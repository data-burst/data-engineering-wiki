---
description: "How Apache Parquet works, animated: columnar storage, row groups, column chunks, min/max statistics, predicate pushdown, encodings and compression."
title: "Parquet"
bookToC: false
---
<div class="lx-kicker-line">$ parquet-tools inspect orders.parquet</div>

# Parquet

**Apache Parquet** is an open, **columnar** file format. It's the default storage format of the modern data stack: Spark, Trino, DuckDB, ClickHouse, Snowflake and BigQuery all read it, and lakehouse table formats (**Iceberg**, **Delta Lake**, **Hudi**) are, underneath, folders of Parquet files plus metadata.

Two ideas make it fast: **store columns, not rows**, and **write statistics so readers can skip data**.

## Idea 1: store columns, not rows

{{< fig kicker="$ SELECT SUM(amount) FROM orders" title="Same table, two layouts on disk" hook="rowcol" >}}
<div class="rc-top">
<table class="rc-tbl"><tr><th>id</th><th>user</th><th>city</th><th class="hot">amount</th></tr>
<tr><td>1</td><td>amy</td><td>NYC</td><td>250</td></tr><tr><td>2</td><td>sam</td><td>NYC</td><td>120</td></tr>
<tr><td>3</td><td>ray</td><td>NYC</td><td>450</td></tr><tr><td>4</td><td>max</td><td>TOR</td><td>980</td></tr>
<tr><td>5</td><td>eva</td><td>TOR</td><td>600</td></tr><tr><td>6</td><td>leo</td><td>CHI</td><td>1200</td></tr></table>
<div>
<div class="rc-q"><span class="k">SELECT</span> <span class="fn">SUM</span>(amount)
<span class="k">FROM</span>   orders;</div>
<div class="rc-legend"><span><i style="background:var(--acc-l);border-color:var(--acc-m)"></i>amount (needed)</span><span><i style="background:var(--panel)"></i>other columns</span><span><i style="background:var(--acc)"></i>read from disk</span></div>
</div>
</div>
<div class="rc-disk"><div class="lb">Row layout · CSV, PostgreSQL heap <span class="rc-read row"></span></div><div class="rc-strip row"></div><div class="rc-meter row"><i></i></div></div>
<div class="rc-disk"><div class="lb">Columnar layout · Parquet, ORC <span class="rc-read col"></span></div><div class="rc-strip col"></div><div class="rc-meter col"><i></i></div></div>
<ol class="lx-caps">
  <li>6 orders, 4 columns. The query needs only <b>one</b> column: <b>amount</b>.</li>
  <li><b>Row layout:</b> each row's values sit next to each other on disk. Great for "fetch order #4", the OLTP case.</li>
  <li><b>Columnar layout:</b> all ids, then all users, then all cities, then all amounts.</li>
  <li>The row store must read <b>everything</b>: amounts are interleaved with columns we don't need.</li>
  <li>The column store reads <b>only the amount block</b>: 4× less I/O here. A real table with 200 columns? Often <b>50–100×</b>.</li>
  <li>Similar values now sit together, so they compress: <b>run-length encoding</b> turns NYC,NYC,NYC into NYC×3. Add dictionary encoding + zstd and files are often several times smaller than the same CSV.</li>
</ol>
{{< /fig >}}

## Idea 2: statistics let you skip data

A Parquet file isn't one big blob. Rows are cut into **row groups** (commonly 64–128 MB; Spark and parquet-java default to 128 MB, DuckDB to ~122k rows). Inside each row group, every column is a **column chunk**, split into **pages**. The **footer** stores the schema plus statistics (**min / max / null count**) for every column chunk, so a reader can decide what to skip before touching the data.

