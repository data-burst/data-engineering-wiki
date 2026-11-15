---
weight: 22
title: "Data Governance"
description: "Data governance for data engineers: ownership, quality, lineage, catalogs, access control, privacy and data contracts, and how to automate them in the pipeline."
---
<div class="lx-kicker-line">$ governance --as-code</div>

# Data Governance

**Data governance** is the set of roles, rules and processes that make sure data is **trusted, findable, secure and used legally**. In practice it answers questions like: who owns this table, what does "active customer" mean, who may see email addresses, where did this number come from, and what breaks if I change this column? For data engineers, good governance is less about committees and more about **automation built into pipelines**: tests, metadata, lineage and access policies that run on every change.

## The pillars

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Ownership</div><h4>Every dataset has an owner</h4><p>Data owners decide what data means and who may use it. Stewards keep definitions and quality in shape day to day.</p></div>
  <div class="lx-card"><div class="lab">Quality</div><h4>Measured, not assumed</h4><p>Freshness, completeness, uniqueness, validity and consistency, checked by tests on every run.</p></div>
  <div class="lx-card"><div class="lab">Metadata and lineage</div><h4>Findable and traceable</h4><p>A catalog describes each dataset; lineage shows where it came from and what depends on it.</p></div>
  <div class="lx-card"><div class="lab">Security and privacy</div><h4>Least privilege by default</h4><p>Classification of sensitive data, role- or attribute-based access, masking, retention and deletion.</p></div>
</div>

## Lineage in action: impact analysis

Lineage is the map of how data flows between tables, jobs and dashboards. Column-level lineage, collected automatically from SQL and job runs (for example via OpenLineage), turns "what breaks if I change this?" into a lookup.

