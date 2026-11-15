---
weight: 3
title: Data Vault
description: "Data Vault 2.0 explained: hubs, links and satellites, hash keys, insert-only loading and how new sources are added without redesign, with an animated model."
---
<div class="lx-kicker-line">$ load hub_customer link_customer_order sat_customer_crm</div>

# Data Vault

**Data Vault** is a modeling method for the integration layer of a data warehouse, created by Dan Linstedt. It splits every business concept into three kinds of tables: **hubs** hold business keys, **links** hold relationships between keys, and **satellites** hold descriptive attributes with full history. Tables are insert-only, so the vault becomes an auditable record of everything every source system ever said. The current version is **Data Vault 2.0** (with a 2.1 refresh), which adds hash keys, loading standards and a methodology around the model.

## Building a vault, one table type at a time

{{< fig kicker="$ dv model --entities customer,order" title="Hubs, links and satellites" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <g class="m" font-size="11.5">
    <rect x="40" y="130" width="190" height="84" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="54" y="150" font-size="11" font-weight="700" fill="#8C8899">HUB</text>
    <text class="m" x="54" y="168" font-size="12.5" font-weight="700" fill="#531A8A">hub_customer</text>
    <text class="m" x="54" y="186" font-size="11" fill="#5C5869">hk_customer · customer_id</text>
    <text class="m" x="54" y="202" font-size="11" fill="#5C5869">load_ts · record_source</text>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <rect x="530" y="130" width="190" height="84" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="544" y="150" font-size="11" font-weight="700" fill="#8C8899">HUB</text>
    <text class="m" x="544" y="168" font-size="12.5" font-weight="700" fill="#531A8A">hub_order</text>
    <text class="m" x="544" y="186" fill="#5C5869">hk_order · order_no</text>
    <text class="m" x="544" y="202" font-size="11" fill="#5C5869">load_ts · record_source</text>
  </g>
  <g class="f m" data-step="2" font-size="11.5">
    <line x1="230" y1="172" x2="290" y2="172" stroke="#3D3A49" stroke-width="1.4"/>
    <line x1="470" y1="172" x2="530" y2="172" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="290" y="134" width="180" height="76" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="304" y="154" font-size="11" font-weight="700" fill="#8C8899">LINK</text>
    <text class="m" x="304" y="172" font-size="12.5" font-weight="700" fill="#17151F">link_customer_order</text>
    <text class="m" x="304" y="192" fill="#5C5869">hk_link · hk_customer</text>
    <text class="m" x="304" y="206" fill="#5C5869">hk_order · load_ts</text>
  </g>
  <g class="f m" data-step="3" font-size="11.5">
    <line x1="135" y1="214" x2="135" y2="246" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="30" y="246" width="210" height="76" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="44" y="266" font-size="11" font-weight="700" fill="#8C8899">SAT · source CRM</text>
    <text class="m" x="44" y="284" font-size="12.5" font-weight="700" fill="#17151F">sat_customer_crm</text>
    <text class="m" x="44" y="302" fill="#5C5869">name · city · email</text>
    <text class="m" x="44" y="316" fill="#5C5869">load_ts · hashdiff</text>
    <line x1="625" y1="214" x2="625" y2="246" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="520" y="246" width="210" height="76" rx="6" fill="#F7F7FB" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="534" y="266" font-size="11" font-weight="700" fill="#8C8899">SAT · source shop</text>
    <text class="m" x="534" y="284" font-size="12.5" font-weight="700" fill="#17151F">sat_order_shop</text>
    <text class="m" x="534" y="302" fill="#5C5869">status · amount</text>
    <text class="m" x="534" y="316" fill="#5C5869">load_ts · hashdiff</text>
  </g>
  <g class="f m" data-step="4" font-size="11.5">
    <line x1="135" y1="98" x2="135" y2="130" stroke="#531A8A" stroke-width="1.8"/>
    <rect x="30" y="20" width="210" height="78" rx="6" fill="#fff" stroke="#531A8A" stroke-width="2.2"/>
    <text class="m" x="44" y="40" font-size="11" font-weight="700" fill="#531A8A">NEW SAT · loyalty app</text>
    <text class="m" x="44" y="58" font-size="12.5" font-weight="700" fill="#17151F">sat_customer_loyalty</text>
    <text class="m" x="44" y="76" fill="#5C5869">tier · points</text>
    <text class="m" x="44" y="90" fill="#5C5869">load_ts · hashdiff</text>
    <text class="m" x="270" y="64" font-size="12" font-weight="700" fill="#531A8A">added, nothing else changed</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A <b>hub</b> stores only the business key (customer_id) plus a hash key, load time and source. One row per customer, ever.</li>
  <li>Another hub for orders. Hubs are the stable backbone: business keys rarely change meaning.</li>
  <li>A <b>link</b> records that a customer and an order are related. Many-to-many by design, so relationship changes never force a redesign.</li>
  <li><b>Satellites</b> hang off hubs and links and hold descriptive attributes, one satellite per source. A new row is inserted only when the <b>hashdiff</b> of the attributes changes.</li>
  <li>A new source (a loyalty app) arrives. You add a <b>new satellite</b>. Existing tables and loads are untouched.</li>
</ol>
{{< /fig >}}

## Key ideas

- **Business keys first.** Hubs are keyed on what the business uses to identify things (customer number, order number), not on source system row IDs.
- **Hash keys.** Data Vault 2.0 computes keys as a hash of the business key (for example `MD5(UPPER(TRIM(customer_id)))`), so hubs, links and satellites can load **in parallel** without lookups.
- **Insert-only.** Nothing is updated or deleted. Every row carries `load_ts` and `record_source`, so you can reconstruct what was known at any point in time.
- **Raw vault vs business vault.** The raw vault stores source data as-is. Business rules (deduplication, currency conversion) live in a separate business vault layer.
- **Information marts on top.** Users don't query the vault directly. You build [star schemas]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}) or views over it for reporting.

## Data Vault vs dimensional vs 3NF

| | 3NF (Inmon) | Dimensional (Kimball) | Data Vault |
|---|---|---|---|
| Main goal | Integrated, non-redundant enterprise model | Fast, easy analytics | Auditable, adaptable integration |
| Adding a source | Often remodel tables | Often rework dimensions | Add hubs/links/satellites |
| History | Must be designed in | SCD types per dimension | Built in (insert-only satellites) |
| Query complexity | Medium | Low | High: many joins |
| Who queries it | Engineers | Analysts and BI tools | Engineers; analysts use marts |

## When to use it

Data Vault pays off when you integrate **many source systems that change often**, need a full **audit trail** (finance, insurance, regulated industries), and have a team large enough to benefit from strict, automatable patterns. Tools such as **dbt** packages (AutomateDV, datavault4dbt), WhereScape and VaultSpeed generate most of the loading code.

It is overkill for a startup with three sources and a handful of dashboards: a staging layer plus well-built star schemas is simpler and faster to deliver.

## Common mistakes

- Using source surrogate IDs as business keys, so the same customer from two systems never meets in one hub.
- One giant satellite per hub that mixes sources and change rates. Split satellites by source and by how often attributes change.
- Letting analysts query the raw vault directly. Build marts.
- Hand-writing hundreds of near-identical load jobs instead of generating them from metadata.

## Learning Resources

### Books
- [Building a Scalable Data Warehouse with Data Vault 2.0](https://www.oreilly.com/library/view/building-a-scalable/9780128026489/): Dan Linstedt and Michael Olschimke
- [Modeling the Agile Data Warehouse with Data Vault](https://www.amazon.com/Modeling-Agile-Data-Warehouse-Vault-ebook/dp/B00ITWTCF0): Hans Hultgren

### Articles and docs
- [Databricks: What is a data vault?](https://www.databricks.com/glossary/data-vault)
- [AutomateDV documentation](https://automate-dv.readthedocs.io/)
- [Practical Introduction to Data Vault Modeling](https://medium.com/@nuhad.shaabani/practical-introduction-to-data-vault-modeling-1c7fdf5b9014)

### Videos
- [Comparing 3 Types of Data Modeling (Normalized vs Star Schema vs Data Vault)](https://www.youtube.com/watch?v=qXXNhLv986I)
- [A brief introduction to Data Vault 2.0](https://www.youtube.com/watch?v=wEhDvjN7f0I&list=PLPz42gh12w04u1VKr4R5Cwbg3EvD1aZdC)
