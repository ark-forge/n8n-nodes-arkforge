# Changelog

All notable changes to this project will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

---

## [1.0.0] — 2026-03-12

### Added
- `Certify` operation — route any HTTP call through ArkForge Trust Layer and get a cryptographic proof
- `Verify` operation — retrieve and display a proof bundle by ID
- Ed25519 signature of the full request+response bundle
- RFC 3161 timestamp via FreeTSA
- Sigstore Rekor immutable log anchor
- Compatible with n8n community nodes installation
- Free tier: 500 proofs/month

[Unreleased]: https://github.com/ark-forge/n8n-nodes-arkforge/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ark-forge/n8n-nodes-arkforge/releases/tag/v1.0.0
