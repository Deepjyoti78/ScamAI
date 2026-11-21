"""ScamShield AI — Safe Job URL Retrieval & Content Extraction Service.

Provides secure HTTP retrieval of public job posting pages with robust SSRF protection:
1. Strict protocol allowlist (HTTP/HTTPS only).
2. Credential rejection (no user:pass in URLs).
3. Port restrictions (standard web ports 80 and 443 only).
4. Hostname & DNS resolution checks (rejection of loopback, private, link-local, multicast, reserved IPs).
5. Protection against unsafe redirects with per-hop re-validation.
6. Content-Type verification (HTML only) and response streaming size limits (max 2 MB).
7. Clean HTML parsing: strips scripts, styles, navigation, headers, footers, buttons, and templates.
8. Rejects oversized extracted text rather than silently scoring a truncated page.
"""

from dataclasses import asdict, dataclass
import html
import concurrent.futures
import http.client
import math
import os
import ssl
import threading
import time
from html.parser import HTMLParser
import ipaddress
import re
import socket
from typing import Optional, Set, Tuple
import urllib.error
import urllib.parse
import urllib.request


# Documented extraction limits
MAX_CONTENT_LENGTH = 15000  # Maximum extracted characters returned
MAX_RESPONSE_BYTES = 2 * 1024 * 1024  # 2 MB response size ceiling
DEFAULT_TIMEOUT_SECONDS = 8.0  # Overall socket and connect timeout
MAX_REDIRECTS = 3  # Maximum followed redirect hops
ALLOWED_PORTS = {80, 443}
ALLOWED_SCHEMES = {"http", "https"}
ALLOWED_CONTENT_TYPES = {"text/html", "application/xhtml+xml"}

# Cloud metadata and internal service hostnames to reject explicitly
BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "metadata.internal",
    "instance-data",
    "169.254.169.254",
}


class SecurityValidationError(Exception):
    """Raised when a URL violates SSRF or security boundaries."""

    pass


@dataclass
class JobExtractionResult:
    """Structured extraction result returned by the extractor service."""

    url: str
    final_url: Optional[str] = None
    http_status: Optional[int] = None
    status: str = "failed"  # success, blocked, unreachable, timeout, oversized, unsupported_content_type, security_violation, insufficient_content
    title: Optional[str] = None
    meta_description: Optional[str] = None
    extracted_text: Optional[str] = None
    error_message: Optional[str] = None
    char_count: int = 0

    def to_dict(self):
        return asdict(self)


class JobPageHTMLParser(HTMLParser):
    """HTML parser that extracts visible job text while stripping boilerplate and scripts."""

    IGNORED_TAGS: Set[str] = {
        "script", "style", "noscript", "template", "svg", "canvas",
        "nav", "footer", "header", "aside", "select", "button",
        "textarea", "iframe", "object",
    }

    BLOCK_TAGS: Set[str] = {
        "p", "div", "section", "article", "main", "h1", "h2", "h3",
        "h4", "h5", "h6", "li", "br", "tr", "dt", "dd", "blockquote",
    }

    def __init__(self):
        super().__init__()
        self.ignored_stack = []
        self.in_ignored = 0
        self.in_title = False
        self.title_parts = []
        self.meta_description = ""
        self.og_title = ""
        self.text_parts = []

    def handle_starttag(self, tag: str, attrs: list):
        tag_lower = tag.lower()
        if tag_lower in self.IGNORED_TAGS:
            if tag_lower not in {"input", "embed"}:
                self.ignored_stack.append(tag_lower)
            self.in_ignored = len(self.ignored_stack)
            return

        if self.in_ignored > 0:
            return

        if tag_lower == "title":
            self.in_title = True
        elif tag_lower == "meta":
            attr_dict = {k.lower(): v for k, v in attrs if v}
            name = attr_dict.get("name", "").lower() or attr_dict.get("property", "").lower()
            content = attr_dict.get("content", "").strip()
            if name in ("description", "og:description") and not self.meta_description:
                self.meta_description = content
            elif name in ("og:title", "twitter:title") and not self.og_title:
                self.og_title = content
        elif tag_lower in self.BLOCK_TAGS:
            self.text_parts.append("\n")

    def handle_endtag(self, tag: str):
        tag_lower = tag.lower()
        if tag_lower in self.IGNORED_TAGS:
            if tag_lower in self.ignored_stack:
                del self.ignored_stack[self.ignored_stack.index(tag_lower):]
            self.in_ignored = len(self.ignored_stack)
            return

        if self.in_ignored > 0:
            return

        if tag_lower == "title":
            self.in_title = False
        elif tag_lower in self.BLOCK_TAGS:
            self.text_parts.append("\n")

    def handle_data(self, data: str):
        if self.in_ignored > 0:
            return

        if self.in_title:
            self.title_parts.append(data)
        else:
            self.text_parts.append(data)

    def get_clean_title(self) -> Optional[str]:
        raw_title = "".join(self.title_parts).strip()
        candidate = raw_title or self.og_title or ""
        # Normalize whitespace
        candidate = re.sub(r"\s+", " ", candidate).strip()
        # Unescape HTML entities
        candidate = html.unescape(candidate)
        return candidate if candidate else None

    def get_clean_text(self) -> str:
        raw_text = "".join(self.text_parts)
        # Unescape entities
        unescaped = html.unescape(raw_text)
        # Normalize multiple newlines and spaces
        cleaned = re.sub(r"[ \t]+", " ", unescaped)
        cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned).strip()
        return cleaned

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)


