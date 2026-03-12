# n8n-nodes-arkforge

**Certify any AI API call with cryptographic proof of execution** — directly from your n8n workflows.

The only trust layer that works across any model, any provider, any infrastructure. In a real-world pipeline (Claude + Mistral + GPT + custom APIs), no single vendor can certify the full chain. ArkForge Trust Layer can.

## Installation

### Community Nodes (recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install a community node**
3. Enter `n8n-nodes-arkforge`
4. Agree to the risks and click **Install**

### Manual

```bash
cd ~/.n8n
npm install n8n-nodes-arkforge
```

## Credentials

1. Get your free API key at [arkforge.tech](https://arkforge.tech)
2. In n8n, go to **Credentials > New > ArkForge Trust Layer API**
3. Paste your API key

## Operations

### Certify API Call

Proxy any API call through the Trust Layer. The upstream API is called normally, and you get back:
- The **original API response** (unchanged)
- A **cryptographic proof** with SHA-256 hashes of request, response, and chain
- A **verification URL** anyone can visit to verify the proof
- An optional **RFC 3161 timestamp** from an independent authority

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| Target URL | Yes | The upstream API to call (e.g. `https://api.anthropic.com/v1/messages`) |
| HTTP Method | No | POST (default) or GET |
| Payload | Yes | JSON body to send to the upstream API |
| Extra Headers | No | Headers forwarded to the upstream API (e.g. `Authorization: Bearer sk-...`) |
| Description | No | Metadata attached to the proof |
| Agent Identity | No | Agent identity recorded in the proof |
| Agent Version | No | Agent version recorded in the proof |

### Verify Proof

Look up and verify an existing proof by its ID.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| Proof ID | Yes | The proof ID (e.g. `prf_20260312_155129_11b6cb`) |

## Output

The Certify operation returns:

```json
{
  "proof": {
    "proof_id": "prf_...",
    "verification_url": "https://arkforge.tech/trust/v1/proof/prf_...",
    "hashes": {
      "request": "sha256:...",
      "response": "sha256:...",
      "chain": "sha256:..."
    },
    "timestamp": "2026-03-12T15:51:29Z",
    "transaction_success": true
  },
  "service_response": {
    "status_code": 200,
    "body": { /* original API response */ }
  }
}
```

Access the upstream response: `{{ $json.service_response.body }}`
Access the proof ID: `{{ $json.proof.proof_id }}`
Access the verification URL: `{{ $json.proof.verification_url }}`

## Use Cases

- **Multi-LLM pipelines**: Certify every step when Claude calls Mistral calls GPT
- **EU AI Act compliance**: Prove which models processed what data, and when
- **Audit trails**: Immutable proof of every AI decision in regulated workflows
- **Supply chain trust**: Verify that API responses haven't been tampered with

## Links

- [ArkForge Trust Layer](https://arkforge.tech)
- [API Documentation](https://arkforge.tech/trust)
- [GitHub](https://github.com/ark-forge/n8n-nodes-arkforge)

## License

[MIT](LICENSE)
