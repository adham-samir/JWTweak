# JWTweak

**The attacker-minded JWT toolkit.** Forge, audit & break JSON Web Tokens — entirely in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-brightgreen)]()

## Why JWTweak?

[jwt.io](https://jwt.io) is great for decoding tokens, but it enforces standards compliance. Security testers need to **break** those standards — downgrade algorithms, inject headers, embed attacker-controlled keys, and sign with raw public key bytes as HMAC secrets.

JWTweak does all JWT operations **manually** at the crypto primitive level, just like your Python exploit scripts do. No JWT libraries. No validation. Pure control.

## What it does

- **Decode** — paste a JWT, see header/payload/signature with smart claim labels (expiry detection, human-readable timestamps), and verify signatures with HMAC secrets or RSA/EC public keys
- **Encode** — build JWTs from scratch with any algorithm, any key. Pre-fills from decoded tokens so you can edit and re-sign
- **Attacks** — four attack vectors in one tab:
  - **Algorithm Confusion** — RS256→HS256 downgrade using the target's public key as HMAC secret
  - **KID Injection** — SQLi, path traversal, command injection, and NoSQL payloads in the `kid` header
  - **JKU Injection** — generate RSA keypairs, build JWKS documents, embed attacker-controlled `jku` URLs
  - **JWK Embedding** — embed an attacker's public key directly in the `jwk` header
- **Key Tools** — PEM → n,e extraction, n,e → PEM reconstruction, RSA/EC key generator, JWK explorer
- **Collapsible key outputs** — public/private PEMs with copy and download buttons

## Privacy & Security

- **No backend** — everything runs in your browser via the Web Crypto API
- **No tracking** — no analytics, no telemetry, no external requests
- **No server** — your tokens, secrets, and keys never leave your machine
- **HTTPS required** — Web Crypto API only works in secure contexts

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Web Crypto API (zero external crypto dependencies)
- Framer Motion (animations)
- Deployable as a static site (GitHub Pages, Vercel, Netlify, Cloudflare Pages)

## Run locally

```bash
git clone https://github.com/adham-samir/JWTweak.git
cd JWTweak
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deploy

Build and deploy the `dist/` folder to any static host:

```bash
npm run build
```

The `dist/` folder contains a fully self-contained static site — just HTML, CSS, and JS. No server required.

## License

MIT — see [LICENSE](LICENSE) for details.

## Disclaimer

For authorized security testing only. Use against systems you own or have explicit permission to test.
