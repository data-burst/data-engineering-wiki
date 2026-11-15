---
description: "CAP theorem explained with an interactive animation: what a distributed database does during a network partition, CP vs AP, eventual consistency and PACELC."
title: "CAP"
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ man cap   # Brewer, 2000 · Gilbert &amp; Lynch, 2002</div>

# CAP: what breaks when the network breaks

You keep **copies of the same data on several machines** (replicas) so the system survives a dead server. CAP asks a single, sharp question:

> When the replicas **can't talk to each other**, and a request arrives, do you **answer anyway** or **refuse**?

That's the whole theorem. Everything else is detail.

<div class="lx-cards">
  <div class="lx-card"><div class="lab">C · Consistency</div><h4>Everyone sees the latest write</h4><p>After a write succeeds, every read from any node returns that value (linearizability).</p></div>
  <div class="lx-card"><div class="lab">A · Availability</div><h4>Every live node answers</h4><p>Any request to a non-failed node gets a real response: not an error, not a timeout.</p></div>
  <div class="lx-card"><div class="lab">P · Partition</div><h4>The network splits</h4><p>Messages between nodes are lost or delayed. On real networks this <b>will</b> happen.</p></div>
</div>

## See it happen

Pick a mode, then step through. Same cluster, same failure: only the choice at step 4 differs.

{{< fig kicker="$ ./cluster --replicas 3 --partition node3" title="Three replicas, one cut cable" hook="cap" >}}
<div class="cap-modes">During a partition, Node 3 should:
  <button class="lx-b on" data-mode="CP">CP · refuse</button>
  <button class="lx-b" data-mode="AP">AP · answer</button>
</div>
<svg class="lx-svg cap lx-canvas" viewBox="0 0 760 340">
  <defs>
    <symbol id="ico-db" viewBox="0 0 20 22"><ellipse cx="10" cy="4" rx="8" ry="3"/><path d="M2 4v14c0 1.7 3.6 3 8 3s8-1.3 8-3V4M2 11c0 1.7 3.6 3 8 3s8-1.3 8-3"/></symbol>
    <symbol id="ico-pc" viewBox="0 0 24 20"><rect x="3" y="2" width="18" height="12" rx="1.5"/><path d="M1 18h22"/></symbol>
  </defs>
  <rect class="partition-zone" x="530" y="95" width="190" height="150" rx="10"/>
  <line x1="95" y1="170" x2="330" y2="70" stroke="#D5DAE3" stroke-width="1.2" stroke-dasharray="2 5"/>
  <line x1="95" y1="170" x2="620" y2="170" stroke="#D5DAE3" stroke-width="1.2" stroke-dasharray="2 5"/>
  <line class="link" x1="330" y1="70" x2="330" y2="270"/>
  <line class="link x3" x1="330" y1="70" x2="620" y2="170"/>
  <line class="link x3" x1="330" y1="270" x2="620" y2="170"/>
  <text class="scis" x="468" y="112" font-size="18" fill="#C2382F">✂</text>
  <text class="scis" x="468" y="246" font-size="18" fill="#C2382F">✂</text>
  <g><rect x="40" y="138" width="110" height="64" rx="6" fill="#fff" stroke="#2B3446" stroke-width="1.4"/>
    <use href="#ico-pc" x="83" y="148" width="24" height="20" fill="none" stroke="#2747D6" stroke-width="1.4"/>
    <text x="95" y="190" text-anchor="middle" class="m" font-weight="600" font-size="12" fill="#0E1525">CLIENT</text></g>
  <g class="node n1"><rect x="265" y="27" width="130" height="86" rx="6"/><use class="ico" href="#ico-db" x="276" y="38" width="16" height="18"/><text class="nm" x="340" y="52" text-anchor="middle">NODE 1</text><text class="val" x="330" y="82" text-anchor="middle">x = 1</text><text class="st" x="330" y="102" text-anchor="middle">ok</text></g>
  <g class="node n2"><rect x="265" y="227" width="130" height="86" rx="6"/><use class="ico" href="#ico-db" x="276" y="238" width="16" height="18"/><text class="nm" x="340" y="252" text-anchor="middle">NODE 2</text><text class="val" x="330" y="282" text-anchor="middle">x = 1</text><text class="st" x="330" y="302" text-anchor="middle">ok</text></g>
  <g class="node n3"><rect x="555" y="127" width="130" height="86" rx="6"/><use class="ico" href="#ico-db" x="566" y="138" width="16" height="18"/><text class="nm" x="630" y="152" text-anchor="middle">NODE 3</text><text class="val" x="620" y="182" text-anchor="middle">x = 1</text><text class="st" x="620" y="202" text-anchor="middle">ok</text></g>
  <g class="resp"><rect x="25" y="230" width="140" height="36" rx="6" stroke-width="1.4"/><text x="95" y="253" text-anchor="middle" class="m" font-weight="700" font-size="12"></text></g>
  <g class="pkts"></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>client</td><td>node1</td><td class="tag">WRITE</td><td>x = 2 → ok</td></tr>
