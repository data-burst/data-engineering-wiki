---
weight: 1
title: ETL
description: "ETL (extract, transform, load) animated: how data is cleaned in a staging engine before loading, when ETL still beats ELT, and common pitfalls."
bookToC: false
---
<div class="lx-kicker-line">$ etl run nightly_sales --date 2026-11-15</div>

# ETL

**ETL (Extract, Transform, Load)** is a data integration pattern that pulls data out of source systems, cleans and reshapes it in a separate processing engine, and only then loads the finished result into a target such as a data warehouse. The warehouse never sees raw data: it receives tables that are already deduplicated, typed, joined and ready for reports.

ETL is the classic pattern from the era when warehouse compute was expensive and limited. Today [ELT]({{< relref "../elt" >}}) is the default for analytics, but ETL is still the right call when data must be filtered, masked or validated **before** it is allowed into the target.

## How it works

{{< fig kicker="$ etl run nightly_sales" title="Extract, transform in staging, then load" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
  <defs><marker id="etl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m">
    <rect x="20" y="40" width="160" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="60" font-size="12" font-weight="600" fill="#17151F">POSTGRES</text><text x="34" y="77" font-size="11" fill="#5C5869">orders</text>
    <rect x="20" y="110" width="160" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="130" font-size="12" font-weight="600" fill="#17151F">SFTP · CSV</text><text x="34" y="147" font-size="11" fill="#5C5869">stores.csv</text>
    <rect x="20" y="180" width="160" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="200" font-size="12" font-weight="600" fill="#17151F">REST API</text><text x="34" y="217" font-size="11" fill="#5C5869">fx rates</text>
    <rect x="270" y="30" width="230" height="206" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="286" y="54" font-size="12" font-weight="600" fill="#17151F">ETL ENGINE · STAGING</text>
    <rect x="590" y="100" width="150" height="70" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="606" y="126" font-size="12" font-weight="600" fill="#17151F">WAREHOUSE</text><text x="606" y="148" font-size="11" fill="#5C5869">fct_orders</text>
  </g>
  <g class="f" data-step="1">
    <line x1="180" y1="63" x2="264" y2="90" stroke="#531A8A" stroke-width="1.4" marker-end="url(#etl-ar)"/>
    <line x1="180" y1="133" x2="264" y2="133" stroke="#531A8A" stroke-width="1.4" marker-end="url(#etl-ar)"/>
    <line x1="180" y1="203" x2="264" y2="176" stroke="#531A8A" stroke-width="1.4" marker-end="url(#etl-ar)"/>
    <text x="222" y="30" text-anchor="middle" class="m" font-size="11" fill="#531A8A">extract</text>
  </g>
  <g class="f" data-step="2">
    <rect x="284" y="68" width="202" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="294" y="88" class="m" font-size="11.5" fill="#17151F">drop 3 rows: null amount</text>
    <rect x="284" y="106" width="202" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="294" y="126" class="m" font-size="11.5" fill="#17151F">dedupe 12 repeated ids</text>
    <rect x="284" y="144" width="202" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="294" y="164" class="m" font-size="11.5" fill="#17151F">join fx → amount_usd</text>
    <rect x="284" y="182" width="202" height="30" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="294" y="202" class="m" font-size="11.5" fill="#17151F">mask phone numbers</text>
  </g>
  <g class="f" data-step="3">
    <line x1="500" y1="135" x2="584" y2="135" stroke="#531A8A" stroke-width="1.4" marker-end="url(#etl-ar)"/>
    <text x="542" y="126" text-anchor="middle" class="m" font-size="11" fill="#531A8A">load</text>
    <text x="606" y="190" class="m" font-size="11" fill="#531A8A">clean rows only</text>
  </g>
  <g class="f" data-step="4">
    <rect x="270" y="252" width="230" height="36" rx="6" fill="#fff" stroke="#8C8899" stroke-width="1.4" stroke-dasharray="4 4"/>
    <text x="385" y="275" text-anchor="middle" class="m" font-size="11.5" fill="#5C5869">raw extract discarded</text>
    <text x="590" y="266" class="m" font-size="11" fill="#5C5869">new rule next month?</text>
    <text x="590" y="282" class="m" font-size="11" fill="#5C5869">re-extract from sources</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Three sources: an orders database, a CSV of stores dropped on SFTP, and an API with exchange rates. One <b>warehouse</b> table is the goal.</li>
  <li><b>Extract</b>: the job pulls yesterday's rows from each source into the engine's staging area, usually on a nightly schedule.</li>
  <li><b>Transform</b>: clean, deduplicate, join and mask, all <b>outside</b> the warehouse, in Spark, Python or an ETL tool.</li>
  <li><b>Load</b>: only the finished, modeled rows are written to the warehouse. Analysts never see the mess.</li>
  <li>The cost: raw data usually isn't kept, so a <b>new business rule</b> means re-extracting history from the sources, if they still have it.</li>
</ol>
{{< /fig >}}

## The three steps

- **Extract**: read from databases, files, APIs and SaaS tools. Prefer **incremental** extraction (only rows changed since the last run, using an `updated_at` column or [CDC]({{< relref "../cdc" >}})) over full dumps, and read from a replica so the production database isn't slowed down.
- **Transform**: cleansing (nulls, bad formats), standardizing (units, currencies, time zones), deduplication, joins and lookups, aggregation, and business rules such as "a cancelled order doesn't count as revenue".
- **Load**: write to the target. Make it **idempotent**: re-running the job for 2026-11-15 should replace that day's data, not append it twice. Use `MERGE` / upsert or overwrite-by-partition.

## ETL vs ELT

| | ETL | ELT |
|---|---|---|
| Where transforms run | Separate engine (Spark, ETL tool) | Inside the warehouse (SQL, dbt) |
| What lands in the target | Clean, modeled tables | Raw copies first, models on top |
| Re-processing history | Re-extract from sources | Re-run SQL on stored raw data |
| Sensitive data | Can be masked before it lands | Lands raw, must be secured in place |
| Best fit | Strict compliance, heavy non-SQL logic, small or legacy targets | Cloud warehouses and lakehouses |

## When ETL is still the right choice

- **PII or regulated data** that may not be stored unmasked in the analytics platform.
- **Heavy non-SQL work**: parsing binaries or documents, ML feature extraction, image or geo processing.
- **Targets that can't transform**: an operational database, a search index, a small on-prem warehouse.
- **Reducing volume**: aggregating billions of IoT readings before loading saves storage and cost.

## Common mistakes

- **Non-idempotent loads** that append duplicates when a job is retried.
- **Full extracts every night** of tables that only change by 1 percent.
- **No data quality checks** between transform and load, so bad data is published silently.
- **Business logic hidden in a GUI tool** with no version control or tests.

## Learning Resources

### Books
- [The Data Warehouse ETL Toolkit](https://www.oreilly.com/library/view/the-data-warehouse/9780764567575/): Ralph Kimball and Joe Caserta
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/): Reis and Housley
- [Understanding ETL](https://www.oreilly.com/library/view/understanding-etl/9781098159269/): Matt Palmer

### Articles and videos
- [AWS: What is ETL?](https://aws.amazon.com/what-is/etl/)
- [Databricks: Extract Transform Load](https://www.databricks.com/glossary/extract-transform-load)
- [Functional Data Engineering](https://maximebeauchemin.medium.com/functional-data-engineering-a-modern-paradigm-for-batch-data-processing-2327ec32c42a): Maxime Beauchemin, on idempotent, partition-based loads
- [What is ETL with a clear example](https://www.youtube.com/watch?v=wDTzxdShbd8)

See also: [ELT]({{< relref "../elt" >}}), [Pipeline Orchestration]({{< relref "/docs/roadmap/pipeline-orchestration" >}})
