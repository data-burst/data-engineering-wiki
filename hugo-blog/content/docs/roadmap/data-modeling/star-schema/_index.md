---
weight: 1
title: Star Schema (Ralph Kimball)
description: "How a Kimball star schema works: fact tables, dimension tables, grain, surrogate keys and slowly changing dimensions, with animated examples and SQL."
---
<div class="lx-kicker-line">$ kimball --design sales_mart</div>

# Star Schema (Ralph Kimball)

A **star schema** organizes analytical data into one central **fact table** that records business events (an order line, a page view, a payment) and several **dimension tables** that describe the who, what, where and when of each event. Drawn on paper, the fact table sits in the middle and the dimensions surround it like the points of a star. It is the core of Ralph Kimball's dimensional modeling and is still the most common shape for BI-facing tables in 2026, whether they live in Snowflake, BigQuery, ClickHouse or a lakehouse.

## How it fits together

{{< fig kicker="$ SELECT ... FROM fact_sales JOIN dim_*" title="A star schema assembles around one fact table" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 400">
  <g class="m" font-size="11.5">
    <!-- fact -->
    <rect x="295" y="60" width="170" height="150" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="380" y="82" text-anchor="middle" font-size="12.5" font-weight="700" fill="#531A8A">FACT_SALES</text>
    <line x1="295" y1="90" x2="465" y2="90" stroke="#DCC9EE"/>
    <text class="m" x="310" y="108" fill="#5C5869">date_key</text>
    <text class="m" x="310" y="124" fill="#5C5869">product_key</text>
    <text class="m" x="310" y="140" fill="#5C5869">store_key</text>
    <text class="m" x="310" y="156" fill="#5C5869">customer_key</text>
    <text class="m" x="310" y="176" fill="#17151F" font-weight="700">quantity</text>
    <text class="m" x="310" y="192" fill="#17151F" font-weight="700">amount</text>
    <text class="m" x="450" y="192" text-anchor="end" fill="#8C8899">measures</text>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <line x1="200" y1="73" x2="295" y2="108" stroke="#3D3A49" stroke-width="1.4"/>
    <line x1="560" y1="73" x2="465" y2="124" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="30" y="20" width="170" height="106" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="45" y="42" font-size="12.5" font-weight="700" fill="#17151F">DIM_DATE</text>
    <line x1="30" y1="50" x2="200" y2="50" stroke="#E7E7EF"/>
    <text class="m" x="45" y="68" fill="#5C5869">date_key</text><text class="m" x="45" y="84" fill="#5C5869">date</text>
    <text class="m" x="45" y="100" fill="#5C5869">month</text><text class="m" x="45" y="116" fill="#5C5869">is_holiday</text>
    <rect x="560" y="20" width="170" height="106" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="575" y="42" font-size="12.5" font-weight="700" fill="#17151F">DIM_PRODUCT</text>
    <line x1="560" y1="50" x2="730" y2="50" stroke="#E7E7EF"/>
    <text class="m" x="575" y="68" fill="#5C5869">product_key</text><text class="m" x="575" y="84" fill="#5C5869">name</text>
    <text class="m" x="575" y="100" fill="#5C5869">category</text><text class="m" x="575" y="116" fill="#5C5869">brand</text>
  </g>
  <g class="f m" data-step="2" font-size="11.5">
    <line x1="200" y1="213" x2="295" y2="140" stroke="#3D3A49" stroke-width="1.4"/>
    <line x1="560" y1="213" x2="465" y2="156" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="30" y="160" width="170" height="106" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="45" y="182" font-size="12.5" font-weight="700" fill="#17151F">DIM_STORE</text>
    <line x1="30" y1="190" x2="200" y2="190" stroke="#E7E7EF"/>
    <text class="m" x="45" y="208" fill="#5C5869">store_key</text><text class="m" x="45" y="224" fill="#5C5869">city</text>
    <text class="m" x="45" y="240" fill="#5C5869">region</text><text class="m" x="45" y="256" fill="#5C5869">opened_on</text>
    <rect x="560" y="160" width="170" height="106" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="575" y="182" font-size="12.5" font-weight="700" fill="#17151F">DIM_CUSTOMER</text>
    <line x1="560" y1="190" x2="730" y2="190" stroke="#E7E7EF"/>
    <text class="m" x="575" y="208" fill="#5C5869">customer_key</text><text class="m" x="575" y="224" fill="#5C5869">name</text>
    <text class="m" x="575" y="240" fill="#5C5869">segment</text><text class="m" x="575" y="256" fill="#5C5869">city</text>
  </g>
  <g class="f m" data-step="3" font-size="12">
    <rect x="30" y="286" width="700" height="100" rx="6" fill="#260246"/>
    <text class="m" x="48" y="310" fill="#EEEAF5"><tspan fill="#E2B6FB">SELECT</tspan> d.month, p.category, <tspan fill="#E2B6FB">SUM</tspan>(f.amount)</text>
    <text class="m" x="48" y="329" fill="#EEEAF5"><tspan fill="#E2B6FB">FROM</tspan> fact_sales f</text>
    <text class="m" x="48" y="348" fill="#EEEAF5"><tspan fill="#E2B6FB">JOIN</tspan> dim_date d <tspan fill="#E2B6FB">USING</tspan> (date_key) <tspan fill="#E2B6FB">JOIN</tspan> dim_product p <tspan fill="#E2B6FB">USING</tspan> (product_key)</text>
    <text class="m" x="48" y="367" fill="#EEEAF5"><tspan fill="#E2B6FB">GROUP BY</tspan> d.month, p.category;</text>
  </g>
  <g class="f" data-step="4">
    <line x1="200" y1="73" x2="295" y2="108" stroke="#531A8A" stroke-width="3"/>
    <line x1="560" y1="73" x2="465" y2="124" stroke="#531A8A" stroke-width="3"/>
    <rect x="27" y="17" width="176" height="112" rx="8" fill="none" stroke="#531A8A" stroke-width="2.5"/>
    <rect x="557" y="17" width="176" height="112" rx="8" fill="none" stroke="#531A8A" stroke-width="2.5"/>
    <text x="380" y="240" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#531A8A">2 joins, 1 hop each</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The <b>fact table</b> holds one row per order line: foreign keys to dimensions plus numeric <b>measures</b> (quantity, amount). It is long and narrow.</li>
  <li><b>Dimensions</b> describe the event: when it happened and what was sold. They are short, wide and full of text you filter and group by.</li>
  <li>Add where (store) and who (customer). Every dimension connects <b>directly</b> to the fact table, which is what makes it a star.</li>
  <li>A business question becomes a predictable query: filter and group by dimension columns, aggregate fact measures.</li>
  <li>Each dimension is <b>one join away</b>. Engines recognize this pattern (star-join optimization, join filters / bloom filters) and BI tools generate it automatically.</li>
</ol>
{{< /fig >}}

## The four design steps

Kimball's process is short and still the best way to start:

1. **Pick the business process.** Sales, shipments, sign-ups. One process, one fact table.
2. **Declare the grain.** State exactly what one fact row means: "one row per order line", not "sales data". Mixing grains in one table is the most common modeling bug.
3. **Identify the dimensions.** Everything that describes a row at that grain: date, product, store, customer, promotion.
4. **Identify the facts.** The numbers measured at that grain: quantity, amount, discount.

## Facts and dimensions in detail

| | Fact table | Dimension table |
|---|---|---|
| Contains | Measures + foreign keys | Descriptive attributes |
| Shape | Billions of rows, few columns | Thousands to millions of rows, many columns |
| Changes | Append-mostly | Updated as the business changes |
| Example | `fact_sales(date_key, product_key, amount)` | `dim_product(product_key, name, category, brand)` |

Fact tables come in three main flavors:

- **Transaction facts**: one row per event (an order line). The default.
- **Periodic snapshot facts**: one row per entity per period (account balance at end of each day).
- **Accumulating snapshot facts**: one row per process instance, updated as it moves through milestones (order placed, paid, shipped, delivered).

Measures are **additive** (amount: sum across any dimension), **semi-additive** (balance: sum across accounts, not across days) or **non-additive** (ratios: recompute from parts, never sum).

Dimensions use a **surrogate key** (`product_key`, an integer or hash generated by the warehouse) instead of the source system's ID. This lets you keep history, merge several sources and handle "unknown" members with a dedicated row such as key `-1`.

## Slowly changing dimensions

Customers move, products change category. How the dimension handles change decides whether old reports stay correct. The common options:

- **Type 1, overwrite**: update the row in place. Simple, but history is rewritten: last year's sales now show the new city.
- **Type 2, add a row**: close the old version and insert a new one with its own surrogate key and validity dates. History is preserved.
- **Type 3, add a column**: keep `previous_city` next to `city`. Only one level of history.

{{< fig kicker="$ dbt snapshot --select dim_customer" title="SCD Type 2: a customer moves from New York to Toronto" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 270">
  <g class="f" data-step="1">
    <rect x="160" y="12" width="440" height="32" rx="6" fill="#F4EEFA" stroke="#DCC9EE"/>
    <text x="380" y="33" text-anchor="middle" class="m" font-size="12" fill="#531A8A" font-weight="700">source change · C-42 city = Toronto · 2026-03-01</text>
  </g>
  <g class="m" font-size="12">
    <rect x="20" y="56" width="720" height="26" rx="4" fill="#F7F7FB"/>
    <g fill="#8C8899" font-size="11" font-weight="700">
      <text class="m" x="36" y="73">CUSTOMER_KEY</text><text class="m" x="150" y="73">CUSTOMER_ID</text><text class="m" x="260" y="73">CITY</text>
      <text class="m" x="360" y="73">VALID_FROM</text><text class="m" x="480" y="73">VALID_TO</text><text class="m" x="610" y="73">IS_CURRENT</text>
    </g>
    <rect x="20" y="88" width="720" height="26" rx="4" fill="#fff" stroke="#E7E7EF"/>
    <g fill="#17151F"><text class="m" x="36" y="105">101</text><text class="m" x="150" y="105">C-42</text><text class="m" x="260" y="105">New York</text>
      <text class="m" x="360" y="105">2024-05-10</text><text class="m" x="480" y="105">9999-12-31</text><text class="m" x="610" y="105">true</text></g>
  </g>
  <g class="f m" data-step="2" font-size="12">
    <rect x="476" y="91" width="250" height="20" fill="#fff"/>
    <text class="m" x="480" y="105" fill="#531A8A" font-weight="700">2026-03-01</text><text class="m" x="610" y="105" fill="#531A8A" font-weight="700">false</text>
  </g>
  <g class="f m" data-step="3" font-size="12">
    <rect x="20" y="120" width="720" height="26" rx="4" fill="#F4EEFA" stroke="#DCC9EE"/>
    <g fill="#17151F" font-weight="700"><text class="m" x="36" y="137">205</text><text class="m" x="150" y="137">C-42</text><text class="m" x="260" y="137">Toronto</text>
      <text class="m" x="360" y="137">2026-03-01</text><text class="m" x="480" y="137">9999-12-31</text><text class="m" x="610" y="137">true</text></g>
  </g>
  <g class="f m" data-step="4" font-size="12">
    <text class="m" x="20" y="182" font-size="11" font-weight="700" fill="#8C8899">FACT_SALES</text>
    <rect x="20" y="192" width="345" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="36" y="214" fill="#17151F">order 9001 · 2026-01-15 · 80</text>
    <text class="m" x="36" y="236" fill="#531A8A" font-weight="700">customer_key 101 → New York</text>
    <rect x="395" y="192" width="345" height="56" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="411" y="214" fill="#17151F">order 9350 · 2026-04-02 · 120</text>
    <text class="m" x="411" y="236" fill="#531A8A" font-weight="700">customer_key 205 → Toronto</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Customer <b>C-42</b> has one version in the dimension, valid "forever" (9999-12-31) and flagged current. (dbt snapshots leave <code>dbt_valid_to</code> NULL instead by default; the idea is the same.)</li>
  <li>The source system reports that C-42 moved to Toronto.</li>
  <li>Type 2 does not overwrite. It <b>closes</b> the old version: <code>valid_to</code> is set and <code>is_current</code> becomes false.</li>
  <li>A <b>new row</b> with a new surrogate key (205) carries the new city from 2026-03-01 onward.</li>
  <li>Facts point to the version that was true <b>when the event happened</b>. January revenue stays in New York, April revenue goes to Toronto.</li>
</ol>
{{< /fig >}}

In practice you rarely write Type 2 logic by hand: `dbt snapshot`, Delta / Iceberg `MERGE` patterns and most ELT tools generate it.

## When to use a star schema

- BI dashboards and self-service analytics, where business users explore by dimension.
- Semantic layers (dbt Semantic Layer, Cube, LookML, Power BI models) map naturally onto facts and dimensions.
- Columnar warehouses are fast at scanning wide fact tables and joining small dimensions.

It is less suited to raw integration of many changing sources (look at [Data Vault]({{< relref "/docs/roadmap/data-modeling/data-vault" >}})) or to operational systems that need normalized writes.

Some teams now flatten a star into **one big table (OBT)** for a specific dashboard. That is fine as a final serving layer, but keep the star underneath: it is the reusable, conformed model.

## Common mistakes

- **No declared grain**, so a fact table mixes order-level and line-level rows and sums double count.
- **Using source IDs as dimension keys**, which makes history and multi-source merges painful.
- **Measures in dimensions** (for example `lifetime_revenue` in `dim_customer`) that go stale and get summed in the wrong place.
- **Not conforming dimensions**: `dim_customer` built three different ways for three marts, so numbers disagree.
- **Snowflaking everything by reflex.** Storage is cheap; extra joins cost users. See [Snowflake Schema]({{< relref "/docs/roadmap/data-modeling/snowflake" >}}).

## Learning Resources

### Books
- [The Data Warehouse Toolkit, 3rd Edition](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit%3A+The+Definitive+Guide+to+Dimensional+Modeling%2C+3rd+Edition-p-9781118530801): Ralph Kimball and Margy Ross, the canonical reference
- [Star Schema: The Complete Reference](https://www.oreilly.com/library/view/star-schema-the/9780071744324/): Christopher Adamson

### Articles and docs
- [Kimball Group: Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)
- [dbt: Snapshots (SCD Type 2)](https://docs.getdbt.com/docs/build/snapshots)
- [Databricks: What is a star schema?](https://www.databricks.com/glossary/star-schema)

### Videos
- [Data Modeling Tutorial: Star Schema (aka Kimball Approach)](https://www.youtube.com/watch?v=gRE3E7VUzRU)
- [What is STAR schema | Star vs Snowflake Schema | Fact vs Dimension Table](https://www.youtube.com/watch?v=hQvCOBv_-LE)
