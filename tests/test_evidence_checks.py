"""Unit tests for ScamShield AI Trust Chain Evidence Checking Engine.

Covers:
1. Explicit upfront fee request.
2. OTP or password request.
3. Matching supplied domains.
4. Mismatched supplied domains.
5. Missing company details.
6. Legitimate third-party recruitment domains (ATS and recognized agencies).
7. Benign mention of payment in a warning context (negation filtering).
8. Malformed URLs and email addresses.
9. Backward compatibility and alias resolution in JobAnalysisRequest.
"""

from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest

from backend.schemas import JobAnalysisRequest
from backend.services.trust_chain import (
    FindingSeverity,
    FindingStatus,
    check_application_destination,
    check_credential_requests,
    check_information_completeness,
    check_payment_demands,
    check_recruiter_email_domain,
    execute_trust_chain_investigation,
    normalize_domain,
)


# --- 1. Domain Normalization & URL Parsing Tests ---

def test_normalize_domain_valid_urls():
    """Verify clean extraction of hostname and registrable domain."""
    assert normalize_domain("https://careers.google.com/jobs/123") == ("careers.google.com", "google.com")
    assert normalize_domain("http://www.amazon.co.uk/p/test") == ("www.amazon.co.uk", "amazon.co.uk")
    assert normalize_domain("stripe.com") == ("stripe.com", "stripe.com")
    assert normalize_domain("sub.corp.microsoft.com:8080") == ("sub.corp.microsoft.com", "microsoft.com")
    assert normalize_domain("recruiter@infosys.co.in") == ("infosys.co.in", "infosys.co.in")


def test_normalize_domain_malformed_inputs():
    """Verify safe handling of None, empty strings, and malformed URLs."""
    assert normalize_domain(None) == (None, None)
    assert normalize_domain("") == (None, None)
    assert normalize_domain("   ") == (None, None)
    assert normalize_domain("not_a_valid_url") == (None, None)
    assert normalize_domain("http://") == (None, None)
    assert normalize_domain("https://..com") == (None, None)


# --- 2. Upfront Fee & Payment Demand Tests ---

def test_explicit_upfront_fee_request():
    """Verify detection of explicit demand for registration or interview fee."""
    text = (
        "We have selected your resume for Data Entry. Candidate must pay a ₹2,500 registration fee "
        "and security deposit upfront before the interview can be scheduled."
    )
    result = check_payment_demands(text)
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.CRITICAL
    assert "fee_payment_demand" == result["check_id"]
    assert "registration fee" in result["observation"].lower()


def test_wire_transfer_equipment_fee():
    """Verify detection of payment demanded via wire transfer or money transfer."""
    text = "Work from home setup. You must send $250 equipment fee via wire transfer to receive your home office kit."
    result = check_payment_demands(text)
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.CRITICAL


def test_benign_mention_of_payment_in_warning_context():
    """Verify that mentioning fees in a disclaimer or warning does NOT trigger a false positive."""
    disclaimer_texts = [
        "Acme Corp does not charge any application or recruitment fees at any stage of the hiring process.",
        "Beware of scammers: our recruiters will never ask for fees, deposits, or payment of any kind.",
        "All interviews and assessments are free of charge. We never request money from applicants.",
        "Warning: Any job offer demanding a registration fee is fraudulent.",
    ]
    for text in disclaimer_texts:
        result = check_payment_demands(text)
        assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED, f"False positive on: {text}"
        assert result["severity"] == FindingSeverity.NEUTRAL


# --- 3. Credential & OTP Request Tests ---

def test_otp_and_password_demand():
    """Verify detection of requests for OTPs or passwords."""
    text = "To confirm your identity for the interview, please share the OTP sent to your phone number."
    result = check_credential_requests(text)
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.CRITICAL
    assert "credential_otp_request" == result["check_id"]

    password_text = "Send your email password so our IT department can configure your employee profile."
    pwd_result = check_credential_requests(password_text)
    assert pwd_result["status"] == FindingStatus.CONCERN_OBSERVED


