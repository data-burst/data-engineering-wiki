---
title: "Logging"
description: "Logging done right: structured JSON logs, levels, correlation IDs, the collect-ship-store pipeline, and how Loki, Elasticsearch, OpenSearch and Splunk compare."
weight: 1
---

# Logging

A **log** is a timestamped record of something that happened inside a program: a job started, a file was loaded, a connection failed. Logs are the most detailed observability signal, and usually the first place you look when a pipeline fails at 3 a.m. Good logging is about making those records **searchable and connectable**, not just printing more text.

## Structured logs

Plain text is easy to write and hard to query:

```text
2026-11-16 03:12:09 ERROR failed to load orders batch 8812 after 3 retries
```

A **structured** log is a set of key-value fields, usually JSON. Every field becomes filterable, and machines no longer need regexes to parse it:

```json
{"ts":"2026-11-16T03:12:09Z","level":"error","service":"orders-loader",
 "event":"load_failed","table":"orders","batch_id":8812,"retries":3,
 "trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","error":"connection reset by peer"}
```

In Python, `structlog` or `python-json-logger` produce this; in Java, Logback or Log4j 2 with a JSON encoder; in Go, the standard library's `log/slog`.

## Log levels

| Level | Use it for | Example |
|---|---|---|
| `ERROR` | Something failed and needs attention | Load failed after retries |
| `WARN` | Unexpected but handled | Retrying after a timeout; 3% of rows rejected |
| `INFO` | Normal milestones | Job started, 1,204,331 rows written |
| `DEBUG` | Details for developers, off in production | The generated SQL statement |

## How logs flow

1. **Emit**: the application writes to stdout/stderr (the container convention) or to a file.
2. **Collect**: an agent on each node tails the output and adds metadata (pod, namespace, host). Common agents are **Fluent Bit**, **Vector**, **Grafana Alloy** and the **OpenTelemetry Collector**.
3. **Process**: parse, drop noisy lines, mask personal data, sample.
4. **Store and index**: a log backend.
5. **Query and alert**: search, dashboards, alerts on error patterns.

## Storage backends

| Backend | Indexing approach | Strength | Watch out for |
|---|---|---|---|
| **Grafana Loki** | Indexes only labels; stores compressed chunks in object storage | Cheap at volume, pairs with Grafana | Full-text search over huge ranges is slower; keep labels low-cardinality |
| **Elasticsearch** / **OpenSearch** | Full-text inverted index on every field | Fast, flexible search and analytics | Expensive storage and memory at scale |
| **Splunk** | Proprietary index, SPL query language | Powerful search, security use cases | License cost tied to ingest volume |
| **ClickHouse**-based (SigNoz, HyperDX, ClickStack) | Columnar tables | Fast aggregation over structured logs | Needs schema discipline |
| Cloud native (CloudWatch, Cloud Logging, Azure Monitor) | Managed | No operations | Cost and vendor lock-in |

Historic note: the "ELK stack" is Elasticsearch, Logstash and Kibana; swap Logstash for Fluentd and it is "EFK". Elastic changed Elasticsearch's license in 2021, AWS forked it as **OpenSearch**, and Elastic added AGPL as an open-source option again in 2024. **Sentry** is a related but different tool: it groups application errors and stack traces rather than storing all logs.

## Logging in data pipelines

- Log **counts** at each stage (read, rejected, written) so you can reconcile them later.
- Include **run identifiers**: Airflow `dag_id`, `run_id`, `task_id`, or the Spark application ID, so all lines of one run can be pulled together.
- Log **what** was processed (table, partition, file, offset range) but **not** the row contents; data in logs is a privacy and compliance risk.
- Add the OpenTelemetry `trace_id` so logs link to [traces]({{< relref "../Tracing" >}}).

## Common mistakes

- **Logging personal data.** Emails, tokens and full payloads in logs spread sensitive data to a system with weak access control and long retention.
- **Logging inside tight loops.** A log line per row turns a 10-minute job into a 2-hour one and a large bill.
- **Using logs as metrics.** Counting log lines to draw a throughput graph is slow and costly; emit a [metric]({{< relref "../monitoring" >}}) instead.
- **No retention policy.** Keep hot, searchable logs for days or weeks and archive the rest to cheap object storage.

## Learning Resources

- [The Twelve-Factor App: Logs](https://12factor.net/logs)
- [OpenTelemetry logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- [Grafana Loki documentation](https://grafana.com/docs/loki/latest/)
- [OpenSearch documentation](https://docs.opensearch.org/latest/) and [Elastic observability docs](https://www.elastic.co/docs/solutions/observability)
- [Fluent Bit documentation](https://docs.fluentbit.io/) and [Vector documentation](https://vector.dev/docs/)
- *Observability Engineering*, Charity Majors, Liz Fong-Jones and George Miranda (O'Reilly)
- *Logging and Log Management*, Anton Chuvakin, Kevin Schmidt and Chris Phillips (Syngress)
