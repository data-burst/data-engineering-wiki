---
title: "REST"
weight: 4
description: "REST API design explained: resources and URLs, HTTP methods and idempotency, status codes, pagination, versioning, OpenAPI, and REST vs GraphQL vs gRPC."
---
<div class="lx-kicker-line">$ curl -s https://api.shop.com/orders/42</div>

# REST

**REST** (Representational State Transfer) is an architectural style for APIs over HTTP. You model your domain as **resources** with stable URLs (`/orders/42`), and act on them with the standard HTTP **methods** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Each request is **stateless**, carrying everything the server needs, and responses can be **cached**. Most public APIs you will ingest from (Stripe, GitHub, Salesforce, Shopify) are REST APIs returning JSON.

The term comes from Roy Fielding's 2000 PhD thesis. In practice, "RESTful" usually means "resource-oriented JSON over HTTP", not every constraint Fielding described.

## Resources and methods

{{< fig kicker="$ curl -X DELETE https://api.shop.com/orders/42" title="One resource, six requests" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 322">
<defs>
<marker id="rest-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#3D3A49"/></marker>
</defs>
<g class="m">
<text x="20" y="36" font-size="11" font-weight="700" fill="#5C5869">REQUEST</text>
<text x="380" y="36" font-size="11" font-weight="700" fill="#5C5869">RESPONSE</text>
<rect x="590" y="22" width="154" height="290" rx="8" fill="#F4EEFA" fill-opacity="0.5" stroke="#DCC9EE"/>
<text x="667" y="44" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">SERVER · /orders</text>
<rect x="600" y="60" width="134" height="40" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text x="610" y="76" font-size="11.5" font-weight="600" fill="#17151F">/orders/41</text><text x="610" y="92" font-size="11" fill="#5C5869">status: paid</text><rect x="600" y="110" width="134" height="40" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text x="610" y="126" font-size="11.5" font-weight="600" fill="#17151F">/orders/42</text><text x="610" y="142" font-size="11" fill="#5C5869">status: paid</text>
</g>
<g class="f slide-r m" data-step="1">
<rect x="20" y="64" width="72" height="24" rx="4" fill="#531A8A"/><text x="56" y="80" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">GET</text>
<text x="102" y="80" font-size="12" fill="#17151F">/orders<tspan font-size="11" fill="#5C5869"></tspan></text>
<line x1="340" y1="76" x2="370" y2="76" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#rest-a)"/>
<rect x="380" y="64" width="46" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="403" y="80" text-anchor="middle" font-size="11.5" font-weight="700" fill="#531A8A">200</text>
<text x="434" y="80" font-size="11.5" fill="#17151F">[41, 42]</text>
</g>
<g class="f pop m" data-step="2"><rect x="600" y="160" width="134" height="40" rx="5" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text x="610" y="176" font-size="11.5" font-weight="600" fill="#17151F">/orders/43</text><text x="610" y="192" font-size="11" fill="#5C5869">status: new</text></g>
<g class="f slide-r m" data-step="2">
<rect x="20" y="108" width="72" height="24" rx="4" fill="#531A8A"/><text x="56" y="124" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">POST</text>
<text x="102" y="124" font-size="12" fill="#17151F">/orders<tspan dx="8" font-size="11" fill="#5C5869">{&quot;sku&quot;:&quot;A7&quot;}</tspan></text>
<line x1="340" y1="120" x2="370" y2="120" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#rest-a)"/>
<rect x="380" y="108" width="46" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="403" y="124" text-anchor="middle" font-size="11.5" font-weight="700" fill="#531A8A">201</text>
<text x="434" y="124" font-size="11.5" fill="#17151F">Location: /orders/43</text>
</g>
<g class="f slide-r m" data-step="3">
<rect x="20" y="152" width="72" height="24" rx="4" fill="#531A8A"/><text x="56" y="168" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">GET</text>
<text x="102" y="168" font-size="12" fill="#17151F">/orders/42<tspan font-size="11" fill="#5C5869"></tspan></text>
<line x1="340" y1="164" x2="370" y2="164" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#rest-a)"/>
<rect x="380" y="152" width="46" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="403" y="168" text-anchor="middle" font-size="11.5" font-weight="700" fill="#531A8A">200</text>
<text x="434" y="168" font-size="11.5" fill="#17151F">{&quot;status&quot;:&quot;paid&quot;}</text>
</g>
<g class="f slide-r m" data-step="4">
<rect x="20" y="196" width="72" height="24" rx="4" fill="#531A8A"/><text x="56" y="212" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">PATCH</text>
<text x="102" y="212" font-size="12" fill="#17151F">/orders/42<tspan dx="8" font-size="11" fill="#5C5869">{&quot;status&quot;:&quot;shipped&quot;}</tspan></text>
<line x1="340" y1="208" x2="370" y2="208" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#rest-a)"/>
<rect x="380" y="196" width="46" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="403" y="212" text-anchor="middle" font-size="11.5" font-weight="700" fill="#531A8A">200</text>
<text x="434" y="212" font-size="11.5" fill="#17151F">{&quot;status&quot;:&quot;shipped&quot;}</text>
</g>
<g class="f slide-r m" data-step="5">
<rect x="20" y="240" width="72" height="24" rx="4" fill="#531A8A"/><text x="56" y="256" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">DELETE</text>
<text x="102" y="256" font-size="12" fill="#17151F">/orders/42<tspan font-size="11" fill="#5C5869"></tspan></text>
<line x1="340" y1="252" x2="370" y2="252" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#rest-a)"/>
<rect x="380" y="240" width="46" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/><text x="403" y="256" text-anchor="middle" font-size="11.5" font-weight="700" fill="#531A8A">204</text>
<text x="434" y="256" font-size="11.5" fill="#17151F">No Content</text>
</g>
<g class="f slide-r m" data-step="6">
<rect x="20" y="284" width="72" height="24" rx="4" fill="#531A8A"/><text x="56" y="300" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">GET</text>
<text x="102" y="300" font-size="12" fill="#17151F">/orders/42<tspan font-size="11" fill="#5C5869"></tspan></text>
<line x1="340" y1="296" x2="370" y2="296" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#rest-a)"/>
<rect x="380" y="284" width="46" height="24" rx="4" fill="#fff" stroke="#C2382F"/><text x="403" y="300" text-anchor="middle" font-size="11.5" font-weight="700" fill="#C2382F">404</text>
<text x="434" y="300" font-size="11.5" fill="#C2382F">Not Found</text>
</g>
<g class="f m" data-step="4"><rect x="606" y="132" width="124" height="14" fill="#fff"/><text x="610" y="142" font-size="11" font-weight="600" fill="#531A8A">status: shipped</text></g>
<g class="f pop m" data-step="5"><rect x="600" y="110" width="134" height="40" rx="5" fill="#fff" stroke="#C2382F" stroke-dasharray="4 3"/><text x="667" y="134" text-anchor="middle" font-size="11.5" font-weight="600" fill="#C2382F">deleted</text></g>
</svg>
<ol class="lx-caps">
  <li>One collection, <b>/orders</b>, holds two orders. Each order has its own URL. The method says what to do with it.</li>
  <li><b>GET /orders</b> lists the collection: <b>200</b> with a JSON array. Safe: nothing changes on the server.</li>
  <li><b>POST /orders</b> creates a new order. The server picks the ID and answers <b>201 Created</b> with a <b>Location</b> header pointing at it.</li>
  <li><b>GET /orders/42</b> reads one resource by its URL: <b>200</b> and the order as JSON.</li>
  <li><b>PATCH /orders/42</b> changes only the fields you send. The order is now shipped.</li>
  <li><b>DELETE /orders/42</b> removes it. <b>204 No Content</b>: success, with no body to return.</li>
  <li>Asking for it again gets <b>404 Not Found</b>. The URL is the same; the resource is gone.</li>
</ol>
{{< /fig >}}

| Request | Meaning | Success | Idempotent |
|---|---|---|---|
| `GET /orders?status=shipped&limit=50` | List orders, filtered | 200 | yes |
| `GET /orders/42` | Read one order | 200, or 404 | yes |
| `POST /orders` | Create an order | 201 + `Location: /orders/43` | no |
| `PUT /orders/42` | Replace order 42 | 200 or 204 | yes |
| `PATCH /orders/42` | Change some fields | 200 | not necessarily |
| `DELETE /orders/42` | Delete it | 204 | yes |
| `GET /users/7/orders` | Orders belonging to user 7 | 200 | yes |

URLs are **nouns**. The verb is the HTTP method. `/getOrder?id=42` or `POST /deleteOrder` are RPC in disguise.

## Try it

[JSONPlaceholder](https://jsonplaceholder.typicode.com/) is a free fake REST API you can practice on. Writes are accepted and echoed back but not stored.

```bash
API=https://jsonplaceholder.typicode.com
curl -s $API/users/1 | jq '.name, .email'            # GET one resource
curl -s "$API/posts?userId=1" | jq length            # GET a filtered collection
curl -s -i -X POST $API/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"hello","userId":1}'                  # POST: 201 Created + the new id
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE $API/posts/1   # DELETE: 200
```

## Design rules that age well

- **Use status codes properly.** 400 for bad input with a JSON error body, 401 vs 403, 404, 409 for conflicts, 429 with `Retry-After` for rate limits. A consistent error format such as RFC 9457 "Problem Details" helps clients.
- **Paginate every list.** Prefer **cursor** pagination (`?after=ord_123`) over `?page=7`: offsets skip or repeat rows when data changes between requests, which is exactly what happens during an incremental sync.
- **Support incremental reads.** A filter like `?updated_since=2026-01-01T00:00:00Z` lets pipelines fetch only what changed.
- **Make retries safe.** Accept an `Idempotency-Key` header on `POST` so a retried payment isn't charged twice.
- **Version deliberately.** `/v1/...` in the path or a header. Add fields freely; never rename or remove them without a new version.
- **Describe it with OpenAPI.** An OpenAPI 3.1 (or 3.2, released 2025) document gives you docs, client generation, mocks and request validation for free.

## REST vs GraphQL vs gRPC

| | REST | [GraphQL]({{< relref "../graphql" >}}) | [gRPC]({{< relref "../grpc" >}}) |
|---|---|---|---|
| Shape | Many resource URLs | One endpoint, client writes a query | Service methods defined in `.proto` |
| Payload | JSON (usually) | JSON | Protobuf (binary) |
| Transport | HTTP/1.1, 2 or 3 | HTTP | HTTP/2 |
| HTTP caching | Natural (GET + ETag) | Hard (mostly POST) | No |
| Streaming | SSE, webhooks | Subscriptions | Built in, both directions |
| Best for | Public APIs, CRUD, integrations | Front-ends with varied data needs | Internal service-to-service, low latency |

## Common mistakes

- **Returning 200 with `{"error": ...}` in the body.** Clients and monitoring can't tell it failed.
- **Unbounded list endpoints** that return 2 million rows in one response.
- **Chatty APIs** that need 20 calls to render one screen. Offer an `?expand=` option, a dedicated endpoint, or consider GraphQL.
- **Breaking changes without a version**, which silently breaks every downstream pipeline.

## Learning Resources

### Books

- [Designing Web APIs](https://www.oreilly.com/library/view/designing-web-apis/9781492026914/): Jin, Sahni, Shevat
- [API Design Patterns](https://www.manning.com/books/api-design-patterns): JJ Geewax, based on Google's API design rules

### Articles and references

- [Fielding's dissertation, chapter 5: REST](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) and [Google API Improvement Proposals](https://google.aip.dev/)
- [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)

See also: [HTTP]({{< relref "/docs/roadmap/networking/protocols/http" >}}), [Web frameworks]({{< relref "/docs/roadmap/web-frameworks-and-api-development" >}}).
