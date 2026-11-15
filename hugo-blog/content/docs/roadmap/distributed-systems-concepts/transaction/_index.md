---
title: "Distributed Transactions"
description: "Distributed transactions explained: two-phase commit animated with a coordinator crash, why 2PC blocks, consensus-based commit, sagas and the outbox pattern."
weight: 6
bookToC: false
---
<div class="lx-kicker-line">$ man 2pc   # all nodes commit, or none do</div>

# Distributed Transactions

A **distributed transaction** is a group of changes that spans more than one database, shard or service and must **all succeed or all fail**. Moving 100 from Ali's account on one shard to Sara's account on another is the classic example: debiting Ali without crediting Sara is not acceptable, even if a machine crashes halfway.

Inside one database this is plain [ACID]({{< relref "/docs/roadmap/distributed-systems-concepts/acid" >}}): the write-ahead log makes the commit atomic. Across machines there is no shared log, so the machines need a protocol to agree on one outcome.

## Two-phase commit (2PC)

2PC adds a **coordinator** that asks every participant to get ready, then tells all of them the single decision.

{{< fig kicker="$ ./transfer --from ali@nodeA --to sara@nodeB --amount 100" title="Two-phase commit, and what happens when the coordinator dies" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <line x1="330" y1="96" x2="140" y2="210" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <line x1="430" y1="96" x2="620" y2="210" stroke="#B5B0C4" stroke-width="1.4" stroke-dasharray="5 5"/>
  <g><rect x="280" y="20" width="200" height="76" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="380" y="44" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">COORDINATOR</text>
    <text x="380" y="66" text-anchor="middle" class="m" font-size="11" fill="#5C5869">txn 81: Ali → Sara 100</text>
    <text x="380" y="86" text-anchor="middle" class="m" font-size="11" fill="#8C8899">log: (empty)</text></g>
  <g><rect x="40" y="210" width="200" height="86" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="140" y="234" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">NODE A</text>
    <text x="140" y="260" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">Ali = 500</text>
    <text x="140" y="284" text-anchor="middle" class="m" font-size="11" fill="#8C8899">idle</text></g>
  <g><rect x="520" y="210" width="200" height="86" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="620" y="234" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">NODE B</text>
    <text x="620" y="260" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">Sara = 200</text>
    <text x="620" y="284" text-anchor="middle" class="m" font-size="11" fill="#8C8899">idle</text></g>
  <!-- step 1: prepare -->
  <g class="f" data-step="1">
    <line x1="330" y1="96" x2="140" y2="210" stroke="#531A8A" stroke-width="2"/>
    <line x1="430" y1="96" x2="620" y2="210" stroke="#531A8A" stroke-width="2"/>
    <text x="237" y="146" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">PREPARE ↓</text>
    <text x="523" y="146" class="m" font-size="11" font-weight="700" fill="#531A8A">↓ PREPARE</text>
  </g>
  <!-- step 2: votes -->
  <g class="f" data-step="2">
    <text x="203" y="166" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">YES ↑</text>
    <text x="557" y="166" class="m" font-size="11" font-weight="700" fill="#531A8A">↑ YES</text>
    <rect x="50" y="248" width="180" height="42" fill="#fff"/>
    <text x="140" y="260" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">Ali = 400 ?</text>
    <text x="140" y="284" text-anchor="middle" class="m" font-size="11" fill="#531A8A">PREPARED · row locked</text>
    <rect x="530" y="248" width="180" height="42" fill="#fff"/>
    <text x="620" y="260" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#531A8A">Sara = 300 ?</text>
    <text x="620" y="284" text-anchor="middle" class="m" font-size="11" fill="#531A8A">PREPARED · row locked</text>
  </g>
  <!-- step 3: coordinator crash -->
  <g class="f" data-step="3">
    <rect x="290" y="76" width="180" height="16" fill="#fff"/>
    <text x="380" y="86" text-anchor="middle" class="m" font-size="11" fill="#17151F">log: COMMIT txn 81</text>
    <rect x="276" y="16" width="208" height="84" rx="8" fill="none" stroke="#C2382F" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="490" y="40" class="m" font-size="12" font-weight="700" fill="#C2382F">CRASHED</text>
    <rect x="50" y="274" width="180" height="16" fill="#fff"/>
    <text x="140" y="284" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#C2382F">IN DOUBT · lock held</text>
    <rect x="530" y="274" width="180" height="16" fill="#fff"/>
    <text x="620" y="284" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#C2382F">IN DOUBT · lock held</text>
    <text x="40" y="318" class="m" font-size="11" fill="#C2382F">other writes to Ali and Sara wait…</text>
  </g>
  <!-- step 4: recovery -->
  <g class="f" data-step="4">
    <rect x="274" y="14" width="212" height="88" rx="8" fill="#FBFBFE"/>
    <rect x="486" y="26" width="80" height="20" fill="#FBFBFE"/>
    <rect x="280" y="20" width="200" height="76" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="380" y="44" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">COORDINATOR</text>
    <text x="380" y="66" text-anchor="middle" class="m" font-size="11" fill="#5C5869">restarted, reads log</text>
    <text x="380" y="86" text-anchor="middle" class="m" font-size="11" fill="#17151F">log: COMMIT txn 81</text>
    <text x="168" y="186" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">COMMIT ↓</text>
    <text x="590" y="186" class="m" font-size="11" font-weight="700" fill="#531A8A">↓ COMMIT</text>
    <rect x="50" y="248" width="180" height="42" fill="#fff"/>
    <text x="140" y="260" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">Ali = 400</text>
    <text x="140" y="284" text-anchor="middle" class="m" font-size="11" fill="#531A8A">COMMITTED · unlocked</text>
    <rect x="530" y="248" width="180" height="42" fill="#fff"/>
    <text x="620" y="260" text-anchor="middle" class="m" font-size="13" font-weight="700" fill="#17151F">Sara = 300</text>
    <text x="620" y="284" text-anchor="middle" class="m" font-size="11" fill="#531A8A">COMMITTED · unlocked</text>
    <rect x="36" y="306" width="300" height="18" fill="#FBFBFE"/>
  </g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>coordinator</td><td>A, B</td><td class="tag">PREPARE</td><td>can you commit txn 81?</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>A, B</td><td>coordinator</td><td class="tag">VOTE YES</td><td>changes on disk, rows locked, promise to obey</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>coordinator</td><td>its log</td><td class="tag">DECIDE</td><td>COMMIT written to disk</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>coordinator</td><td>-</td><td class="err">CRASH</td><td>decision never sent · A and B blocked</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>coordinator</td><td>A, B</td><td class="tag">COMMIT</td><td>recovered from log · locks released</td></tr>
</table>
<ol class="lx-caps">
  <li>Transfer 100 from <b>Ali</b> (Node A) to <b>Sara</b> (Node B). A <b>coordinator</b> drives the commit.</li>
  <li><b>Phase 1</b>: the coordinator sends <b>PREPARE</b> to every participant.</li>
  <li>Each participant writes its changes durably, <b>locks the rows</b> and votes <b>YES</b>. A YES is a promise: "I will commit if told to, even after a crash."</li>
  <li>The coordinator logs <b>COMMIT</b>, then crashes before telling anyone. The participants are <b>in doubt</b>: they promised, so they cannot abort alone, and they do not know the decision. Locks stay held and other writes <b>block</b>.</li>
  <li><b>Phase 2</b>: the coordinator restarts, reads COMMIT from its log and resends it. Both nodes commit and release their locks. Atomic, but only after waiting.</li>
</ol>
{{< /fig >}}

That waiting is the key weakness of 2PC: it is **atomic but blocking**. A dead coordinator can freeze rows on healthy machines for as long as it stays down. 2PC also needs every participant to vote, so one slow node slows every transaction.

**Three-phase commit (3PC)** tries to remove the blocking with an extra round, but it assumes network delays are bounded, which real networks do not guarantee. It is taught often and used rarely.

## How modern systems commit across machines

| Approach | Idea | Atomic? | Where you meet it |
|---|---|---|---|
| **2PC / XA** | Coordinator + prepare/commit rounds | Yes, blocking | XA in Java/.NET, PostgreSQL `PREPARE TRANSACTION`, MySQL XA |
| **2PC over consensus groups** | Each participant and the coordinator state are replicated with Raft or Paxos, so a single crash does not block | Yes | Google Spanner, CockroachDB, YugabyteDB, TiDB |
| **Saga** | A chain of local transactions, each with a compensating action ("refund" undoes "charge") | No, eventually consistent | Microservice workflows, Temporal, AWS Step Functions |
| **Transactional outbox** | Write the business row and an "event to publish" row in one local transaction; a relay or CDC publishes it | Yes for DB + event | Debezium outbox, event-driven services |
| **Kafka transactions** | Producer writes to several partitions and commits offsets atomically via a transaction coordinator | Yes, within Kafka | Exactly-once Kafka Streams and Flink sinks |

Spanner also uses **TrueTime** (GPS and atomic clocks with a bounded error) to give every transaction a globally meaningful timestamp. See [Clock]({{< relref "/docs/roadmap/distributed-systems-concepts/clock" >}}).

## When to use what

- **Same database, many shards**: let a database built for it (Spanner, CockroachDB, Citus, Vitess) handle commit. Do not build your own.
- **Database + message broker**: use the outbox pattern, not a "write to DB, then publish to Kafka" dual write.
- **Several services owned by different teams**: use a saga with idempotent steps and compensations. 2PC across services couples their availability.
- **Data pipelines**: make sinks idempotent (upsert by key, or overwrite a partition) so a retried job never double-writes.

## Common mistakes

- **Dual writes.** Writing to the database and then to Kafka (or a cache) without a transaction. A crash in between leaves them disagreeing forever.
- **Forgotten prepared transactions.** An orphaned `PREPARE TRANSACTION` in PostgreSQL holds locks and blocks vacuum until someone commits or rolls it back.
- **Sagas without compensation for every step.** If step 4 fails, steps 1 to 3 must be undone, and the undo must itself be retryable.
- **Assuming exactly-once delivery.** Networks deliver at-least-once; exactly-once *effects* come from idempotency plus transactions.

## Learning Resources

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: chapters on transactions and consistency/consensus
- [Database Internals](https://www.oreilly.com/library/view/database-internals/9781492040330/), Alex Petrov: chapter 13, distributed transactions

### Papers

- [Consensus on Transaction Commit](https://www.microsoft.com/en-us/research/publication/consensus-on-transaction-commit/): Jim Gray and Leslie Lamport, why 2PC blocks and how Paxos Commit fixes it
- [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database-2/)
- [Sagas](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf): Garcia-Molina and Salem, 1987

### Articles and videos

- [Pattern: Saga](https://microservices.io/patterns/data/saga.html) and [Pattern: Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html), Chris Richardson
- [Distributed Systems 7.1: Two-phase commit](https://www.youtube.com/watch?v=-_rdWB9hN1c), Martin Kleppmann
- [Handle Distributed Transactions: 2PC, 3PC, Saga](https://www.youtube.com/watch?v=ET_DnJgfplY)