def test_benign_credential_warning():
    """Verify that advisory warnings against sharing OTPs do NOT trigger false positives."""
    text = "Security reminder: We will never ask for your password or OTP. Do not share your verification code."
    result = check_credential_requests(text)
    assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED
    assert result["severity"] == FindingSeverity.NEUTRAL


# --- 4. Recruiter Email Domain Alignment Tests ---

def test_matching_supplied_domains():
    """Verify that matching recruiter email and company domains yield no mismatch."""
    email = "talent.acquisition@stripe.com"
    website = "https://stripe.com/jobs"
    result = check_recruiter_email_domain(email, website, "Stripe")
    assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED
    assert result["severity"] == FindingSeverity.INFORMATIONAL
    assert "matches" in result["observation"].lower()


def test_matching_subdomain_and_root_domain():
    """Verify matching across subdomains (e.g., hr@careers.google.com vs https://google.com)."""
    email = "recruiter@careers.google.com"
    website = "https://www.google.com"
    result = check_recruiter_email_domain(email, website, "Google")
    assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED


def test_mismatched_supplied_domains():
    """Verify detection of mismatch between recruiter email domain and claimed website."""
    email = "recruiter@microsoft-careers-portal.com"
    website = "https://microsoft.com"
    result = check_recruiter_email_domain(email, website, "Microsoft")
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.WARNING
    assert "does not match" in result["observation"].lower()


def test_free_webmail_for_corporate_employer():
    """Verify that personal webmail addresses representing corporate employers are flagged."""
    email = "google.hiring.team@gmail.com"
    website = "https://google.com"
    result = check_recruiter_email_domain(email, website, "Google")
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.WARNING
    assert "free public email" in result["observation"].lower()


def test_recognized_staffing_agency_email():
    """Verify that recognized third-party staffing firms are acknowledged properly."""
    email = "john.doe@randstad.com"
    website = "https://acme-manufacturing.com"
    result = check_recruiter_email_domain(email, website, "Acme Manufacturing")
    assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED
    assert "recognized staffing agency" in result["observation"].lower()


def test_malformed_recruiter_email():
    """Verify graceful handling of malformed email strings."""
    result = check_recruiter_email_domain("not_an_email", "https://example.com", "Example")
    assert result["status"] == FindingStatus.UNABLE_TO_DETERMINE
    assert result["severity"] == FindingSeverity.WARNING


# --- 5. Application Destination URL Tests ---

def test_application_matches_company_domain():
    """Verify matching application destination."""
    app_url = "https://careers.netflix.com/jobs/view/100"
    website = "https://netflix.com"
    result = check_application_destination(app_url, website)
    assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED


def test_application_routes_through_reputable_ats():
    """Verify that standard enterprise ATS domains (Greenhouse, Lever, Workday) are recognized."""
    ats_urls = [
        "https://boards.greenhouse.io/figma/jobs/123",
        "https://jobs.lever.co/canva/456",
        "https://adobe.myworkdayjobs.com/en-US/external_careers/job/123",
        "https://jobs.smartrecruiters.com/AcmeCorp/789",
    ]
    for url in ats_urls:
        result = check_application_destination(url, "https://company.example.com")
        assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED, f"Failed on ATS URL: {url}"
        assert "established hiring platform" in result["observation"].lower()


def test_application_mismatch_unrecognized_domain():
    """Verify that non-ATS unrelated destinations are flagged when company website is provided."""
    app_url = "https://free-survey-forms-collect.net/apply-now"
    website = "https://amazon.com"
    result = check_application_destination(app_url, website)
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.WARNING


def test_application_malformed_url():
    """Verify safe handling of unparseable application URLs."""
    result = check_application_destination("htp:/invalid-url", "https://example.com")
    assert result["status"] == FindingStatus.UNABLE_TO_DETERMINE


