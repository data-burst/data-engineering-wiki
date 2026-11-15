---
title: "ACID"
description: "ACID transactions explained: atomicity, consistency, isolation and durability, isolation levels and their anomalies, with an animated lost update and its fix."
weight: 5
bookToC: false
---
<div class="lx-kicker-line">$ man acid   # BEGIN; ... COMMIT;</div>

# ACID

**ACID** is the set of guarantees a database gives a **transaction**, a group of reads and writes that should behave as one unit. A transfer of 100 from Ali to Sara is two updates; ACID promises that both happen or neither does, that concurrent transfers do not corrupt each other, and that a committed transfer survives a power cut.

<div class="lx-cards">
  <div class="lx-card"><div class="lab">A · Atomicity</div><h4>All or nothing</h4><p>If anything fails mid-transaction, every change is rolled back. Never "Ali debited, Sara not credited".</p></div>
  <div class="lx-card"><div class="lab">C · Consistency</div><h4>Rules still hold</h4><p>Constraints (foreign keys, <code>CHECK balance &gt;= 0</code>, unique keys) are true before and after. Mostly your schema's job.</p></div>
  <div class="lx-card"><div class="lab">I · Isolation</div><h4>Concurrency looks safe</h4><p>Transactions running at the same time do not see each other's half-done work. How strictly depends on the isolation level.</p></div>
  <div class="lx-card"><div class="lab">D · Durability</div><h4>Committed means saved</h4><p>Once <code>COMMIT</code> returns, the change survives a crash: it is in the write-ahead log on disk (and often on a replica).</p></div>
</div>

## How databases deliver it

- **Atomicity and durability** come from the **write-ahead log (WAL)**: changes are appended to a log and flushed to disk before `COMMIT` returns. After a crash, the database replays committed work and discards the rest.
- **Isolation** comes from **locks** and **MVCC** (multi-version concurrency control): readers see a consistent snapshot while writers create new row versions.
- **Consistency** is shared: the database enforces the constraints you declare; your application must keep the rest of the business rules.

## Isolation is where the bugs live

Atomicity and durability are rarely the problem in practice. Isolation is, because most databases do **not** run fully isolated by default. Here is the most common bug it causes.

