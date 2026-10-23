"""ScamShield AI — Safe Job URL Retrieval & Content Extraction Service.

Provides secure HTTP retrieval of public job posting pages with robust SSRF protection:
1. Strict protocol allowlist (HTTP/HTTPS only).
2. Credential rejection (no user:pass in URLs).
3. Port restrictions (standard web ports 80 and 443 only).
4. Hostname & DNS resolution checks (rejection of loopback, private, link-local, multicast, reserved IPs).
5. Protection against unsafe redirects with per-hop re-validation.
6. Content-Type verification (HTML only) and response streaming size limits (max 2 MB).
7. Clean HTML parsing: strips scripts, styles, navigation, headers, footers, buttons, and templates.
8. Truncates extracted text to documented maximum character length.
"""

from dataclasses import asdict, dataclass
import html
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
        "input", "textarea", "iframe", "object", "embed",
    }

    BLOCK_TAGS: Set[str] = {
        "p", "div", "section", "article", "main", "h1", "h2", "h3",
        "h4", "h5", "h6", "li", "br", "tr", "dt", "dd", "blockquote",
    }

    def __init__(self):
        super().__init__()
        self.in_ignored = 0
        self.in_title = False
        self.title_parts = []
        self.meta_description = ""
        self.og_title = ""
        self.text_parts = []

    def handle_starttag(self, tag: str, attrs: list):
        tag_lower = tag.lower()
        if tag_lower in self.IGNORED_TAGS:
            self.in_ignored += 1
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
            self.in_ignored = max(0, self.in_ignored - 1)
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


