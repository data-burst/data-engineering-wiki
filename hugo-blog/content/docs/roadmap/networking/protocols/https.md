---
title: "HTTPS"
description: "How HTTPS works, animated: the TLS 1.3 handshake, key exchange, certificates and chains of trust, plus common certificate errors and how to debug them."
bookToC: false
---
<div class="lx-kicker-line">$ openssl s_client -connect shop.com:443   # RFC 8446 (TLS 1.3)</div>

# HTTPS

**HTTPS** is plain HTTP sent inside a **TLS** (Transport Layer Security) connection, usually on port 443. TLS gives three guarantees: **confidentiality** (nobody on the path can read the data), **integrity** (nobody can change it unnoticed) and **authentication** (you are really talking to `shop.com`, proven by a certificate). "SSL" is the name of TLS's long-dead predecessor; every SSL version and TLS 1.0 and 1.1 are deprecated. Use TLS 1.3, with 1.2 as a fallback.

## The TLS 1.3 handshake

{{< fig kicker="$ openssl s_client -connect shop.com:443 -tls1_3" title="TLS 1.3 handshake: one round trip to encrypted data" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 364">
<defs>
<marker id="tls-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="tls-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="200" y1="62" x2="200" y2="356" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="130" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="200" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
<text x="200" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">browser</text>
<line x1="560" y1="62" x2="560" y2="356" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="490" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="560" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">SERVER</text>
<text x="560" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">shop.com:443</text>
<g class="f" data-step="1"><line x1="204" y1="99" x2="556" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tls-a)"/><text x="380" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ClientHello  key_share, SNI</text></g>
<g class="f" data-step="2"><line x1="556" y1="133" x2="204" y2="133" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tls-a)"/><text x="380" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ServerHello  key_share</text></g>
<g class="f" data-step="2"><rect x="132" y="152" width="95" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="180" y="167" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">derive keys</text></g>
<g class="f" data-step="2"><rect x="532" y="152" width="95" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="580" y="167" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">derive keys</text></g>
<g class="f" data-step="3"><line x1="556" y1="201" x2="204" y2="201" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tls-a)"/><text x="380" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">{EncExt, Certificate, CertVerify, Finished}</text></g>
<g class="f" data-step="4"><rect x="114" y="220" width="172" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="200" y="235" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">check chain + hostname</text></g>
<g class="f" data-step="4"><line x1="204" y1="269" x2="556" y2="269" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tls-a)"/><text x="380" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">{Finished}</text></g>
<g class="f" data-step="5"><line x1="204" y1="303" x2="556" y2="303" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tls-a)"/><text x="380" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">{GET / HTTP/1.1}</text></g>
<g class="f" data-step="5"><line x1="556" y1="337" x2="204" y2="337" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tls-a)"/><text x="380" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">{200 OK ...}</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>client</td><td>server</td><td class="tag">ClientHello</td><td>TLS 1.3, ciphers: TLS_AES_128_GCM_SHA256 …, SNI=shop.com, key_share: X25519MLKEM768</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>server</td><td>client</td><td class="tag">ServerHello</td><td>chosen cipher + server key_share → both derive handshake keys</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>server</td><td>client</td><td class="tag">ENCRYPTED</td><td>EncryptedExtensions, Certificate (shop.com ← intermediate CA), CertificateVerify, Finished</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>client</td><td>client</td><td class="tag">VERIFY</td><td>chain → root CA in trust store · not expired · SAN matches shop.com</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>client</td><td>server</td><td class="tag">ENCRYPTED</td><td>Finished</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>client</td><td>server</td><td class="tag">APP DATA</td><td>HTTP request, AES-GCM encrypted</td></tr>
</table>
<ol class="lx-caps">
  <li>A TCP connection to port 443 is open. Nothing is encrypted yet.</li>
  <li><b>ClientHello</b>: supported versions and ciphers, the server name (<b>SNI</b>), and a <b>key share</b>: the client's half of a key exchange.</li>
  <li><b>ServerHello</b> carries the server's key share. Both sides now compute the same <b>shared secret</b> without ever sending it.</li>
  <li>Everything from here is encrypted ({ } = encrypted). The server sends its remaining settings and its <b>certificate</b>, then signs the handshake with its private key to prove it owns it.</li>
  <li>The client checks the certificate chain up to a <b>trusted CA</b>, the expiry and that the name matches shop.com, then sends <b>Finished</b>.</li>
  <li>Application data flows encrypted. The whole handshake took <b>one round trip</b> (TLS 1.2 needed two).</li>
</ol>
{{< /fig >}}

Two kinds of cryptography work together:

- **Key exchange** (ECDHE with X25519, and since 2024 to 2025 hybrid post-quantum **X25519MLKEM768** by default in major browsers, Cloudflare and OpenSSL 3.5) lets both sides agree on a secret over an open network. New keys per connection give **forward secrecy**: stealing the server's private key later does not decrypt old traffic.
- **Signatures and certificates** prove identity. The server's certificate binds its public key to the name `shop.com` and is signed by a **certificate authority** (CA) that your OS or browser already trusts.

After the handshake, data is encrypted with a fast symmetric cipher such as AES-GCM or ChaCha20-Poly1305.

## The chain of trust

| Certificate | Signed by | Lives in |
|---|---|---|
| Leaf: `shop.com` | Intermediate CA | Sent by the server |
| Intermediate CA | Root CA | Sent by the server |
| Root CA | Itself | Your trust store (OS, browser, JVM `cacerts`, Python `certifi`) |

Let's Encrypt and other ACME CAs issue free certificates automatically. Lifetimes are shrinking: the CA/Browser Forum has voted to cut maximum validity from 398 days to 200 days (March 2026), 100 days (2027) and 47 days (2029), so certificate renewal must be automated.

## Common mistakes

- **Disabling verification to "make it work"** (`verify=False`, `curl -k`, `sslmode=require` without `verify-full`). The connection is encrypted but you no longer know who is on the other end.
- **The server sends only the leaf certificate.** Browsers may cope; Python, Java and Go clients fail with "unable to get local issuer certificate". Serve the full chain.
- **Corporate proxies with their own CA.** Add the company root to the trust store your runtime actually uses (Java and Python often have their own).
- **Expired certificates.** The top cause of HTTPS outages. Automate renewal and alert on expiry.
- **Mixed content.** An HTTPS page that loads scripts over HTTP is blocked by browsers.

## Try it

```bash
curl -vI https://shop.com 2>&1 | grep -E 'SSL|TLS|subject|issuer|expire'
openssl s_client -connect shop.com:443 -servername shop.com </dev/null | openssl x509 -noout -dates -subject
```

## Learning Resources

- [The Illustrated TLS 1.3 Connection](https://tls13.xargs.org/): every byte of a real handshake, explained
- [RFC 8446: TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [Bulletproof TLS and PKI](https://www.feistyduck.com/books/bulletproof-tls-and-pki/): Ivan Ristić
- [What is HTTPS?](https://www.cloudflare.com/learning/ssl/what-is-https/): Cloudflare Learning Center
- [Let's Encrypt: How It Works](https://letsencrypt.org/how-it-works/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/): check any public server's TLS setup

See also: [HTTP]({{< relref "http" >}}), [SSH]({{< relref "ssh" >}}).
