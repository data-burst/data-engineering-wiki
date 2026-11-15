---
title: "OAuth"
weight: 1
description: "OAuth 2.0 explained, animated: the authorization code flow with PKCE, access and refresh tokens, scopes, client credentials, and how OpenID Connect adds login."
bookToC: false
---
<div class="lx-kicker-line">$ man oauth   # RFC 6749 · RFC 7636 (PKCE) · OAuth 2.1 draft</div>

# OAuth

**OAuth 2.0** is a standard for **delegated authorization**: it lets an application act on your behalf in another service without ever seeing your password. You log in at the service itself, approve a limited **scope** ("read repositories", "view calendar"), and the application receives an **access token** that works only for that scope and only for a while. "Sign in with Google" adds **OpenID Connect** on top, which also tells the app who you are.

For data engineers, OAuth is how connectors pull from Salesforce, Google Analytics, HubSpot or GitHub, and how services authenticate to each other with the client credentials flow.

## The four roles

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Resource owner</div><h4>You</h4><p>The person whose data is being accessed.</p></div>
  <div class="lx-card"><div class="lab">Client</div><h4>The app</h4><p>Wants access, for example a reporting tool or an ingestion connector.</p></div>
  <div class="lx-card"><div class="lab">Authorization server</div><h4>Issues tokens</h4><p>Logs you in and asks for consent. Okta, Entra ID, Auth0, Keycloak, Google.</p></div>
  <div class="lx-card"><div class="lab">Resource server</div><h4>The API</h4><p>Holds the data and accepts access tokens.</p></div>
</div>

## Authorization code flow with PKCE

This is the flow to use for web apps, single-page apps, mobile and CLI tools. **PKCE** (Proof Key for Code Exchange, "pixie") was first meant for mobile apps; OAuth 2.1 makes it required for every client.

