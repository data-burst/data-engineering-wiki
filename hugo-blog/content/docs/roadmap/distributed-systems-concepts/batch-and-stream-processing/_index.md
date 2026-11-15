---
description: "Batch vs stream processing explained with a live simulation: latency, micro-batching, event time, watermarks and how to choose between Spark, Flink and Kafka Streams."
weight: 8
bookToC: false
---
<div class="lx-kicker-line">$ ./pipeline --mode batch|stream</div>

# Batch and Stream Processing

Data keeps arriving: orders, clicks, sensor readings. The question is simple: **do you process it in chunks later, or each event as it lands?**

- **Batch**: collect events for a while (an hour, a day), then run one job over all of them.
- **Stream**: process every event within milliseconds to seconds of its arrival.

The difference is not speed of the engine. It's **how stale your answer is allowed to be**.

## Watch them side by side

Press **Play**. The same events go to both pipelines. Watch the **counters** and the **"behind by"** clock.

{{< fig kicker="$ ./simulate --events orders" title="Same events, two pipelines" hook="stream" >}}
<div class="bs-ctl">
  <button class="lx-b solid" data-play>▶ Play</button>
  <button class="lx-b ghost" data-burst>+ traffic spike</button>
  <span class="sep"></span> Batch schedule:
  <button class="lx-b on" data-every="8">Batch · 8 s</button>
  <button class="lx-b" data-every="1">Micro-batch · 1 s</button>
</div>
<div class="bs-lane s">
  <div class="bs-name">Stream<small>per event</small></div>
  <div class="bs-track"><div class="bs-proc"><b>Flink</b>process<br>now</div></div>
  <div class="bs-out"><div class="num">0</div><small>orders counted</small><div class="lag">behind by ~0 s</div></div>
</div>
<div class="bs-lane b">
  <div class="bs-name">Batch<small>every 8 s</small></div>
  <div class="bs-track"><div class="bs-bucket"></div><div class="bs-bucket-lbl">0 waiting</div><div class="bs-proc"><b>Spark job</b>runs on<br>schedule</div></div>
  <div class="bs-out"><div class="num">0</div><small>orders counted</small><div class="lag">behind by 0.0 s</div></div>
</div>
<div class="bs-truth">Orders that really happened: <b>0</b></div>
<ol class="lx-caps"><li>The stream count tracks reality almost instantly. The batch count <b>jumps</b> on schedule and is always a little behind. Switch to <b>micro-batch</b> (how Spark Structured Streaming works) and the gap shrinks.</li></ol>
{{< /fig >}}

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Batch</div><h4>Throughput and simplicity</h4><p>Re-run a whole day if logic changes. Cheap, easy to test, easy to backfill. Results are minutes to hours old.</p></div>
  <div class="lx-card"><div class="lab">Stream</div><h4>Freshness</h4><p>Fraud alerts, live dashboards, recommendations. Needs state, checkpoints and care for late or duplicate events.</p></div>
  <div class="lx-card"><div class="lab">Micro-batch</div><h4>The middle ground</h4><p>Tiny batches every second or so. Batch semantics with near-real-time latency.</p></div>
</div>

## The hard part of streaming: time

In batch, "yesterday's data" is a closed folder. In a stream, an event from 10:59 can arrive at 11:03 (a phone was offline). So streaming engines separate:

- **Event time**: when it happened (in the payload).
- **Processing time**: when the engine saw it.
- **Watermark**: the engine's guess that "no more events older than *T* will come", which is when a window like *10:00–11:00* can be closed.
- **Windows**: tumbling (fixed, non-overlapping), sliding, and session windows.

Exactly-once results come from **checkpointed state + idempotent or transactional sinks**, not from the network delivering each message once.

## How to choose

| Question | Lean batch | Lean stream |
|---|---|---|
| How fresh must the answer be? | Hours are fine | Seconds matter |
| Will logic change and need re-running on history? | Often | Rarely, or you keep a replayable log |
| Team experience with stateful systems | Low | High |
| Cost sensitivity | High | Freshness is worth paying for |

Most platforms do both: stream into Kafka for real-time use, and land the same events in a lakehouse table for batch analytics. See [Lambda]({{< relref "/docs/roadmap/data-architecture/lambda" >}}) and [Kappa]({{< relref "/docs/roadmap/data-architecture/kappa" >}}).

## Tools in 2026

- **Batch:** Apache Spark, dbt + a warehouse (Snowflake, BigQuery, ClickHouse), DuckDB for single-node jobs, Airflow / Dagster for scheduling.
- **Stream:** Apache Flink, Kafka Streams, Spark Structured Streaming, RisingWave / Materialize (streaming SQL).
- **Logs / transport:** Apache Kafka, Redpanda, Pulsar.

## Learning Resources

### Books

- [Streaming Systems](https://www.oreilly.com/library/view/streaming-systems/9781491983867/): Akidau, Chernyak, Lax
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/)
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/): Martin Kleppmann

### Articles

- [Streaming 101](https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/) and [Streaming 102](https://www.oreilly.com/radar/the-world-beyond-batch-streaming-102/): Tyler Akidau
- [Apache Flink: Timely Stream Processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/)

### Videos

- [Batch Processing vs Stream Processing: Tech Primers](https://www.youtube.com/watch?v=A3Mvy8WMk04)
