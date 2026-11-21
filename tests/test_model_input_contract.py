"""Software parity checks for the existing model; not scientific accuracy evidence."""
import asyncio
import hashlib
import importlib.util
import json
from itertools import combinations
from pathlib import Path
from unittest.mock import patch

import joblib
import numpy as np
import pandas as pd
import pytest

from backend.schemas import JobAnalysisRequest
from backend.services.prediction import PredictionService
from backend.services.url_extractor import JobExtractionResult
from ml.explain import explain_prediction
from ml.preprocess import (
    TEXT_COLUMNS, build_model_input, extract_combined_text_from_df,
    extract_combined_text_from_dict, prepare_training_data,
)

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'research/experiments/phase_02b/evidence'


@pytest.fixture(scope='module')
def model():
    return joblib.load(ROOT / 'models/baseline_model.joblib')


@pytest.fixture(scope='module')
def baseline_cases():
    archive_script = ROOT / 'research/experiments/phase_02b/scripts/verify_contract.py'
    if not archive_script.exists() or not (EVIDENCE / 'reference_before.json').exists() or not (ROOT / 'data/fake_job_postings.csv').exists():
        pytest.skip('Archived parity checks require the separately obtained local dataset and private research reference files.')
    spec = importlib.util.spec_from_file_location('phase2b_contract_check', archive_script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.cases()


@pytest.fixture(scope='module')
def existing_sample(baseline_cases):
    # Only actual five-field dataset content is used for saved-model/integration checks.
    return {k: None if pd.isna(v) else v for k, v in baseline_cases[0][1].items()}


def test_original_training_strings_features_scores_and_attributions(model, baseline_cases, tmp_path):
    reference = json.loads((EVIDENCE / 'reference_before.json').read_text(encoding='utf-8'))['cases']
    checked = []
    for (name, sample), old in zip(baseline_cases, reference):
        assert name == old['case_id']
        training = extract_combined_text_from_df(pd.DataFrame([sample])).iloc[0]
        inference = build_model_input(sample)
        assert training == inference == extract_combined_text_from_dict(sample)
        assert hashlib.sha256(training.encode()).hexdigest() == old['text_sha256']
        vector = model.named_steps['tfidf'].transform([training]).tocsr()
        assert vector.indices.tolist() == old['feature_indices']
        np.testing.assert_allclose(vector.data, old['feature_values'], rtol=0, atol=1e-15)
        score = model.predict_proba([inference])[0]
        np.testing.assert_allclose(score, old['scores'], rtol=0, atol=1e-15)
        explanation = json.dumps(explain_prediction(model, inference), sort_keys=True, separators=(',', ':'))
        assert hashlib.sha256(explanation.encode()).hexdigest() == old['explanation_sha256']
        checked.append(name)
    assert len(checked) == len(reference) == 14
    (tmp_path / 'parity_checks.json').write_text(json.dumps({
        'baseline_cases_checked': checked, 'text_hashes_equal': True,
        'sparse_features_equal_within_absolute_tolerance': 1e-15,
        'saved_model_scores_equal_within_absolute_tolerance': 1e-15,
        'explanation_hashes_equal': True,
        'scientific_scope': 'Five existing dataset rows and nine software edge fixtures; no accuracy experiment or training.'
    }, indent=2), encoding='utf-8')


def test_original_field_order_and_format():
    sample = {k: str(i) for i, k in enumerate(reversed(TEXT_COLUMNS))}
    expected = 'title: 4 company_profile: 3 description: 2 requirements: 1 benefits: 0'
    assert build_model_input(sample) == expected


def test_every_missing_field_combination_and_nondefault_dataframe_index():
    for size in range(6):
        for selected in combinations(TEXT_COLUMNS, size):
            sample = {k: 'Value' for k in selected}
            expected = ' '.join(k + ': value' for k in TEXT_COLUMNS if k in selected) or 'unspecified job opportunity'
            df = pd.DataFrame([sample], index=[37])
            combined = extract_combined_text_from_df(df)
            assert combined.index.tolist() == [37]
            assert combined.iloc[0] == build_model_input(sample) == expected
    assert extract_combined_text_from_df(pd.DataFrame()).empty


@pytest.mark.parametrize('missing', [None, float('nan'), pd.NA, '', ' \t\n'])
def test_missing_scalar_variants_and_original_fallback(missing):
    sample = {k: missing for k in TEXT_COLUMNS}
    assert build_model_input(sample) == 'unspecified job opportunity'
    assert extract_combined_text_from_df(pd.DataFrame([sample])).iloc[0] == 'unspecified job opportunity'


def test_html_newlines_and_punctuation_preserve_existing_cleanup():
    assert build_model_input({'title': '<b>Engineer</b>\n', 'description': '<p>Build\n APIs !</p> Apply now .'}) == 'title: engineer description: build apis! apply now.'


def test_metadata_target_and_identifier_invariance(model, existing_sample):
    base = build_model_input(existing_sample)
    metadata = {k: 'excluded marker' for k in (
        'employment_type', 'required_experience', 'required_education', 'industry',
        'function', 'employer_name', 'recruiter_email', 'company_website',
        'application_url', 'recruiter_message', 'job_id', 'fraudulent',
    )}
    modified = {**existing_sample, **metadata}
    assert build_model_input(modified) == extract_combined_text_from_dict(modified) == base
    x, y = prepare_training_data(pd.DataFrame([modified]).assign(fraudulent=1, job_id=999))
    assert x.iloc[0] == base and y.iloc[0] == 1
    original_vector = model.named_steps['tfidf'].transform([base])
    modified_vector = model.named_steps['tfidf'].transform([build_model_input(modified)])
    assert (original_vector != modified_vector).nnz == 0
    np.testing.assert_array_equal(model.predict_proba([base]), model.predict_proba([build_model_input(modified)]))
    assert explain_prediction(model, base) == explain_prediction(model, build_model_input(modified))


def _final_event(chunks):
    for chunk in chunks:
        if chunk.startswith('event: complete\n'):
            return json.loads(chunk.split('data: ', 1)[1])
    raise AssertionError('Missing stream completion')


@pytest.mark.parametrize('mode', ['structured', 'free_text', 'extracted_url'])
def test_sync_stream_model_input_metadata_and_attribution(model, existing_sample, mode):
    sample = dict(existing_sample) if mode == 'structured' else {'description': existing_sample['description']}
    extracted = JobExtractionResult(url='https://jobs.example.invalid/posting', status='success', title=existing_sample['title'], extracted_text=existing_sample['description'])
    if mode == 'extracted_url':
        sample = {'job_url': extracted.url}
    metadata = dict(employment_type='Contract', employer_name='Example Employer',
                    company_website='https://example.invalid', recruiter_email='recruiter@example.invalid',
                    application_url='https://example.invalid/apply', recruiter_message='Separate investigation context.')
    representations = []
    actual_builder = build_model_input
    def record(payload):
        result = actual_builder(payload)
        representations.append(result)
        return result
    # Wrap real local evidence logic; mock only external web lookup and URL I/O.
    from backend.services import prediction as prediction_module
    actual_trust = prediction_module.execute_trust_chain_investigation
    service = PredictionService(ROOT / 'models/baseline_model.joblib')
    service._pipeline = model
    with patch('backend.services.prediction.build_model_input', side_effect=record), \
         patch('backend.services.prediction.execute_trust_chain_investigation', wraps=actual_trust) as trust, \
         patch('backend.services.prediction.execute_web_research', return_value=([], None)) as web, \
         patch('backend.services.prediction.extract_job_posting_from_url', return_value=extracted):
        # Real valid no-provider summary, without invoking provider code.
        web.return_value = ([], {'status': 'not_configured', 'provider': 'offline', 'total_queries_executed': 0, 'findings_count': 0, 'overall_evidence_assessment': 'Offline software check.', 'limitations_disclaimer': 'No web research performed.'})
        plain = service.analyze_job(JobAnalysisRequest(**sample))
        request = JobAnalysisRequest(**sample, **metadata)
        sync = service.analyze_job(request)
        async def collect():
            return [chunk async for chunk in service.stream_analyze_job(request)]
        streamed = _final_event(asyncio.run(collect()))
        assert len(representations) == 3
        assert representations[0] == representations[1] == representations[2]
        assert plain.fraud_probability == sync.fraud_probability == streamed['fraud_probability']
        assert sync.prediction == streamed['prediction']
        assert [s.model_dump() for s in sync.top_suspicious_signals] == streamed['top_suspicious_signals']
        assert [s.model_dump() for s in sync.top_legitimate_signals] == streamed['top_legitimate_signals']
        for call in trust.call_args_list[-2:]:
            for key in ('employer_name','company_website','recruiter_email','application_url','recruiter_message'):
                assert call.kwargs[key] == metadata[key]
        for call in web.call_args_list[-2:]:
            for key in ('employer_name','company_website','recruiter_email','application_url'):
                assert call.kwargs[key] == metadata[key]
        assert request.employment_type == metadata['employment_type']


def test_critical_evidence_escalates_review_without_changing_model(model, existing_sample):
    from backend.services.trust_chain import execute_trust_chain_investigation
    result = execute_trust_chain_investigation(description=existing_sample['description'])
    # Controlled software fixture isolates triage wiring, not a new fraud example/benchmark.
    result['trust_chain_findings'][0].update(status='concern_observed', severity='critical')
    service = PredictionService(ROOT / 'models/baseline_model.joblib');service._pipeline = model
    request = JobAnalysisRequest(**existing_sample)
    with patch('backend.services.prediction.execute_web_research', return_value=([], None)):
        baseline = service.analyze_job(request)
        with patch('backend.services.prediction.execute_trust_chain_investigation', return_value=result):
            escalated = service.analyze_job(request)
    assert escalated.prediction == baseline.prediction
    assert escalated.fraud_probability == baseline.fraud_probability
    assert escalated.risk_level == 'high' and escalated.review_decision == 'flagged_suspicious'


def test_legacy_api_score_fields_are_preserved_and_documented():
    from backend.schemas import JobAnalysisResponse
    props = JobAnalysisResponse.model_json_schema()['properties']
    assert 'fraud_probability' in props and 'confidence' in props
    assert 'uncalibrated' in props['fraud_probability']['description']
    assert 'not measured predictive reliability' in props['confidence']['description']
