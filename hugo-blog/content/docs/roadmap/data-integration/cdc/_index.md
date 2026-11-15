---
weight: 3
title: CDC
description: "Change data capture animated: how Debezium reads the Postgres WAL or MySQL binlog and streams every insert, update and delete to Kafka as ordered change events."
bookToC: false
---
<div class="lx-kicker-line">$ debezium --connector postgres --slot orders_cdc</div>

# CDC (Change Data Capture)

**Change data capture (CDC)** is a way of copying a database by streaming its **changes** instead of re-reading its tables. Every insert, update and delete is captured as an event, in commit order, within seconds of happening, and delivered to other systems: a warehouse, a search index, a cache or another service.

The reliable way to do it is **log-based CDC**: read the database's own transaction log (the PostgreSQL **WAL**, the MySQL **binlog**, the SQL Server transaction log, the MongoDB oplog). Every database already writes this log for crash recovery and replication, so CDC gets a complete, ordered history of changes without querying the tables at all.

## Watch it happen

{{< fig kicker="$ debezium --connector postgres --topic pg.public.orders" title="From WAL to Kafka: log-based CDC" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <defs><marker id="cdc-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m">
    <rect x="20" y="20" width="160" height="50" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="36" y="42" font-size="12" font-weight="600" fill="#17151F">APP</text><text x="36" y="59" font-size="11" fill="#5C5869">checkout service</text>
    <line x1="100" y1="70" x2="100" y2="104" stroke="#3D3A49" stroke-width="1.4" marker-end="url(#cdc-ar)"/><text x="110" y="92" font-size="11" fill="#8C8899">SQL</text>
    <rect x="20" y="108" width="290" height="206" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="36" y="130" font-size="12" font-weight="600" fill="#17151F">POSTGRES</text>
    <text x="36" y="154" font-size="11" fill="#8C8899">TABLE orders</text>
    <g font-size="12" fill="#3D3A49"><text x="36" y="176">id 5</text><text x="90" y="176">SHZ</text><text x="140" y="176">new</text></g>
    <line x1="36" y1="214" x2="294" y2="214" stroke="#E7E7EF"/>
    <text x="36" y="236" font-size="11" fill="#8C8899">WAL (write-ahead log)</text>
    <rect x="36" y="246" width="258" height="50" rx="4" fill="#F7F7FB" stroke="#E7E7EF"/>
  </g>
  <g class="f m" data-step="1">
    <g font-size="12" fill="#3D3A49"><text x="36" y="198">id 7</text><text x="90" y="198">TEH</text><text x="140" y="198">new</text></g>
    <rect x="44" y="256" width="76" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="82" y="276" text-anchor="middle" font-size="11.5" fill="#17151F">INS 7</text>
  </g>
  <g class="f m" data-step="2">
    <rect x="136" y="186" width="50" height="18" fill="#fff"/><text x="140" y="198" font-size="12" fill="#531A8A">paid</text>
    <rect x="128" y="256" width="76" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="166" y="276" text-anchor="middle" font-size="11.5" fill="#17151F">UPD 7</text>
  </g>
  <g class="f m" data-step="3">
    <line x1="32" y1="172" x2="175" y2="172" stroke="#5C5869" stroke-width="1.4"/>
    <rect x="212" y="256" width="76" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="250" y="276" text-anchor="middle" font-size="11.5" fill="#17151F">DEL 5</text>
  </g>
  <g class="f m" data-step="4">
    <rect x="350" y="240" width="130" height="62" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="415" y="265" text-anchor="middle" font-size="12" font-weight="600" fill="#17151F">DEBEZIUM</text><text x="415" y="284" text-anchor="middle" font-size="11" fill="#5C5869">replication slot</text>
    <line x1="294" y1="271" x2="344" y2="271" stroke="#531A8A" stroke-width="1.4" marker-end="url(#cdc-ar)"/>
    <text x="314" y="232" font-size="11" fill="#531A8A">reads log</text>
  </g>
  <g class="f m" data-step="5">
    <line x1="480" y1="271" x2="516" y2="271" stroke="#531A8A" stroke-width="1.4" marker-end="url(#cdc-ar)"/>
    <rect x="520" y="200" width="220" height="110" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="534" y="222" font-size="12" font-weight="600" fill="#17151F">KAFKA</text><text x="534" y="240" font-size="11" fill="#5C5869">pg.public.orders</text>
    <rect x="532" y="256" width="62" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="563" y="276" text-anchor="middle" font-size="11.5" fill="#17151F">c · 7</text>
    <rect x="600" y="256" width="62" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="631" y="276" text-anchor="middle" font-size="11.5" fill="#17151F">u · 7</text>
    <rect x="668" y="256" width="62" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="699" y="276" text-anchor="middle" font-size="11.5" fill="#17151F">d · 5</text>
    <rect x="520" y="20" width="220" height="130" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="534" y="42" font-size="12" font-weight="600" fill="#17151F">CONSUMERS</text>
    <text x="534" y="70" font-size="11.5" fill="#3D3A49">warehouse → MERGE</text><text x="534" y="94" font-size="11.5" fill="#3D3A49">search → reindex</text><text x="534" y="118" font-size="11.5" fill="#3D3A49">cache → evict</text>
    <line x1="630" y1="200" x2="630" y2="156" stroke="#531A8A" stroke-width="1.4" marker-end="url(#cdc-ar)"/>
  </g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>WHERE</th><th>OP</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>app → pg</td><td class="tag">INSERT</td><td>INSERT INTO orders VALUES (7, 'TEH', 'new')</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>app → pg</td><td class="tag">UPDATE</td><td>UPDATE orders SET status = 'paid' WHERE id = 7</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>app → pg</td><td class="tag">DELETE</td><td>DELETE FROM orders WHERE id = 5</td></tr>
<tr class="f" data-step="5"><td>4</td><td>05</td><td>kafka</td><td class="tag">op=c</td><td>key 7 · before null · after {id 7, TEH, new}</td></tr>
<tr class="f" data-step="5"><td>5</td><td>05</td><td>kafka</td><td class="tag">op=u</td><td>key 7 · before {status new} · after {status paid}</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>kafka</td><td class="tag">op=d</td><td>key 5 · before {id 5, SHZ, new} · after null</td></tr>
</table>
<ol class="lx-caps">
  <li>An app writes to Postgres. Order <b>5</b> already exists. Below the table sits the <b>WAL</b>, the log Postgres writes before changing any data.</li>
  <li>The app inserts order <b>7</b>. The row appears and an <b>INSERT</b> record is appended to the WAL.</li>
  <li>Order 7 is paid. The row changes in place, but the WAL keeps an <b>UPDATE</b> record: history is preserved.</li>
  <li>Order 5 is deleted. A table scan would never notice it is gone; the WAL has a <b>DELETE</b> record.</li>
  <li><b>Debezium</b> reads the WAL through a <b>replication slot</b>, like a replica would. It never queries the table.</li>
  <li>Each record becomes a <b>change event</b> with <b>before</b> and <b>after</b> images, keyed by primary key, so all changes to one order land in order on one partition. Consumers apply them.</li>
</ol>
{{< /fig >}}

## Ways to capture changes

| Method | How | Catches deletes? | Load on source | Verdict |
|---|---|---|---|---|
| **Log-based** | Read WAL / binlog / oplog | Yes | Very low | The default. Needs log access and config |
| **Trigger-based** | Triggers write each change to an audit table | Yes | High: every write does extra work | Only when you can't read the log |
| **Query-based** (timestamp / ID) | `WHERE updated_at > :last_run` on a schedule | **No** (hard deletes vanish) | Medium, repeated scans | Fine for append-only tables; misses intermediate states |

Query-based "CDC" is really incremental extraction. It misses deletes, misses a row that changed twice between polls, and depends on every writer updating `updated_at` correctly.

## Setting it up on PostgreSQL

1. Set `wal_level = logical` and restart.
2. Create a publication for the tables to capture, and a user with the `REPLICATION` attribute.
3. Point the connector (Debezium on Kafka Connect, Debezium Server, Flink CDC, or a managed service) at the database. It creates a **replication slot**, takes an initial **snapshot** of existing rows, then switches to streaming the WAL from the exact position where the snapshot ended.

MySQL is similar with `binlog_format = ROW` and `binlog_row_image = FULL`.

## Common mistakes

- **An abandoned replication slot.** If the connector stops, Postgres keeps every WAL segment the slot hasn't confirmed, and the disk fills up. Monitor slot lag and set `max_slot_wal_keep_size`.
- **Ignoring schema changes.** An `ALTER TABLE` changes the event shape. Use a schema registry with [Avro]({{< relref "/docs/roadmap/file-formats-and-serialization/serialization/avro" >}}) or Protobuf so consumers can evolve.
- **Assuming exactly-once delivery.** After a restart, a connector can re-send events. Make consumers idempotent: upsert by primary key, using the log position (LSN) to ignore older versions.
- **Replicating to the warehouse with plain INSERTs.** Updates and deletes must become `MERGE` statements, or you get one row per version.
- **Missing old values on update.** In Postgres, set `REPLICA IDENTITY FULL` on tables where you need the full `before` image.

## Tools in 2026

- **Open source**: Debezium (Kafka Connect or standalone Debezium Server), Flink CDC, Kafka Connect JDBC (query-based only).
- **Managed**: AWS DMS, Google Datastream, Azure Data Factory CDC, Confluent's managed Debezium connectors, Fivetran, Airbyte.
- **Built into databases**: Postgres logical replication, MySQL binlog replication, SQL Server CDC, MongoDB change streams, Snowflake and Databricks streams / change data feed on their own tables.

## Learning Resources

### Docs
- [Debezium documentation](https://debezium.io/documentation/reference/stable/)
- [PostgreSQL: Logical Decoding](https://www.postgresql.org/docs/current/logicaldecoding.html)
- [Confluent: What is Change Data Capture?](https://www.confluent.io/learn/change-data-capture/)

### Books and talks
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/), Chapter 11 "Stream Processing": Martin Kleppmann
- [Turning the database inside-out with Apache Samza](https://martin.kleppmann.com/2015/03/04/turning-the-database-inside-out.html): Martin Kleppmann
- [Streaming Change Data Capture](https://www.oreilly.com/library/view/streaming-change-data/9781492032526/)

### Videos
- [Change Data Capture (CDC) Explained (with examples)](https://www.youtube.com/watch?v=5KN_feUhtTM)
- [Data Pipelines: Using CDC to Ingest Data into Kafka](https://www.youtube.com/watch?v=T6PAcWtoHTo)

See also: [ELT]({{< relref "../elt" >}}), [Messaging and Streaming Platforms]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}})
