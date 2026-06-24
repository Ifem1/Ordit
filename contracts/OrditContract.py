# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class OrditContract(gl.Contract):
    """
    OrditContract

    A GenLayer-native AI insight auditing and accountability contract for Ordit.

    Product purpose:
    Ordit helps organizations verify that AI-generated business insights are
    genuinely supported by the underlying data. An analyst submits an insight
    (claim text, supporting metrics, assumptions, business context) alongside a
    reference to the dataset and dashboard it was derived from. GenLayer
    validators independently evaluate whether the insight is factually supported,
    statistically sound, and free from hallucination or exaggeration. The
    contract returns an authoritative on-chain verdict and a structured audit
    report.

    What belongs on-chain:
    - organization and role registry
    - dataset and dashboard registry
    - versioned insight audit requests
    - GenLayer consensus verdicts
    - 8-dimension audit scores
    - detailed findings (supported/unsupported claims, misleading statements)
    - human review outcomes
    - activated business decisions
    - immutable audit trail

    What should stay off-chain:
    - full documents, raw data files, PDFs, evidence files, long tables.
      Store those in Supabase/storage and put hashes or summaries here.
    """

    owner: str
    paused: bool

    org_counter: u256
    dataset_counter: u256
    dashboard_counter: u256
    request_counter: u256
    decision_counter: u256
    review_counter: u256
    audit_counter: u256
    activation_counter: u256

    organizations: TreeMap[str, str]
    org_roles: TreeMap[str, str]
    org_index: TreeMap[str, str]

    datasets: TreeMap[str, str]
    org_dataset_index: TreeMap[str, str]

    dashboards: TreeMap[str, str]
    org_dashboard_index: TreeMap[str, str]

    insight_requests: TreeMap[str, str]
    request_decisions: TreeMap[str, str]
    org_request_index: TreeMap[str, str]

    decisions: TreeMap[str, str]
    escalations: TreeMap[str, str]
    human_reviews: TreeMap[str, str]
    activated_decisions: TreeMap[str, str]

    audit_logs: TreeMap[str, str]
    request_audit_index: TreeMap[str, str]

    approved_claim_hashes: TreeMap[str, str]
    blocked_claim_hashes: TreeMap[str, str]
    reviewer_reputation: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address.as_hex
        self.paused = False

        self.org_counter = u256(0)
        self.dataset_counter = u256(0)
        self.dashboard_counter = u256(0)
        self.request_counter = u256(0)
        self.decision_counter = u256(0)
        self.review_counter = u256(0)
        self.audit_counter = u256(0)
        self.activation_counter = u256(0)

        self.organizations = TreeMap()
        self.org_roles = TreeMap()
        self.org_index = TreeMap()

        self.datasets = TreeMap()
        self.org_dataset_index = TreeMap()

        self.dashboards = TreeMap()
        self.org_dashboard_index = TreeMap()

        self.insight_requests = TreeMap()
        self.request_decisions = TreeMap()
        self.org_request_index = TreeMap()

        self.decisions = TreeMap()
        self.escalations = TreeMap()
        self.human_reviews = TreeMap()
        self.activated_decisions = TreeMap()

        self.audit_logs = TreeMap()
        self.request_audit_index = TreeMap()

        self.approved_claim_hashes = TreeMap()
        self.blocked_claim_hashes = TreeMap()
        self.reviewer_reputation = TreeMap()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _sender(self) -> str:
        return gl.message.sender_address.as_hex.lower()

    def _json(self, value: typing.Any) -> str:
        return json.dumps(value, sort_keys=True)

    def _load(self, raw: str) -> typing.Any:
        if raw is None or raw == "":
            return {}
        return json.loads(raw)

    def _require_owner(self) -> None:
        if self._sender() != self.owner.lower():
            raise gl.vm.UserError("Only contract owner")

    def _require_not_paused(self) -> None:
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

    def _require_non_empty(self, value: str, field_name: str) -> None:
        if value is None or len(value.strip()) == 0:
            raise gl.vm.UserError(field_name + " is required")

    def _key2(self, a: str, b: str) -> str:
        return a + "::" + b

    def _append(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        return existing + "|" + item

    def _append_unique(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        parts = existing.split("|")
        for part in parts:
            if part == item:
                return existing
        return existing + "|" + item

    def _limit(self, value: typing.Any, max_len: int) -> str:
        text = str(value) if value is not None else ""
        if len(text) > max_len:
            return text[:max_len]
        return text

    def _to_int(self, value: typing.Any, fallback: int) -> int:
        try:
            return int(value)
        except Exception:
            return fallback

    def _bounded_score(self, value: typing.Any, fallback: int) -> int:
        score = self._to_int(value, fallback)
        if score < 0:
            return 0
        if score > 100:
            return 100
        return score

    def _list_of_strings(self, value: typing.Any, max_items: int, max_len: int) -> typing.List[str]:
        result: typing.List[str] = []
        if isinstance(value, list):
            for item in value:
                if len(result) >= max_items:
                    break
                result.append(self._limit(item, max_len))
            return result
        if value is None:
            return result
        text = str(value)
        if len(text.strip()) == 0:
            return result
        result.append(self._limit(text, max_len))
        return result

    def _next_id(self, prefix: str, counter_name: str) -> str:
        if counter_name == "org":
            self.org_counter = self.org_counter + u256(1)
            return prefix + "-" + str(self.org_counter)
        if counter_name == "dataset":
            self.dataset_counter = self.dataset_counter + u256(1)
            return prefix + "-" + str(self.dataset_counter)
        if counter_name == "dashboard":
            self.dashboard_counter = self.dashboard_counter + u256(1)
            return prefix + "-" + str(self.dashboard_counter)
        if counter_name == "request":
            self.request_counter = self.request_counter + u256(1)
            return prefix + "-" + str(self.request_counter)
        if counter_name == "decision":
            self.decision_counter = self.decision_counter + u256(1)
            return prefix + "-" + str(self.decision_counter)
        if counter_name == "review":
            self.review_counter = self.review_counter + u256(1)
            return prefix + "-" + str(self.review_counter)
        if counter_name == "audit":
            self.audit_counter = self.audit_counter + u256(1)
            return prefix + "-" + str(self.audit_counter)
        if counter_name == "activation":
            self.activation_counter = self.activation_counter + u256(1)
            return prefix + "-" + str(self.activation_counter)
        raise gl.vm.UserError("Unknown counter: " + counter_name)

    def _normalise_verdict(self, value: typing.Any) -> str:
        v = str(value).strip().upper()
        if v in ["APPROVE", "APPROVED", "PASS", "SUPPORTED", "VALID"]:
            return "APPROVED"
        if v in ["UNSUPPORTED", "REJECT", "REJECTED", "FAIL", "INVALID", "FALSE"]:
            return "UNSUPPORTED"
        if v in ["NEEDS_REVIEW", "REVIEW", "ESCALATE", "UNCERTAIN"]:
            return "NEEDS_REVIEW"
        if v in ["NEEDS_REVISION", "REVISION", "REVISE", "PARTIAL", "MIXED"]:
            return "NEEDS_REVISION"
        return "NEEDS_REVIEW"

    def _require_org_exists(self, org_id: str) -> typing.Any:
        raw = self.organizations.get(org_id, "")
        if raw == "":
            raise gl.vm.UserError("Organization not found: " + org_id)
        return self._load(raw)

    def _require_dataset_exists(self, dataset_id: str) -> typing.Any:
        raw = self.datasets.get(dataset_id, "")
        if raw == "":
            raise gl.vm.UserError("Dataset not found: " + dataset_id)
        return self._load(raw)

    def _require_dashboard_exists(self, dashboard_id: str) -> typing.Any:
        raw = self.dashboards.get(dashboard_id, "")
        if raw == "":
            raise gl.vm.UserError("Dashboard not found: " + dashboard_id)
        return self._load(raw)

    def _require_request_exists(self, request_id: str) -> typing.Any:
        raw = self.insight_requests.get(request_id, "")
        if raw == "":
            raise gl.vm.UserError("Insight request not found: " + request_id)
        return self._load(raw)

    def _is_org_member(self, org_id: str, wallet: str) -> bool:
        org = self._load(self.organizations.get(org_id, ""))
        if org.get("owner", "").lower() == wallet.lower():
            return True
        role = self.org_roles.get(self._key2(org_id, wallet.lower()), "")
        return role != "" and role != "REMOVED"

    def _require_org_member(self, org_id: str) -> None:
        if not self._is_org_member(org_id, self._sender()):
            raise gl.vm.UserError("Not an organization member")

    def _assert_no_predecided_verdict(self, text: str) -> None:
        lower = text.lower()
        forbidden = [
            '"verdict"', "'verdict'", "verdict:",
            '"approved"', "'approved'", "approved:",
            '"unsupported"', "'unsupported'", "unsupported:",
            '"hallucination_risk_score"', "hallucination_risk_score:",
            '"evidence_support_score"', "evidence_support_score:",
            '"final_decision"', "final_decision:",
        ]
        for item in forbidden:
            if item in lower:
                raise gl.vm.UserError("Caller input contains pre-decided audit language: " + item)

    def _record_audit(
        self,
        org_id: str,
        request_id: str,
        event_type: str,
        actor: str,
        summary: str,
        data_hash: str,
        created_at: str,
    ) -> str:
        audit_id = self._next_id("AUDIT", "audit")
        entry = {
            "audit_id": audit_id,
            "org_id": org_id,
            "request_id": request_id,
            "event_type": event_type,
            "actor": actor.lower(),
            "summary": self._limit(summary, 800),
            "data_hash": data_hash,
            "created_at": created_at,
        }
        self.audit_logs[audit_id] = self._json(entry)
        if request_id != "":
            self.request_audit_index[request_id] = self._append(
                self.request_audit_index.get(request_id, ""),
                audit_id,
            )
        return audit_id

    def _normalise_audit_result(self, raw: typing.Any) -> typing.Any:
        if isinstance(raw, str):
            parsed = json.loads(raw)
        else:
            parsed = raw

        verdict = self._normalise_verdict(parsed.get("verdict", "NEEDS_REVIEW"))

        scores = parsed.get("scores", {})
        findings = parsed.get("findings", {})

        supported_claims = self._list_of_strings(findings.get("supported_claims", []), 16, 400)
        unsupported_claims = self._list_of_strings(findings.get("unsupported_claims", []), 16, 400)
        misleading_statements = self._list_of_strings(findings.get("misleading_statements", []), 12, 400)
        missing_context = self._list_of_strings(findings.get("missing_context", []), 12, 360)
        recommendations = self._list_of_strings(findings.get("recommendations", []), 12, 360)
        required_changes = self._list_of_strings(findings.get("required_changes", []), 12, 360)
        risks = self._list_of_strings(findings.get("risks", []), 10, 360)

        reviewer_required = verdict == "NEEDS_REVIEW"
        revision_required = verdict == "NEEDS_REVISION"

        return {
            "verdict": verdict,
            "scores": {
                "evidence_support": self._bounded_score(scores.get("evidence_support", scores.get("evidence_support_score", 0)), 0),
                "statistical_confidence": self._bounded_score(scores.get("statistical_confidence", scores.get("statistical_confidence_score", 0)), 0),
                "explainability": self._bounded_score(scores.get("explainability", scores.get("explainability_score", 0)), 0),
                "narrative_accuracy": self._bounded_score(scores.get("narrative_accuracy", scores.get("narrative_accuracy_score", 0)), 0),
                "business_impact": self._bounded_score(scores.get("business_impact", scores.get("business_impact_score", 0)), 0),
                "hallucination_risk": self._bounded_score(scores.get("hallucination_risk", scores.get("hallucination_risk_score", 100)), 100),
                "completeness": self._bounded_score(scores.get("completeness", scores.get("completeness_score", 0)), 0),
                "confidence": self._bounded_score(scores.get("confidence", scores.get("confidence_score", 50)), 50),
            },
            "findings": {
                "supported_claims": supported_claims,
                "unsupported_claims": unsupported_claims,
                "misleading_statements": misleading_statements,
                "missing_context": missing_context,
                "recommendations": recommendations,
                "required_changes": required_changes,
                "risks": risks,
                "rationale": self._limit(findings.get("rationale", ""), 2000),
                "audit_summary": self._limit(findings.get("audit_summary", ""), 800),
            },
            "reviewer_required": reviewer_required,
            "revision_required": revision_required,
        }

    def _apply_verdict_thresholds(self, result: typing.Any) -> typing.Any:
        scores = result["scores"]
        verdict = result["verdict"]

        # If hallucination risk is very high, escalate
        if scores["hallucination_risk"] >= 80 and verdict == "APPROVED":
            verdict = "NEEDS_REVIEW"

        # If evidence support is critically low, mark unsupported
        if scores["evidence_support"] < 20 and verdict == "APPROVED":
            verdict = "UNSUPPORTED"

        # Any unsupported claims with an APPROVED verdict → revision needed
        if len(result["findings"]["unsupported_claims"]) > 0 and verdict == "APPROVED":
            verdict = "NEEDS_REVISION"

        result["verdict"] = verdict
        result["reviewer_required"] = verdict == "NEEDS_REVIEW"
        result["revision_required"] = verdict == "NEEDS_REVISION"
        return result

    def _run_consensus_audit(
        self,
        request_record: typing.Any,
        org: typing.Any,
        dataset: typing.Any,
        dashboard: typing.Any,
    ) -> typing.Any:
        request_json = self._json(request_record)
        org_json = self._json({
            "org_id": org.get("org_id", ""),
            "name": org.get("name", ""),
            "industry": org.get("industry", ""),
        })
        dataset_json = self._json({
            "dataset_id": dataset.get("dataset_id", ""),
            "name": dataset.get("name", ""),
            "source": dataset.get("source", ""),
            "schema_summary": dataset.get("schema_summary", ""),
        })
        dashboard_json = self._json({
            "dashboard_id": dashboard.get("dashboard_id", ""),
            "name": dashboard.get("name", ""),
            "report_type": dashboard.get("report_type", ""),
            "reporting_period": dashboard.get("reporting_period", ""),
        })

        def evaluate_once() -> str:
            prompt = f"""
You are a decentralized AI insight auditor for Ordit.

Your job is to determine whether the submitted AI-generated business insight is
genuinely supported by the underlying data. You must evaluate it rigorously
against the provided metrics, assumptions, and business context.

Important rules:
1. Do not invent data, statistics, or business facts not present in the submission.
2. Treat the provided metrics and schema as the authoritative evidence base.
3. If a claim goes beyond what the data shows, mark it as unsupported.
4. Distinguish between correlation and causation — do not accept causal claims
   that only have correlational evidence.
5. If the insight exaggerates impact, cherry-picks data, or omits material
   context, flag it clearly.
6. If there is genuine ambiguity requiring domain expertise, choose NEEDS_REVIEW.
7. Return only JSON matching the schema exactly.

Organization:
{org_json}

Dataset:
{dataset_json}

Dashboard:
{dashboard_json}

Insight audit request:
{request_json}

Return this exact JSON object:
{{
  "verdict": "APPROVED | NEEDS_REVISION | UNSUPPORTED | NEEDS_REVIEW",
  "scores": {{
    "evidence_support": 0,
    "statistical_confidence": 0,
    "explainability": 0,
    "narrative_accuracy": 0,
    "business_impact": 0,
    "hallucination_risk": 0,
    "completeness": 0,
    "confidence": 0
  }},
  "findings": {{
    "supported_claims": ["specific claim directly supported by the data"],
    "unsupported_claims": ["specific claim not supported or exaggerated"],
    "misleading_statements": ["specific misleading or ambiguous statement"],
    "missing_context": ["important missing context or omitted variable"],
    "recommendations": ["specific improvement recommendation"],
    "required_changes": ["specific change required before approval"],
    "risks": ["specific business or analytical risk"],
    "rationale": "clear explanation for the verdict",
    "audit_summary": "executive summary of the audit finding"
  }}
}}

Score guidance (0-100):
- evidence_support: how well the data actually supports the claims
- statistical_confidence: strength of statistical evidence
- explainability: how clearly the insight explains its methodology
- narrative_accuracy: accuracy of language used relative to the data
- business_impact: relevance and materiality of the insight to the business
- hallucination_risk: probability of fabricated or invented content (higher = worse)
- completeness: whether all material factors were considered
- confidence: your overall confidence in this assessment

Verdicts:
- APPROVED: all major claims are well-supported, hallucination risk is low
- NEEDS_REVISION: core insight is sound but specific claims need adjustment
- UNSUPPORTED: claims are not supported by the provided data
- NEEDS_REVIEW: ambiguous case requiring human expert review
"""
            raw = gl.nondet.exec_prompt(prompt, response_format="json")
            normalised = self._normalise_audit_result(raw)
            return json.dumps(normalised, sort_keys=True)

        consensus_json = gl.eq_principle.prompt_non_comparative(
            evaluate_once,
            task="Audit an AI-generated business insight against provided data and return a structured JSON verdict with scores and findings.",
            criteria="The result must be valid JSON with a verdict field (APPROVED, NEEDS_REVISION, UNSUPPORTED, or NEEDS_REVIEW), 8 numeric scores between 0-100, and a findings object with rationale and audit_summary. The verdict must be logically consistent with the scores.",
        )

        return self._normalise_audit_result(consensus_json)

    def _create_insight_request(
        self,
        request_id: str,
        org_id: str,
        dataset_id: str,
        dashboard_id: str,
        insight_text: str,
        metrics: str,
        assumptions: str,
        business_context: str,
        claim_hash: str,
        evidence_manifest_hash: str,
        submitted_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(org_id, "org_id")
        self._require_non_empty(dataset_id, "dataset_id")
        self._require_non_empty(dashboard_id, "dashboard_id")
        self._require_non_empty(insight_text, "insight_text")
        self._require_non_empty(metrics, "metrics")
        self._require_non_empty(claim_hash, "claim_hash")

        self._assert_no_predecided_verdict(
            insight_text + " " + metrics + " " + assumptions + " " + business_context
        )

        org = self._require_org_exists(org_id)
        if org.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Organization is not active")

        dataset = self._require_dataset_exists(dataset_id)
        if dataset.get("org_id", "") != org_id:
            raise gl.vm.UserError("Dataset does not belong to organization")
        if dataset.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Dataset is not active")

        dashboard = self._require_dashboard_exists(dashboard_id)
        if dashboard.get("org_id", "") != org_id:
            raise gl.vm.UserError("Dashboard does not belong to organization")
        if dashboard.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Dashboard is not active")

        if self.blocked_claim_hashes.get(claim_hash, "") != "":
            raise gl.vm.UserError("Claim hash was previously blocked")
        if self.approved_claim_hashes.get(claim_hash, "") != "":
            raise gl.vm.UserError("Claim hash was already approved")

        final_request_id = request_id
        if final_request_id.strip() == "":
            final_request_id = self._next_id("REQ", "request")
        if self.insight_requests.get(final_request_id, "") != "":
            raise gl.vm.UserError("Insight request already exists")

        record = {
            "request_id": final_request_id,
            "org_id": org_id,
            "dataset_id": dataset_id,
            "dashboard_id": dashboard_id,
            "insight_text": self._limit(insight_text, 3000),
            "metrics": self._limit(metrics, 2400),
            "assumptions": self._limit(assumptions, 1400),
            "business_context": self._limit(business_context, 1600),
            "claim_hash": claim_hash,
            "evidence_manifest_hash": evidence_manifest_hash,
            "submitted_by": self._sender(),
            "submitted_at": submitted_at,
            "status": "PENDING",
        }

        self.insight_requests[final_request_id] = self._json(record)
        self.org_request_index[org_id] = self._append(
            self.org_request_index.get(org_id, ""),
            final_request_id,
        )

        self._record_audit(
            org_id,
            final_request_id,
            "INSIGHT_AUDIT_REQUEST_CREATED",
            self._sender(),
            "Insight audit request submitted for GenLayer consensus",
            claim_hash,
            submitted_at,
        )

        return final_request_id

    def _adjudicate_request(self, request_id: str, adjudicated_at: str) -> str:
        self._require_not_paused()

        raw_request = self.insight_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Insight request not found")

        request_record = self._load(raw_request)
        if request_record.get("status", "") not in ["PENDING", "RETRY_PENDING"]:
            raise gl.vm.UserError("Insight request is not pending adjudication")

        org = self._require_org_exists(request_record.get("org_id", ""))
        dataset = self._require_dataset_exists(request_record.get("dataset_id", ""))
        dashboard = self._require_dashboard_exists(request_record.get("dashboard_id", ""))

        result = self._run_consensus_audit(request_record, org, dataset, dashboard)
        result = self._apply_verdict_thresholds(result)

        decision_id = self._next_id("DEC", "decision")
        verdict = result["verdict"]

        request_status = "NEEDS_REVIEW"
        if verdict == "APPROVED":
            request_status = "APPROVED"
            self.approved_claim_hashes[request_record.get("claim_hash", "")] = request_id
        elif verdict == "UNSUPPORTED":
            request_status = "UNSUPPORTED"
            self.blocked_claim_hashes[request_record.get("claim_hash", "")] = request_id
        elif verdict == "NEEDS_REVISION":
            request_status = "NEEDS_REVISION"
        elif verdict == "NEEDS_REVIEW":
            request_status = "NEEDS_REVIEW"

        decision_record = {
            "decision_id": decision_id,
            "request_id": request_id,
            "org_id": request_record.get("org_id", ""),
            "verdict": verdict,
            "request_status": request_status,
            "scores": result["scores"],
            "findings": result["findings"],
            "reviewer_required": result["reviewer_required"],
            "revision_required": result["revision_required"],
            "adjudicated_by": "GENLAYER_CONSENSUS",
            "adjudicated_at": adjudicated_at,
        }

        self.decisions[decision_id] = self._json(decision_record)
        self.request_decisions[request_id] = decision_id

        request_record["status"] = request_status
        request_record["last_decision_id"] = decision_id
        request_record["adjudicated_at"] = adjudicated_at
        self.insight_requests[request_id] = self._json(request_record)

        if request_status == "NEEDS_REVIEW":
            escalation_record = {
                "request_id": request_id,
                "org_id": request_record.get("org_id", ""),
                "decision_id": decision_id,
                "status": "OPEN",
                "reason": result["findings"].get("rationale", ""),
                "opened_at": adjudicated_at,
                "opened_by": "GENLAYER_CONSENSUS",
            }
            self.escalations[request_id] = self._json(escalation_record)

        self._record_audit(
            request_record.get("org_id", ""),
            request_id,
            "GENLAYER_CONSENSUS_DECISION",
            "GENLAYER_CONSENSUS",
            "Consensus insight audit verdict: " + verdict,
            decision_id,
            adjudicated_at,
        )

        return self._json(decision_record)

    # ------------------------------------------------------------------
    # Owner and contract status
    # ------------------------------------------------------------------

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def is_paused(self) -> bool:
        return self.paused

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self._json({
            "owner": self.owner,
            "paused": self.paused,
            "org_counter": str(self.org_counter),
            "dataset_counter": str(self.dataset_counter),
            "dashboard_counter": str(self.dashboard_counter),
            "request_counter": str(self.request_counter),
            "decision_counter": str(self.decision_counter),
        })

    @gl.public.write
    def transfer_ownership(self, new_owner: str, updated_at: str) -> None:
        self._require_owner()
        self._require_non_empty(new_owner, "new_owner")
        previous = self.owner
        self.owner = new_owner
        self._record_audit("", "", "OWNERSHIP_TRANSFERRED", previous, "Contract ownership transferred", new_owner, updated_at)

    @gl.public.write
    def pause(self) -> None:
        self._require_owner()
        self.paused = True

    @gl.public.write
    def unpause(self) -> None:
        self._require_owner()
        self.paused = False

    # ------------------------------------------------------------------
    # Organization management
    # ------------------------------------------------------------------

    @gl.public.write
    def create_organization(
        self,
        org_id: str,
        name: str,
        industry: str,
        metadata_hash: str,
        created_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(name, "name")
        self._require_non_empty(industry, "industry")

        final_org_id = org_id
        if final_org_id.strip() == "":
            final_org_id = self._next_id("ORG", "org")
        if self.organizations.get(final_org_id, "") != "":
            raise gl.vm.UserError("Organization already exists")

        record = {
            "org_id": final_org_id,
            "name": self._limit(name, 180),
            "industry": self._limit(industry, 120),
            "metadata_hash": metadata_hash,
            "owner": self._sender(),
            "status": "ACTIVE",
            "created_by": self._sender(),
            "created_at": created_at,
        }

        self.organizations[final_org_id] = self._json(record)
        self.org_roles[self._key2(final_org_id, self._sender())] = "OWNER"
        self.org_index["all"] = self._append_unique(self.org_index.get("all", ""), final_org_id)

        self._record_audit(final_org_id, "", "ORGANIZATION_CREATED", self._sender(), "Organization created", metadata_hash, created_at)
        return final_org_id

    @gl.public.write
    def add_organization_role(self, org_id: str, wallet: str, role: str, added_at: str) -> None:
        self._require_not_paused()
        self._require_org_exists(org_id)
        org = self._load(self.organizations.get(org_id, ""))
        if org.get("owner", "").lower() != self._sender():
            raise gl.vm.UserError("Only org owner can manage roles")
        self._require_non_empty(wallet, "wallet")
        allowed = ["ANALYST", "REVIEWER", "ADMIN"]
        if role.upper() not in allowed:
            raise gl.vm.UserError("Invalid role. Must be ANALYST, REVIEWER, or ADMIN")
        self.org_roles[self._key2(org_id, wallet.lower())] = role.upper()
        self._record_audit(org_id, "", "ORG_ROLE_ADDED", self._sender(), "Added " + role + " role for " + wallet.lower(), wallet.lower(), added_at)

    @gl.public.write
    def remove_organization_role(self, org_id: str, wallet: str, removed_at: str) -> None:
        self._require_not_paused()
        self._require_org_exists(org_id)
        org = self._load(self.organizations.get(org_id, ""))
        if org.get("owner", "").lower() != self._sender():
            raise gl.vm.UserError("Only org owner can manage roles")
        key = self._key2(org_id, wallet.lower())
        if self.org_roles.get(key, "") == "OWNER":
            raise gl.vm.UserError("Cannot remove org owner")
        self.org_roles[key] = "REMOVED"
        self._record_audit(org_id, "", "ORG_ROLE_REMOVED", self._sender(), "Removed role for " + wallet.lower(), wallet.lower(), removed_at)

    @gl.public.write
    def set_organization_status(self, org_id: str, status: str, updated_at: str) -> None:
        self._require_not_paused()
        org = self._require_org_exists(org_id)
        if org.get("owner", "").lower() != self._sender():
            raise gl.vm.UserError("Only org owner can update status")
        allowed = ["ACTIVE", "SUSPENDED", "ARCHIVED"]
        if status.upper() not in allowed:
            raise gl.vm.UserError("Invalid status")
        org["status"] = status.upper()
        org["updated_at"] = updated_at
        self.organizations[org_id] = self._json(org)
        self._record_audit(org_id, "", "ORG_STATUS_UPDATED", self._sender(), "Status set to " + status.upper(), status.upper(), updated_at)

    @gl.public.view
    def get_organization(self, org_id: str) -> str:
        return self.organizations.get(org_id, "")

    @gl.public.view
    def get_organization_role(self, org_id: str, wallet: str) -> str:
        return self.org_roles.get(self._key2(org_id, wallet.lower()), "")

    @gl.public.view
    def get_organization_index(self) -> str:
        return self.org_index.get("all", "")

    # ------------------------------------------------------------------
    # Dataset management
    # ------------------------------------------------------------------

    @gl.public.write
    def register_dataset(
        self,
        dataset_id: str,
        org_id: str,
        name: str,
        source: str,
        schema_summary: str,
        metadata_hash: str,
        registered_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_org_member(org_id)
        self._require_non_empty(name, "name")
        self._require_non_empty(source, "source")

        org = self._require_org_exists(org_id)
        if org.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Organization is not active")

        final_dataset_id = dataset_id
        if final_dataset_id.strip() == "":
            final_dataset_id = self._next_id("DS", "dataset")
        if self.datasets.get(final_dataset_id, "") != "":
            raise gl.vm.UserError("Dataset already exists")

        record = {
            "dataset_id": final_dataset_id,
            "org_id": org_id,
            "name": self._limit(name, 180),
            "source": self._limit(source, 300),
            "schema_summary": self._limit(schema_summary, 2000),
            "metadata_hash": metadata_hash,
            "status": "ACTIVE",
            "registered_by": self._sender(),
            "registered_at": registered_at,
        }

        self.datasets[final_dataset_id] = self._json(record)
        self.org_dataset_index[org_id] = self._append_unique(
            self.org_dataset_index.get(org_id, ""),
            final_dataset_id,
        )

        self._record_audit(org_id, "", "DATASET_REGISTERED", self._sender(), "Dataset registered: " + name, metadata_hash, registered_at)
        return final_dataset_id

    @gl.public.write
    def update_dataset_summary(self, dataset_id: str, schema_summary: str, metadata_hash: str, updated_at: str) -> None:
        self._require_not_paused()
        dataset = self._require_dataset_exists(dataset_id)
        self._require_org_member(dataset.get("org_id", ""))
        dataset["schema_summary"] = self._limit(schema_summary, 2000)
        dataset["metadata_hash"] = metadata_hash
        dataset["updated_at"] = updated_at
        self.datasets[dataset_id] = self._json(dataset)

    @gl.public.write
    def set_dataset_status(self, dataset_id: str, status: str, updated_at: str) -> None:
        self._require_not_paused()
        dataset = self._require_dataset_exists(dataset_id)
        self._require_org_member(dataset.get("org_id", ""))
        allowed = ["ACTIVE", "ARCHIVED", "SUSPENDED"]
        if status.upper() not in allowed:
            raise gl.vm.UserError("Invalid dataset status")
        dataset["status"] = status.upper()
        dataset["updated_at"] = updated_at
        self.datasets[dataset_id] = self._json(dataset)

    @gl.public.view
    def get_dataset(self, dataset_id: str) -> str:
        return self.datasets.get(dataset_id, "")

    @gl.public.view
    def get_org_dataset_index(self, org_id: str) -> str:
        return self.org_dataset_index.get(org_id, "")

    # ------------------------------------------------------------------
    # Dashboard management
    # ------------------------------------------------------------------

    @gl.public.write
    def register_dashboard(
        self,
        dashboard_id: str,
        org_id: str,
        name: str,
        report_type: str,
        reporting_period: str,
        metadata_hash: str,
        registered_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_org_member(org_id)
        self._require_non_empty(name, "name")
        self._require_non_empty(report_type, "report_type")

        org = self._require_org_exists(org_id)
        if org.get("status", "") != "ACTIVE":
            raise gl.vm.UserError("Organization is not active")

        final_dashboard_id = dashboard_id
        if final_dashboard_id.strip() == "":
            final_dashboard_id = self._next_id("DASH", "dashboard")
        if self.dashboards.get(final_dashboard_id, "") != "":
            raise gl.vm.UserError("Dashboard already exists")

        record = {
            "dashboard_id": final_dashboard_id,
            "org_id": org_id,
            "name": self._limit(name, 180),
            "report_type": self._limit(report_type, 120),
            "reporting_period": self._limit(reporting_period, 120),
            "metadata_hash": metadata_hash,
            "status": "ACTIVE",
            "registered_by": self._sender(),
            "registered_at": registered_at,
        }

        self.dashboards[final_dashboard_id] = self._json(record)
        self.org_dashboard_index[org_id] = self._append_unique(
            self.org_dashboard_index.get(org_id, ""),
            final_dashboard_id,
        )

        self._record_audit(org_id, "", "DASHBOARD_REGISTERED", self._sender(), "Dashboard registered: " + name, metadata_hash, registered_at)
        return final_dashboard_id

    @gl.public.write
    def update_dashboard_summary(self, dashboard_id: str, metadata_hash: str, updated_at: str) -> None:
        self._require_not_paused()
        dashboard = self._require_dashboard_exists(dashboard_id)
        self._require_org_member(dashboard.get("org_id", ""))
        dashboard["metadata_hash"] = metadata_hash
        dashboard["updated_at"] = updated_at
        self.dashboards[dashboard_id] = self._json(dashboard)

    @gl.public.write
    def set_dashboard_status(self, dashboard_id: str, status: str, updated_at: str) -> None:
        self._require_not_paused()
        dashboard = self._require_dashboard_exists(dashboard_id)
        self._require_org_member(dashboard.get("org_id", ""))
        allowed = ["ACTIVE", "ARCHIVED", "SUSPENDED"]
        if status.upper() not in allowed:
            raise gl.vm.UserError("Invalid dashboard status")
        dashboard["status"] = status.upper()
        dashboard["updated_at"] = updated_at
        self.dashboards[dashboard_id] = self._json(dashboard)

    @gl.public.view
    def get_dashboard(self, dashboard_id: str) -> str:
        return self.dashboards.get(dashboard_id, "")

    @gl.public.view
    def get_org_dashboard_index(self, org_id: str) -> str:
        return self.org_dashboard_index.get(org_id, "")

    # ------------------------------------------------------------------
    # Insight audit submission and GenLayer consensus
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_insight_audit_request(
        self,
        request_id: str,
        org_id: str,
        dataset_id: str,
        dashboard_id: str,
        insight_text: str,
        metrics: str,
        assumptions: str,
        business_context: str,
        claim_hash: str,
        evidence_manifest_hash: str,
        submitted_at: str,
    ) -> str:
        return self._create_insight_request(
            request_id, org_id, dataset_id, dashboard_id,
            insight_text, metrics, assumptions, business_context,
            claim_hash, evidence_manifest_hash, submitted_at,
        )

    @gl.public.write
    def adjudicate_insight_request(self, request_id: str, adjudicated_at: str) -> str:
        return self._adjudicate_request(request_id, adjudicated_at)

    @gl.public.write
    def submit_and_audit_insight(
        self,
        request_id: str,
        org_id: str,
        dataset_id: str,
        dashboard_id: str,
        insight_text: str,
        metrics: str,
        assumptions: str,
        business_context: str,
        claim_hash: str,
        evidence_manifest_hash: str,
        submitted_at: str,
        adjudicated_at: str,
    ) -> str:
        final_request_id = self._create_insight_request(
            request_id, org_id, dataset_id, dashboard_id,
            insight_text, metrics, assumptions, business_context,
            claim_hash, evidence_manifest_hash, submitted_at,
        )
        return self._adjudicate_request(final_request_id, adjudicated_at)

    # ------------------------------------------------------------------
    # Human review and decision activation
    # ------------------------------------------------------------------

    @gl.public.write
    def human_review_decision(
        self,
        request_id: str,
        final_verdict: str,
        notes: str,
        review_evidence_hash: str,
        decided_at: str,
    ) -> str:
        self._require_not_paused()

        raw_request = self.insight_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Insight request not found")

        request_record = self._load(raw_request)
        org_id = request_record.get("org_id", "")
        self._require_org_member(org_id)

        if request_record.get("status", "") not in ["NEEDS_REVIEW", "NEEDS_REVISION"]:
            raise gl.vm.UserError("Request is not eligible for human review")

        verdict = self._normalise_verdict(final_verdict)
        if verdict == "NEEDS_REVIEW":
            raise gl.vm.UserError("Human review must resolve to APPROVED, UNSUPPORTED, or NEEDS_REVISION")

        review_id = self._next_id("HREV", "review")

        request_status = "APPROVED"
        if verdict == "UNSUPPORTED":
            request_status = "UNSUPPORTED"
            self.blocked_claim_hashes[request_record.get("claim_hash", "")] = request_id
        elif verdict == "NEEDS_REVISION":
            request_status = "NEEDS_REVISION"
        else:
            self.approved_claim_hashes[request_record.get("claim_hash", "")] = request_id

        review_record = {
            "review_id": review_id,
            "request_id": request_id,
            "org_id": org_id,
            "reviewer": self._sender(),
            "final_verdict": verdict,
            "request_status": request_status,
            "notes": self._limit(notes, 1400),
            "review_evidence_hash": review_evidence_hash,
            "decided_at": decided_at,
        }

        self.human_reviews[request_id] = self._json(review_record)

        request_record["status"] = request_status
        request_record["human_review_id"] = review_id
        request_record["human_decided_at"] = decided_at
        self.insight_requests[request_id] = self._json(request_record)

        escalation = self._load(self.escalations.get(request_id, "{}") or "{}")
        if escalation:
            escalation["status"] = "CLOSED"
            escalation["closed_by"] = self._sender()
            escalation["closed_at"] = decided_at
            escalation["close_reason"] = "Human review: " + verdict
            self.escalations[request_id] = self._json(escalation)

        rep_key = self._key2(org_id, self._sender())
        raw_rep = self.reviewer_reputation.get(rep_key, "")
        rep = self._load(raw_rep) if raw_rep != "" else {"reviews": 0, "approved": 0, "rejected": 0}
        rep["reviews"] = self._to_int(rep.get("reviews", 0), 0) + 1
        if verdict == "APPROVED":
            rep["approved"] = self._to_int(rep.get("approved", 0), 0) + 1
        else:
            rep["rejected"] = self._to_int(rep.get("rejected", 0), 0) + 1
        self.reviewer_reputation[rep_key] = self._json(rep)

        self._record_audit(org_id, request_id, "HUMAN_REVIEW_DECISION", self._sender(), "Human review decision: " + verdict, review_evidence_hash, decided_at)
        return self._json(review_record)

    @gl.public.write
    def mark_business_decision_activated(
        self,
        request_id: str,
        activation_summary: str,
        activated_at: str,
    ) -> str:
        self._require_not_paused()

        raw_request = self.insight_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Insight request not found")

        request_record = self._load(raw_request)
        org_id = request_record.get("org_id", "")
        self._require_org_member(org_id)

        if request_record.get("status", "") not in ["APPROVED"]:
            raise gl.vm.UserError("Insight must be APPROVED before activation")

        activation_id = self._next_id("ACT", "activation")
        activation_record = {
            "activation_id": activation_id,
            "request_id": request_id,
            "org_id": org_id,
            "claim_hash": request_record.get("claim_hash", ""),
            "activation_summary": self._limit(activation_summary, 1200),
            "activated_by": self._sender(),
            "activated_at": activated_at,
        }

        self.activated_decisions[request_id] = self._json(activation_record)
        request_record["status"] = "ACTIVATED"
        request_record["activation_id"] = activation_id
        request_record["activated_at"] = activated_at
        self.insight_requests[request_id] = self._json(request_record)

        self._record_audit(org_id, request_id, "BUSINESS_DECISION_ACTIVATED", self._sender(), "Approved insight activated as business decision", activation_id, activated_at)
        return self._json(activation_record)

    @gl.public.write
    def mark_business_decision_blocked(
        self,
        request_id: str,
        block_reason: str,
        blocked_at: str,
    ) -> None:
        self._require_not_paused()

        raw_request = self.insight_requests.get(request_id, "")
        if raw_request == "":
            raise gl.vm.UserError("Insight request not found")

        request_record = self._load(raw_request)
        org_id = request_record.get("org_id", "")
        self._require_org_member(org_id)

        request_record["status"] = "BLOCKED"
        request_record["block_reason"] = self._limit(block_reason, 800)
        request_record["blocked_at"] = blocked_at
        self.insight_requests[request_id] = self._json(request_record)
        self.blocked_claim_hashes[request_record.get("claim_hash", "")] = request_id

        self._record_audit(org_id, request_id, "BUSINESS_DECISION_BLOCKED", self._sender(), "Insight manually blocked", block_reason, blocked_at)

    # ------------------------------------------------------------------
    # Read methods
    # ------------------------------------------------------------------

    @gl.public.view
    def get_insight_request(self, request_id: str) -> str:
        return self.insight_requests.get(request_id, "")

    @gl.public.view
    def get_request_decision_id(self, request_id: str) -> str:
        return self.request_decisions.get(request_id, "")

    @gl.public.view
    def get_decision(self, decision_id: str) -> str:
        return self.decisions.get(decision_id, "")

    @gl.public.view
    def get_latest_decision_for_request(self, request_id: str) -> str:
        decision_id = self.request_decisions.get(request_id, "")
        if decision_id == "":
            return ""
        return self.decisions.get(decision_id, "")

    @gl.public.view
    def get_escalation(self, request_id: str) -> str:
        return self.escalations.get(request_id, "")

    @gl.public.view
    def get_human_review(self, request_id: str) -> str:
        return self.human_reviews.get(request_id, "")

    @gl.public.view
    def get_activated_decision(self, request_id: str) -> str:
        return self.activated_decisions.get(request_id, "")

    @gl.public.view
    def get_org_request_index(self, org_id: str) -> str:
        return self.org_request_index.get(org_id, "")

    @gl.public.view
    def get_audit_log(self, audit_id: str) -> str:
        return self.audit_logs.get(audit_id, "")

    @gl.public.view
    def get_request_audit_index(self, request_id: str) -> str:
        return self.request_audit_index.get(request_id, "")

    @gl.public.view
    def get_reviewer_reputation(self, org_id: str, reviewer_wallet: str) -> str:
        return self.reviewer_reputation.get(self._key2(org_id, reviewer_wallet.lower()), "")

    @gl.public.view
    def is_claim_hash_approved(self, claim_hash: str) -> str:
        return self.approved_claim_hashes.get(claim_hash, "")

    @gl.public.view
    def is_claim_hash_blocked(self, claim_hash: str) -> str:
        return self.blocked_claim_hashes.get(claim_hash, "")
