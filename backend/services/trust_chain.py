"""ScamShield AI — Trust Chain Investigation Engine.

Provides deterministic, context-aware evidence checks that complement
the probabilistic Machine Learning model. Evaluates:
1. Upfront recruitment fee & payment demands (context-aware, negation-filtering).
2. Credential & OTP requests (context-aware, negation-filtering).
3. Recruiter email domain vs. claimed company domain.
4. Application destination URL vs. official company domain (with ATS recognition).
5. Missing information & data completeness audit.
"""

from enum import Enum
import re
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlsplit


class FindingStatus(str, Enum):
    CONCERN_OBSERVED = "concern_observed"
    NO_MISMATCH_OBSERVED = "no_mismatch_observed"
    NOT_CHECKED = "not_checked"
    UNABLE_TO_DETERMINE = "unable_to_determine"


class FindingSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFORMATIONAL = "informational"
    NEUTRAL = "neutral"


# Known two-part public suffixes (ccTLD second-level domains)
KNOWN_TWO_PART_SUFFIXES = {
    "co.uk", "org.uk", "gov.uk", "ac.uk", "me.uk", "ltd.uk",
    "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in",
    "com.au", "net.au", "org.au", "edu.au", "gov.au",
    "co.nz", "net.nz", "org.nz", "govt.nz",
    "co.za", "org.za", "web.za", "net.za",
    "com.br", "net.br", "org.br",
    "com.sg", "edu.sg", "gov.sg",
    "co.jp", "ne.jp", "or.jp", "go.jp",
    "com.my", "net.my", "org.my", "gov.my",
    "com.mx", "org.mx", "gob.mx",
    "com.hk", "edu.hk", "gov.hk",
    "com.ph", "org.ph", "gov.ph",
    "com.ar", "com.tr", "com.tw", "co.kr",
}

# Free / public consumer webmail providers where corporate recruitment is anomalous
PUBLIC_EMAIL_PROVIDERS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
    "mail.com", "aol.com", "proton.me", "protonmail.com", "zoho.com",
    "gmx.com", "yandex.com", "rediffmail.com", "live.com",
}

# Well-known reputable Applicant Tracking Systems (ATS) and job distribution platforms
REPUTABLE_ATS_DOMAINS = {
    "greenhouse.io": "Greenhouse ATS",
    "lever.co": "Lever ATS",
    "myworkdayjobs.com": "Workday Recruiting",
    "workday.com": "Workday",
    "smartrecruiters.com": "SmartRecruiters",
    "taleo.net": "Oracle Taleo",
    "ashbyhq.com": "Ashby ATS",
    "bamboohr.com": "BambooHR",
    "apply.workable.com": "Workable",
    "workable.com": "Workable",
    "jobvite.com": "Jobvite",
    "rippling-ats.com": "Rippling ATS",
    "rippling.com": "Rippling",
    "icims.com": "iCIMS Talent Cloud",
    "successfactors.com": "SAP SuccessFactors",
    "recruitee.com": "Recruitee",
    "breezy.hr": "Breezy HR",
    "pinpointhq.com": "Pinpoint ATS",
    "jazzhr.com": "JazzHR",
    "linkedin.com": "LinkedIn Jobs",
    "indeed.com": "Indeed",
    "naukri.com": "Naukri",
}

# Recognized legitimate global recruitment / staffing agencies
RECOGNIZED_STAFFING_AGENCIES = {
    "randstad.com": "Randstad",
    "roberthalf.com": "Robert Half",
    "adecco.com": "Adecco",
    "michaelpage.com": "Michael Page",
    "pagepersonnel.com": "Page Personnel",
    "kellyservices.com": "Kelly Services",
    "manpower.com": "ManpowerGroup",
    "allegisgroup.com": "Allegis Group",
    "hays.com": "Hays",
    "teksystems.com": "TEKsystems",
    "apexsystems.com": "Apex Systems",
}


