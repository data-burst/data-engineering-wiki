---
title: "PACELC"
description: "PACELC extends CAP: during a partition choose availability or consistency, else choose latency or consistency. Animated write latency and real systems compared."
weight: 2
bookToC: false
---
<div class="lx-kicker-line">$ man pacelc   # Abadi, 2010</div>

# PACELC

**PACELC** extends the [CAP theorem]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}}) with the case CAP ignores: normal operation. It says: if there is a **P**artition, a replicated system must choose between **A**vailability and **C**onsistency; **E**lse, when the network is healthy, it must still choose between **L**atency and **C**onsistency.

> **if** Partition **then** (A or C) **else** (L or C)

Partitions are rare. Latency is paid on every single request. That is why the "else" half usually matters more when you pick a database.

## Why consistency costs latency

To be consistent, a write must reach other replicas before it is confirmed, and other replicas can be an ocean away.

{{< fig kicker="$ ./write x --leader eu-central --replicas us-east,ap-southeast" title="The same write, consistent (EC) vs fast (EL)" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 310">
  <line x1="390" y1="130" x2="580" y2="60" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <line x1="390" y1="170" x2="580" y2="240" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <text x="470" y="82" text-anchor="middle" class="m" font-size="11" fill="#8C8899">~90 ms RTT</text>
  <text x="500" y="186" text-anchor="middle" class="m" font-size="11" fill="#8C8899">~160 ms RTT</text>
  <line x1="130" y1="148" x2="230" y2="148" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <g><rect x="20" y="120" width="110" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="75" y="145" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
    <text x="75" y="164" text-anchor="middle" class="m" font-size="11" fill="#8C8899">Frankfurt</text></g>
  <g><rect x="230" y="108" width="160" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="310" y="132" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">LEADER · EU</text>
    <text x="310" y="160" text-anchor="middle" class="m" font-size="14" font-weight="700" fill="#17151F">x = 1</text></g>
  <g><rect x="580" y="20" width="160" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="660" y="44" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">REPLICA · US-EAST</text>
    <text x="660" y="72" text-anchor="middle" class="m" font-size="14" font-weight="700" fill="#17151F">x = 1</text></g>
  <g><rect x="580" y="200" width="160" height="80" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="660" y="224" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">REPLICA · SG</text>
    <text x="660" y="252" text-anchor="middle" class="m" font-size="14" font-weight="700" fill="#17151F">x = 1</text></g>
  <!-- step 1: EC -->
  <g class="f" data-step="1">
    <line x1="130" y1="148" x2="230" y2="148" stroke="#531A8A" stroke-width="2"/>
    <line x1="390" y1="130" x2="580" y2="60" stroke="#531A8A" stroke-width="2"/>
    <text x="180" y="140" text-anchor="middle" class="m" font-size="11" fill="#531A8A">x = 2</text>
    <rect x="250" y="142" width="120" height="24" fill="#fff"/>
    <text x="310" y="160" text-anchor="middle" class="m" font-size="14" font-weight="700" fill="#531A8A">x = 2</text>
    <rect x="600" y="54" width="120" height="24" fill="#fff"/>
    <text x="660" y="72" text-anchor="middle" class="m" font-size="14" font-weight="700" fill="#531A8A">x = 2</text>
    <text x="20" y="237" class="m" font-size="11" fill="#17151F">EC · wait for US-EAST</text>
    <rect x="190" y="226" width="270" height="14" rx="3" fill="#531A8A"/>
    <text x="466" y="237" class="m" font-size="11" font-weight="700" fill="#531A8A">~90 ms</text>
  </g>
  <!-- step 2: EL -->
  <g class="f" data-step="2">
    <text x="180" y="168" text-anchor="middle" class="m" font-size="11" fill="#531A8A">x = 3</text>
    <rect x="250" y="142" width="120" height="24" fill="#fff"/>
    <text x="310" y="160" text-anchor="middle" class="m" font-size="14" font-weight="700" fill="#531A8A">x = 3</text>
    <text x="310" y="180" text-anchor="middle" class="m" font-size="11" fill="#8C8899">ack after local write</text>
    <text x="20" y="271" class="m" font-size="11" fill="#17151F">EL · ack locally</text>
    <rect x="190" y="260" width="6" height="14" rx="2" fill="#531A8A"/>
    <text x="204" y="271" class="m" font-size="11" font-weight="700" fill="#531A8A">~2 ms · replicas copy later</text>
  </g>
  <!-- step 3: stale read far away -->
  <g class="f" data-step="3">
    <rect x="576" y="196" width="168" height="88" rx="8" fill="none" stroke="#C2382F" stroke-width="2"/>
    <text x="660" y="302" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#C2382F">local read in SG: x = 1</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>One leader in Europe, replicas in the US and Singapore. The network is healthy: this is the <b>E</b> (else) case.</li>
  <li><b>EC</b>: the leader confirms <b>x = 2</b> only after a majority (itself + US-EAST) has it. Correct, but the client waits a full ocean round trip, <b>~90 ms</b>.</li>
  <li><b>EL</b>: the leader confirms <b>x = 3</b> after its own write, in <b>~2 ms</b>, and replicates in the background.</li>
  <li>The bill arrives later: a user in Singapore reads the nearby replica and gets <b>x = 1</b>. Low latency bought with <b>stale data</b>.</li>
</ol>
{{< /fig >}}

## Classifying real systems

Each system gets two letters: what it does during a partition (PA or PC) and what it does otherwise (EL or EC). Many are configurable, so the table shows the usual default.

| System | Class | Notes |
|---|---|---|
| Cassandra, ScyllaDB, Riak | PA/EL | Tunable per query: `QUORUM` reads and writes move toward EC |
| DynamoDB | PA/EL | Eventually consistent reads by default; strongly consistent reads are EC (not available on global secondary indexes) |
| MongoDB | PA/EC (Abadi, 2012) | Today depends on write and read concern; `majority` + linearizable reads behave PC/EC |
| PNUTS (Yahoo) | PC/EL | Abadi's example of an unusual combination |
| Spanner, CockroachDB, YugabyteDB | PC/EC | Consensus on every write; pay latency for correctness |
| etcd, ZooKeeper | PC/EC | Coordination data where wrong answers are unacceptable |

## How to use it

- Ask the **else** question first: "Can this read be a few seconds stale?" If yes, EL buys you lower latency and cheaper multi-region reads.
- Choose **per operation**, not per database: a checkout can use strong reads while product reviews use eventually consistent ones.
- Put the leader (or the quorum) close to the writers. Most of the EC penalty is the speed of light between regions.

## Common mistakes

- **Thinking PACELC replaces CAP.** It extends it; the partition rule still holds.
- **Reading the latency cost from a benchmark in one region.** Run it across the regions you will actually deploy.
- **Treating the letters as fixed.** Most modern databases let you pick consistency per query or per table.

## Learning Resources

### Papers and articles

- [Consistency Tradeoffs in Modern Distributed Database System Design](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf): Daniel Abadi, IEEE Computer, 2012, the PACELC paper
- [Problems with CAP, and Yahoo's little known NoSQL system](https://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html): Abadi's original 2010 blog post
- [PACELC Theorem](https://www.scylladb.com/glossary/pacelc-theorem/), ScyllaDB glossary

### Videos

- [CAP Theorem and PACELC | System Design Interview Concept](https://www.youtube.com/watch?v=BaKtC-VIYrM)
