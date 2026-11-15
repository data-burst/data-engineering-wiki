---
title: "Lambda"
description: "Lambda architecture explained with an animation: batch, speed and serving layers, how results are merged, and why two codebases became its weak point."
---
<div class="lx-kicker-line">$ ./lambda --batch spark --speed flink</div>

# Lambda Architecture

The **Lambda architecture** processes the same events along two paths: a **batch layer** that periodically recomputes accurate results from all historical data, and a **speed layer** that processes new events in real time to cover the gap since the last batch run. A **serving layer** merges both so queries get answers that are complete and fresh. Nathan Marz described it around 2011, when stream processors were not yet reliable enough to be the only source of truth.

## Follow one stream of events

{{< fig kicker="$ ./lambda --query orders_today" title="Two paths, merged at query time" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 320">
  <g class="m" font-size="11.5">
    <rect x="20" y="120" width="120" height="60" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="80" y="146" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">EVENTS</text>
    <text class="m" x="80" y="164" text-anchor="middle" fill="#5C5869">orders · Kafka</text>
    <line x1="140" y1="140" x2="190" y2="65" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="190" y="30" width="170" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="204" y="52" font-size="12.5" font-weight="700" fill="#17151F">BATCH LAYER</text>
    <text class="m" x="204" y="70" fill="#5C5869">master dataset (S3)</text><text class="m" x="204" y="88" fill="#5C5869">Spark · every 6 h</text>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <line x1="360" y1="65" x2="410" y2="65" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="410" y="30" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="424" y="52" font-size="12.5" font-weight="700" fill="#17151F">BATCH VIEW</text>
    <text class="m" x="424" y="70" fill="#5C5869">as of 06:00</text><text class="m" x="424" y="88" fill="#17151F" font-weight="700">1,200 orders</text>
  </g>
  <g class="f m" data-step="2" font-size="11.5">
    <line x1="140" y1="160" x2="190" y2="235" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="190" y="200" width="170" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="204" y="222" font-size="12.5" font-weight="700" fill="#17151F">SPEED LAYER</text>
    <text class="m" x="204" y="240" fill="#5C5869">Flink · per event</text><text class="m" x="204" y="258" fill="#5C5869">only since 06:00</text>
    <line x1="360" y1="235" x2="410" y2="235" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="410" y="200" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="424" y="222" font-size="12.5" font-weight="700" fill="#17151F">REALTIME VIEW</text>
    <text class="m" x="424" y="240" fill="#5C5869">06:00 → now</text><text class="m" x="424" y="258" fill="#17151F" font-weight="700">85 orders</text>
  </g>
  <g class="f m" data-step="3" font-size="11.5">
    <line x1="560" y1="65" x2="610" y2="135" stroke="#531A8A" stroke-width="2"/>
    <line x1="560" y1="235" x2="610" y2="165" stroke="#531A8A" stroke-width="2"/>
    <rect x="610" y="110" width="130" height="80" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="675" y="134" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">SERVING</text>
    <text class="m" x="675" y="152" text-anchor="middle" fill="#5C5869">merge views</text>
    <text class="m" x="675" y="174" text-anchor="middle" fill="#17151F" font-weight="700">1,285</text>
    <text class="m" x="380" y="303" text-anchor="middle" fill="#3D3A49">orders today = 1,200 (batch) + 85 (speed) = 1,285</text>
  </g>
  <g class="f m" data-step="4" font-size="11.5">
    <rect x="180" y="20" width="190" height="260" rx="10" fill="none" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="5 4"/>
    <text class="m" x="275" y="146" text-anchor="middle" font-weight="700" fill="#531A8A">same logic,</text>
    <text class="m" x="275" y="162" text-anchor="middle" font-weight="700" fill="#531A8A">two codebases</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Every event is appended to an immutable <b>master dataset</b>. The batch layer can always recompute from scratch, which makes it the source of truth.</li>
  <li>Every few hours a batch job rebuilds the <b>batch view</b> from all data. Accurate and complete, but up to 6 hours stale.</li>
  <li>The <b>speed layer</b> processes only events since the last batch run, incrementally. Fast, possibly approximate, and thrown away when the next batch view lands.</li>
  <li>The <b>serving layer</b> answers queries by merging both views: complete history plus the last few hours.</li>
  <li>The catch: the same business logic is written <b>twice</b>, in a batch engine and a stream engine, and both must give identical answers forever.</li>
</ol>
{{< /fig >}}

## The three layers

| Layer | Job | Typical tools (then → now) |
|---|---|---|
| Batch | Store all raw data immutably, recompute views from scratch | Hadoop MapReduce → Spark on S3 / lakehouse tables |
| Speed | Process recent events incrementally, low latency | Storm → Flink, Spark Structured Streaming, Kafka Streams |
| Serving | Index views and merge them for queries | HBase, Druid, Cassandra → Druid, Pinot, ClickHouse, a warehouse |

## Trade-offs

**Strengths**
- Batch recomputation fixes bugs and late data: correct the code, rerun, and history is right again.
- The speed layer can be simple and approximate, because its results are temporary.
- Fault tolerant: if the speed layer breaks, the next batch run still produces correct numbers.

**Weaknesses**
- **Two codebases** with the same logic in different frameworks. They drift, and debugging "why does the dashboard jump at 06:00?" is painful.
- Two systems to run, monitor and pay for.
- Merging views in the serving layer is custom logic for every metric.

## Is Lambda still used?

Rarely as a deliberate design for new systems. Modern stream processors (Flink, Spark Structured Streaming) give exactly-once state and handle late events, which removes the original reason for a separate batch path. Teams now either use [Kappa]({{< relref "/docs/roadmap/data-architecture/kappa" >}}), or a lakehouse where streaming and batch jobs write the **same** tables with the **same** code (Spark or Flink SQL in both modes). You still see Lambda-shaped systems in practice, often by accident: a nightly batch pipeline plus a separate real-time dashboard built later.

## Common mistakes

- Implementing metrics differently in the two layers so numbers change when the batch view replaces the realtime one.
- No clear handover point: the speed layer must cover exactly the events the latest batch view does not.
- Choosing Lambda when hourly freshness from a single batch pipeline would have been enough.

## Learning Resources

### Articles
- [How to beat the CAP theorem](http://nathanmarz.com/blog/how-to-beat-the-cap-theorem.html): Nathan Marz, the original idea
- [Questioning the Lambda Architecture](https://www.oreilly.com/radar/questioning-the-lambda-architecture/): Jay Kreps
- [Databricks: What is Lambda architecture?](https://www.databricks.com/glossary/lambda-architecture)

### Books
- [Big Data: Principles and best practices of scalable realtime data systems](https://www.manning.com/books/big-data): Nathan Marz and James Warren
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/): Martin Kleppmann
