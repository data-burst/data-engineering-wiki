---
title: "HTTP"
description: "HTTP explained with an animated request/response: methods, status codes, headers, caching with ETags, and how HTTP/1.1, HTTP/2 and HTTP/3 differ."
bookToC: false
---
<div class="lx-kicker-line">$ curl -i https://api.shop.com/orders/42   # RFC 9110</div>

# HTTP

**HTTP** (Hypertext Transfer Protocol) is a request/response protocol: a client sends a **request** naming a method and a resource, and the server sends back one **response** with a status code, headers and an optional body. It started as the protocol for web pages and is now the default for APIs, object storage (every S3 `GET` and `PUT` is an HTTP call), webhooks and most SaaS data sources your pipelines pull from.

## Anatomy of an exchange

{{< fig kicker="$ curl -v https://api.shop.com/orders/42" title="One HTTP exchange, then a cached revalidation" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 296">
<defs>
<marker id="http-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="http-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="200" y1="62" x2="200" y2="288" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="130" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="200" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
<text x="200" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">curl / browser</text>
<line x1="560" y1="62" x2="560" y2="288" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="490" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="560" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">SERVER</text>
<text x="560" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">api.shop.com</text>
<g class="f" data-step="1"><line x1="204" y1="99" x2="556" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#http-a)"/><text x="380" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">TCP + TLS handshake</text></g>
<g class="f" data-step="2"><line x1="204" y1="133" x2="556" y2="133" stroke="#531A8A" stroke-width="1.6" marker-end="url(#http-a)"/><text x="380" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /orders/42  HTTP/1.1</text></g>
<g class="f" data-step="3"><rect x="481" y="152" width="158" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="560" y="167" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">route → handler → DB</text></g>
<g class="f" data-step="4"><line x1="556" y1="201" x2="204" y2="201" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#http-a)"/><text x="380" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">200 OK  JSON  ETag: "v7"</text></g>
<g class="f" data-step="5"><line x1="204" y1="235" x2="556" y2="235" stroke="#531A8A" stroke-width="1.6" marker-end="url(#http-a)"/><text x="380" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /orders/42  If-None-Match: "v7"</text></g>
<g class="f" data-step="5"><line x1="556" y1="269" x2="204" y2="269" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#http-a)"/><text x="380" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">304 Not Modified  (no body)</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>client</td><td>server</td><td class="tag">CONNECT</td><td>TCP 3-way handshake + TLS 1.3 (port 443)</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>client</td><td>server</td><td class="tag">REQUEST</td><td>GET /orders/42 HTTP/1.1 · Host: api.shop.com · Accept: application/json · Authorization: Bearer …</td></tr>
<tr class="f" data-step="4"><td>3</td><td>04</td><td>server</td><td>client</td><td class="tag">RESPONSE</td><td>HTTP/1.1 200 OK · Content-Type: application/json · Content-Length: 312 · Cache-Control: private, max-age=0 · ETag: "v7"</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>server</td><td>client</td><td class="tag">BODY</td><td>{"id":42,"user":"sam","status":"shipped","total":120.0}</td></tr>
<tr class="f" data-step="5"><td>5</td><td>05</td><td>client</td><td>server</td><td class="tag">REQUEST</td><td>GET /orders/42 · If-None-Match: "v7"</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>server</td><td>client</td><td class="tag">RESPONSE</td><td>HTTP/1.1 304 Not Modified (client reuses its cached copy)</td></tr>
</table>
<ol class="lx-caps">
  <li>The client wants order 42 from an API.</li>
  <li>First a connection: <b>TCP</b>, then <b>TLS</b> for HTTPS. Keep-alive lets later requests reuse it.</li>
  <li>The <b>request</b>: a method, a path, a version, then headers. GET has no body.</li>
  <li>The server routes the request to code that builds the answer, often with a database query.</li>
  <li>The <b>response</b>: a status code, headers that describe the body, then the body itself. The <b>ETag</b> is a version tag for this representation.</li>
  <li>Later, the client asks again with <b>If-None-Match</b>. Nothing changed, so the server sends <b>304</b> with no body: a cheap cache revalidation.</li>
</ol>
{{< /fig >}}

HTTP is **stateless**: each request carries everything the server needs (credentials, cookies, parameters). Sessions, logins and shopping carts are built on top with headers and tokens.

## Methods

| Method | Meaning | Safe | Idempotent | Body |
|---|---|---|---|---|
| GET | Read a resource | yes | yes | no |
| HEAD | GET without the body | yes | yes | no |
| POST | Create, or run an action | no | no | yes |
| PUT | Replace a resource fully | no | yes | yes |
| PATCH | Change part of a resource | no | not necessarily | yes |
| DELETE | Remove a resource | no | yes | rarely |

**Idempotent** means repeating the request has the same effect as sending it once. It matters for retries: a pipeline can safely retry a timed-out `PUT`, but a retried `POST /payments` might charge twice unless the API supports an idempotency key.

## Status codes

| Range | Meaning | Ones to know |
|---|---|---|
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Look elsewhere | 301/308 moved permanently, 304 Not Modified |
| 4xx | Client's fault | 400 bad request, 401 not authenticated, 403 not allowed, 404, 409 conflict, 429 too many requests |
| 5xx | Server's fault | 500, 502 bad gateway, 503 unavailable, 504 gateway timeout |

Retry 429 and 5xx with exponential backoff (respect the `Retry-After` header). Never blindly retry 4xx: the request itself is wrong.

## HTTP/1.1 → HTTP/2 → HTTP/3

The three versions carry the same methods, headers and status codes; what changed is how requests share the network. The main problem each version fixes is **head-of-line blocking**: one slow or lost piece holding up everything queued behind it.

{{< fig kicker="$ curl -sI --http2 https://shop.com" title="Head-of-line blocking in HTTP/1.1, HTTP/2 and HTTP/3" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 290">
<defs>
<marker id="hv-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5C5869"/></marker>
</defs>
<g class="m">
<line x1="150" y1="24" x2="736" y2="24" stroke="#5C5869" stroke-width="1.2" marker-end="url(#hv-a)"/>
<text x="150" y="16" font-size="11" fill="#5C5869">time →  (three files: A, B, C)</text>
<text x="20" y="58" font-size="12.5" font-weight="700" fill="#17151F">HTTP/1.1</text><text x="20" y="74" font-size="11" fill="#5C5869">1 TCP conn</text>
<line x1="20" y1="92" x2="740" y2="92" stroke="#DCDAE6"/>
<text x="20" y="136" font-size="12.5" font-weight="700" fill="#17151F">HTTP/2</text><text x="20" y="152" font-size="11" fill="#5C5869">1 TCP conn</text>
<text x="140" y="119" text-anchor="end" font-size="11" fill="#5C5869">A</text><text x="140" y="143" text-anchor="end" font-size="11" fill="#5C5869">B</text><text x="140" y="167" text-anchor="end" font-size="11" fill="#5C5869">C</text>
<line x1="20" y1="194" x2="740" y2="194" stroke="#DCDAE6"/>
<text x="20" y="238" font-size="12.5" font-weight="700" fill="#17151F">HTTP/3</text><text x="20" y="254" font-size="11" fill="#5C5869">QUIC over UDP</text>
<text x="140" y="221" text-anchor="end" font-size="11" fill="#5C5869">A</text><text x="140" y="245" text-anchor="end" font-size="11" fill="#5C5869">B</text><text x="140" y="269" text-anchor="end" font-size="11" fill="#5C5869">C</text>
</g>
<g class="f slide-r m" data-step="1">
<rect x="150" y="48" width="165" height="26" rx="4" fill="#531A8A"/><text x="232" y="65" text-anchor="middle" font-size="11" fill="#fff">A: GET → 200</text>
<rect x="321" y="48" width="165" height="26" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="403" y="65" text-anchor="middle" font-size="11" fill="#17151F">B: GET → 200</text>
<rect x="492" y="48" width="165" height="26" rx="4" fill="#5C5869"/><text x="574" y="65" text-anchor="middle" font-size="11" fill="#fff">C: GET → 200</text>
<text x="666" y="65" font-size="11" fill="#5C5869">done</text>
</g>
<g class="f slide-r m" data-step="2">
<rect x="150" y="106" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="162" y="119" text-anchor="middle" font-size="11" fill="#fff">A</text><rect x="180" y="130" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="192" y="143" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="210" y="154" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="222" y="167" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="240" y="106" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="252" y="119" text-anchor="middle" font-size="11" fill="#fff">A</text>
</g>
<g class="f m" data-step="3">
<rect x="300" y="102" width="120" height="74" rx="4" fill="#C2382F" fill-opacity="0.07" stroke="#C2382F" stroke-dasharray="4 3"/>
<text x="360" y="143" text-anchor="middle" font-size="11" fill="#C2382F">all streams wait</text>
<g class="pulse"><rect x="270" y="130" width="24" height="18" rx="3" fill="#fff" stroke="#C2382F" stroke-dasharray="3 2"/><text x="282" y="143" text-anchor="middle" font-size="12" font-weight="700" fill="#C2382F">×</text></g><rect x="426" y="130" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="438" y="143" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="456" y="154" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="468" y="167" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="486" y="106" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="498" y="119" text-anchor="middle" font-size="11" fill="#fff">A</text><rect x="516" y="130" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="528" y="143" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="546" y="154" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="558" y="167" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="576" y="106" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="588" y="119" text-anchor="middle" font-size="11" fill="#fff">A</text><rect x="606" y="130" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="618" y="143" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="636" y="154" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="648" y="167" text-anchor="middle" font-size="11" fill="#fff">C</text>
<text x="666" y="143" font-size="11" fill="#5C5869">done</text>
</g>
<g class="f slide-r m" data-step="4">
<rect x="150" y="208" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="162" y="221" text-anchor="middle" font-size="11" fill="#fff">A</text><rect x="180" y="232" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="192" y="245" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="210" y="256" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="222" y="269" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="240" y="208" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="252" y="221" text-anchor="middle" font-size="11" fill="#fff">A</text>
</g>
<g class="f m" data-step="5">
<rect x="300" y="228" width="120" height="26" rx="4" fill="#C2382F" fill-opacity="0.07" stroke="#C2382F" stroke-dasharray="4 3"/>
<text x="360" y="245" text-anchor="middle" font-size="11" fill="#C2382F">only B waits</text>
<g class="pulse"><rect x="270" y="232" width="24" height="18" rx="3" fill="#fff" stroke="#C2382F" stroke-dasharray="3 2"/><text x="282" y="245" text-anchor="middle" font-size="12" font-weight="700" fill="#C2382F">×</text></g><rect x="300" y="256" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="312" y="269" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="330" y="208" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="342" y="221" text-anchor="middle" font-size="11" fill="#fff">A</text><rect x="390" y="256" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="402" y="269" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="420" y="208" width="24" height="18" rx="3" fill="#531A8A" stroke="#531A8A"/><text x="432" y="221" text-anchor="middle" font-size="11" fill="#fff">A</text><rect x="480" y="256" width="24" height="18" rx="3" fill="#5C5869" stroke="#5C5869"/><text x="492" y="269" text-anchor="middle" font-size="11" fill="#fff">C</text><rect x="426" y="232" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="438" y="245" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="456" y="232" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="468" y="245" text-anchor="middle" font-size="11" fill="#17151F">B</text><rect x="486" y="232" width="24" height="18" rx="3" fill="#F4EEFA" stroke="#531A8A"/><text x="498" y="245" text-anchor="middle" font-size="11" fill="#17151F">B</text>
<text x="516" y="245" font-size="11" font-weight="600" fill="#531A8A">done</text>
</g>
</svg>
<ol class="lx-caps">
  <li>A page needs three files, A, B and C, from the same server. Time runs left to right.</li>
  <li><b>HTTP/1.1</b>: one request at a time per connection. B can't start until A's response is complete. Browsers work around it by opening about 6 connections per host.</li>
  <li><b>HTTP/2</b>: all three requests share one TCP connection as interleaved <b>streams</b>. No waiting for a whole response.</li>
  <li>One packet carrying B is <b>lost</b>. TCP delivers bytes strictly in order, so frames for A and C that already arrived sit in the buffer until B's packet is resent. Every stream stalls.</li>
  <li><b>HTTP/3</b> runs on <b>QUIC</b> over UDP. Streams are still multiplexed on one connection, but QUIC orders bytes per stream, not per connection.</li>
  <li>The same loss now delays <b>only stream B</b>. A and C keep flowing and the page finishes sooner.</li>
</ol>
{{< /fig >}}

| Version | Transport | What changed |
|---|---|---|
| HTTP/1.1 (1997) | TCP | Text format, keep-alive connections, one request at a time per connection |
| HTTP/2 (2015) | TCP + TLS | Binary frames, many requests **multiplexed** over one connection, header compression. gRPC is built on it. |
| HTTP/3 (2022) | QUIC over UDP | No TCP head-of-line blocking, faster connection setup, survives network changes (Wi-Fi to mobile) |

Since 2022, RFC 9110 defines these shared semantics separately from the wire formats.

## Common mistakes

- **Pulling an API without pagination or rate-limit handling.** Read the `Link` or cursor fields and honor 429s, or the job either misses data or gets banned.
- **Using GET for actions with side effects.** Crawlers, prefetchers and caches assume GET is safe.
- **Sending credentials over plain HTTP.** Always use [HTTPS]({{< relref "https" >}}).
- **Treating every non-200 as fatal.** 201, 204 and 304 are successes too.

## Try it

```bash
curl -v https://example.com/ -o /dev/null      # the full request and response headers
curl -sI https://www.google.com | head -1      # HTTP/2 200: the version the server picked
curl -sI --http1.1 https://www.google.com | head -1   # force HTTP/1.1
curl -sI --http3 https://www.google.com | head -1     # needs a curl built with HTTP/3 support
```

## Learning Resources

### Documentation

- [MDN: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP): the best reference for methods, headers and status codes
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9112: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112), [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)

### Books

- [HTTP: The Definitive Guide](https://www.oreilly.com/library/view/http-the-definitive/1565925092/): Gourley and Totty, old but still the clearest on fundamentals
- [High Performance Browser Networking](https://hpbn.co/): HTTP/1.1, HTTP/2 and performance, free online

### Videos

- [HTTP/1 to HTTP/2 to HTTP/3](https://www.youtube.com/watch?v=a-sBfyiXysI): Hussein Nasser

See also: [REST]({{< relref "/docs/roadmap/general-software-engineering-skills/rest" >}}), [TCP/IP]({{< relref "tcp" >}}), [UDP]({{< relref "udp" >}}).
