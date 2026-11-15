---
title: "Time Series"
description: "What time-series databases optimize for: time partitioning, compression, downsampling, retention and cardinality, with Prometheus, InfluxDB, TimescaleDB."
weight: 4
---

# Time-Series Databases

A **time-series database (TSDB)** stores measurements indexed by time: CPU usage every 15 seconds, the temperature of a sensor every minute, a stock price on every trade. Each point is a **timestamp**, a **value**, and a set of **labels** (tags) that identify the series, such as `host=web-1, region=eu`. Writes are almost always appends of recent data, and queries ask for ranges and aggregates ("average latency per 5 minutes over the last day"), so TSDBs optimize for exactly that.

## What makes them different

- **Partitioned by time.** Data is cut into time chunks (TimescaleDB "chunks", Prometheus 2-hour "blocks"). A query for the last hour opens only the newest chunks, and dropping old data is just deleting a chunk.
- **Write-optimized.** In Prometheus and InfluxDB, new points go to an in-memory buffer plus a write-ahead log and are flushed as immutable compressed blocks, the same [LSM pattern]({{< relref "columnar" >}}) used by wide-column stores.
- **Heavy compression.** Consecutive timestamps differ by a near-constant interval and values change slowly, so delta-of-delta encoding for timestamps and XOR (Gorilla) encoding for floats bring a point down to roughly 1 to 2 bytes.
- **Downsampling and retention.** Keep raw 10-second data for 15 days, 5-minute averages for a year, and delete the rest automatically. TimescaleDB calls these continuous aggregates; Prometheus delegates long-term storage to Thanos, Mimir or VictoriaMetrics.
- **Time-aware queries.** Built-in functions for time buckets, rates, gap filling and "last value per series".

## Popular time-series databases

| Database | Model | Notes |
|---|---|---|
| **[Prometheus](https://prometheus.io/)** | Pull-based metrics, PromQL | The standard for infrastructure and Kubernetes monitoring. Single-node local storage, with remote write for long-term storage; Prometheus 3.0 (2024) made OpenTelemetry (OTLP) ingestion a built-in feature. |
| **[InfluxDB](https://www.influxdata.com/)** | Push-based, SQL and InfluxQL | InfluxDB 3 (Core and Enterprise GA in 2025) was rewritten in Rust on Apache Arrow, DataFusion and Parquet. Flux, the 2.x language, is in maintenance mode. |
| **[TimescaleDB](https://www.timescale.com/)** | PostgreSQL extension | Hypertables auto-partitioned by time, columnar compression, full SQL and joins with your relational data. The company behind it renamed itself TigerData in 2025. |
| **[QuestDB](https://questdb.com/)**, **ClickHouse** | Columnar SQL | Strong for high-volume event and market data with SQL analytics. |
| **[VictoriaMetrics](https://victoriametrics.com/)** | Prometheus-compatible | Long-term, horizontally scalable metrics storage. |

## Cardinality: the number that matters

Every unique combination of labels is a separate series. `http_requests{path, status}` with 50 paths and 5 statuses is 250 series; add `user_id` with a million users and it becomes 250 million. **High cardinality** is the most common way to run a TSDB out of memory. Keep unbounded values (user ids, request ids, full URLs) out of labels and in logs or traces instead.

## When to use one

- **Good fit:** metrics and monitoring, IoT sensor data, application telemetry, financial ticks.
- **Maybe not:** if you already run PostgreSQL and the volume is moderate, TimescaleDB or a well-partitioned table may be all you need. If you need ad hoc analytics across events with many dimensions, a columnar OLAP database like ClickHouse often works better than a metrics TSDB.

## Common mistakes

- Putting high-cardinality fields in tags or labels.
- Storing raw data forever with no retention or downsampling policy.
- Mixing up **event time** and **ingest time** when devices send late data. See [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}}).

## Learning Resources

- [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://www.vldb.org/pvldb/vol8/p1816-teller.pdf) (Facebook, VLDB 2015): the compression scheme most TSDBs use
- [Prometheus documentation: storage](https://prometheus.io/docs/prometheus/latest/storage/)
- [InfluxDB 3 documentation](https://docs.influxdata.com/)
- [TimescaleDB documentation](https://docs.timescale.com/)
- [Writing a Time Series Database from Scratch](https://web.archive.org/web/20210803115658/https://fabxc.org/tsdb/): Fabian Reinartz on the Prometheus 2 storage engine
- *Time Series Databases: New Ways to Store and Access Data*, Ted Dunning and Ellen Friedman
