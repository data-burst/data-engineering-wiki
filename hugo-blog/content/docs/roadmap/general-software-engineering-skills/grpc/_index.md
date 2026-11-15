---
title: "gRPC"
weight: 5
description: "gRPC explained: Protocol Buffers service definitions, code generation, HTTP/2 transport, the four streaming modes, deadlines, and when to pick gRPC over REST."
---
# gRPC

**gRPC** is an open-source **remote procedure call** framework: you define a service and its methods in a `.proto` file, generate client and server code for your languages, and then call a method on another machine as if it were a local function. Messages are encoded with **Protocol Buffers**, a compact binary format, and sent over **HTTP/2**. Google open-sourced it in 2015; it is a CNCF project and the standard for internal service-to-service calls in many companies, and in data tools such as Apache Arrow Flight, Temporal and etcd.

## Define once, call from any language

```protobuf
syntax = "proto3";
package shop.v1;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);                 // unary
  rpc WatchOrders (WatchRequest) returns (stream Order);          // server streaming
  rpc UploadEvents (stream Event) returns (UploadSummary);        // client streaming
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);     // bidirectional
}

message GetOrderRequest { int64 id = 1; }
message Order { int64 id = 1; string user = 2; double total = 3; string status = 4; }
```

`protoc` (or `buf generate`) turns this into typed stubs. A Python client then calls `stub.GetOrder(GetOrderRequest(id=42), timeout=2.0)` and a Go server implements `GetOrder(ctx, req)`. The field **numbers**, not names, go on the wire, which is what makes old and new versions compatible. See [Protobuf]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/protobuf" >}}).

## The four call types

| Type | Shape | Example |
|---|---|---|
| Unary | one request → one response | Get an order |
| Server streaming | one request → many responses | Tail new orders as they arrive |
| Client streaming | many requests → one response | Upload a batch of events, get a summary |
| Bidirectional | many ↔ many, independently | Chat, live sync |

Streaming rides on HTTP/2 streams, so many calls share one TCP connection without blocking each other at the HTTP level.

## gRPC vs REST

| | gRPC | REST + JSON |
|---|---|---|
| Contract | Required `.proto`, generated code | Optional (OpenAPI) |
| Payload | Binary, small, fast to parse | Text, human-readable |
| Browser support | Needs gRPC-Web or Connect | Native |
| Streaming | Built in | Workarounds (SSE, WebSockets) |
| Debugging | Needs tools (`grpcurl`, Postman) | `curl` |
| Best for | Internal microservices, low latency, polyglot teams | Public APIs, browsers, integrations |

## Production essentials

- **Always set a deadline.** Without one, a stuck server holds your call forever. Deadlines propagate to downstream calls.
- **Use status codes**: `NOT_FOUND`, `INVALID_ARGUMENT`, `UNAVAILABLE` (retryable), `DEADLINE_EXCEEDED`.
- **Load balance per request, not per connection.** HTTP/2 keeps one long-lived connection, so a plain L4 load balancer sends everything to one pod. Use client-side balancing, a service mesh, or an L7 proxy such as Envoy.
- **Evolve schemas safely**: add new fields with new numbers, never reuse or renumber old ones, mark removed ones `reserved`.

## Common mistakes

- Choosing gRPC for a **public, browser-facing** API where JSON over HTTP would be simpler for consumers.
- **Changing field numbers or types** in a `.proto`, which silently corrupts data between old and new services.
- Forgetting **message size limits** (4 MB by default in many implementations) when returning large results. Stream them instead.

## Learning Resources

- [grpc.io documentation](https://grpc.io/docs/): core concepts, per-language quick starts
- [gRPC: Up and Running](https://www.oreilly.com/library/view/grpc-up-and/9781492058328/): Kasun Indrasiri, Danesh Kuruppu
- [Protocol Buffers language guide (proto3)](https://protobuf.dev/programming-guides/proto3/)
- [Buf](https://buf.build/docs/): modern tooling for linting, breaking-change checks and code generation
- [Connect](https://connectrpc.com/): gRPC-compatible RPC that also works with plain HTTP and browsers
- [grpcurl](https://github.com/fullstorydev/grpcurl): curl for gRPC

See also: [REST]({{< relref "../rest" >}}), [GraphQL]({{< relref "../graphql" >}}), [HTTP]({{< relref "/docs/roadmap/networking/protocols/http" >}}).