# --- 6. Missing Details & Data Completeness Tests ---

def test_missing_company_details_completeness_check():
    """Verify that missing metadata fields result in unable_to_determine status."""
    result = check_information_completeness(
        company_website=None,
        recruiter_email=None,
        application_url=None,
        employer_name=None,
    )
    assert result["status"] == FindingStatus.UNABLE_TO_DETERMINE
    assert "multiple verification fields are missing" in result["observation"].lower()


def test_unprovided_fields_in_individual_checks():
    """Verify that omitted optional inputs return not_checked status."""
    email_res = check_recruiter_email_domain(None, "https://stripe.com", "Stripe")
    assert email_res["status"] == FindingStatus.NOT_CHECKED

    app_res = check_application_destination(None, "https://stripe.com")
    assert app_res["status"] == FindingStatus.NOT_CHECKED


# --- 7. Full Investigation Engine Integration & Aliases ---

def test_full_trust_chain_investigation_integration():
    """Verify end-to-end trust chain execution returns structured findings and summary."""
    result = execute_trust_chain_investigation(
        description="Senior Python Backend Developer with 5 years experience.",
        title="Senior Python Developer",
        employer_name="Stripe",
        company_website="https://stripe.com",
        recruiter_email="recruiting@stripe.com",
        application_url="https://stripe.com/jobs/123",
    )
    assert "trust_chain_findings" in result
    assert "trust_chain_summary" in result
    assert len(result["trust_chain_findings"]) == 5

    summary = result["trust_chain_summary"]
    assert summary["concerns_count"] == 0
    assert summary["executed_checks"] == 5
    assert "Consistent Evidence" in summary["overall_trust_recommendation"]


def test_job_analysis_request_backward_compatibility_and_aliases():
    """Verify that existing clients and alias names work seamlessly."""
    # Old payload format (no trust chain fields)
    old_payload = {
        "description": "Standard job posting description for backward compatibility testing.",
        "title": "Software Engineer",
    }
    req_old = JobAnalysisRequest(**old_payload)
    assert req_old.job_url is None
    assert req_old.employer_name is None

    # New payload format with aliases
    alias_payload = {
        "description": "Standard job posting description with alternative field aliases.",
        "job_posting_url": "https://linkedin.com/jobs/view/999",
        "claimed_employer": "Google LLC",
        "official_company_url": "https://google.com",
        "application_destination_url": "https://careers.google.com/jobs",
        "additional_context": "Recruiter reached out via LinkedIn InMail.",
    }
    req_alias = JobAnalysisRequest(**alias_payload)
    assert req_alias.job_url == "https://linkedin.com/jobs/view/999"
    assert req_alias.employer_name == "Google LLC"
    assert req_alias.company_website == "https://google.com"
    assert req_alias.application_url == "https://careers.google.com/jobs"
    assert req_alias.recruiter_message == "Recruiter reached out via LinkedIn InMail."


# --- 8. Audit Scenario Verification Tests (Scenarios 1 through 7) ---

def test_scenario_1_explicit_recruitment_fee_before_interview():
    """Scenario 1: Posting asks applicant to pay registration fee before interview.
    Confirm appropriate warning appears with evidence from submitted text.
    """
    text = (
        "Thank you for applying. All applicants must pay a mandatory registration fee of $75 "
        "before the interview can be scheduled with our hiring manager."
    )
    result = check_payment_demands(text)
    assert result["status"] == FindingStatus.CONCERN_OBSERVED
    assert result["severity"] == FindingSeverity.CRITICAL
    assert result["check_id"] == "fee_payment_demand"
    # Confirm evidence snippet from submitted text is present in observation
    assert "registration fee" in result["observation"].lower()
    assert "pay a mandatory registration fee" in result["observation"].lower()
    assert "applicant" in result["explanation"].lower() or "fraud" in result["explanation"].lower()


