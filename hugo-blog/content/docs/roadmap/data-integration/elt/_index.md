---
weight: 2
title: ELT
description: "ELT (extract, load, transform) explained with an animation: land raw data first, model it with SQL and dbt inside the warehouse, and rebuild any time from raw."
bookToC: false
---
<div class="lx-kicker-line">$ airbyte sync && dbt build</div>

# ELT

**ELT (Extract, Load, Transform)** is a data integration pattern that copies data from source systems into the warehouse or lakehouse **as-is**, and only then transforms it with SQL running inside that warehouse. Compared to [ETL]({{< relref "../etl" >}}), the last two letters swap places: loading comes first, transformation second.

ELT became the default once cloud warehouses (Snowflake, BigQuery, Redshift, Databricks, ClickHouse) made storage cheap and compute elastic. If the warehouse can transform a billion rows in seconds, there's little reason to run a separate transformation server, and keeping the raw data means you can always change your mind later.

## How it works

{{< fig kicker="$ airbyte sync && dbt build" title="Load raw first, transform inside the warehouse" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
  <defs><marker id="elt-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m">
    <rect x="20" y="50" width="140" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="77" font-size="12" font-weight="600" fill="#17151F">POSTGRES</text>
    <rect x="20" y="120" width="140" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="147" font-size="12" font-weight="600" fill="#17151F">STRIPE API</text>
    <rect x="20" y="190" width="140" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="217" font-size="12" font-weight="600" fill="#17151F">SALESFORCE</text>
    <rect x="196" y="112" width="124" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="258" y="137" text-anchor="middle" font-size="12" font-weight="600" fill="#17151F">EL TOOL</text><text x="258" y="156" text-anchor="middle" font-size="11" fill="#5C5869">Airbyte, Fivetran</text>
    <rect x="356" y="16" width="384" height="272" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/><text x="372" y="38" font-size="12" font-weight="600" fill="#17151F">WAREHOUSE / LAKEHOUSE</text>
    <rect x="372" y="52" width="108" height="176" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="426" y="72" text-anchor="middle" font-size="11" font-weight="600" fill="#5C5869">RAW</text>
    <rect x="496" y="52" width="108" height="176" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="550" y="72" text-anchor="middle" font-size="11" font-weight="600" fill="#5C5869">STAGING</text>
    <rect x="620" y="52" width="108" height="176" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="674" y="72" text-anchor="middle" font-size="11" font-weight="600" fill="#5C5869">MARTS</text>
  </g>
  <g class="f" data-step="1">
    <line x1="160" y1="72" x2="192" y2="128" stroke="#531A8A" stroke-width="1.4" marker-end="url(#elt-ar)"/>
    <line x1="160" y1="142" x2="192" y2="142" stroke="#531A8A" stroke-width="1.4" marker-end="url(#elt-ar)"/>
    <line x1="160" y1="212" x2="192" y2="158" stroke="#531A8A" stroke-width="1.4" marker-end="url(#elt-ar)"/>
    <line x1="320" y1="142" x2="366" y2="142" stroke="#531A8A" stroke-width="1.4" marker-end="url(#elt-ar)"/>
    <g class="m" font-size="11" fill="#17151F">
      <rect x="380" y="90" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="388" y="107">orders</text>
      <rect x="380" y="124" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="388" y="141">charges</text>
      <rect x="380" y="158" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="388" y="175">accounts</text>
    </g>
  </g>
  <g class="f" data-step="2">
    <line x1="480" y1="140" x2="492" y2="140" stroke="#531A8A" stroke-width="1.4" marker-end="url(#elt-ar)"/>
    <g class="m" font-size="11" fill="#17151F">
      <rect x="504" y="90" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="512" y="107">stg_orders</text>
      <rect x="504" y="124" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="512" y="141">stg_charges</text>
      <rect x="504" y="158" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="512" y="175">stg_accounts</text>
    </g>
  </g>
  <g class="f" data-step="3">
    <line x1="604" y1="140" x2="616" y2="140" stroke="#531A8A" stroke-width="1.4" marker-end="url(#elt-ar)"/>
    <g class="m" font-size="11" fill="#17151F">
      <rect x="628" y="107" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="636" y="124">fct_revenue</text>
      <rect x="628" y="141" width="92" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/><text x="636" y="158">dim_customer</text>
    </g>
  </g>
  <g class="f" data-step="4">
    <path d="M426 228 C426 268, 674 268, 674 234" fill="none" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#elt-ar)"/>
    <text x="550" y="276" text-anchor="middle" class="m" font-size="11" fill="#531A8A">change logic → dbt build --full-refresh</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Three sources and one warehouse, organized in layers: <b>raw</b>, <b>staging</b> and <b>marts</b>.</li>
  <li><b>Extract + Load</b>: a connector copies tables and API objects into the raw layer <b>unchanged</b>. No business logic yet.</li>
  <li><b>Transform</b>, step one: SQL models clean and type each raw table: rename columns, cast types, drop test rows.</li>
  <li>Step two: models join staging tables into <b>marts</b>, the facts and dimensions that dashboards query.</li>
  <li>Raw data stays. When a rule changes, you <b>rebuild</b> the marts from raw with SQL. No need to touch the sources again.</li>
</ol>
{{< /fig >}}

## The modern ELT stack

- **Extract and load**: managed or open-source connectors such as Fivetran, Airbyte, dlt, Meltano or the warehouse's own ingestion (Snowpipe, BigQuery Data Transfer). For databases, connectors often use [CDC]({{< relref "../cdc" >}}) under the hood.
- **Transform**: [dbt](https://docs.getdbt.com/) or SQLMesh. Each model is a `SELECT` statement in a Git repo; the tool works out the dependency order, runs it in the warehouse, and tests the results.
- **Orchestrate**: Airflow, Dagster or Prefect trigger the load, then the transform. See [Pipeline Orchestration]({{< relref "/docs/roadmap/pipeline-orchestration" >}}).

A dbt model is just SQL:

```sql
-- models/marts/fct_revenue.sql
SELECT o.order_id, o.ordered_at::date AS order_date, c.amount_usd
FROM {{ ref('stg_orders') }} o
JOIN {{ ref('stg_charges') }} c USING (order_id)
WHERE c.status = 'succeeded'
```

## ETL vs ELT

| | ETL | ELT |
|---|---|---|
| Order | Extract → Transform → Load | Extract → Load → Transform |
| Transform engine | Separate server or cluster | The warehouse itself |
| Raw data kept | Usually not | Yes, in the raw layer |
| Change a rule | Re-extract and re-run | Re-run SQL |
| Skills needed | Spark, Python, ETL tools | Mostly SQL |
| Main risk | Rigid, slow to change | Raw PII lands in the warehouse; warehouse bill grows |

## Common mistakes

- **Treating raw as a dumping ground.** Without staging models and tests, every analyst cleans the same raw table differently.
- **Rebuilding everything on every run.** Use incremental models for large fact tables, or the warehouse bill will tell you.
- **Forgetting governance.** Raw tables contain personal data. Restrict access to the raw layer and mask in staging.
- **No tests.** Add `unique`, `not_null` and relationship tests on keys from the first model.

## Learning Resources

- [dbt documentation](https://docs.getdbt.com/docs/introduction) and the [dbt best-practice guide on project structure](https://docs.getdbt.com/best-practices/how-we-structure/1-guide-overview)
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/): Reis and Housley
- [Airbyte documentation](https://docs.airbyte.com/)
- [IBM: What is ELT?](https://www.ibm.com/topics/elt)
- [ETL vs ELT | Modern Data Architectures](https://www.youtube.com/watch?v=_Nk0v9qUWk4)
