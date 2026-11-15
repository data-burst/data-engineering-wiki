---
title: "Monitoring"
description: "Metrics-based monitoring explained: counters, gauges and histograms, Prometheus pull scraping and PromQL, cardinality, SLOs and alerting for data pipelines."
weight: 2
---

# Monitoring

**Monitoring** is collecting **metrics**, numeric measurements over time, from your systems and alerting when they leave a healthy range. Metrics answer questions like "how far behind is the Kafka consumer?", "how long did the nightly load take?" and "what share of requests failed in the last 5 minutes?". They are cheap to store and fast to query, which makes them the backbone of dashboards and alerts.

## Metric types

| Type | Behaviour | Example | Query it as |
|---|---|---|---|
| **Counter** | Only goes up (resets on restart) | `rows_written_total` | A rate: rows per second |
| **Gauge** | Goes up and down | `kafka_consumer_lag`, `queue_depth` | The current value or average |
| **Histogram** | Counts observations in buckets | `job_duration_seconds` | Percentiles (p50, p99) |

Each metric has **labels** (dimensions) such as `table="orders"` or `env="prod"`. Every unique combination of labels is a separate **time series**, which is where cost comes from: a `user_id` label on a busy metric can create millions of series. Keep labels **low-cardinality**.

## Prometheus

**Prometheus** is the de facto open-source monitoring system and a CNCF graduated project (version 3 was released in late 2024). It **pulls** metrics: every 15–30 seconds it **scrapes** an HTTP `/metrics` endpoint on each target, stores samples in its time-series database, evaluates rules and sends alerts to **Alertmanager**, which deduplicates, groups and routes them to Slack, email or PagerDuty.

```text
# HELP rows_written_total Rows written by the loader
# TYPE rows_written_total counter
rows_written_total{table="orders",env="prod"} 1204331
```

**PromQL** queries the data:

```promql
# Rows per second, per table, over the last 5 minutes
sum by (table) (rate(rows_written_total[5m]))

# p99 job duration from a histogram
histogram_quantile(0.99, sum by (le) (rate(job_duration_seconds_bucket[1h])))

# Alert condition: consumer more than 100k messages behind for 10 minutes
max by (group) (kafka_consumergroup_lag) > 100000
```

Short-lived batch jobs finish before Prometheus scrapes them; push their final metrics to a **Pushgateway** or send them through the **OpenTelemetry Collector** (Prometheus 3 also accepts OTLP directly).

For long retention and many clusters, Prometheus is extended or replaced by **Thanos**, **Grafana Mimir** or **VictoriaMetrics**. **Grafana** is the usual dashboard layer on top.

## What to monitor in a data platform

| Area | Key metrics |
|---|---|
| Streaming | Consumer lag, messages in/out per second, end-to-end latency, broker disk usage |
| Batch jobs | Duration, success/failure, rows in/out, time since last success |
| Orchestrator | Queued vs running tasks, scheduler heartbeat, SLA misses |
| Warehouse / query engines | Query latency percentiles, queued queries, credits or bytes scanned |
| Infrastructure | CPU, memory, disk, network: the **USE** method (utilization, saturation, errors) |
| Services and APIs | Rate, errors, duration: the **RED** method |

## SLOs and alerting

Alert on **symptoms users feel**, not on every cause. A **Service Level Objective (SLO)** states the target, for example "the `orders` table is fresher than 30 minutes 99% of the time" or "99.9% of ingestion requests succeed". The remaining 0.1% is the **error budget**; page someone when it burns too fast, and send everything else to a ticket queue.

## Tools at a glance

| Tool | Type | Notes |
|---|---|---|
| Prometheus + Alertmanager | Open source, pull | Default for Kubernetes |
| Grafana | Dashboards and alerting | Reads Prometheus, Loki, Tempo, SQL databases and more |
| Mimir, Thanos, VictoriaMetrics | Scalable Prometheus-compatible storage | Long retention, global view |
| Datadog, New Relic, Dynatrace, Grafana Cloud | SaaS | Fast to adopt, cost grows with hosts and series |
| Zabbix, Nagios | Classic host monitoring | Common for VMs and network gear |
| StatsD | Push UDP aggregation daemon | Legacy; many apps now use OpenTelemetry metrics instead |

## Common mistakes

- **Alerting on everything.** Dozens of noisy alerts train people to ignore pages. Each page should be actionable and urgent.
- **Averages instead of percentiles.** An average latency of 200 ms can hide a p99 of 8 seconds.
- **High-cardinality labels.** Request IDs, user IDs or raw URLs as labels will overload the TSDB.
- **Only infrastructure metrics.** CPU can be fine while the pipeline writes zero rows. Add business-level metrics like rows written and freshness.

## Learning Resources

- [Prometheus documentation](https://prometheus.io/docs/introduction/overview/) and [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Grafana documentation](https://grafana.com/docs/grafana/latest/)
- [Google SRE book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) and [Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [The USE Method, Brendan Gregg](https://www.brendangregg.com/usemethod.html)
- *Prometheus: Up & Running*, 2nd ed., Julien Pivotto and Brian Brazil (O'Reilly)
- [Prometheus and Grafana tutorial (YouTube)](https://www.youtube.com/watch?v=h4Sl21AKiDg)