def test_scenario_2_domain_mismatch_three_way():
    """Scenario 2: Employer domain, recruiter email, and application domain all differ.
    Confirm comparisons are correct and findings identify the specific mismatch.
    """
    employer_website = "https://stripe.com"
    recruiter_email = "talent@fintech-recruiters-portal.net"
    application_url = "https://generic-form-collector.org/apply/stripe"

    # Recruiter email check
    email_check = check_recruiter_email_domain(recruiter_email, employer_website, "Stripe")
    assert email_check["status"] == FindingStatus.CONCERN_OBSERVED
    assert email_check["severity"] == FindingSeverity.WARNING
    assert "fintech-recruiters-portal.net" in email_check["observation"]
    assert "stripe.com" in email_check["observation"]

    # Application destination check
    app_check = check_application_destination(application_url, employer_website)
    assert app_check["status"] == FindingStatus.CONCERN_OBSERVED
    assert app_check["severity"] == FindingSeverity.WARNING
    assert "generic-form-collector.org" in app_check["observation"]
    assert "stripe.com" in app_check["observation"]


def test_scenario_3_matching_domains_no_unsupported_verification():
    """Scenario 3: Compatible employer, recruiter, and application domains.
    Confirm checks report only what supplied info supports; do not mark employer as independently verified.
    """
    employer_website = "https://netflix.com"
    recruiter_email = "jobs@netflix.com"
    application_url = "https://jobs.netflix.com/jobs/789"

    full_result = execute_trust_chain_investigation(
        description="Senior Distributed Systems Engineer working on video streaming microservices.",
        title="Senior Systems Engineer",
        employer_name="Netflix",
        company_website=employer_website,
        recruiter_email=recruiter_email,
        application_url=application_url,
    )
    findings = {f["check_id"]: f for f in full_result["trust_chain_findings"]}

    # Recruiter email finding
    assert findings["recruiter_email_domain"]["status"] == FindingStatus.NO_MISMATCH_OBSERVED
    assert "matches" in findings["recruiter_email_domain"]["observation"].lower()
    # Ensure findings do not claim independent verification or guarantee
    assert "verified employer" not in findings["recruiter_email_domain"]["observation"].lower()
    assert "guarantee" not in findings["recruiter_email_domain"]["observation"].lower()

    # Application destination finding
    assert findings["application_destination"]["status"] == FindingStatus.NO_MISMATCH_OBSERVED

    # Summary recommendation
    summary = full_result["trust_chain_summary"]
    assert summary["concerns_count"] == 0
    assert "Consistent Evidence" in summary["overall_trust_recommendation"]
    # Verify summary does not state employer is externally certified/verified
    assert "certified" not in summary["overall_trust_recommendation"].lower()


def test_scenario_4_missing_information_not_fabricated():
    """Scenario 4: Omit recruiter email and official company URL.
    Return an appropriate not-checked or insufficient-evidence status, not a fabricated finding.
    """
    full_result = execute_trust_chain_investigation(
        description="Standard job posting description with no recruiter email or company website provided.",
        title="Account Executive",
        employer_name=None,
        company_website=None,
        recruiter_email=None,
        application_url=None,
    )
    findings = {f["check_id"]: f for f in full_result["trust_chain_findings"]}

    assert findings["recruiter_email_domain"]["status"] == FindingStatus.NOT_CHECKED
    assert "no recruiter email" in findings["recruiter_email_domain"]["observation"].lower()

    assert findings["application_destination"]["status"] == FindingStatus.NOT_CHECKED
    assert "no external application" in findings["application_destination"]["observation"].lower()

    assert findings["data_completeness"]["status"] == FindingStatus.UNABLE_TO_DETERMINE
    assert full_result["trust_chain_summary"]["not_checked_count"] == 2
    assert "Limited Evidence" in full_result["trust_chain_summary"]["overall_trust_recommendation"]