def normalize_domain(raw_url_or_domain: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """Extract (hostname, registrable_domain) safely from a URL or raw domain string.

    Returns (None, None) if input is empty, malformed, or has an invalid hostname.
    """
    if not raw_url_or_domain:
        return None, None

    cleaned = raw_url_or_domain.strip().lower()
    if not cleaned:
        return None, None

    # Handle email address passed in
    if "@" in cleaned and "/" not in cleaned:
        parts = cleaned.split("@")
        cleaned = parts[-1].strip()

    # If scheme missing, prepend https:// for proper parsing
    if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
        cleaned_for_split = "https://" + cleaned
    else:
        cleaned_for_split = cleaned

    try:
        parsed = urlsplit(cleaned_for_split)
        netloc = parsed.netloc or parsed.path.split("/")[0]
        # Strip port if present
        host = netloc.split(":")[0].strip().strip(".")
    except Exception:
        return None, None

    if not host or "." not in host:
        return None, None

    # Disallow invalid host characters
    if not re.match(r"^[a-z0-9\-\._]+$", host):
        return None, None

    # Compute registrable domain
    labels = host.split(".")
    if len(labels) < 2:
        return host, host

    # Check two-part public suffixes
    if len(labels) >= 3:
        two_part = f"{labels[-2]}.{labels[-1]}"
        if two_part in KNOWN_TWO_PART_SUFFIXES:
            registrable = f"{labels[-3]}.{two_part}"
            return host, registrable

    registrable = f"{labels[-2]}.{labels[-1]}"
    return host, registrable


def extract_sentences(text: str) -> List[str]:
    """Split text into sentences for context-aware grammatical inspection."""
    raw_sentences = re.split(r"[.!?\n\r;]+", text)
    return [s.strip() for s in raw_sentences if s.strip()]


# Payment demand trigger phrases
PAYMENT_DEMAND_PATTERNS = [
    r"\b(?:pay|send|transfer|wire|deposit)\b.*?\b(?:registration|interview|application|processing|placement|clearance|security|training|equipment|laptop|starter|kit|documentation|visa)\b.*?\b(?:fee|fees|deposit|amount|charge|cost|money)\b",
    r"\b(?:registration|interview|application|processing|placement|clearance|security|training|equipment|laptop|starter|kit|documentation|visa)\b.*?\b(?:fee|fees|deposit|charge|cost)\b.*?\b(?:required|mandatory|upfront|payable|must be paid|advance|to secure|before interview|via wire|wire transfer|money transfer|transfer|send|pay)\b",
    r"\b(?:wire transfer|money transfer|western union|moneygram|crypto|usdt|bitcoin|gift card|zelle|venmo)\b.*?\b(?:fee|payment|deposit|send|pay)\b",
    r"\b(?:must|need to|candidate must|applicant must)\s+(?:pay|send|transfer|deposit)\b",
    r"\bpay(?:ment)?\s+of\s+[\$£€₹]?\s*\d+",
    r"\brefundable\s+deposit\b",
    r"\bupfront\s+fee\b",
]

# Negation and educational warning phrases
# Negation and educational warning phrases
DISCLAIMER_PATTERNS = [
    r"\b(?:never|do not|does not|will not|never ever)\s+(?:ask|charge|request|demand|require|accept|collect|solicit)\w*\b.*?\b(?:fee|fees|money|payment|deposit|charge|charges)\b",
    r"\b(?:never|do not|does not|will not|never ever)\s+(?:ask|request|demand|require)\w*\s+(?:candidates?|applicants?|you|anyone)?\s*(?:to\s+(?:pay|send|wire|transfer|deposit)|for\s+(?:any\s+)?(?:fees?|money|payment|deposit))\b",
    r"\b(?:not|never)\s+(?:required|asked)\s+to\s+(?:pay|send|transfer|wire|deposit)\b",
    r"\b(?:do\s+not|never)\s+(?:pay|send|wire|transfer|deposit)\b",
    r"\bno\s+(?:application|registration|recruitment|processing|placement|interview)?\s*(?:fees?|money|payment|deposit)\s*(?:is|are)?\s*(?:charged|required|collected|demanded|asked)\b",
    r"\bfree\s+of\s+(?:any\s+)?charge\b",
    r"\bwithout\s+any\s+(?:fees?|charges?|payment|cost)\b",
    r"\bwe\s+do\s+not\s+(?:charge|collect|take|ask)\b",
    r"\b(?:beware|warning|caution|alert|scam alert|fraud alert)\b.*?\b(?:fee|payment|money|scammers?|fraud)\b",
    r"\bdoes\s+not\s+solicit\s+fees?\b",
    r"\brecruiters?\s+will\s+never\s+ask\b",
    r"\bany\s+(?:job\s+)?offer\b.*?\b(?:requiring|demanding)\b.*?\b(?:fee|fees|payment|deposit)\b.*?\b(?:fraudulent|fake|scam)\b",
]

# Credential / OTP demand patterns
CREDENTIAL_DEMAND_PATTERNS = [
    r"\b(?:share|send|provide|give|enter|submit|confirm)\s+(?:the|your|an?|this)?\s*(?:otp|one[- ]time password|verification code|pin|passcode|secret code)\b",
    r"\b(?:provide|share|send)\s+(?:the|your|an?|this)?\s*(?:email|google|bank|banking|netbanking|account|login)\s+password\b",
    r"\b(?:send|enter)\s+the\s+code\s+sent\s+to\s+your\s+(?:phone|mobile|sms|email)\b",
    r"\b(?:credit|debit)\s+card\s+(?:cvv|cvc|pin|number|details)\s+(?:to proceed|required)\b",
]

CREDENTIAL_DISCLAIMER_PATTERNS = [
    r"\b(?:never|do not|does not|will not)\s+(?:ask|request|demand)\w*\s+(?:candidates?|applicants?|you|anyone)?\s*(?:to\s+(?:share|send|provide|disclose)|for)\b.*?\b(?:otp|password|pin|code|credentials)\b",
    r"\b(?:never|do not|does not|will not)\s+(?:ask|request|demand)\s+(?:for\s+)?(?:the\s+|your\s+|any\s+)?(?:otp|password|pin|credentials)\b",
    r"\b(?:do\s+not|never)\s+share\s+(?:the\s+|your\s+|any\s+)?(?:otp|password|verification code|code|pin)\b",
    r"\bwe\s+will\s+never\s+ask\s+for\s+(?:the\s+|your\s+|any\s+)?(?:otp|password)\b",
    r"\bkeep\s+your\s+otp\s+confidential\b",
]


def check_payment_demands(combined_text: str) -> Dict[str, Any]:
    """Check for explicit upfront recruitment fee demands while filtering out benign warnings."""
    sentences = extract_sentences(combined_text)
    detected_phrases = []
    disclaimer_found = False

    for s in sentences:
        s_lower = s.lower()

        # Check for disclaimer in this sentence or surrounding context
        is_disclaimer = any(re.search(pat, s_lower) for pat in DISCLAIMER_PATTERNS)
        if is_disclaimer:
            disclaimer_found = True
            continue

        for pat in PAYMENT_DEMAND_PATTERNS:
            match = re.search(pat, s_lower)
            if match:
                detected_phrases.append(s.strip())
                break

    if detected_phrases:
        first_phrase = detected_phrases[0]
        # Shorten observation snippet if very long
        snippet = first_phrase if len(first_phrase) <= 180 else first_phrase[:177] + "..."
        return {
            "check_id": "fee_payment_demand",
            "title": "Upfront Recruitment Fee / Payment Demand",
            "status": FindingStatus.CONCERN_OBSERVED,
            "severity": FindingSeverity.CRITICAL,
            "observation": f"Affirmative payment or deposit language detected: \"{snippet}\"",
            "explanation": (
                "Legitimate employers and recognized recruitment agencies cover recruitment overhead. "
                "Demanding upfront registration, training, equipment, or interview fees is one of the highest-risk indicators of recruitment fraud."
            ),
            "recommended_action": (
                "Do NOT transfer funds, purchase gift cards, or submit security deposits. "
                "Contact the official employer through their verified website directory to report the listing."
            ),
            "evidence_source": "Job posting content & communication text analysis",
        }

    if disclaimer_found:
        return {
            "check_id": "fee_payment_demand",
            "title": "Upfront Recruitment Fee / Payment Demand",
            "status": FindingStatus.NO_MISMATCH_OBSERVED,
            "severity": FindingSeverity.NEUTRAL,
            "observation": "Mention of recruitment fees occurs within an anti-fraud warning or disclaimer statement.",
            "explanation": (
                "The text mentions recruitment fees or charges solely in a defensive context "
                "(e.g., clarifying that the organization never charges fees). No fee requirement is demanded from applicants."
            ),
            "recommended_action": "Standard practice. Maintain normal vigilance.",
            "evidence_source": "Context-aware negation filter on posting text",
        }

    return {
        "check_id": "fee_payment_demand",
        "title": "Upfront Recruitment Fee / Payment Demand",
        "status": FindingStatus.NO_MISMATCH_OBSERVED,
        "severity": FindingSeverity.NEUTRAL,
        "observation": "No upfront fee, registration charge, or equipment payment demands were detected in the text.",
        "explanation": "No textual indicators of financial solicitation were identified in the submitted job content.",
        "recommended_action": "Proceed with normal application process without sending payments.",
        "evidence_source": "Job posting content analysis",
    }


def check_credential_requests(combined_text: str) -> Dict[str, Any]:
    """Check for unauthorized requests for passwords, OTPs, or financial credentials."""
    sentences = extract_sentences(combined_text)
    detected_phrases = []
    disclaimer_found = False

    for s in sentences:
        s_lower = s.lower()

        # Check disclaimer
        is_disclaimer = any(re.search(pat, s_lower) for pat in CREDENTIAL_DISCLAIMER_PATTERNS)
        if is_disclaimer:
            disclaimer_found = True
            continue

        for pat in CREDENTIAL_DEMAND_PATTERNS:
            match = re.search(pat, s_lower)
            if match:
                detected_phrases.append(s.strip())
                break

    if detected_phrases:
        snippet = detected_phrases[0]
        if len(snippet) > 180:
            snippet = snippet[:177] + "..."
        return {
            "check_id": "credential_otp_request",
            "title": "Sensitive Credential & OTP Request",
            "status": FindingStatus.CONCERN_OBSERVED,
            "severity": FindingSeverity.CRITICAL,
            "observation": f"Request for sensitive credentials or security codes detected: \"{snippet}\"",
            "explanation": (
                "Legitimate hiring processes never require job applicants to disclose OTPs, account passwords, "
                "or two-factor codes. Such requests are used in account takeover and financial phishing."
            ),
            "recommended_action": (
                "Never share OTPs, passcodes, or banking credentials under any pretext. "
                "Immediately cease contact with the sender."
            ),
            "evidence_source": "Communication & message content analysis",
        }

    if disclaimer_found:
        return {
            "check_id": "credential_otp_request",
            "title": "Sensitive Credential & OTP Request",
            "status": FindingStatus.NO_MISMATCH_OBSERVED,
            "severity": FindingSeverity.NEUTRAL,
            "observation": "Security code or credential terms appear within an educational warning.",
            "explanation": "Text explicitly instructs applicants not to share credentials, consistent with corporate security advisories.",
            "recommended_action": "Adhere to the advisory: keep credentials strictly private.",
            "evidence_source": "Context-aware negation filter on posting text",
        }

    return {
        "check_id": "credential_otp_request",
        "title": "Sensitive Credential & OTP Request",
        "status": FindingStatus.NO_MISMATCH_OBSERVED,
        "severity": FindingSeverity.NEUTRAL,
        "observation": "No requests for passwords, OTP verification codes, or banking PINs were observed.",
        "explanation": "The submitted job details do not show signs of account takeover or credential harvesting.",
        "recommended_action": "Standard vigilance. Never share login tokens or 2FA codes.",
        "evidence_source": "Communication text inspection",
    }


def check_recruiter_email_domain(
    recruiter_email: Optional[str],
    company_website: Optional[str],
    employer_name: Optional[str],
) -> Dict[str, Any]:
    """Compare recruiter email domain with claimed company website and public email patterns."""
    if not recruiter_email or not recruiter_email.strip():
        return {
            "check_id": "recruiter_email_domain",
            "title": "Recruiter Email Domain Alignment",
            "status": FindingStatus.NOT_CHECKED,
            "severity": FindingSeverity.NEUTRAL,
            "observation": "No recruiter email address was provided for domain verification.",
            "explanation": "Providing the recruiter's sender email allows automated verification against official corporate domains.",
            "recommended_action": "Obtain the recruiter's official email address before sharing personal information.",
            "evidence_source": "Applicant input",
        }

    cleaned_email = recruiter_email.strip().lower()
    email_parts = cleaned_email.split("@")
    if len(email_parts) != 2 or not email_parts[0].strip() or not email_parts[1].strip():
        return {
            "check_id": "recruiter_email_domain",
            "title": "Recruiter Email Domain Alignment",
            "status": FindingStatus.UNABLE_TO_DETERMINE,
            "severity": FindingSeverity.WARNING,
            "observation": f"The provided recruiter email \"{recruiter_email}\" is malformed or invalid.",
            "explanation": "A valid email address containing an '@' and standard domain name is required for verification.",
            "recommended_action": "Verify and provide the exact email address used by the recruiter.",
            "evidence_source": "Input syntax validation",
        }

    email_host, email_reg = normalize_domain(cleaned_email)
    if not email_host or not email_reg:
        return {
            "check_id": "recruiter_email_domain",
            "title": "Recruiter Email Domain Alignment",
            "status": FindingStatus.UNABLE_TO_DETERMINE,
            "severity": FindingSeverity.WARNING,
            "observation": f"The provided recruiter email \"{recruiter_email}\" contains an invalid or unparseable domain name.",
            "explanation": "A valid email address containing a standard top-level domain is required for verification.",
            "recommended_action": "Verify and provide the exact email address used by the recruiter.",
            "evidence_source": "Input syntax validation",
        }

    comp_host, comp_reg = normalize_domain(company_website)

    # Case 1: Free / public webmail provider
    if email_reg in PUBLIC_EMAIL_PROVIDERS or email_host in PUBLIC_EMAIL_PROVIDERS:
        has_corporate_claim = bool(employer_name and len(employer_name.strip()) > 1)
        target_name = employer_name.strip() if has_corporate_claim else "established employers"
        return {
            "check_id": "recruiter_email_domain",
            "title": "Recruiter Email Domain Alignment",
            "status": FindingStatus.CONCERN_OBSERVED,
            "severity": FindingSeverity.WARNING,
            "observation": f"Recruiter is contacting via a free public email service (@{email_host}) rather than an enterprise domain.",
            "explanation": (
                f"Recruiters representing {target_name} typically communicate through official enterprise email domains. "
                "While freelancers or very early startups occasionally use webmail, impersonators frequently rely on free webmail accounts."
            ),
            "recommended_action": (
                "Request communication via the organization's official email domain or verify the recruiter's identity "
                "through the company's verified LinkedIn page or corporate directory."
            ),
            "evidence_source": f"Recruiter email: {recruiter_email}",
        }

    # Case 2: Company website provided and comparable
    if comp_reg:
        if email_reg == comp_reg:
            return {
                "check_id": "recruiter_email_domain",
                "title": "Recruiter Email Domain Alignment",
                "status": FindingStatus.NO_MISMATCH_OBSERVED,
                "severity": FindingSeverity.INFORMATIONAL,
                "observation": f"Recruiter email domain (@{email_host}) matches company domain ({comp_reg}).",
                "explanation": (
                    "The recruiter email domain is consistent with the supplied official company website. "
                    "Note: Domain consistency is a necessary baseline but does not constitute cryptographic identity verification (email headers may still require SPF/DKIM verification)."
                ),
                "recommended_action": "Verify that email headers or reply-to addresses match the legitimate corporate server.",
                "evidence_source": f"Comparison: {email_host} vs {comp_host}",
            }

        # Check if recruiter is from a recognized staffing agency
        if email_reg in RECOGNIZED_STAFFING_AGENCIES:
            agency_name = RECOGNIZED_STAFFING_AGENCIES[email_reg]
            return {
                "check_id": "recruiter_email_domain",
                "title": "Recruiter Email Domain Alignment",
                "status": FindingStatus.NO_MISMATCH_OBSERVED,
                "severity": FindingSeverity.INFORMATIONAL,
                "observation": f"Recruiter domain (@{email_host}) belongs to recognized staffing agency {agency_name}.",
                "explanation": (
                    f"Third-party recruiters from recognized staffing firms ({agency_name}) routinely recruit on behalf of client employers ({employer_name or comp_reg}). "
                    "A domain difference in this context is standard industry practice."
                ),
                "recommended_action": "Confirm that the recruiter is officially engaged by the client organization.",
                "evidence_source": f"Recognized staffing registry: {email_host}",
            }

        # Genuine domain mismatch
        return {
            "check_id": "recruiter_email_domain",
            "title": "Recruiter Email Domain Alignment",
            "status": FindingStatus.CONCERN_OBSERVED,
            "severity": FindingSeverity.WARNING,
            "observation": f"Recruiter domain (@{email_host}) does NOT match supplied company domain ({comp_reg}).",
            "explanation": (
                f"The recruiter's email domain (@{email_host}) differs from the organization's stated official domain ({comp_reg}). "
                "Impersonators often register lookalike domains or completely unrelated domains to deceive candidates."
            ),
            "recommended_action": (
                "Do not submit sensitive documents to this address. Cross-check the recruiter's name against the employer's official careers portal."
            ),
            "evidence_source": f"Cross-domain audit: {email_host} != {comp_reg}",
        }

    # Case 3: Email provided, but company website is missing or malformed
    website_provided = bool(company_website and company_website.strip())
    observation = (
        f"Recruiter domain (@{email_host}) uses a custom domain, but the supplied company website \"{company_website}\" is malformed and could not be verified."
        if website_provided
        else f"Recruiter domain (@{email_host}) uses a custom domain, but no company website was provided to compare against."
    )
    return {
        "check_id": "recruiter_email_domain",
        "title": "Recruiter Email Domain Alignment",
        "status": FindingStatus.UNABLE_TO_DETERMINE,
        "severity": FindingSeverity.NEUTRAL,
        "observation": observation,
        "explanation": "Without a valid official company website, cross-referencing email domain authenticity cannot be completed.",
        "recommended_action": "Supply a valid official company website URL to verify domain correspondence.",
        "evidence_source": f"Recruiter email: {recruiter_email}",
    }


def check_application_destination(
    application_url: Optional[str],
    company_website: Optional[str],
) -> Dict[str, Any]:
    """Compare application destination URL against official company domain and known ATS platforms."""
    if not application_url or not application_url.strip():
        return {
            "check_id": "application_destination",
            "title": "Application Destination URL Check",
            "status": FindingStatus.NOT_CHECKED,
            "severity": FindingSeverity.NEUTRAL,
            "observation": "No external application destination URL was supplied for verification.",
            "explanation": "Verifying the application destination ensures candidates are not directed to phishing portals or credential harvesters.",
            "recommended_action": "If applying externally, inspect the destination address bar before entering personal details.",
            "evidence_source": "Applicant input",
        }

    app_host, app_reg = normalize_domain(application_url)
    if not app_host or not app_reg:
        return {
            "check_id": "application_destination",
            "title": "Application Destination URL Check",
            "status": FindingStatus.UNABLE_TO_DETERMINE,
            "severity": FindingSeverity.WARNING,
            "observation": f"The application URL \"{application_url}\" could not be parsed as a valid web address.",
            "explanation": "The URL structure appears malformed or lacks a valid top-level domain.",
            "recommended_action": "Ensure the application URL starts with https:// and contains a valid domain name.",
            "evidence_source": "URL syntax parser",
        }

    # Case 1: Known enterprise ATS or job board
    if app_reg in REPUTABLE_ATS_DOMAINS:
        ats_name = REPUTABLE_ATS_DOMAINS[app_reg]
        return {
            "check_id": "application_destination",
            "title": "Application Destination URL Check",
            "status": FindingStatus.NO_MISMATCH_OBSERVED,
            "severity": FindingSeverity.INFORMATIONAL,
            "observation": f"Application destination routes through established hiring platform {ats_name} ({app_reg}).",
            "explanation": (
                f"Enterprises routinely host job applications on dedicated Applicant Tracking Systems like {ats_name}. "
                "Routing through a standard ATS is standard corporate practice."
            ),
            "recommended_action": "Verify that the job title and employer name match on the ATS page.",
            "evidence_source": f"Application URL: {app_host}",
        }

    comp_host, comp_reg = normalize_domain(company_website)

    # Case 2: Matches official company website domain
    if comp_reg and app_reg == comp_reg:
        return {
            "check_id": "application_destination",
            "title": "Application Destination URL Check",
            "status": FindingStatus.NO_MISMATCH_OBSERVED,
            "severity": FindingSeverity.INFORMATIONAL,
            "observation": f"Application URL domain ({app_reg}) matches the claimed company website domain.",
            "explanation": "The candidate is directed to apply on the employer's first-party web domain.",
            "recommended_action": "Ensure the connection uses valid HTTPS encryption before submitting your resume.",
            "evidence_source": f"Cross-domain audit: {app_host} == {comp_reg}",
        }

    # Case 3: Company website provided, but application URL belongs to an unrelated, non-ATS third party
    if comp_reg and app_reg != comp_reg:
        return {
            "check_id": "application_destination",
            "title": "Application Destination URL Check",
            "status": FindingStatus.CONCERN_OBSERVED,
            "severity": FindingSeverity.WARNING,
            "observation": f"Application destination domain ({app_reg}) differs from official company domain ({comp_reg}) and is not a recognized ATS.",
            "explanation": (
                f"The application links to an unverified third-party domain ({app_host}) rather than the employer's official website or a known ATS. "
                "Fraudulent campaigns often use lookalike forms or generic data-collection pages to harvest applicant details."
            ),
            "recommended_action": (
                "Do not enter passwords or financial details on third-party forms. Apply directly through the employer's official careers site."
            ),
            "evidence_source": f"Cross-domain audit: {app_host} vs {comp_reg}",
        }

    # Case 4: No valid company website to compare against
    website_provided = bool(company_website and company_website.strip())
    observation = (
        f"Application destination points to {app_host}, but the supplied company website \"{company_website}\" is malformed and could not be verified."
        if website_provided
        else f"Application destination points to {app_host}, but no official company domain was provided for comparison."
    )
    return {
        "check_id": "application_destination",
        "title": "Application Destination URL Check",
        "status": FindingStatus.UNABLE_TO_DETERMINE,
        "severity": FindingSeverity.NEUTRAL,
        "observation": observation,
        "explanation": "Cross-domain verification requires a valid official company website URL.",
        "recommended_action": "Provide a valid official company website URL to verify routing authenticity.",
        "evidence_source": f"Application URL: {app_host}",
    }


def check_information_completeness(
    company_website: Optional[str],
    recruiter_email: Optional[str],
    application_url: Optional[str],
    employer_name: Optional[str],
) -> Dict[str, Any]:
    """Audit the completeness of provided metadata to ensure sufficient verifiable evidence."""
    missing_items = []
    if not (employer_name and employer_name.strip()):
        missing_items.append("Employer Name")
    if not (company_website and company_website.strip()):
        missing_items.append("Official Company Website")
    if not (recruiter_email and recruiter_email.strip()):
        missing_items.append("Recruiter Email")
    if not (application_url and application_url.strip()):
        missing_items.append("Application URL")

    if len(missing_items) >= 3:
        return {
            "check_id": "data_completeness",
            "title": "Corroborating Evidence Completeness",
            "status": FindingStatus.UNABLE_TO_DETERMINE,
            "severity": FindingSeverity.INFORMATIONAL,
            "observation": f"Multiple verification fields are missing: {', '.join(missing_items)}.",
            "explanation": (
                "Automated Trust Chain cross-referencing relies on comparing multiple data points (website, sender email, application URL). "
                "With minimal metadata, analysis relies primarily on textual NLP pattern detection."
            ),
            "recommended_action": "Add official website and recruiter contact details for deeper cross-source corroboration.",
            "evidence_source": "Metadata completeness audit",
        }

    if missing_items:
        return {
            "check_id": "data_completeness",
            "title": "Corroborating Evidence Completeness",
            "status": FindingStatus.NO_MISMATCH_OBSERVED,
            "severity": FindingSeverity.NEUTRAL,
            "observation": f"Core details provided. Unspecified optional fields: {', '.join(missing_items)}.",
            "explanation": "Sufficient corroborating fields were provided to execute cross-domain consistency checks.",
            "recommended_action": "Review available findings below.",
            "evidence_source": "Metadata completeness audit",
        }

    return {
        "check_id": "data_completeness",
        "title": "Corroborating Evidence Completeness",
        "status": FindingStatus.NO_MISMATCH_OBSERVED,
        "severity": FindingSeverity.INFORMATIONAL,
        "observation": "Full multi-source trust chain metadata provided (employer, website, email, application destination).",
        "explanation": "All cross-referencing checks were able to evaluate supplied parameters against independent domain rules.",
        "recommended_action": "Review individual check results for cross-source consistency.",
        "evidence_source": "Metadata completeness audit",
    }


def execute_trust_chain_investigation(
    description: str,
    title: Optional[str] = None,
    company_profile: Optional[str] = None,
    requirements: Optional[str] = None,
    benefits: Optional[str] = None,
    employer_name: Optional[str] = None,
    company_website: Optional[str] = None,
    recruiter_email: Optional[str] = None,
    application_url: Optional[str] = None,
    recruiter_message: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute all deterministic trust chain evidence checks and generate a structured summary.

    Does NOT replace or alter the ML model's prediction or probability.
    Returns findings as distinct, verifiable observations.
    """
    # Consolidate text corpus for NLP checks
    text_components = [
        description or "",
        title or "",
        company_profile or "",
        requirements or "",
        benefits or "",
        recruiter_message or "",
    ]
    combined_text = " ".join([c for c in text_components if c.strip()])

    # Effective employer name (prefer explicit employer_name, fallback to company_profile if short)
    effective_employer = employer_name
    if not effective_employer and company_profile and len(company_profile.strip()) < 80:
        effective_employer = company_profile.strip()

    findings: List[Dict[str, Any]] = []

    # 1. Payment demand check
    findings.append(check_payment_demands(combined_text))

    # 2. Credential & OTP request check
    findings.append(check_credential_requests(combined_text))

    # 3. Recruiter email domain check
    findings.append(check_recruiter_email_domain(recruiter_email, company_website, effective_employer))

    # 4. Application destination check
    findings.append(check_application_destination(application_url, company_website))

    # 5. Metadata completeness audit
    findings.append(check_information_completeness(company_website, recruiter_email, application_url, effective_employer))

    # Aggregate metrics
    total_checks = len(findings)
    executed_checks = sum(1 for f in findings if f["status"] != FindingStatus.NOT_CHECKED)
    concerns_count = sum(1 for f in findings if f["status"] == FindingStatus.CONCERN_OBSERVED)
    no_mismatch_count = sum(1 for f in findings if f["status"] == FindingStatus.NO_MISMATCH_OBSERVED)
    unable_count = sum(1 for f in findings if f["status"] == FindingStatus.UNABLE_TO_DETERMINE)
    not_checked_count = sum(1 for f in findings if f["status"] == FindingStatus.NOT_CHECKED)

    # Synthesize overall trust chain recommendation
    critical_concerns = [f for f in findings if f["status"] == FindingStatus.CONCERN_OBSERVED and f["severity"] == FindingSeverity.CRITICAL]
    warning_concerns = [f for f in findings if f["status"] == FindingStatus.CONCERN_OBSERVED and f["severity"] == FindingSeverity.WARNING]

    if critical_concerns:
        overall_recommendation = (
            f"Critical Trust Warning: {len(critical_concerns)} high-risk direct demand(s) observed "
            f"({', '.join([c['title'] for c in critical_concerns])}). Immediate caution required."
        )
    elif warning_concerns:
        overall_recommendation = (
            f"Investigation Recommended: {len(warning_concerns)} cross-source domain inconsistency/inconsistencies observed. "
            "Verify contact authenticity before proceeding."
        )
    elif no_mismatch_count >= 3:
        overall_recommendation = (
            "Consistent Evidence: No domain mismatches or direct financial demands were observed across the evaluated trust chain."
        )
    else:
        overall_recommendation = (
            "Limited Evidence: Text analysis complete, but limited external contact/website data was supplied for cross-source corroboration."
        )

    summary = {
        "total_checks": total_checks,
        "executed_checks": executed_checks,
        "concerns_count": concerns_count,
        "no_mismatch_count": no_mismatch_count,
        "unable_to_determine_count": unable_count,
        "not_checked_count": not_checked_count,
        "overall_trust_recommendation": overall_recommendation,
    }

    return {
        "trust_chain_findings": findings,
        "trust_chain_summary": summary,
    }
