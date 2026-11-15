---
title: "JWT"
weight: 2
description: "JSON Web Tokens explained, animated: header, payload and signature, how an API verifies a JWT with JWKS, which claims to check, and common security mistakes."
bookToC: false
---
<div class="lx-kicker-line">$ echo $TOKEN | cut -d. -f2 | base64 -d   # RFC 7519</div>

# JWT

A **JSON Web Token** (JWT, pronounced "jot") is a compact, signed string that carries a small JSON document of **claims**, such as "this is user 42, issued by auth.shop.com, valid until 15:00, allowed to read orders". Anyone can **read** a JWT, because it is only Base64URL-encoded, but nobody can **change** it without breaking the **signature**. That lets an API trust the token by checking the signature locally, without calling the login server on every request. JWTs are the usual format for OAuth 2.0 access tokens and OpenID Connect ID tokens.

## Inside a token, and how it is verified

{{< fig kicker="$ jwt decode $TOKEN" title="Three parts, one signature check" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <rect x="20" y="20" width="720" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text y="47" class="m" font-size="13"><tspan x="34" fill="#531A8A" font-weight="600">eyJhbGciOiJSUzI1NiIs…</tspan><tspan x="206" fill="#17151F" font-weight="700" font-size="16">.</tspan><tspan x="222" fill="#17151F" font-weight="600">eyJzdWIiOiJ1c2VyXzQyIiwi…</tspan><tspan x="429" fill="#17151F" font-weight="700" font-size="16">.</tspan><tspan x="446" fill="#5C5869" font-weight="600">dBjftJeZ4CVP…w9QpYk</tspan></text>
  <text x="34" y="82" class="m" font-size="11" fill="#531A8A">HEADER</text>
  <text x="222" y="82" class="m" font-size="11" fill="#17151F">PAYLOAD</text>
  <text x="446" y="82" class="m" font-size="11" fill="#5C5869">SIGNATURE</text>
  <g class="f" data-step="1">
    <rect x="20" y="96" width="190" height="122" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" font-size="11.5" fill="#17151F"><tspan x="32" y="120">{</tspan><tspan x="44" y="140">"alg": "RS256",</tspan><tspan x="44" y="160">"typ": "JWT",</tspan><tspan x="44" y="180">"kid": "2026-01"</tspan><tspan x="32" y="200">}</tspan></text>
  </g>
  <g class="f" data-step="2">
    <rect x="222" y="96" width="268" height="142" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" font-size="11.5" fill="#17151F"><tspan x="234" y="118">{</tspan><tspan x="246" y="136">"sub": "user_42",</tspan><tspan x="246" y="154">"iss": "https://auth.shop.com",</tspan><tspan x="246" y="172">"aud": "orders-api",</tspan><tspan x="246" y="190">"exp": 1795000000,</tspan><tspan x="246" y="208">"scope": "orders:read"</tspan><tspan x="234" y="226">}</tspan></text>
  </g>
  <g class="f" data-step="3">
    <rect x="502" y="96" width="238" height="122" rx="6" fill="#F7F7FB" stroke="#5C5869" stroke-width="1.4"/>
    <text class="m" font-size="11.5" fill="#17151F"><tspan x="514" y="120">RS256(</tspan><tspan x="526" y="140">b64url(header) + "." +</tspan><tspan x="526" y="160">b64url(payload),</tspan><tspan x="526" y="180">auth server PRIVATE key</tspan><tspan x="514" y="200">)</tspan></text>
  </g>
  <g class="f" data-step="4">
    <rect x="20" y="252" width="720" height="34" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text x="380" y="274" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">API: public key for kid 2026-01 (JWKS) → signature ✓ → exp ✓ iss ✓ aud ✓ → 200 OK</text>
  </g>
  <g class="f" data-step="5">
    <rect x="20" y="296" width="720" height="34" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text x="380" y="318" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">tampered: "sub": "admin" → recomputed signature ≠ token signature → 401</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A JWT is three <b>Base64URL</b> strings joined by dots: <b>header</b>, <b>payload</b>, <b>signature</b>. This one arrived in an <code>Authorization: Bearer</code> header.</li>
  <li>The <b>header</b> says how it was signed (<b>alg</b>) and which key was used (<b>kid</b>). Decoding needs no secret.</li>
  <li>The <b>payload</b> holds the claims: who (<b>sub</b>), issued by whom (<b>iss</b>), for which API (<b>aud</b>), until when (<b>exp</b>), with what permissions. It is readable by anyone, so no secrets here.</li>
  <li>The <b>signature</b> covers the first two parts. Only the auth server holds the private key that made it.</li>
  <li>The API fetches the matching <b>public key</b> from the issuer's JWKS endpoint, checks the signature, then the claims. Keys are cached, so there is no database or network call per request.</li>
  <li>Change a single character of the payload and the signature no longer matches. The token is <b>rejected</b>.</li>
</ol>
{{< /fig >}}

## Signing algorithms

| Algorithm | Key | Who can verify | Use when |
|---|---|---|---|
| **HS256** (HMAC) | One shared secret | Anyone with the secret, who could also mint tokens | A single service signs and verifies its own tokens |
| **RS256** (RSA) | Private key signs, public key verifies | Anyone with the public key | Many APIs trust one identity provider. The common default. |
| **ES256 / EdDSA** | Elliptic-curve key pair | Same as RS256 | Same as RS256, with smaller keys and signatures |

## Claims to check, every time

1. The signature, using an algorithm **you** chose (an allow-list), never "whatever the header says".
2. `exp` (expired?) and `nbf` (not yet valid?), with a small clock-skew allowance.
3. `iss`: issued by the identity provider you trust.
4. `aud`: meant for **this** API, not a token issued for another service.
5. Scopes or roles, for the specific action.

Use a maintained library (`PyJWT`, `jose` / `jsonwebtoken` in Node, `golang-jwt/jwt`, Nimbus JOSE in Java) and pass these checks explicitly.

## JWT vs server-side sessions

| | JWT (self-contained) | Session ID (reference) |
|---|---|---|
| Verification | Local, no lookup | Lookup in a session store per request |
| Revocation | Hard: valid until `exp` | Easy: delete the session |
| Size | Hundreds of bytes to a few KB | ~32 bytes |
| Good for | APIs, service-to-service, many verifiers | One web app with a browser login |

Because a JWT cannot be "logged out", keep access tokens short-lived (5 to 15 minutes) and use refresh tokens (see [OAuth]({{< relref "../oauth" >}})) to get new ones.

## Common mistakes

- **Accepting `"alg": "none"`** or letting the token choose between HS256 and RS256. Both have led to complete authentication bypasses.
- **Putting secrets or personal data in the payload.** It is encoded, not encrypted. Use JWE if you really need encryption.
- **Long-lived tokens in `localStorage`.** Any XSS bug can steal them. Prefer short lifetimes; for browser apps, consider HttpOnly cookies or a backend-for-frontend.
- **Skipping `aud` checks**, so a token for the reporting API also works on the payments API.
- **Using JWTs as session storage** for large, changing data. Every request then carries kilobytes of stale state.

## Learning Resources

- [RFC 7519: JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519) and [RFC 8725: JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725)
- [jwt.io](https://jwt.io/): decoder and library list (decode only tokens you don't mind sharing)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook): Auth0, free ebook
- [OWASP JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
- [Critical vulnerabilities in JSON Web Token libraries](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/): the classic `alg` confusion write-up

See also: [OAuth]({{< relref "../oauth" >}}), [HTTPS]({{< relref "/docs/roadmap/networking/protocols/https" >}}).