{{< fig kicker="$ open https://auth.example.com/authorize?..." title="Authorization code flow with PKCE" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 466">
<defs>
<marker id="oauth-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="oauth-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="90" y1="62" x2="90" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="20" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="90" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">BROWSER</text>
<text x="90" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">you</text>
<line x1="283" y1="62" x2="283" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="213" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="283" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">APP</text>
<text x="283" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">client</text>
<line x1="477" y1="62" x2="477" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="407" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="477" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">AUTH SERVER</text>
<text x="477" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">issues tokens</text>
<line x1="670" y1="62" x2="670" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="600" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="670" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">API</text>
<text x="670" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">resource server</text>
<g class="f" data-step="1"><rect x="155" y="84" width="256" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="283" y="99" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">verifier=random · challenge=SHA256</text></g>
<g class="f" data-step="1"><line x1="279" y1="133" x2="94" y2="133" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#oauth-a)"/><text x="187" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">302 → /authorize</text></g>
<g class="f" data-step="1"><line x1="94" y1="167" x2="473" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#oauth-a)"/><text x="283" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /authorize?…&amp;code_challenge</text></g>
<g class="f" data-step="2"><rect x="415" y="186" width="123" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="477" y="201" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">login + consent</text></g>
<g class="f" data-step="3"><line x1="473" y1="235" x2="94" y2="235" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#oauth-a)"/><text x="283" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">302 → /callback?code=…&amp;state</text></g>
<g class="f" data-step="3"><line x1="94" y1="269" x2="279" y2="269" stroke="#531A8A" stroke-width="1.6" marker-end="url(#oauth-a)"/><text x="187" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /callback?code</text></g>
<g class="f" data-step="4"><line x1="287" y1="303" x2="473" y2="303" stroke="#531A8A" stroke-width="1.6" marker-end="url(#oauth-a)"/><text x="380" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">POST /token code+verifier</text></g>
<g class="f" data-step="4"><rect x="363" y="322" width="228" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="477" y="337" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SHA256(verifier) == challenge?</text></g>
<g class="f" data-step="4"><line x1="473" y1="371" x2="287" y2="371" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#oauth-a)"/><text x="380" y="364" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">access + refresh token</text></g>
<g class="f" data-step="5"><line x1="287" y1="405" x2="666" y2="405" stroke="#531A8A" stroke-width="1.6" marker-end="url(#oauth-a)"/><text x="477" y="398" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /repos  Bearer access_token</text></g>
<g class="f" data-step="5"><line x1="666" y1="439" x2="287" y2="439" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#oauth-a)"/><text x="477" y="432" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">200 OK</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>app</td><td>browser</td><td class="tag">REDIRECT</td><td>/authorize?response_type=code&amp;client_id=reports&amp;redirect_uri=…/callback&amp;scope=repo:read&amp;state=xyz&amp;code_challenge=E9Mr…&amp;code_challenge_method=S256</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>browser</td><td>auth</td><td class="tag">LOGIN</td><td>user authenticates (password, passkey, MFA) and consents</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>auth</td><td>browser</td><td class="tag">REDIRECT</td><td>/callback?code=SplxlO…&amp;state=xyz</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>app</td><td>auth</td><td class="tag">TOKEN</td><td>grant_type=authorization_code, code, redirect_uri, code_verifier=dBjf…</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>auth</td><td>app</td><td class="tag">TOKEN</td><td>{access_token, token_type: Bearer, expires_in: 3600, refresh_token}</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>app</td><td>api</td><td class="tag">CALL</td><td>Authorization: Bearer eyJ… → 200 OK</td></tr>
</table>
<ol class="lx-caps">
  <li>A reporting app wants to read your repositories. It must never see your password.</li>
  <li>The app makes a random <b>code_verifier</b>, keeps it secret, and sends only its hash (<b>code_challenge</b>) when it redirects your browser to the authorization server.</li>
  <li>You log in <b>on the authorization server's own page</b> and approve the requested <b>scope</b>, for example <code>repo:read</code>.</li>
  <li>The server redirects back to the app with a short-lived <b>authorization code</b>. The app checks that <code>state</code> matches what it sent.</li>
  <li>The app exchanges the code plus the original <b>verifier</b> for tokens, over a back channel. A thief who stole only the code cannot pass the hash check.</li>
  <li>The app calls the API with the <b>access token</b>. The API checks the token and its scope, not your password.</li>
</ol>
{{< /fig >}}

## Which flow when

| Flow | Use for | Status in 2026 |
|---|---|---|
| **Authorization code + PKCE** | Any app acting for a user | The default |
| **Client credentials** | Service to service, no user (an Airflow DAG calling an internal API) | Current |
| **Device authorization** | TVs, CLIs without a browser (`gh auth login`, `az login --use-device-code`) | Current |
| **Refresh token** | Getting a new access token without asking the user again | Current; rotate them |
| Implicit | Old SPAs: token returned in the URL | **Removed** in OAuth 2.1, don't use |
| Resource owner password | App collects your password directly | **Removed** in OAuth 2.1, don't use |

## OAuth vs OpenID Connect vs JWT

- **OAuth 2.0** answers "may this app do X?" It gives an **access token** for an API.
- **OpenID Connect** (OIDC) answers "who is this user?" It adds an **ID token** (always a [JWT]({{< relref "../jwt" >}})) and a `/userinfo` endpoint. Use it for login.
- **JWT** is just a token **format**. Access tokens are often JWTs, but they may also be opaque strings the API checks with the authorization server (token introspection).

## Common mistakes

- **Using the access token as proof of login.** That's what the ID token is for. An access token issued to another app could be replayed against yours.
- **Skipping `state` or PKCE.** That opens the door to CSRF and stolen authorization codes.
- **Loose redirect URIs.** Register exact URIs. Wildcards let attackers redirect codes to themselves.
- **Asking for broad scopes.** Request the minimum (`repo:read`, not `repo`). Users and security reviews will thank you.
- **Storing refresh tokens like config.** They are long-lived credentials. Keep them in a secrets manager and rotate them.

## Learning Resources

- [OAuth 2.0 Simplified](https://www.oauth.com/): Aaron Parecki, free online book
- [oauth.net](https://oauth.net/2/) and [OAuth 2.1 draft](https://oauth.net/2.1/)
- [RFC 6749: OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749), [RFC 7636: PKCE](https://www.rfc-editor.org/rfc/rfc7636), [RFC 9700: OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [An Illustrated Guide to OAuth and OpenID Connect](https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc): Okta
- [OAuth 2.0 and OpenID Connect (in plain English)](https://www.youtube.com/watch?v=996OiexHze0): Nate Barbettini

See also: [JWT]({{< relref "../jwt" >}}), [HTTPS]({{< relref "/docs/roadmap/networking/protocols/https" >}}).