def is_ip_globally_routable(address):
    if isinstance(address, ipaddress.IPv6Address):
        if address.ipv4_mapped or address.sixtofour or address.teredo:
            return False
        if any(address in ipaddress.ip_network(net) for net in ("64:ff9b::/96", "64:ff9b:1::/48")):
            return False
    if str(address) == "168.63.129.16":
        return False
    return address.is_global and not (address.is_multicast or address.is_reserved or address.is_unspecified)


def _parse_url(raw_url):
    if not isinstance(raw_url, str) or not raw_url or len(raw_url) > 4096:
        raise SecurityValidationError("A URL of at most 4096 characters is required.")
    if re.search(r"[\x00-\x20\x7f\\]", raw_url) or re.search(r"%(?:0[0-9a-f]|1[0-9a-f]|7f)", raw_url, re.I):
        raise SecurityValidationError("Forbidden URL control characters.")
    if re.search(r"%(?![0-9a-f]{2})", raw_url, re.I):
        raise SecurityValidationError("Malformed URL encoding.")
    try:
        parsed = urllib.parse.urlsplit(raw_url)
        host = parsed.hostname
        port = parsed.port if parsed.port is not None else (443 if parsed.scheme == "https" else 80)
        if parsed.scheme not in ALLOWED_SCHEMES or not host or port not in ALLOWED_PORTS:
            raise ValueError()
        if parsed.username is not None or parsed.password is not None or "%" in parsed.netloc:
            raise ValueError()
        host = host.encode("idna").decode("ascii").lower().rstrip(".")
        if host in BLOCKED_HOSTNAMES or host.endswith((".local", ".internal", ".localhost", ".lan", ".corp")):
            raise ValueError()
        try:
            address = ipaddress.ip_address(host)
        except ValueError:
            if len(host) > 253 or not all(re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label) for label in host.split(".")):
                raise ValueError()
        else:
            if not is_ip_globally_routable(address):
                raise ValueError()
        return parsed, host, port
    except (ValueError, UnicodeError):
        raise SecurityValidationError("URL scheme, private/reserved hostname, credentials or port blocked.") from None


_DNS_POOL = concurrent.futures.ThreadPoolExecutor(max_workers=4, thread_name_prefix="job-dns")
_DNS_SLOTS = threading.BoundedSemaphore(4)


def _remaining(deadline):
    seconds = deadline - time.monotonic()
    if seconds <= 0:
        raise TimeoutError("Retrieval deadline exceeded.")
    return seconds


