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
<tr class="f" data-step="4"><td>4</td><td>04</td><td>server</td><td>client</td><td class="tag">BODY</td><td>{"id":42,"user":"sara","status":"shipped","total":120.0}</td></tr>
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

## HTTP versions

| Version | Transport | What changed |
|---|---|---|
| HTTP/1.1 (1997) | TCP | Text format, keep-alive connections, one request at a time per connection |
| HTTP/2 (2015) | TCP + TLS | Binary frames, many requests **multiplexed** over one connection, header compression. gRPC is built on it. |
| HTTP/3 (2022) | QUIC over UDP | No TCP head-of-line blocking, faster connection setup, survives network changes (Wi-Fi to mobile) |

Methods, status codes and headers are the same in all three. Since 2022, RFC 9110 defines these shared semantics separately from the wire formats.

## Common mistakes

- **Pulling an API without pagination or rate-limit handling.** Read the `Link` or cursor fields and honor 429s, or the job either misses data or gets banned.
- **Using GET for actions with side effects.** Crawlers, prefetchers and caches assume GET is safe.
- **Sending credentials over plain HTTP.** Always use [HTTPS]({{< relref "https" >}}).
- **Treating every non-200 as fatal.** 201, 204 and 304 are successes too.

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
