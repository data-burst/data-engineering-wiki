---
title: "Observability"
description: "Observability for data systems: logs, metrics and traces, how OpenTelemetry ties them together, and data observability for freshness, volume and schema."
bookCollapseSection: true
weight: 28
---

# Observability

**Observability** is how well you can understand what a running system is doing, and why, from the data it emits, without shipping new code to find out. Monitoring tells you **that** something is wrong (the nightly load is two hours late); observability lets you ask **why** (one Spark stage waited 90 minutes on an overloaded metastore) even for failures nobody predicted.

## The three signals

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Logs</div><h4>What happened, in detail</h4><p>Timestamped event records: "loaded 1,204,331 rows into orders". Best for debugging one specific failure.</p></div>
  <div class="lx-card"><div class="lab">Metrics</div><h4>How much, over time</h4><p>Cheap numeric time series: rows per second, consumer lag, p99 latency. Best for dashboards and alerts.</p></div>
  <div class="lx-card"><div class="lab">Traces</div><h4>Where the time went</h4><p>One request or job followed across services as a tree of timed spans. Best for latency and dependencies.</p></div>
</div>

They work best linked: an alert fires on a **metric**, you open an example **trace** from that minute, and jump to the **logs** of the slow span using the shared `trace_id`.

| Signal | Cost per event | Cardinality tolerance | Typical tools |
|---|---|---|---|
| Logs | High (full text) | High | Loki, Elasticsearch / OpenSearch, Splunk |
| Metrics | Very low (aggregated) | Low: avoid per-user labels | Prometheus, Mimir, VictoriaMetrics, Datadog |
| Traces | Medium (usually sampled) | High | Jaeger, Grafana Tempo, Zipkin, Honeycomb |

## OpenTelemetry: one standard for all three

**OpenTelemetry (OTel)** is the CNCF standard for producing telemetry. It defines APIs and SDKs for most languages, automatic instrumentation for common libraries, the **OTLP** wire protocol, and the **OpenTelemetry Collector**, which receives, processes and exports data to any backend. Instrument once with OTel and you can switch from Jaeger to Tempo or from Prometheus to Datadog without touching application code. In 2026 it is the default choice for new instrumentation; vendors' proprietary agents increasingly ship as OTel distributions.

## Data observability

Data pipelines can be perfectly healthy by every infrastructure metric and still produce wrong data. **Data observability** monitors the data itself:

- **Freshness**: when did `orders` last receive rows?
- **Volume**: did today's load have 10x fewer rows than usual?
- **Schema**: did a source column change type or disappear?
- **Quality**: null rates, duplicates, distribution shifts.
- **Lineage**: which dashboards depend on this broken table? (OpenLineage)

Tools include dbt tests, Great Expectations, Soda, Elementary and commercial platforms such as Monte Carlo. Airflow and Dagster also expose task-level metrics and lineage.

## What is in this section

- [Logging]({{< relref "logging" >}}): structured logs, log levels, collection pipelines and storage.
- [Monitoring]({{< relref "monitoring" >}}): metrics, Prometheus and PromQL, dashboards, SLOs and alerting.
- [Tracing]({{< relref "Tracing" >}}): spans and context propagation, with an animated trace waterfall.

## Learning Resources

- [OpenTelemetry documentation](https://opentelemetry.io/docs/)
- *Observability Engineering*, Charity Majors, Liz Fong-Jones and George Miranda (O'Reilly)
- [Google SRE book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Distributed Systems Observability, Cindy Sridharan (free O'Reilly report)](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)
