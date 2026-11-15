---
bookCollapseSection: true
weight: 18
title: "Data Architecture"
description: "Data processing architectures for batch and real-time data: how Lambda and Kappa combine or replace batch and stream layers, and how to choose."
---

# Data Architecture

A **data processing architecture** decides how data flows from sources to the answers people query, and in particular how you combine **historical, complete** results with **fresh, real-time** ones. The two classic patterns are named after Greek letters:

- [Lambda]({{< relref "/docs/roadmap/data-architecture/lambda" >}}): run a **batch layer** for accurate history and a **speed layer** for recent events, then merge both at query time.
- [Kappa]({{< relref "/docs/roadmap/data-architecture/kappa" >}}): use **one stream processing path** for everything, and reprocess history by replaying a durable log.

| | Lambda | Kappa |
|---|---|---|
| Processing paths | Two (batch + stream) | One (stream) |
| Codebases | Two, must agree | One |
| Reprocessing | Rerun the batch job | Replay the log into a new job version |
| Main requirement | Batch and stream engines | A replayable log with long retention |

Before these, read [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}}). For where the data ends up, see [Data Management Architecture]({{< relref "/docs/roadmap/data-management-architecture" >}}).

In 2026 many teams use a third, pragmatic option: stream events into a [lakehouse]({{< relref "/docs/roadmap/data-management-architecture/data-lakehouse" >}}) table with Flink or Spark Structured Streaming, and run batch jobs on that same table. One storage layer, two kinds of compute.

## Learning Resources

- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/): chapters 10 and 11 on batch and stream processing
- [Questioning the Lambda Architecture](https://www.oreilly.com/radar/questioning-the-lambda-architecture/): Jay Kreps