def test_scenario_5_legitimate_third_party_recruiting_platform():
    """Scenario 5: Use a job hosted on a third-party recruiting platform (ATS / job board).
    Confirm that the platform domain alone is not treated as evidence of fraud.
    """
    platforms = [
        ("https://boards.greenhouse.io/figma/jobs/123", "https://figma.com", "Greenhouse ATS"),
        ("https://jobs.lever.co/canva/456", "https://canva.com", "Lever ATS"),
        ("https://adobe.myworkdayjobs.com/careers/job/789", "https://adobe.com", "Workday Recruiting"),
        ("https://apply.workable.com/spotify/j/101", "https://spotify.com", "Workable"),
    ]
    for app_url, comp_url, platform_name in platforms:
        check = check_application_destination(app_url, comp_url)
        assert check["status"] == FindingStatus.NO_MISMATCH_OBSERVED, f"Platform falsely flagged: {app_url}"
        assert check["severity"] == FindingSeverity.INFORMATIONAL
        assert platform_name.lower() in check["observation"].lower() or "established hiring platform" in check["observation"].lower()


def test_scenario_6_benign_wording_anti_scam_warnings():
    """Scenario 6: Text discusses recruitment fees in a warning against scams.
    Confirm detector does not automatically treat every mention of a fee as an actual payment demand.
    """
    benign_texts = [
        "Please note that Google will never ask candidates to pay an interview fee or purchase equipment.",
        "Candidates are not required to pay any registration fee or security deposit at any point.",
        "Beware of recruitment fraud: We never request payment of any kind during the hiring process.",
        "Our hiring process is completely free of charge. Do not pay any money to individuals claiming to represent us.",
        "Warning: Any job offer demanding fee or wire transfer is fraudulent and should be reported.",
        "We do not solicit fees for employment applications.",
    ]
    for text in benign_texts:
        result = check_payment_demands(text)
        assert result["status"] == FindingStatus.NO_MISMATCH_OBSERVED, f"False positive triggered on: {text}"
        assert result["severity"] == FindingSeverity.NEUTRAL
        assert result["check_id"] == "fee_payment_demand"


def test_scenario_7_malformed_input_handling():
    """Scenario 7: Test invalid URLs, invalid email addresses, empty descriptions, and missing fields.
    Return useful validation errors / unable_to_determine status.
    """
    from pydantic import ValidationError

    # 1. Invalid email syntax & unparseable domain
    res_bad_email1 = check_recruiter_email_domain("invalid_email_no_at", "https://example.com", "Example")
    assert res_bad_email1["status"] == FindingStatus.UNABLE_TO_DETERMINE
    assert "malformed" in res_bad_email1["observation"].lower()

    res_bad_email2 = check_recruiter_email_domain("user@not_valid_domain", "https://example.com", "Example")
    assert res_bad_email2["status"] == FindingStatus.UNABLE_TO_DETERMINE
    assert "invalid" in res_bad_email2["observation"].lower() or "unparseable" in res_bad_email2["observation"].lower()

    # 2. Invalid application URL
    res_bad_url = check_application_destination("htp://bad-scheme", "https://example.com")
    assert res_bad_url["status"] == FindingStatus.UNABLE_TO_DETERMINE
    assert "could not be parsed" in res_bad_url["observation"].lower()

    # 3. Empty or whitespace description
    with pytest.raises(ValidationError) as exc_empty:
        JobAnalysisRequest(description="")
    assert "description" in str(exc_empty.value).lower()

    with pytest.raises(ValidationError) as exc_ws:
        JobAnalysisRequest(description="          ")
    assert "empty or purely whitespace" in str(exc_ws.value).lower()

    # 4. Missing required fields (neither description nor job_url provided)
    with pytest.raises(ValidationError) as exc_missing:
        JobAnalysisRequest.model_validate({})
    assert "either a job description" in str(exc_missing.value).lower() or "field required" in str(exc_missing.value).lower()

