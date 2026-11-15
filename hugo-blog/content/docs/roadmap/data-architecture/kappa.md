---
title: "Kappa"
description: "Kappa architecture explained with an animation: one stream processing path over a replayable log, and reprocessing by replaying into a new job version."
---
<div class="lx-kicker-line">$ ./kappa --replay-from earliest</div>

# Kappa Architecture

The **Kappa architecture** handles both real-time and historical processing with **a single stream processing pipeline**. All events are kept in a durable, replayable log (usually Apache Kafka). The streaming job reads the log and maintains the output tables continuously. When logic changes, you do not run a separate batch job: you start a new version of the streaming job that **replays the log from the beginning**, let it catch up, and switch readers over. Jay Kreps proposed it in 2014 as a simpler alternative to [Lambda]({{< relref "/docs/roadmap/data-architecture/lambda" >}}).

## Reprocessing without a batch layer

{{< fig kicker="$ flink run orders_by_city_v2.jar   # source starts at earliest offset" title="One log, one code path, replay to fix history" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 310">
  <g class="m" font-size="11.5" fill="#17151F">
    <text class="m" x="60" y="28" font-size="11" font-weight="700" fill="#8C8899">KAFKA TOPIC · orders · offsets 0 → 13 · long retention</text>
    <rect x="60" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="80" y="60" text-anchor="middle">0</text><rect x="104" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="124" y="60" text-anchor="middle">1</text><rect x="148" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="168" y="60" text-anchor="middle">2</text><rect x="192" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="212" y="60" text-anchor="middle">3</text><rect x="236" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="256" y="60" text-anchor="middle">4</text><rect x="280" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="300" y="60" text-anchor="middle">5</text><rect x="324" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="344" y="60" text-anchor="middle">6</text><rect x="368" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="388" y="60" text-anchor="middle">7</text><rect x="412" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="432" y="60" text-anchor="middle">8</text><rect x="456" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="476" y="60" text-anchor="middle">9</text><rect x="500" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="520" y="60" text-anchor="middle">10</text><rect x="544" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="564" y="60" text-anchor="middle">11</text><rect x="588" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="608" y="60" text-anchor="middle">12</text><rect x="632" y="40" width="40" height="30" rx="4" fill="#fff" stroke="#3D3A49" stroke-width="1.2"/><text class="m" x="652" y="60" text-anchor="middle">13</text>
    <text class="m" x="684" y="60" fill="#8C8899">new →</text>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <text class="m" x="22" y="98" font-weight="700" fill="#17151F">v1</text>
    <rect x="60" y="90" width="612" height="8" rx="4" fill="#3D3A49"/>
    <line x1="120" y1="98" x2="160" y2="160" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="160" y="140" width="180" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="174" y="162" font-size="12.5" font-weight="700" fill="#17151F">STREAM JOB v1</text>
    <text class="m" x="174" y="182" fill="#5C5869">live, at head of log</text>
    <line x1="340" y1="167" x2="390" y2="167" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="390" y="140" width="170" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="404" y="162" font-size="12" font-weight="700" fill="#17151F">orders_by_city_v1</text>
    <text class="m" x="404" y="182" fill="#5C5869">table</text>
    <line x1="560" y1="167" x2="610" y2="192" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="610" y="170" width="130" height="70" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="675" y="198" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">SERVING</text>
    <text class="m" x="675" y="218" text-anchor="middle" fill="#5C5869">dashboards, API</text>
  </g>
  <g class="f m" data-step="2" font-size="11.5">
    <text class="m" x="22" y="114" font-weight="700" fill="#531A8A">v2</text>
    <rect x="60" y="106" width="216" height="8" rx="4" fill="#531A8A"/>
    <line x1="100" y1="114" x2="160" y2="249" stroke="#531A8A" stroke-width="1.4"/>
    <rect x="160" y="222" width="180" height="54" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="174" y="244" font-size="12.5" font-weight="700" fill="#531A8A">STREAM JOB v2</text>
    <text class="m" x="174" y="264" fill="#5C5869">replaying from offset 0</text>
    <line x1="340" y1="249" x2="390" y2="249" stroke="#531A8A" stroke-width="1.4"/>
    <rect x="390" y="222" width="170" height="54" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="404" y="244" font-size="12" font-weight="700" fill="#17151F">orders_by_city_v2</text>
    <text class="m" x="404" y="264" fill="#5C5869">filling up</text>
  </g>
  <g class="f m" data-step="3" font-size="11.5">
    <rect x="60" y="106" width="612" height="8" rx="4" fill="#531A8A"/>
    <rect x="172" y="252" width="164" height="18" fill="#fff"/><text class="m" x="174" y="264" fill="#531A8A" font-weight="700">caught up, live</text>
    <rect x="402" y="252" width="150" height="18" fill="#fff"/><text class="m" x="404" y="264" fill="#5C5869">complete</text>
  </g>
  <g class="f m" data-step="4" font-size="11.5">
    <line x1="560" y1="167" x2="610" y2="192" stroke="#FBFBFE" stroke-width="4"/>
    <line x1="560" y1="249" x2="610" y2="222" stroke="#531A8A" stroke-width="2.5"/>
    <line x1="120" y1="99" x2="160" y2="160" stroke="#FBFBFE" stroke-width="4"/>
    <rect x="156" y="136" width="408" height="62" rx="6" fill="#FBFBFE" opacity=".94"/>
    <rect x="160" y="140" width="400" height="54" rx="6" fill="none" stroke="#8C8899" stroke-dasharray="4 4"/>
    <text class="m" x="360" y="172" text-anchor="middle" font-weight="700" fill="#8C8899">v1 stopped, table dropped</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The log keeps every order event with its <b>offset</b>. It is the source of truth, so retention must cover all the history you may need to reprocess.</li>
  <li><b>Job v1</b> reads the log continuously and keeps <code>orders_by_city_v1</code> up to date. Dashboards read that table.</li>
  <li>The logic changes (a bug fix, a new column). Start <b>job v2</b> with the same code path, reading from <b>offset 0</b> into a new table. v1 keeps serving meanwhile.</li>
  <li>v2 replays history much faster than real time and reaches the head of the log. Both tables are now live.</li>
  <li>Point readers at <b>v2</b>, then stop v1 and drop its table. One codebase, and history was recomputed without a batch system.</li>
</ol>
{{< /fig >}}

## Requirements

- **A replayable log with long retention.** Kafka with tiered storage (KIP-405, production-ready since Kafka 3.9), Redpanda or WarpStream, or a compacted topic for entity state. If old events are deleted, they cannot be reprocessed.
- **A stateful stream processor** with exactly-once state and event-time handling: Apache Flink, Kafka Streams or Spark Structured Streaming. See [Batch and Stream Processing]({{< relref "/docs/roadmap/distributed-systems-concepts/batch-and-stream-processing" >}}).
- **Versioned outputs**, so a new job version writes to a new table or topic and readers can switch atomically.
- **Deterministic logic**: replaying the same events must produce the same results (no calls to "now()" or to external APIs whose answers change).

## Lambda vs Kappa

| | Lambda | Kappa |
|---|---|---|
| Code paths | Batch + stream | Stream only |
| Reprocessing | Rerun batch job | Replay log into new job version |
| Operational cost | Two systems | One system, but a big log |
| Best for | Heavy historical recomputation, mixed tools | Event-driven data where all inputs flow through a log |
| Weak spot | Logic duplicated and drifting | Very large replays are slow and need capacity planning |

## When Kappa fits

- All inputs are already events (clickstream, IoT, CDC from databases).
- Freshness matters and you want one definition of each metric.
- History fits in the log, or older history can be bootstrapped from a lakehouse snapshot before switching to the stream.

It fits less well when you must join with large, slowly changing reference data from many batch sources, or when reprocessing years of data through a stream engine is too slow or too costly. A common 2026 hybrid is Kappa-style streaming into Iceberg or Delta tables, with batch jobs reading the same tables for heavy backfills.

## Common mistakes

- Kafka retention of 7 days (the default) and then discovering you cannot replay last quarter.
- Overwriting the live output table during a replay, so dashboards show partial numbers.
- Under-provisioning the replay: catching up on months of events needs far more parallelism than live processing.

## Learning Resources

### Articles
- [Questioning the Lambda Architecture](https://www.oreilly.com/radar/questioning-the-lambda-architecture/): Jay Kreps, where Kappa was proposed
- [The Log: What every software engineer should know about real-time data's unifying abstraction](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying): Jay Kreps
- [Kappa architecture (Wikipedia)](https://en.wikipedia.org/wiki/Kappa_architecture)
- [Dremio: Kappa Architecture](https://www.dremio.com/wiki/kappa-architecture/)

### Books
- [Streaming Systems](https://www.oreilly.com/library/view/streaming-systems/9781491983867/): Akidau, Chernyak, Lax
- [Kafka: The Definitive Guide, 2nd Edition](https://www.oreilly.com/library/view/kafka-the-definitive/9781492043072/)