<tr class="f" data-step="1"><td>2</td><td>01</td><td>node1</td><td>node2, node3</td><td class="tag">REPLICATE</td><td>x = 2 → ack ×2</td></tr>
<tr class="f" data-step="2"><td>3</td><td>02</td><td>node1, node2</td><td>node3</td><td class="err">LINK DOWN</td><td>network partition</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>client</td><td>node1</td><td class="tag">WRITE</td><td>x = 3 → ok (quorum: node1 + node2)</td></tr>
<tr class="f" data-step="3"><td>5</td><td>03</td><td>node1</td><td>node3</td><td class="err">REPLICATE</td><td>x = 3 → lost</td></tr>
<tr class="f" data-step="4"><td>6</td><td>04</td><td>client</td><td>node3</td><td class="tag">READ</td><td>x ?</td></tr>
<tr class="f cp-only" data-step="4"><td>7</td><td>04</td><td>node3</td><td>client</td><td class="err">ERROR</td><td>503 · can't reach quorum (consistent, not available)</td></tr>
<tr class="f ap-only" data-step="4"><td>7</td><td>04</td><td>node3</td><td>client</td><td class="err">RESPONSE</td><td>x = 2 · stale (available, not consistent)</td></tr>
<tr class="f" data-step="5"><td>8</td><td>05</td><td>node1</td><td>node3</td><td class="tag">SYNC</td><td>x = 3 → replicas converge</td></tr>
</table>
<ol class="lx-caps">
  <li>Three replicas hold the same value <b>x = 1</b>. Press <b>Play</b>, or <b>Step</b> through it at your own pace (← → also work).</li>
  <li>A client writes <b>x = 2</b>. Node 1 copies it to the others. No partition → <b>consistent and available</b>. Easy.</li>
  <li>The network splits. Node 3 is <b>alive</b>, it just can't hear Node 1 or Node 2.</li>
  <li>A new write <b>x = 3</b> lands on Node 1. It reaches Node 2, but the copy to Node 3 is <b>lost</b>.</li>
  <li>A client asks <b>Node 3</b> for x. <b>CP</b>: it refuses: correct but unavailable. <b>AP</b>: it answers with old data: available but inconsistent. Toggle the mode to compare.</li>
  <li>The network heals and Node 3 catches up to <b>x = 3</b>. In AP this is <b>eventual consistency</b>: replicas converge once messages flow again.</li>
</ol>
{{< /fig >}}

So the honest reading of CAP is: **P is not optional.** Networks fail, so during a partition you choose between **C** and **A**. "CA" systems only exist on a single machine.

## Real systems, real choices

| System | During a partition | Why |
|---|---|---|
| **PostgreSQL** (sync replica), **etcd**, **ZooKeeper**, **Spanner** | CP | Wrong answers are worse than no answer (money, locks, leader election). |
| **Cassandra**, **DynamoDB**, **Riak** (default settings) | AP | Shopping carts, feeds, metrics: an old answer beats an error page. |
| **Cassandra / DynamoDB** with `QUORUM` or strong reads | closer to CP | The choice is often **per query**, not per database. |
| **Kafka** | tunable | `acks=all` + `min.insync.replicas` trades availability for durability. |

## Beyond CAP: PACELC

CAP only talks about the rare moment of a partition. Most of the time the network is fine, and you **still** pay for consistency in **latency**: a write must wait for replicas to confirm.

> **PACELC:** if **P**artition → choose **A** or **C**; **E**lse → choose **L**atency or **C**onsistency.

Cassandra is **PA/EL** (fast, eventually consistent). Spanner is **PC/EC** (consistent, pays with latency and atomic clocks). See [PACELC]({{< relref "../pacelc" >}}) and [Consistency vs Eventual Consistency]({{< relref "../consistency-vs-eventual-consistency" >}}).

## Common misconceptions

- **"Pick any 2 of 3."** You can't drop P. The real choice is C or A *while partitioned*.
- **"AP means always inconsistent."** No: replicas converge once the partition heals.
- **CAP's C is not ACID's C.** CAP's C is about replicas agreeing; ACID's C is about invariants inside one database. See [ACID]({{< relref "../acid" >}}).

## Learning Resources

### Articles

- [A critique of the CAP theorem: Martin Kleppmann](https://martin.kleppmann.com/2015/09/17/critique-of-the-cap-theorem.html)
- [CAP Twelve Years Later: Eric Brewer](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)
- [Jepsen analyses](https://jepsen.io/analyses): how real databases behave under partitions

### Videos

- [CAP Theorem Simplified](https://www.youtube.com/watch?v=BHqjEjzAicA)

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann: chapters on replication and consistency
