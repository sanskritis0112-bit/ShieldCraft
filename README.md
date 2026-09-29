# Truvault — Digital Identity & Trust Platform

Truvault is a production-style, synthetic-data demonstration of a self-sovereign identity and consent network. It includes a complete user app and an organization portal for banks, universities, employers, and public-sector verifiers.

## Included flows

- DID profile and reusable KYC
- W3C-style verifiable credentials
- encrypted document upload simulation
- SHA-256, IPFS, and Polygon proof display
- asset provenance timeline
- purpose-bound, field-level consent
- time-bound smart-contract authorization and automatic expiry states
- asset delegation
- organization access and verification requests
- explainable anomaly alerts and a factor-level 0–100 trust score
- MFA, OAuth/JWT, RBAC, and AES-256 security concepts
- immutable audit history

All people, organizations, identifiers, transactions, and scores in this project are synthetic.

## Run the interface locally

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use the switch in the left sidebar to move between the User app and Organization portal. The secure sign-in screen is available through “Secure sign out.”

For a production-style local build:

```bash
npm run build
npm run start
```

## Reference services

The hosted demo intentionally uses synthetic client-side state so every flow is safe to explore. Reference implementations for the surrounding services are included:

```text
app/                         React application and product experience
components/ui/               Accessible interface primitives
contracts/ConsentRegistry.sol Polygon/EVM consent and automatic-expiry contract
services/api/src/index.js     Express API reference
services/ai/main.py           FastAPI explainable risk/trust reference
public/og.png                 Branded social preview
```

Run the reference API:

```bash
cd services/api
npm install
npm run dev
```

Run the AI service:

```bash
cd services/ai
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Production integration map

- Store identity, consent, and audit metadata in PostgreSQL or MongoDB.
- Store encrypted document bytes in IPFS; keep only the CID and SHA-256 digest in application records.
- Deploy `ConsentRegistry.sol` to Polygon and interact through Ethers.js.
- Publish access and verification events to Kafka; use Redis for request throttling and short-lived authorization state.
- Run the FastAPI risk service behind a private service boundary and persist factor-level explanations with every decision.
- Terminate TLS at NGINX or the cloud edge; use OAuth 2.0/JWT, MFA, RBAC, key rotation, and a cloud KMS for AES-256 data keys.
- Deploy stateless services with Docker on AWS ECS/EKS and keep secrets in AWS Secrets Manager.

The current Vercel deployment is a polished interactive prototype, not a live identity provider and not a substitute for an audited production security implementation.
