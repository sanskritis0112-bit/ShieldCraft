import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));

const audit = [];
const record = (event, actor, details = {}) => {
  const item = { id: crypto.randomUUID(), event, actor, details, at: new Date().toISOString() };
  audit.unshift(item);
  return item;
};

app.get(['/health', '/api/api/health'], (_req, res) => res.json({ ok: true, service: 'truvault-api' }));

app.get(['/v1/identities/:did', '/api/api/v1/identities/:did'], (req, res) => res.json({
  did: req.params.did,
  status: 'verified',
  credentials: 6,
  trustScore: 92,
  synthetic: true,
}));

app.post(['/v1/documents/proof', '/api/api/v1/documents/proof'], (req, res) => {
  const payload = JSON.stringify(req.body ?? {});
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  record('document.proof.created', 'user', { hash });
  res.status(201).json({
    hash,
    ipfsCid: `bafy${hash.slice(0, 36)}`,
    network: 'polygon-amoy',
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`,
    status: 'verified',
  });
});

app.post(['/v1/consents', '/api/api/v1/consents'], (req, res) => {
  const now = Date.now();
  const durationHours = Math.min(Number(req.body.durationHours ?? 24), 168);
  const consent = {
    id: crypto.randomUUID(),
    organizationDid: req.body.organizationDid,
    assetIds: req.body.assetIds ?? [],
    fields: req.body.fields ?? [],
    purpose: req.body.purpose,
    status: 'active',
    startsAt: new Date(now).toISOString(),
    expiresAt: new Date(now + durationHours * 3_600_000).toISOString(),
  };
  record('consent.granted', 'user', consent);
  res.status(201).json(consent);
});

app.get(['/v1/audit', '/api/api/v1/audit'], (_req, res) => res.json({ items: audit }));

app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Truvault API listening on ${process.env.PORT ?? 4000}`);
});