{{< fig kicker="$ lineage impact orders_db.orders.amount" title="Catch a breaking change before it ships" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 290">
  <g class="m" font-size="11.5">
    <g stroke="#3D3A49" stroke-width="1.4">
      <line x1="170" y1="138" x2="210" y2="138"/><line x1="340" y1="138" x2="380" y2="138"/>
      <line x1="510" y1="138" x2="560" y2="55"/><line x1="510" y1="138" x2="560" y2="130"/><line x1="510" y1="138" x2="560" y2="205"/></g>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.4">
      <rect x="20" y="110" width="150" height="56" rx="6"/><rect x="210" y="110" width="130" height="56" rx="6"/><rect x="380" y="110" width="130" height="56" rx="6"/>
      <rect x="560" y="30" width="180" height="50" rx="6"/><rect x="560" y="105" width="180" height="50" rx="6"/><rect x="560" y="180" width="180" height="50" rx="6"/></g>
    <g font-weight="700" fill="#17151F" font-size="12">
      <text class="m" x="34" y="133">orders_db.orders</text><text class="m" x="224" y="133">stg_orders</text><text class="m" x="394" y="133">fct_orders</text>
      <text class="m" x="574" y="52">Revenue dashboard</text><text class="m" x="574" y="127">Churn model</text><text class="m" x="574" y="202">Finance export</text></g>
    <g fill="#8C8899" font-size="11">
      <text class="m" x="34" y="153">source · Postgres</text><text class="m" x="224" y="153">dbt model</text><text class="m" x="394" y="153">dbt model</text>
      <text class="m" x="574" y="70">BI</text><text class="m" x="574" y="145">ML feature job</text><text class="m" x="574" y="220">nightly CSV to ERP</text></g>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <rect x="20" y="40" width="190" height="50" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="34" y="60" font-weight="700" fill="#531A8A">PR #812 · schema change</text>
    <text class="m" x="34" y="78" fill="#3D3A49">amount → total_amount</text>
    <line x1="95" y1="90" x2="95" y2="110" stroke="#531A8A" stroke-width="1.8"/>
  </g>
  <g class="f" data-step="2">
    <g stroke="#531A8A" stroke-width="3">
      <line x1="170" y1="138" x2="210" y2="138"/><line x1="340" y1="138" x2="380" y2="138"/>
      <line x1="510" y1="138" x2="560" y2="55"/><line x1="510" y1="138" x2="560" y2="205"/></g>
    <g fill="none" stroke="#531A8A" stroke-width="2.5">
      <rect x="207" y="107" width="136" height="62" rx="8"/><rect x="377" y="107" width="136" height="62" rx="8"/>
      <rect x="557" y="27" width="186" height="56" rx="8"/><rect x="557" y="177" width="186" height="56" rx="8"/></g>
    <text x="736" y="169" text-anchor="end" class="m" font-size="11" fill="#8C8899">not affected</text>
  </g>
  <g class="f m" data-step="3" font-size="12">
    <rect x="20" y="246" width="720" height="36" rx="6" fill="#260246"/>
    <text class="m" x="36" y="269" fill="#EEEAF5"><tspan fill="#E2B6FB" font-weight="700">CI · contract check failed</tspan> · 4 downstream assets break · owners notified</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The catalog has collected <b>lineage</b>: a source table feeds two dbt models, which feed a dashboard, a model and an export.</li>
  <li>A backend engineer opens a PR that renames the source column <b>amount</b>.</li>
  <li><b>Column-level lineage</b> walks downstream: four assets read <code>amount</code>. The churn model only uses other columns, so it is not affected.</li>
  <li>A <b>data contract</b> check in CI blocks the merge and notifies the owners. The fix is planned instead of discovered on Monday morning.</li>
</ol>
{{< /fig >}}

## Data quality

Define quality as testable rules close to the data, and run them in the pipeline:

| Dimension | Example check |
|---|---|
| Freshness | `fct_orders` updated within the last 2 hours |
| Completeness | `customer_id` is never null |
| Uniqueness | `order_id` is unique |
| Validity | `status` in ('placed', 'paid', 'shipped', 'cancelled') |
| Consistency | Sum of order lines equals order total |
| Volume | Today's row count within 30% of the 7-day average |

Tools: dbt tests, Great Expectations, Soda, and data observability platforms (Monte Carlo, Elementary) that learn baselines and alert on anomalies. Failing checks should **stop** bad data from reaching consumers, not just send an email.

## Data contracts

A **data contract** is an agreement between a data producer and its consumers, written as code: schema, meaning of fields, quality rules, freshness SLO, and how breaking changes are handled. Contracts are checked in CI (like the figure above) and at runtime. They are the practical tool behind "data as a product" in [data mesh]({{< relref "/docs/roadmap/data-management-architecture/data-mesh" >}}).

## Catalog and metadata

A **data catalog** is the search engine for your data: descriptions, owners, schemas, tags, popularity, lineage and a **business glossary** of agreed definitions. Open-source options include DataHub, OpenMetadata and Unity Catalog; commercial ones include Atlan, Collibra and Alation. The catalog is only useful if metadata is collected automatically from warehouses, dbt, orchestrators and BI tools.

## Security and privacy

- **Classify** data (public, internal, confidential, PII) and tag columns, ideally with automatic detection.
- **Access control**: role-based (RBAC) or attribute-based (ABAC, for example "analysts in the EU see EU rows only"), using row filters and column masking in the warehouse or catalog.
- **Least privilege and auditing**: no shared superuser accounts; log who queried what.
- **Encryption** in transit and at rest.
- **Retention and deletion**: keep personal data only as long as needed and be able to delete one person's data everywhere, including old lakehouse snapshots and backups.
- **Regulations**: GDPR (EU), CCPA/CPRA (California), HIPAA (US health), and the EU AI Act for data used to train and run AI systems.

## Common mistakes

- Governance as a document no one reads, instead of checks that run in CI and pipelines.
- A catalog filled once by hand, then out of date in a month.
- "Owner: data team" on every table. Owners must be the people who can answer questions about meaning.
- Granting broad access because fine-grained policies feel slow, then finding PII in a public dashboard.
- Deleting rows for a GDPR request but leaving them in table snapshots, raw files and backups.

## Learning Resources

### Books
- [Data Governance: The Definitive Guide](https://www.oreilly.com/library/view/data-governance-the/9781492063483/): Eryurek, Gilad, Lakshmanan, Kibunguchy-Grant, Ashdown
- [DAMA-DMBOK: Data Management Body of Knowledge](https://www.dama.org/cpages/body-of-knowledge)
- [Data Contracts](https://www.oreilly.com/library/view/data-contracts/9781098157623/): Chad Sanderson, Mark Freeman and B. E. Schmidt
- [Data Mesh](https://www.oreilly.com/library/view/data-mesh/9781492092384/): Zhamak Dehghani, chapter on federated computational governance

### Docs and tools
- [OpenLineage](https://openlineage.io/): open standard for lineage events
- [DataHub](https://datahubproject.io/) and [OpenMetadata](https://open-metadata.org/)
- [dbt data tests](https://docs.getdbt.com/docs/build/data-tests)

### Videos
- [What is data governance? (AWS)](https://www.youtube.com/watch?v=kiYPjNj9AmU)
- [Data Governance Explained in 5 Minutes](https://www.youtube.com/watch?v=uPsUjKLHLAg)