{{< fig kicker="$ SELECT id, amount FROM orders WHERE amount > 500" title="Predicate pushdown with min/max stats" >}}
<svg class="lx-svg" viewBox="0 0 760 300">
  <rect x="10" y="10" width="740" height="280" rx="12" fill="#FBFBFE" stroke="#E7E7EF" stroke-width="1.5"/>
  <text x="26" y="36" class="m" font-size="13" font-weight="700" fill="#5C5869">orders.parquet</text>
  <!-- row group 0 -->
  <g><rect x="26" y="50" width="330" height="150" rx="10" fill="#FFFFFF" stroke="#E7E7EF"/>
    <text x="40" y="74" font-weight="700" font-size="15">Row group 0 · rows 1–3</text>
    <g class="m" font-size="12" font-weight="700">
      <rect x="40" y="88" width="70" height="96" rx="6" fill="#F7F7FB"/><text x="75" y="140" text-anchor="middle">id</text>
      <rect x="118" y="88" width="70" height="96" rx="6" fill="#F7F7FB"/><text x="153" y="140" text-anchor="middle">user</text>
      <rect x="196" y="88" width="70" height="96" rx="6" fill="#F7F7FB"/><text x="231" y="140" text-anchor="middle">city</text>
      <rect x="274" y="88" width="70" height="96" rx="6" fill="#F4EEFA"/><text x="309" y="140" text-anchor="middle">amount</text>
    </g></g>
  <!-- row group 1 -->
  <g><rect x="372" y="50" width="330" height="150" rx="10" fill="#FFFFFF" stroke="#E7E7EF"/>
    <text x="386" y="74" font-weight="700" font-size="15">Row group 1 · rows 4–6</text>
    <g class="m" font-size="12" font-weight="700">
      <rect x="386" y="88" width="70" height="96" rx="6" fill="#F7F7FB"/><text x="421" y="140" text-anchor="middle">id</text>
      <rect x="464" y="88" width="70" height="96" rx="6" fill="#F7F7FB"/><text x="499" y="140" text-anchor="middle">user</text>
      <rect x="542" y="88" width="70" height="96" rx="6" fill="#F7F7FB"/><text x="577" y="140" text-anchor="middle">city</text>
      <rect x="620" y="88" width="70" height="96" rx="6" fill="#F4EEFA"/><text x="655" y="140" text-anchor="middle">amount</text>
    </g></g>
  <!-- footer -->
  <g><rect x="26" y="214" width="676" height="62" rx="10" fill="#17151F"/>
    <text x="42" y="238" font-weight="700" font-size="14" fill="#E2B6FB">Footer</text>
    <text x="42" y="262" class="m" font-size="12.5" fill="#EEEAF5">schema · RG0 amount: min 120, max 450 · RG1 amount: min 600, max 1200</text></g>
  <!-- steps -->
  <g class="f" data-step="1"><rect x="22" y="210" width="684" height="70" rx="12" fill="none" stroke="#531A8A" stroke-width="3"/></g>
  <g class="f fade" data-step="2"><rect x="26" y="50" width="330" height="150" rx="10" fill="rgba(252,252,253,.82)"/>
    <line x1="60" y1="70" x2="320" y2="190" stroke="#C2382F" stroke-width="3"/><line x1="320" y1="70" x2="60" y2="190" stroke="#C2382F" stroke-width="3"/>
    <rect x="96" y="112" width="190" height="34" rx="8" fill="#FFFFFF" stroke="#C2382F"/><text x="191" y="135" text-anchor="middle" font-weight="700" font-size="14" fill="#C2382F">skipped · max 450 ≤ 500</text></g>
  <g class="f fade" data-step="3">
    <rect x="464" y="88" width="148" height="96" rx="6" fill="rgba(252,252,253,.8)"/>
    <rect x="383" y="85" width="76" height="102" rx="8" fill="none" stroke="#531A8A" stroke-width="3"/>
    <rect x="617" y="85" width="76" height="102" rx="8" fill="none" stroke="#531A8A" stroke-width="3"/>
    <text x="690" y="74" text-anchor="end" font-weight="700" font-size="12" fill="#531A8A">2 / 8 chunks read</text></g>
</svg>
<ol class="lx-caps">
  <li>The file: two row groups, each holding four column chunks, plus a footer.</li>
  <li>The reader opens the <b>footer first</b>: a few KB, read with one request.</li>
  <li><b>Row group 0</b> has max amount 450, so no row can match <code>amount &gt; 500</code>. It is <b>never read</b>.</li>
  <li>In row group 1, only the <b>id</b> and <b>amount</b> chunks are fetched (<b>column pruning</b>). 2 of 8 chunks read.</li>
</ol>
{{< /fig >}}

> This is why **sorting or clustering** data before writing matters: if `amount` is sorted, min/max ranges don't overlap and the engine skips almost everything. Iceberg and Delta lift these same stats up to the table level to skip whole **files**.

## Encodings and compression

| Technique | What it does | Works best on |
|---|---|---|
| **Dictionary** | Replace values with small integer codes | Low-cardinality strings (city, status) |
| **RLE / bit-packing** | Store `value × count` | Repeated or sorted values, dictionary codes |
| **Delta** | Store differences between neighbors | Timestamps, increasing IDs |
| **zstd / snappy** | General compression per page | Everything, on top of the above |

## When not to use Parquet

- **Row-at-a-time writes or updates**: Parquet files are immutable. Use a database, or a table format (Iceberg / Delta) that rewrites files for you.
- **Tiny files**: thousands of 10 KB files kill performance. Aim for 100 MB – 1 GB per file.
- **Message passing between services**: use [Avro]({{< relref "../serialization/avro" >}}) or [Protobuf]({{< relref "../serialization/protobuf" >}}).

## Try it

```python
import duckdb
duckdb.sql("COPY (SELECT * FROM 'orders.csv') TO 'orders.parquet' (FORMAT parquet, COMPRESSION zstd)")
duckdb.sql("SELECT * FROM parquet_metadata('orders.parquet')").show()   # row groups + min/max stats
duckdb.sql("SELECT SUM(amount) FROM 'orders.parquet' WHERE amount > 500").show()
```

## Learning Resources

- [Apache Parquet documentation](https://parquet.apache.org/docs/)
- [Dremel: Interactive Analysis of Web-Scale Datasets](https://research.google/pubs/dremel-interactive-analysis-of-web-scale-datasets-2/): the paper behind nested columnar storage
- [DuckDB: Querying Parquet](https://duckdb.org/docs/data/parquet/overview)
- See also: [CSV]({{< relref "csv" >}}), [JSON]({{< relref "json" >}})
