---
bookCollapseSection: true
weight: 4
description: "Software engineering skills every data engineer needs: REST, GraphQL and gRPC APIs, OAuth and JWT for authentication, and caching for speed."
---
# General Software Engineering Skills

Data engineering is software engineering with data as the product. Pipelines call APIs, expose APIs, authenticate to dozens of services and need to be fast without overloading the systems they read from. This section covers the building blocks that come up in almost every project.

## APIs: how systems talk

| Page | What you learn |
|---|---|
| [REST]({{< relref "rest" >}}) | Resource-oriented HTTP APIs: methods, status codes, pagination, versioning and OpenAPI. |
| [GraphQL]({{< relref "graphql" >}}) | One endpoint, client-shaped queries, resolvers and the N+1 problem. |
| [gRPC]({{< relref "grpc" >}}) | Typed RPC with Protocol Buffers over HTTP/2, with streaming and deadlines. |

| | REST | GraphQL | gRPC |
|---|---|---|---|
| You call | `GET /orders/42` | `POST /graphql` with a query | `OrderService.GetOrder(id=42)` |
| Format | JSON | JSON | Protobuf (binary) |
| Pick it for | Public APIs, integrations, simple CRUD | UIs needing varied, nested data | Fast internal service-to-service calls and streaming |

## Security: who may do what

| Page | What you learn |
|---|---|
| [OAuth]({{< relref "oauth" >}}) | Delegated authorization: the authorization code flow with PKCE, client credentials, scopes and refresh tokens. |
| [JWT]({{< relref "jwt" >}}) | The signed token format behind most access tokens, and how APIs verify it safely. |

## Performance

| Page | What you learn |
|---|---|
| [Caching]({{< relref "caching" >}}) | Cache-aside, write strategies, eviction, TTLs, invalidation and stampedes. |

## Learning Resources

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann
- [The Twelve-Factor App](https://12factor.net/): conventions for building deployable services
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/): concise security guidance per topic
