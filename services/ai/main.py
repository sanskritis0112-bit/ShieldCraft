from typing import Dict
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Truvault Explainable Risk Service", version="1.0.0")


class TrustFactors(BaseModel):
    identity_verification: float = Field(ge=0, le=100)
    credential_authenticity: float = Field(ge=0, le=100)
    document_integrity: float = Field(ge=0, le=100)
    provenance_completeness: float = Field(ge=0, le=100)
    verification_history: float = Field(ge=0, le=100)
    access_behaviour: float = Field(ge=0, le=100)
    suspicious_activity: float = Field(ge=0, le=100)


WEIGHTS: Dict[str, float] = {
    "identity_verification": 0.25,
    "credential_authenticity": 0.20,
    "document_integrity": 0.15,
    "provenance_completeness": 0.15,
    "verification_history": 0.10,
    "access_behaviour": 0.10,
    "suspicious_activity": 0.05,
}


@app.get("/health")
@app.get("/api/ai/health")
def health():
    return {"ok": True, "service": "truvault-risk"}


@app.post("/v1/trust-score")
@app.post("/api/ai/v1/trust-score")
def trust_score(factors: TrustFactors):
    values = factors.model_dump()
    contributions = {
        name: round(value * WEIGHTS[name], 2) for name, value in values.items()
    }
    score = round(sum(contributions.values()))
    explanations = [
        {
            "factor": name,
            "value": value,
            "weight": WEIGHTS[name],
            "contribution": contributions[name],
            "signal": "positive" if value >= 90 else "review" if value >= 75 else "negative",
        }
        for name, value in values.items()
    ]
    return {"score": score, "risk": "low" if score >= 85 else "medium" if score >= 65 else "high", "factors": explanations}


class ActivitySignal(BaseModel):
    failed_mfa_attempts: int = 0
    request_frequency_ratio: float = 1.0
    impossible_travel: bool = False
    new_device: bool = False
    document_metadata_mismatch: bool = False


@app.post("/v1/anomaly")
@app.post("/api/ai/v1/anomaly")
def anomaly(signal: ActivitySignal):
    reasons = []
    risk = 0
    if signal.failed_mfa_attempts >= 3:
        reasons.append(f"{signal.failed_mfa_attempts} failed MFA attempts")
        risk += 35
    if signal.request_frequency_ratio >= 3:
        reasons.append(f"request frequency is {signal.request_frequency_ratio:.1f}x baseline")
        risk += 25
    if signal.impossible_travel:
        reasons.append("impossible travel from prior session")
        risk += 30
    if signal.new_device:
        reasons.append("new device fingerprint")
        risk += 10
    if signal.document_metadata_mismatch:
        reasons.append("document metadata differs from issuer baseline")
        risk += 25
    return {"risk": min(risk, 100), "flagged": risk >= 30, "reasons": reasons or ["activity matches known safe patterns"]}