def is_ip_globally_routable(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Check if an IP address is a safe, globally routable public address."""
    if (
        ip_obj.is_loopback
        or ip_obj.is_private
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    ):
        return False

    # IPv4-specific non-routable / carrier-grade ranges
    if isinstance(ip_obj, ipaddress.IPv4Address):
        # Carrier-grade NAT (RFC 6598: 100.64.0.0/10)
        cgnat = ipaddress.IPv4Network("100.64.0.0/10")
        if ip_obj in cgnat:
            return False
        # Benchmark / Documentation IPs
        test_nets = [
            ipaddress.IPv4Network("192.0.0.0/24"),
            ipaddress.IPv4Network("192.0.2.0/24"),
            ipaddress.IPv4Network("198.51.100.0/24"),
            ipaddress.IPv4Network("203.0.113.0/24"),
            ipaddress.IPv4Network("198.18.0.0/15"),
        ]
        if any(ip_obj in net for net in test_nets):
            return False

    # IPv6-specific non-routable ranges
    if isinstance(ip_obj, ipaddress.IPv6Address):
        # Unique local (fc00::/7)
        if ip_obj in ipaddress.IPv6Network("fc00::/7"):
            return False
        # Link-local (fe80::/10)
        if ip_obj in ipaddress.IPv6Network("fe80::/10"):
            return False
        # Discard prefix / Documentation (100::/64, 2001:db8::/32)
        if (
            ip_obj in ipaddress.IPv6Network("100::/64")
            or ip_obj in ipaddress.IPv6Network("2001:db8::/32")
        ):
            return False

    return True


def validate_url_security(raw_url: str) -> Tuple[bool, Optional[str], Optional[urllib.parse.SplitResult]]:
    """Strictly validate URL structure, protocol, credentials, port, and IP target for SSRF safety.

    Returns (is_valid, error_reason, parsed_split_result).
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "URL must be a non-empty string.", None

    trimmed = raw_url.strip()
    try:
        parsed = urllib.parse.urlsplit(trimmed)
    except Exception as e:
        return False, f"Malformed URL syntax: {e}", None

    # 1. Scheme check
    scheme = (parsed.scheme or "").lower()
    if scheme not in ALLOWED_SCHEMES:
        return False, f"Unsupported scheme '{scheme}'. Only HTTP and HTTPS are permitted.", None

    # 2. Credential check
    if parsed.username or parsed.password:
        return False, "Embedded credentials (user:pass) in URLs are rejected for security.", None

    # 3. Hostname check
    hostname = (parsed.hostname or "").strip().lower()
    if not hostname:
        return False, "URL is missing a valid hostname.", None

    # Check blocked hostnames
    if hostname in BLOCKED_HOSTNAMES or hostname.endswith((".local", ".internal", ".localhost", ".lan", ".corp")):
        return False, f"Access to internal or reserved hostname '{hostname}' is blocked.", None

    # 4. Port check
    port = parsed.port or (443 if scheme == "https" else 80)
    if port not in ALLOWED_PORTS:
        return False, f"Port {port} is not permitted. Only standard web ports (80, 443) are allowed.", None

    # 5. IP Address / DNS resolution safety check
    # Check if hostname itself is directly an IP address
    try:
        ip_direct = ipaddress.ip_address(hostname)
        if not is_ip_globally_routable(ip_direct):
            return False, f"Target IP '{hostname}' belongs to a private, loopback, or reserved network range.", None
        return True, None, parsed
    except ValueError:
        # Not a direct IP address; proceed to DNS resolution
        pass

    try:
        addr_info = socket.getaddrinfo(hostname, port, type=socket.SOCK_STREAM)
    except socket.gaierror as e:
        return False, f"Hostname resolution failed: unable to resolve '{hostname}'.", None
    except Exception as e:
        return False, f"Network resolution error for '{hostname}': {e}", None

    if not addr_info:
        return False, f"No IP addresses resolved for '{hostname}'.", None

    # Verify that every resolved IP is globally routable
    for addr in addr_info:
        ip_str = addr[4][0]
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            if not is_ip_globally_routable(ip_obj):
                return False, f"Target resolves to a restricted IP address ({ip_str}). Access blocked.", None
        except ValueError:
            return False, f"Invalid resolved IP address: {ip_str}", None

    return True, None, parsed


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Custom redirect handler that validates each redirect target before following it."""

    def __init__(self, max_redirects: int = MAX_REDIRECTS):
        self.max_redirects = max_redirects
        self.redirects_count = 0
        self.final_url = None

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.redirects_count += 1
        if self.redirects_count > self.max_redirects:
            raise SecurityValidationError(f"Too many redirects (exceeded limit of {self.max_redirects}).")

        # Resolve relative URLs
        full_new_url = urllib.parse.urljoin(req.full_url, newurl)

        # Validate redirect target
        is_safe, error_reason, _ = validate_url_security(full_new_url)
        if not is_safe:
            raise SecurityValidationError(f"Redirect destination blocked: {error_reason}")

        self.final_url = full_new_url
        return super().redirect_request(req, fp, code, msg, headers, full_new_url)


def extract_job_posting_from_url(
    job_url: str,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> JobExtractionResult:
    """Safely fetch and parse a public job posting webpage.

    Enforces all SSRF defenses, response limits, and HTML cleanup.
    Returns structured JobExtractionResult with explicit extraction status.
    """
    clean_input_url = (job_url or "").strip()
    if not clean_input_url:
        return JobExtractionResult(
            url="",
            status="invalid_url",
            error_message="A job URL must be provided.",
        )

    # 1. Pre-fetch SSRF & URL Security Validation
    is_safe, error_reason, parsed = validate_url_security(clean_input_url)
    if not is_safe:
        return JobExtractionResult(
            url=clean_input_url,
            status="security_violation",
            error_message=error_reason or "The provided URL violates security policies.",
        )

    # 2. Build secure request opener
    redirect_handler = SafeRedirectHandler(max_redirects=MAX_REDIRECTS)
    opener = urllib.request.build_opener(redirect_handler)

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36 ScamShieldAI/1.0"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    req = urllib.request.Request(clean_input_url, headers=headers)

    # 3. Execute request with timeouts and streaming size caps
    try:
        with opener.open(req, timeout=timeout) as response:
            http_status = getattr(response, "status", 200)
            final_url = redirect_handler.final_url or response.geturl() or clean_input_url

            # Verify final URL security after any redirects
            if redirect_handler.final_url:
                is_final_safe, final_err, _ = validate_url_security(final_url)
                if not is_final_safe:
                    return JobExtractionResult(
                        url=clean_input_url,
                        final_url=final_url,
                        http_status=http_status,
                        status="security_violation",
                        error_message=f"Final destination blocked: {final_err}",
                    )

            # Check Content-Type header
            content_type_header = response.headers.get("Content-Type", "")
            mime_type = content_type_header.lower().split(";")[0].strip()
            if mime_type and mime_type not in ALLOWED_CONTENT_TYPES:
                return JobExtractionResult(
                    url=clean_input_url,
                    final_url=final_url,
                    http_status=http_status,
                    status="unsupported_content_type",
                    error_message=(
                        f"Unsupported page type '{mime_type}'. "
                        "ScamShield AI only supports public HTML job postings."
                    ),
                )

            # Stream response up to MAX_RESPONSE_BYTES
            chunks = []
            total_bytes = 0
            while True:
                chunk = response.read(65536)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_RESPONSE_BYTES:
                    return JobExtractionResult(
                        url=clean_input_url,
                        final_url=final_url,
                        http_status=http_status,
                        status="oversized",
                        error_message="The target job webpage exceeds the maximum allowed size (2 MB).",
                    )
                chunks.append(chunk)

            raw_bytes = b"".join(chunks)

            # Determine charset
            charset = "utf-8"
            if "charset=" in content_type_header.lower():
                try:
                    charset = content_type_header.lower().split("charset=")[-1].split(";")[0].strip()
                except Exception:
                    charset = "utf-8"

            try:
                html_text = raw_bytes.decode(charset, errors="replace")
            except Exception:
                html_text = raw_bytes.decode("utf-8", errors="replace")

    except SecurityValidationError as sec_err:
        return JobExtractionResult(
            url=clean_input_url,
            status="security_violation",
            error_message=str(sec_err),
        )
    except urllib.error.HTTPError as http_err:
        if http_err.code in (401, 403):
            return JobExtractionResult(
                url=clean_input_url,
                http_status=http_err.code,
                status="blocked",
                error_message=(
                    f"Access was restricted by the job board (HTTP {http_err.code}). "
                    "Anti-bot defenses, session logins, or geographic blocks may prevent automated extraction. "
                    "Please copy and paste the job posting text manually."
                ),
            )
        if http_err.code == 404:
            return JobExtractionResult(
                url=clean_input_url,
                http_status=404,
                status="unreachable",
                error_message="Job posting page not found (HTTP 404). Please confirm the URL is active.",
            )
        return JobExtractionResult(
            url=clean_input_url,
            http_status=http_err.code,
            status="unreachable",
            error_message=f"The job hosting server returned an error (HTTP {http_err.code}).",
        )
    except (urllib.error.URLError, TimeoutError, socket.timeout) as net_err:
        err_msg = str(net_err.reason) if hasattr(net_err, "reason") else str(net_err)
        if "timed out" in err_msg.lower():
            return JobExtractionResult(
                url=clean_input_url,
                status="timeout",
                error_message="Connection timed out while retrieving the job page. The host may be unresponsive.",
            )
        return JobExtractionResult(
            url=clean_input_url,
            status="unreachable",
            error_message="Unable to establish a connection to the job posting host.",
        )
    except Exception as general_err:
        return JobExtractionResult(
            url=clean_input_url,
            status="failed",
            error_message="Failed to retrieve the webpage. Please copy and paste the text manually.",
        )

    # 4. Parse HTML and extract clean text
    parser = JobPageHTMLParser()
    try:
        parser.feed(html_text)
    except Exception:
        pass

    extracted_title = parser.get_clean_title()
    clean_text = parser.get_clean_text()

    # 5. Detect anti-bot / JavaScript challenge placeholders
    js_challenge_indicators = [
        "please enable javascript",
        "turn on javascript",
        "attention required! | cloudflare",
        "just a moment...",
        "verify you are human",
        "checking your browser",
    ]
    is_js_walled = any(ind in clean_text.lower() for ind in js_challenge_indicators) and len(clean_text) < 500

    if is_js_walled:
        return JobExtractionResult(
            url=clean_input_url,
            final_url=final_url,
            http_status=http_status,
            status="blocked",
            title=extracted_title,
            error_message=(
                "This webpage requires JavaScript execution or cloud verification to display posting text. "
                "Please copy and paste the job description text manually."
            ),
        )

    # 6. Check for sufficient readable text
    if len(clean_text) < 40:
        return JobExtractionResult(
            url=clean_input_url,
            final_url=final_url,
            http_status=http_status,
            status="insufficient_content",
            title=extracted_title,
            error_message=(
                "Insufficient readable job posting content could be extracted from this URL. "
                "The page content may be rendered via client-side JavaScript. Please paste the job description manually."
            ),
        )

    # 7. Truncate text to documented maximum length
    truncated_text = clean_text[:MAX_CONTENT_LENGTH]

    return JobExtractionResult(
        url=clean_input_url,
        final_url=final_url,
        http_status=http_status,
        status="success",
        title=extracted_title,
        meta_description=parser.meta_description or None,
        extracted_text=truncated_text,
        char_count=len(truncated_text),
    )
