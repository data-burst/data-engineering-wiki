---
title: "Go"
description: "Go for data engineers: why Kubernetes, Terraform and Prometheus are written in it, goroutines and channels for concurrent ingestion, and when to choose Go."
weight: 100
---

# Go

**Go** (often "Golang") is a statically typed, compiled language created at Google and released in 2009. It is deliberately small: few features, fast compilation, a garbage collector, and concurrency built into the language with **goroutines** and **channels**. Programs compile to a single static binary with no runtime to install, which makes Go ideal for command-line tools, network services and anything shipped in a tiny container.

## Where Go shows up in data engineering

Go is the language of **cloud-native infrastructure**, so you meet it constantly even if you never write it:

| Category | Written in Go |
|---|---|
| Containers and orchestration | Kubernetes, Docker, containerd, Helm, Argo CD |
| Infrastructure as code | Terraform, OpenTofu, Pulumi engine |
| Observability | Prometheus, Grafana (backend), Loki, Tempo, Mimir, Jaeger, the OpenTelemetry Collector |
| Databases and messaging | etcd, CockroachDB, Vitess, NATS, Temporal |
| Data movement | Redpanda Connect (formerly Benthos), many Kafka and CDC tools |

Writing Go yourself makes sense for:

- **High-throughput ingestion services**: HTTP or gRPC endpoints that accept events and write to Kafka.
- **Kubernetes operators and controllers** (with `controller-runtime` / Kubebuilder) for your data platform.
- **Terraform providers** and internal CLIs.
- **Lightweight connectors** where a 15 MB container beats a 1 GB JVM or Python image.

It is a weak fit for analytical data manipulation: there is no DataFrame ecosystem comparable to Python's, so do that in SQL, Python or Spark.

## Concurrency in a few lines

```go
// Fetch many API pages concurrently, at most 8 in flight, and collect results.
func fetchAll(ctx context.Context, urls []string) []Result {
    results := make(chan Result)
    sem := make(chan struct{}, 8)          // limits concurrency
    var wg sync.WaitGroup
    for _, u := range urls {
        wg.Add(1)
        go func(u string) {                // a goroutine: cheap, thousands are fine
            defer wg.Done()
            sem <- struct{}{}; defer func() { <-sem }()
            results <- fetch(ctx, u)
        }(u)
    }
    go func() { wg.Wait(); close(results) }()
    var out []Result
    for r := range results { out = append(out, r) }
    return out
}
```

## Go vs Python vs Rust for data tooling

| | Go | Python | Rust |
|---|---|---|---|
| Performance | Fast, GC pauses are small | Slow for pure loops | Fastest, no GC |
| Concurrency | Built in, simple | Limited by the GIL (free-threaded builds emerging) | Powerful, more complex |
| Learning curve | Low | Lowest | Steep |
| Data libraries | Few | Richest | Growing fast (Arrow, Polars, DataFusion) |
| Deployment | Single static binary | Interpreter + dependencies | Single binary |

## Common mistakes

- **Leaking goroutines.** A goroutine blocked forever on a channel never exits. Always pass a `context.Context` and handle cancellation.
- **Ignoring errors.** Go returns errors as values; `_ = f()` silently swallows failures in a pipeline.
- **Data races.** Shared maps written from several goroutines crash or corrupt data. Use the `-race` detector in tests.
- **Unbounded concurrency.** Starting a goroutine per record can exhaust memory or hammer an API. Use worker pools or semaphores.

## Learning Resources

### Official

- [A Tour of Go](https://go.dev/tour/)
- [Effective Go](https://go.dev/doc/effective_go) and [Go by Example](https://gobyexample.com/)

### Books

- *Learning Go*, 2nd ed., Jon Bodner (O'Reilly)
- *The Go Programming Language*, Alan Donovan and Brian Kernighan (Addison-Wesley)
- *Concurrency in Go*, Katherine Cox-Buday (O'Reilly)

### Courses and talks

- [Go Programming: Golang Course with Bonus Projects (freeCodeCamp)](https://www.youtube.com/watch?v=un6ZyFkqFKo)
- [Concurrency is not Parallelism, Rob Pike (talk)](https://go.dev/blog/waza-talk)
- [Kubebuilder book](https://book.kubebuilder.io/): build Kubernetes operators in Go
