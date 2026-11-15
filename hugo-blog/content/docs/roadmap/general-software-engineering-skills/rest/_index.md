---
title: "REST"
weight: 4
description: "REST API design explained: resources and URLs, HTTP methods and idempotency, status codes, pagination, versioning, OpenAPI, and REST vs GraphQL vs gRPC."
---
# REST

**REST** (Representational State Transfer) is an architectural style for APIs over HTTP. You model your domain as **resources** with stable URLs (`/orders/42`), and act on them with the standard HTTP **methods** (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Each request is **stateless**, carrying everything the server needs, and responses can be **cached**. Most public APIs you will ingest from (Stripe, GitHub, Salesforce, Shopify) are REST APIs returning JSON.

The term comes from Roy Fielding's 2000 PhD thesis. In practice, "RESTful" usually means "resource-oriented JSON over HTTP", not every constraint Fielding described.

## Resources and methods

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