{{< fig kicker="$ psql -c 'SHOW default_transaction_isolation'   # read committed" title="A lost update: two checkouts, one item" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 270">
  <text x="20" y="30" class="m" font-size="11" fill="#5C5869">product 7 has 1 left · T1 = Ali's checkout · T2 = Sara's checkout</text>
  <line x1="20" y1="118" x2="560" y2="118" stroke="#E7E7EF" stroke-width="1.2"/>
  <line x1="20" y1="182" x2="560" y2="182" stroke="#E7E7EF" stroke-width="1.2"/>
  <text x="20" y="100" class="m" font-size="12" font-weight="700" fill="#17151F">T1</text>
  <text x="20" y="155" class="m" font-size="12" font-weight="700" fill="#5C5869">ROW</text>
  <text x="20" y="220" class="m" font-size="12" font-weight="700" fill="#17151F">T2</text>
  <text x="560" y="256" text-anchor="end" class="m" font-size="11" fill="#8C8899">time →</text>
  <g font-size="11" text-anchor="middle">
    <rect x="95" y="135" width="150" height="30" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="170" y="154" fill="#17151F">stock 1 · orders 0</text>
  </g>
  <!-- step 1: both read -->
  <g class="f" data-step="1" font-size="11" text-anchor="middle">
    <rect x="95" y="80" width="150" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="170" y="99" fill="#17151F">READ stock = 1</text>
    <rect x="95" y="200" width="150" height="30" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="170" y="219" fill="#17151F">READ stock = 1</text>
  </g>
  <!-- step 2: T1 writes -->
  <g class="f" data-step="2" font-size="11" text-anchor="middle">
    <rect x="255" y="80" width="150" height="30" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="330" y="99" fill="#531A8A">SET stock=0 · COMMIT</text>
    <rect x="255" y="135" width="150" height="30" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <text class="m" x="330" y="154" fill="#17151F">stock 0 · orders 1</text>
  </g>
  <!-- step 3: T2 overwrites -->
  <g class="f" data-step="3" font-size="11" text-anchor="middle">
    <rect x="415" y="200" width="150" height="30" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text class="m" x="490" y="219" fill="#C2382F">SET stock=0 · COMMIT</text>
    <rect x="415" y="135" width="150" height="30" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text class="m" x="490" y="154" fill="#C2382F">stock 0 · orders 2</text>
    <text class="m" x="490" y="190" font-weight="700" fill="#C2382F">LOST UPDATE</text>
  </g>
  <!-- step 4: fix -->
  <g class="f" data-step="4">
    <rect x="585" y="70" width="160" height="170" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/>
    <g font-size="11" fill="#17151F">
      <text class="m" x="597" y="92" font-weight="700" fill="#531A8A">FIX</text>
      <text class="m" x="597" y="114">SELECT … FOR UPDATE</text>
      <text class="m" x="597" y="134">T2 waits on T1's lock,</text>
      <text class="m" x="597" y="152">re-reads stock = 0,</text>
      <text class="m" x="597" y="170">rejects the order.</text>
      <text class="m" x="597" y="198" fill="#5C5869">or SERIALIZABLE:</text>
      <text class="m" x="597" y="216" fill="#5C5869">T2 aborts and retries</text>
    </g>
  </g>
</svg>
<ol class="lx-caps">
  <li>One item left in stock. Ali and Sara press "Buy" at the same moment, starting transactions <b>T1</b> and <b>T2</b>.</li>
  <li>Both read <b>stock = 1</b>. Each sees "in stock", which was true when it looked.</li>
  <li>T1 computes 1 − 1 = 0, writes <b>stock = 0</b>, inserts an order and commits.</li>
  <li>T2 does the same math on its <b>stale read</b> and overwrites stock with 0. Two orders, one item: T1's decrement was <b>lost</b>. READ COMMITTED allows this.</li>
  <li>Fix it by locking the row (<code>SELECT … FOR UPDATE</code>), by an atomic <code>UPDATE … SET stock = stock - 1 WHERE stock &gt; 0</code>, or by running at <b>SERIALIZABLE</b> and retrying aborted transactions.</li>
</ol>
{{< /fig >}}

## Isolation levels

The SQL standard defines four levels by which anomalies they allow. Real databases differ in the details, so check yours.

| Level | Dirty read | Non-repeatable read | Lost update | Write skew / phantoms | Default in |
|---|---|---|---|---|---|
| Read uncommitted | possible | possible | possible | possible | rarely used |
| Read committed | prevented | possible | possible | possible | PostgreSQL, Oracle, SQL Server |
| Repeatable read / snapshot | prevented | prevented | depends on DB | possible | MySQL InnoDB |
| Serializable | prevented | prevented | prevented | prevented | CockroachDB, Spanner (strict serializable) |

Notes that trip people up:

- PostgreSQL's REPEATABLE READ is **snapshot isolation** and detects the lost update above (T2 gets a serialization error). MySQL's REPEATABLE READ does **not**, because a plain `SELECT` reads a snapshot while `UPDATE` writes the latest version.
- Oracle's "SERIALIZABLE" is actually snapshot isolation and still allows **write skew** (two doctors both going off call because each saw the other still on call).
- Serializable costs throughput and produces aborts, so the application **must retry** failed transactions.

## ACID's C is not CAP's C

The same letter means two different things:

| | ACID consistency | CAP consistency |
|---|---|---|
| About | Data obeys your rules (constraints, invariants) | Every replica returns the latest write (linearizability) |
| Scope | One database, one transaction | Many replicas of the same data |
| Broken by | A bug or a missing constraint | Replication lag, network partitions |
| Read more | This page | [CAP]({{< relref "/docs/roadmap/distributed-systems-concepts/cap" >}}) |

## ACID in data engineering

- **Warehouses** (Snowflake, BigQuery, Redshift) give ACID per statement or transaction, usually with snapshot isolation.
- **Lakehouse table formats** (Apache Iceberg, Delta Lake, Apache Hudi) bring ACID commits to files on object storage: a commit atomically swaps a metadata pointer, and concurrent writers use optimistic concurrency (one wins, the other retries).
- **NoSQL stores** traditionally offered single-row atomicity and **BASE** (basically available, soft state, eventually consistent). Many now add transactions: MongoDB multi-document transactions, DynamoDB `TransactWriteItems`.
- Across databases or services you need [distributed transactions]({{< relref "/docs/roadmap/distributed-systems-concepts/transaction" >}}) or sagas.

## Common mistakes

- **Read, compute in the app, write back.** That pattern is exactly the lost update. Prefer atomic SQL (`SET x = x - 1`) or explicit locks.
- **Assuming the default level is serializable.** It almost never is.
- **Long transactions.** Holding a transaction open while calling an external API keeps locks and old row versions alive.
- **Not retrying.** Serialization failures and deadlocks are normal under load; wrap transactions in a retry loop.
- **Turning off `fsync` or `synchronous_commit` for speed** and then being surprised that "committed" data vanished after a crash.

## Learning Resources

### Books

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann and Chris Riccomini: the transactions chapter
- [Database Internals](https://www.oreilly.com/library/view/database-internals/9781492040330/), Alex Petrov: chapter 5, transaction processing and recovery

### Docs and papers

- [PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [A Critique of ANSI SQL Isolation Levels](https://www.microsoft.com/en-us/research/publication/a-critique-of-ansi-sql-isolation-levels/): Berenson et al., 1995
- [Hermitage](https://github.com/ept/hermitage): Martin Kleppmann's tests of which anomalies each database really allows
- [ACID Transactions](https://www.yugabyte.com/acid/acid-transactions/), Yugabyte

### Videos

- [ACID Properties in Databases With Examples](https://www.youtube.com/watch?v=GAe5oB742dw)
