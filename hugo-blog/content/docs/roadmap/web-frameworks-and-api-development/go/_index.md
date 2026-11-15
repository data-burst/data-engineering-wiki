---
weight: 2
description: "Go web development in 2026: the net/http standard library with method routing, chi, Gin, Echo and Fiber compared, middleware, timeouts, and how to choose."
---
# Go

**Go** is a compiled, statically typed language from Google built for networked services. It compiles to a single static binary, starts instantly, uses little memory, and handles thousands of concurrent requests with **goroutines** (lightweight threads) and ordinary blocking code. Much of the cloud-native and data infrastructure stack is written in Go: Kubernetes, Docker, Terraform, Prometheus, Grafana, etcd, CockroachDB, Redpanda's tooling and many Kafka connectors. Data teams reach for it for high-throughput ingestion services, CLIs and Kubernetes operators.

## Start with the standard library

Go's `net/http` is a production-grade HTTP server, not a toy. Since **Go 1.22** its router supports **methods and path parameters**, which removed the main reason to pull in a third-party router:

```go
package main

import (
    "encoding/json"
    "net/http"
    "strconv"
    "time"
)

type Order struct {
    ID    int64   `json:"id"`
    User  string  `json:"user"`
    Total float64 `json:"total"`
}

func getOrder(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
    if err != nil {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }
    order := Order{ID: id, User: "sara", Total: 120} // look up in the DB here
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(order)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /orders/{id}", getOrder)
    srv := &http.Server{
        Addr:         ":8080",
        Handler:      mux,
        ReadTimeout:  5 * time.Second, // the zero-value server has no timeouts
        WriteTimeout: 10 * time.Second,
    }
    srv.ListenAndServe()
}
```

**Middleware** in Go is just a function that wraps a handler: `func(next http.Handler) http.Handler`. Logging, auth and recovery are each a few lines.

## The frameworks

| Library | Built on | Character |
|---|---|---|
| **net/http** | Standard library | Zero dependencies, stable forever under the Go 1 compatibility promise. Enough for most services since 1.22. |
| **chi** | net/http | A small router with route groups, sub-routers and a middleware collection. Handlers stay plain `http.Handler`, so everything in the ecosystem works. |
| **Gin** | net/http | The most popular Go framework. Its own `gin.Context`, fast routing, binding and validation of JSON and query parameters, lots of middleware. |
| **Echo** | net/http | Similar to Gin: its own context, binding, validation, and well-organized docs. |
| **Fiber** | fasthttp | Express-style API and very high raw throughput, but **not** compatible with `net/http` handlers, middleware or HTTP/2. |

## How to choose

- **Default:** `net/http`. Add **chi** when you want route groups and ready-made middleware while staying standard-compatible.
- **Gin or Echo** when the team wants batteries (binding, validation, error handling) and prefers a framework's conventions.
- **Fiber** only if benchmarks of **your** workload show `net/http` is the bottleneck, which is rare: the database or downstream calls usually dominate.
- For **gRPC** services, use `grpc-go` or **connect-go** instead of an HTTP framework. See [gRPC]({{< relref "/docs/roadmap/general-software-engineering-skills/grpc" >}}).

## Common mistakes

- **Using `http.ListenAndServe` or the default `http.Client` without timeouts.** Both wait forever by default. Create an `http.Server` and `http.Client{Timeout: ...}` explicitly.
- **Ignoring `r.Context()`.** Pass the request context into database and HTTP calls so work stops when the client disconnects.
- **Starting goroutines per request without limits.** Bound concurrency with a worker pool or `errgroup.SetLimit`.
- **Not shutting down gracefully.** Handle SIGTERM and call `srv.Shutdown(ctx)` so in-flight requests finish during a Kubernetes rollout.
- **Choosing a framework for benchmark numbers** rather than ecosystem fit.

## Learning Resources

### Official

- [Tutorial: Developing a RESTful API with Go and Gin](https://go.dev/doc/tutorial/web-service-gin)
- [Routing enhancements for Go 1.22](https://go.dev/blog/routing-enhancements): the new `net/http` patterns
- [net/http package documentation](https://pkg.go.dev/net/http)
- [chi](https://go-chi.io/), [Gin](https://gin-gonic.com/en/docs/), [Echo](https://echo.labstack.com/docs), [Fiber](https://docs.gofiber.io/)

### Books

- [Let's Go and Let's Go Further](https://lets-go.alexedwards.net/): Alex Edwards, the best practical guides to Go web apps and APIs with the standard library
- [Learning Go, 2nd edition](https://www.oreilly.com/library/view/learning-go-2nd/9781098139285/): Jon Bodner
- [Building Distributed Applications in Gin](https://www.packtpub.com/en-us/product/building-distributed-applications-in-gin-9781801074858): Mohamed Labouardy

### Courses

- [Crash course in Gin Framework](https://www.youtube.com/watch?v=N14HOh10ghY)
- [Go Fiber Web Framework](https://www.youtube.com/watch?v=RK6KnzIfeJQ)

See also: [Go language]({{< relref "/docs/roadmap/programming-language/go" >}}), [REST]({{< relref "/docs/roadmap/general-software-engineering-skills/rest" >}}).
