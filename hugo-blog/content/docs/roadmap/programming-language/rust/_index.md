---
title: "Rust"
description: "Rust in data engineering: memory safety without a garbage collector, the Rust data tools (Polars, DataFusion, delta-rs, uv), and Python bindings via PyO3."
weight: 1000
---

# Rust

**Rust** is a compiled systems language that gives C/C++-level performance with **memory safety and no garbage collector**. Its compiler enforces **ownership and borrowing** rules, so whole classes of bugs (use-after-free, null pointer dereferences, data races between threads) are rejected at compile time instead of crashing in production. Started by Graydon Hoare and sponsored by Mozilla, Rust reached 1.0 in 2015 and has been stewarded by the independent **Rust Foundation** since 2021.

## Why Rust matters to data engineers

Most data engineers will **use** Rust far more than they **write** it. A large share of the fastest new data tools are written in Rust and exposed to Python:

| Tool | What it is |
|---|---|
| **Polars** | DataFrame library, multi-threaded and lazy |
| **Apache DataFusion** | Embeddable SQL query engine on Arrow; powers InfluxDB 3, GreptimeDB and Spark accelerators like DataFusion Comet |
| **arrow-rs**, **delta-rs**, **iceberg-rust** | Arrow, Delta Lake and Iceberg implementations without the JVM |
| **Lance** | Columnar format for ML and vector data |
| **Vector** | Observability data pipeline for logs and metrics |
| **RisingWave**, **Materialize** | Streaming databases |
| **uv**, **ruff** | Fast Python package manager and linter |
| **dbt Fusion engine** | dbt's new SQL compiler and engine (2025) |

The pattern: write the hot path in Rust, expose it to Python with **PyO3** and **maturin**, share data zero-copy through **Arrow**. Users `pip install` and never see Rust.

## When to write Rust yourself

- Building a **query engine, storage format or connector** where CPU and memory efficiency matter.
- **Speeding up a Python bottleneck**: a custom parser, a hashing or deduplication routine, a UDF.
- **Long-running agents** with tight memory budgets (edge collectors, sidecars).

For everyday pipelines, Rust's learning curve and slower iteration rarely pay off; Python plus Rust-powered libraries gives most of the speed.

## The core idea: ownership

```rust
fn total(amounts: &[f64]) -> f64 {    // borrows the slice, read-only
    amounts.iter().sum()
}

fn main() {
    let amounts = vec![250.0, 120.0, 450.0];
    let t = total(&amounts);          // lend it out
    println!("{t} from {} orders", amounts.len()); // still ours to use
    let moved = amounts;              // ownership moves
    // println!("{:?}", amounts);     // compile error: value was moved
    drop(moved);                      // freed here, deterministically, no GC
}
```

Every value has exactly one owner; references are either many readers or one writer, never both. That single rule is what makes fearless multi-threading possible.

## Rust vs other options

| | Rust | C++ | Go | Java |
|---|---|---|---|---|
| Memory safety | Compile-time guaranteed | Manual | GC | GC |
| Predictable latency | Yes, no GC | Yes | Small GC pauses | GC tuning needed |
| Learning curve | Steep | Steep | Low | Medium |
| Data ecosystem | Arrow-native, growing fast | Mature engines (DuckDB, ClickHouse, Velox) | Thin | Huge (JVM big data) |

## Common mistakes

- **Fighting the borrow checker with `.clone()` everywhere.** It compiles, but copies data and loses the performance you came for. Restructure ownership instead.
- **`unwrap()` in production paths.** It panics on errors; use `?` and proper error types (`thiserror`, `anyhow`).
- **Rewriting what a library already does.** Before writing a Rust extension, check whether Polars, DuckDB or DataFusion already covers it.

## Learning Resources

### Official

- [The Rust Programming Language ("the book")](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) and [Rustlings exercises](https://github.com/rust-lang/rustlings)
- [PyO3 user guide](https://pyo3.rs/) and [maturin](https://www.maturin.rs/)

### Books

- *Programming Rust*, 2nd ed., Jim Blandy, Jason Orendorff and Leonora Tindall (O'Reilly)
- *Rust in Action*, Tim McNamara (Manning)
- *Rust for Rustaceans*, Jon Gjengset (No Starch): after the basics

### Data-specific

- [Apache DataFusion documentation](https://datafusion.apache.org/)
- [Polars user guide](https://docs.pola.rs/)
- [Easy Rust](https://dhghomon.github.io/easy_rust/): simple-English introduction
