import json

import pytest


ORG = "ORG-TRUST"
DATASET = "DATA-TRUST"
DASHBOARD = "DASH-TRUST"
REQUEST = "REQ-TRUST"


def _setup(contract, vm, owner, reviewer, analyst):
    vm.sender = owner
    contract.create_organization(ORG, "Trust Test", "Technology", "org-hash", "2026-08-20T00:00:00Z")
    contract.add_organization_role(ORG, reviewer, "REVIEWER", "2026-08-20T00:00:01Z")
    contract.add_organization_role(ORG, analyst, "ANALYST", "2026-08-20T00:00:02Z")
    contract.register_dataset(DATASET, ORG, "Evidence", "https://evidence.test", "fixture", "data-hash", "2026-08-20T00:00:03Z")
    contract.register_dashboard(DASHBOARD, ORG, "Dashboard", "AUDIT", "2026-Q3", "dash-hash", "2026-08-20T00:00:04Z")


@pytest.fixture
def contract(direct_deploy):
    return direct_deploy("contracts/OrditContract.py")


def test_citation_hash_binds_the_exact_truncated_content(contract):
    full_body = "evidence-" * 1200
    canonical = full_body[:5000]
    source = {
        "url": "https://evidence.test/source",
        "label": "fixture",
        "status_code": 200,
        "content": canonical,
        "content_hash": contract._sha256(canonical),
        "error": "",
    }
    result = {"findings": {"cited_sources": [{
        "url": source["url"], "content_hash": source["content_hash"], "claim": "fixture claim"
    }]}}
    contract._validate_citations(result, [source])
    assert result["findings"]["cited_sources"] == [{
        "url": source["url"], "content_hash": source["content_hash"], "claim": "fixture claim"
    }]


def test_commitment_is_deterministic_and_changes_with_canonical_content(contract):
    source = {"url": "https://evidence.test/source", "label": "fixture", "status_code": 200,
              "content": "same canonical excerpt", "content_hash": contract._sha256("same canonical excerpt"), "error": ""}
    first = contract._fetched_evidence_commitment([source])
    assert first == contract._fetched_evidence_commitment([source])
    changed = dict(source)
    changed["content"] = "changed canonical excerpt"
    changed["content_hash"] = contract._sha256(changed["content"])
    assert first != contract._fetched_evidence_commitment([changed])


def test_unfetched_or_stale_citations_are_rejected(contract):
    source = {"url": "https://evidence.test/source", "label": "fixture", "status_code": 200,
              "content": "canonical", "content_hash": contract._sha256("canonical"), "error": ""}
    result = {"findings": {"cited_sources": [
        {"url": "https://fabricated.test", "content_hash": "deadbeef", "claim": "fabricated"},
        {"url": source["url"], "content_hash": "deadbeef", "claim": "stale"},
    ]}}
    contract._validate_citations(result, [source])
    assert result["findings"]["cited_sources"] == []


def test_reviewer_only_and_self_review_are_enforced(contract, direct_vm, direct_owner, direct_alice, direct_bob):
    _setup(contract, direct_vm, direct_owner, direct_alice, direct_bob)
    direct_vm.sender = direct_bob
    contract.submit_insight_audit_request(
        REQUEST, ORG, DATASET, DASHBOARD, "Claim", "Metric", "", "Context", "claim-self", "manifest",
        json.dumps([{"url": "https://evidence.test/source"}]), "2026-08-20T00:01:00Z"
    )
    request = contract._load(contract.get_insight_request(REQUEST))
    request["status"] = "NEEDS_REVIEW"
    contract.insight_requests[REQUEST] = contract._json(request)
    with direct_vm.prank(direct_bob), direct_vm.expect_revert("required organization role"):
        contract.human_review_decision(REQUEST, "APPROVED", "no", "review", "2026-08-20T00:02:00Z")
    with direct_vm.prank(direct_alice):
        review = json.loads(contract.human_review_decision(REQUEST, "APPROVED", "independent", "review", "2026-08-20T00:03:00Z"))
    assert review["reviewer"] == str(direct_alice).lower()


def test_only_owner_or_admin_can_activate_or_block(contract, direct_vm, direct_owner, direct_alice, direct_bob):
    _setup(contract, direct_vm, direct_owner, direct_alice, direct_bob)
    request = {"request_id": REQUEST, "org_id": ORG, "claim_hash": "claim-activate", "status": "APPROVED"}
    contract.insight_requests[REQUEST] = contract._json(request)
    with direct_vm.prank(direct_bob), direct_vm.expect_revert("required organization role"):
        contract.mark_business_decision_activated(REQUEST, "unauthorized", "2026-08-20T00:04:00Z")
    with direct_vm.prank(direct_owner):
        activation = json.loads(contract.mark_business_decision_activated(REQUEST, "authorized", "2026-08-20T00:05:00Z"))
    assert activation["activated_by"] == str(direct_owner).lower()