def _resolve(host, port, deadline):
    try:
        address = ipaddress.ip_address(host)
        entries = [(socket.AF_INET6 if address.version == 6 else socket.AF_INET, socket.SOCK_STREAM, 0, "", (host, port))]
    except ValueError:
        if not _DNS_SLOTS.acquire(blocking=False):
            raise TimeoutError("DNS resolver busy.")
        try:
            future = _DNS_POOL.submit(socket.getaddrinfo, host, port, 0, socket.SOCK_STREAM)
        except BaseException:
            _DNS_SLOTS.release()
            raise
        future.add_done_callback(lambda _: _DNS_SLOTS.release())
        entries = future.result(timeout=_remaining(deadline))
    approved = []
    for family, kind, proto, _, sockaddr in entries:
        if family not in (socket.AF_INET, socket.AF_INET6) or not is_ip_globally_routable(ipaddress.ip_address(sockaddr[0])):
            raise SecurityValidationError("Target resolves to a restricted/private or reserved address. Access blocked.")
        approved.append((family, kind, proto, sockaddr))
    if not approved:
        raise SecurityValidationError("No approved public address was resolved.")
    return approved


def validate_url_security(raw_url):
    """Compatibility validation; fetching pins its own validated DNS answer."""
    try:
        parsed, host, port = _parse_url(raw_url)
        _resolve(host, port, time.monotonic() + DEFAULT_TIMEOUT_SECONDS)
        return True, None, parsed
    except SecurityValidationError as error:
        return False, str(error), None
    except Exception:
        return False, "URL hostname cannot be resolved.", None


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Legacy validator; retrieval does not use urllib openers."""
    def __init__(self, max_redirects=MAX_REDIRECTS):
        self.max_redirects, self.redirects_count = max_redirects, 0

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.redirects_count += 1
        if self.redirects_count > self.max_redirects:
            raise SecurityValidationError("Too many redirects.")
        target = urllib.parse.urljoin(req.full_url, newurl)
        valid, reason, _ = validate_url_security(target)
        if not valid:
            raise SecurityValidationError(reason)
        return super().redirect_request(req, fp, code, msg, headers, target)


def _connect_approved(connection, addresses, host, tls, deadline):
    """Connect numeric sockaddr directly, retaining the original TLS server name."""
    last_error = OSError("No address connected")
    for family, kind, proto, sockaddr in addresses:
        sock = socket.socket(family, kind, proto)
        try:
            connection.sock = sock
            connection._deadline_socket = sock
            sock.settimeout(min(DEFAULT_TIMEOUT_SECONDS, _remaining(deadline)))
            sock.connect(sockaddr)
            if tls:
                context = ssl.create_default_context()
                context.set_alpn_protocols(["http/1.1"])
                sock = context.wrap_socket(sock, server_hostname=host, do_handshake_on_connect=False)
                connection.sock = sock
                connection._deadline_socket = sock
                sock.settimeout(min(DEFAULT_TIMEOUT_SECONDS, _remaining(deadline)))
                sock.do_handshake()
            connection.sock = sock
            return
        except ssl.SSLCertVerificationError:
            sock.close()
            raise
        except OSError as error:
            sock.close()
            last_error = error
    raise last_error


def _fetch_html(url, deadline):
    """No proxies/cookies, bounded body, redirects validated before each connection."""
    for hop in range(MAX_REDIRECTS + 1):
        parsed, host, port = _parse_url(url)
        addresses = _resolve(host, port, deadline)
        connection = http.client.HTTPConnection(host, port, timeout=min(DEFAULT_TIMEOUT_SECONDS, _remaining(deadline)))
        connection.connect = lambda: _connect_approved(connection, addresses, host, parsed.scheme == "https", deadline)
        response = None
        expired = threading.Event()
        def expire(conn=connection):
            expired.set()
            active = getattr(conn, "_deadline_socket", conn.sock)
            if active is not None:
                try:
                    active.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass
                active.close()
        timer = threading.Timer(_remaining(deadline), expire)
        timer.daemon = True
        timer.start()
        try:
            path = urllib.parse.urlunsplit(("", "", parsed.path or "/", parsed.query, ""))
            connection.request("GET", path, headers={"Accept": "text/html,application/xhtml+xml", "Accept-Encoding": "identity", "User-Agent": "ScamShieldAI/1.1", "Connection": "close"})
            response = connection.getresponse()
            if expired.is_set():
                raise TimeoutError("Retrieval deadline exceeded")
            _remaining(deadline)
            if response.status in (301, 302, 303, 307, 308):
                if hop == MAX_REDIRECTS:
                    raise SecurityValidationError("Too many redirects.")
                location = response.getheader("Location")
                if not location:
                    raise SecurityValidationError("Redirect has no destination.")
                target = urllib.parse.urljoin(url, location)
                if parsed.scheme == "https" and urllib.parse.urlsplit(target).scheme != "https":
                    raise SecurityValidationError("HTTPS downgrade blocked.")
                url = target
                continue
            if response.status != 200:
                return None, url, response.status, "blocked" if response.status in (401, 403) else "unreachable"
            if response.getheader("Content-Type", "").split(";")[0].strip().lower() not in ALLOWED_CONTENT_TYPES:
                return None, url, response.status, "unsupported_content_type"
            if response.getheader("Content-Encoding", "identity").lower() not in ("", "identity"):
                return None, url, response.status, "unsupported_encoding"
            declared_size = response.getheader("Content-Length")
            if declared_size and (not declared_size.isdigit() or int(declared_size) > MAX_RESPONSE_BYTES):
                return None, url, response.status, "oversized"
            body = bytearray()
            while True:
                _remaining(deadline)
                chunk = response.read(min(65536, MAX_RESPONSE_BYTES + 1 - len(body)))
                if not chunk:
                    break
                body.extend(chunk)
                if len(body) > MAX_RESPONSE_BYTES:
                    return None, url, response.status, "oversized"
            if expired.is_set():
                raise TimeoutError("Retrieval deadline exceeded")
            _remaining(deadline)
            try:
                text = body.decode(response.headers.get_content_charset() or "utf-8", errors="replace")
            except LookupError:
                text = body.decode("utf-8", errors="replace")
            return text, url, response.status, "success"
        except Exception:
            if expired.is_set():
                raise TimeoutError("Retrieval deadline exceeded") from None
            raise
        finally:
            timer.cancel()
            timer.join(timeout=0.1)
            if response is not None:
                response.close()
            connection.close()


def extract_job_posting_from_url(job_url, timeout=DEFAULT_TIMEOUT_SECONDS):
    """Default-off pending independent transport qualification; no failed score sentinel."""
    def failed(status, message, http_status=None):
        return JobExtractionResult(url="", status=status, error_message=message, http_status=http_status)
    try:
        _parse_url(job_url)
    except SecurityValidationError:
        return failed("security_violation", "URL blocked or malformed. Paste the job description instead.")
    if os.getenv("SCAMSHIELD_ENABLE_URL_FETCH", "false").lower() != "true":
        return failed("unavailable", "URL retrieval is disabled on this server. Paste the job description to analyze it.")
    if not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or timeout <= 0:
        return failed("timeout", "Invalid retrieval deadline.")
    deadline = time.monotonic() + min(timeout, 15.0)
    try:
        text, final_url, status_code, status = _fetch_html(job_url, deadline)
        if status != "success":
            return failed(status, "The page could not be used for analysis. Retry or paste the job description.", status_code)
        parser = JobPageHTMLParser()
        parser.feed(text)
        parser.close()
        clean = parser.get_clean_text()
        _remaining(deadline)
        if any(term in clean.lower() for term in ("enable javascript", "verify you are human", "checking your browser", "just a moment")) and len(clean) < 500:
            return failed("blocked", "The page requires interactive verification. Paste the job description.")
        if len(clean) < 40:
            return failed("insufficient_content", "No usable job text was extracted. Paste the job description.")
        if len(clean) > MAX_CONTENT_LENGTH:
            return failed("oversized", "Extracted text exceeds the supported length. Paste the relevant description.")
        parsed = urllib.parse.urlsplit(final_url)
        safe_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
        return JobExtractionResult(url="", final_url=safe_url, http_status=status_code, status="success", title=parser.get_clean_title(), extracted_text=clean, char_count=len(clean))
    except SecurityValidationError:
        return failed("security_violation", "Destination or redirect blocked by the URL policy.")
    except (TimeoutError, socket.timeout):
        return failed("timeout", "URL retrieval timed out. Retry or paste the description.")
    except Exception:
        if time.monotonic() >= deadline:
            return failed("timeout", "URL retrieval timed out. Retry or paste the description.")
        return failed("unreachable", "URL retrieval failed. Retry or paste the description.")
