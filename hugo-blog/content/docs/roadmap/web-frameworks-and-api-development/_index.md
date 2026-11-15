---
bookCollapseSection: true
weight: 5
description: "Web frameworks and API development for data engineers: how a request flows through any framework, and the 2026 choices in Python, Java and Go."
bookToC: false
---
# Web Frameworks and API Development

Data engineers build APIs more often than the job title suggests: a service that serves model features, an internal endpoint over a curated table, a webhook receiver that lands events in Kafka, or an admin tool for a pipeline. A **web framework** handles the plumbing of HTTP (parsing requests, routing, validation, serialization, errors) so you only write the part that is specific to your data.

## What every framework does

{{< fig kicker="$ curl -H 'Authorization: Bearer …' /orders/42" title="One request through a web framework" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 466">
<defs>
<marker id="mw-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="mw-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="90" y1="62" x2="90" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="24" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="90" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
<line x1="235" y1="62" x2="235" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="170" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="235" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">SERVER</text>
<text x="235" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">uvicorn, Tomcat</text>
<line x1="380" y1="62" x2="380" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="314" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="380" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">MIDDLEWARE</text>
<text x="380" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">log, auth, CORS</text>
<line x1="525" y1="62" x2="525" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="460" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="525" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">HANDLER</text>
<text x="525" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">get_order(id)</text>
<line x1="670" y1="62" x2="670" y2="458" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="604" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="670" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">DATABASE</text>
<g class="f" data-step="1"><line x1="94" y1="99" x2="231" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#mw-a)"/><text x="162" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /orders/42</text></g>
<g class="f" data-step="1"><rect x="174" y="118" width="123" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="235" y="133" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">parse → Request</text></g>
<g class="f" data-step="2"><line x1="239" y1="167" x2="376" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#mw-a)"/><text x="308" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">Request</text></g>
<g class="f" data-step="2"><line x1="376" y1="201" x2="94" y2="201" stroke="#C2382F" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#mw-r)"/><text x="235" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">no token → 401</text></g>
<g class="f" data-step="3"><line x1="384" y1="235" x2="521" y2="235" stroke="#531A8A" stroke-width="1.6" marker-end="url(#mw-a)"/><text x="452" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">route /orders/{id}</text></g>
<g class="f" data-step="3"><rect x="460" y="254" width="130" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="525" y="269" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">validate id: int</text></g>
<g class="f" data-step="4"><line x1="529" y1="303" x2="666" y2="303" stroke="#531A8A" stroke-width="1.6" marker-end="url(#mw-a)"/><text x="598" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SELECT … id=42</text></g>
<g class="f" data-step="4"><line x1="666" y1="337" x2="529" y2="337" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#mw-a)"/><text x="598" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">row</text></g>
<g class="f" data-step="5"><line x1="521" y1="371" x2="384" y2="371" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#mw-a)"/><text x="452" y="364" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">Order → JSON</text></g>
<g class="f" data-step="5"><line x1="376" y1="405" x2="239" y2="405" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#mw-a)"/><text x="308" y="398" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">+ X-Request-ID</text></g>
<g class="f" data-step="5"><line x1="231" y1="439" x2="94" y2="439" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#mw-a)"/><text x="162" y="432" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">200 OK  JSON</text></g>
</svg>
<ol class="lx-caps">
  <li>Every framework, in any language, runs the same pipeline. The details differ, the shape doesn't.</li>
  <li>The <b>server</b> (an ASGI server, a servlet container, Go's net/http) reads bytes off the socket and builds a <b>Request</b> object.</li>
  <li><b>Middleware</b> wraps every request: logging, auth, CORS, rate limits. It can <b>short-circuit</b>, for example 401 when there is no valid token.</li>
  <li>The <b>router</b> matches method + path to a <b>handler</b>. The framework parses and validates path, query and body before your code runs.</li>
  <li>Your handler does the real work, usually a database call. This is where the time goes.</li>
  <li>The return value is <b>serialized</b> to JSON. The response passes back out through the middleware, which can add headers and record latency.</li>
</ol>
{{< /fig >}}

The concepts carry across languages:

| Concept | Python (FastAPI) | Java (Spring Boot) | Go (net/http, chi) |
|---|---|---|---|
| Route | `@app.get("/orders/{id}")` | `@GetMapping("/orders/{id}")` | `mux.HandleFunc("GET /orders/{id}", h)` |
| Validation | Pydantic models | Bean Validation (`@Valid`) | By hand or a validator library |
| Middleware | ASGI middleware | Servlet filters / interceptors | `func(http.Handler) http.Handler` |
| Server | Uvicorn, Granian | Embedded Tomcat, Jetty, Netty | Built into the standard library |
| API docs | OpenAPI generated automatically | springdoc-openapi | swaggo, or spec-first with oapi-codegen |

## Pick by language

| Page | Frameworks covered |
|---|---|
| [Python]({{< relref "python" >}}) | FastAPI, Django (+ Django REST Framework / Django Ninja), Flask, Litestar; WSGI vs ASGI |
| [Java]({{< relref "java" >}}) | Spring Boot, Quarkus, Micronaut; virtual threads and native images |
| [Go]({{< relref "go" >}}) | The standard library's `net/http`, chi, Gin, Echo, Fiber |

## What makes an API production-ready, in any framework

- **Validation at the edge.** Reject bad input with a clear 400 before it reaches your database.
- **Timeouts everywhere.** On the server, on database calls, and on every outbound HTTP call.
- **Health and readiness endpoints** (`/healthz`, `/readyz`) for load balancers and Kubernetes.
- **Structured logs, metrics and traces.** OpenTelemetry instrumentation is available for all the frameworks here.
- **Authentication** with [OAuth]({{< relref "/docs/roadmap/general-software-engineering-skills/oauth" >}}) and [JWT]({{< relref "/docs/roadmap/general-software-engineering-skills/jwt" >}}) rather than home-made tokens.
- **A contract.** An OpenAPI document for [REST]({{< relref "/docs/roadmap/general-software-engineering-skills/rest" >}}) APIs, or `.proto` files for [gRPC]({{< relref "/docs/roadmap/general-software-engineering-skills/grpc" >}}).

## Learning Resources

- [MDN: An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [The Twelve-Factor App](https://12factor.net/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
