---
weight: 2
title: Snowflake
description: "What a snowflake schema is, how normalizing dimensions into sub-tables trades extra joins for less redundancy, and when to choose it over a star schema."
---
<div class="lx-kicker-line">$ normalize dim_product --into category,department</div>

# Snowflake Schema

A **snowflake schema** is a star schema whose dimension tables are **normalized**: instead of repeating `category` and `department` text on every product row, the product dimension points to a category table, which points to a department table. The fact table stays the same; only the dimensions branch out, which gives the diagram its snowflake shape. (The name predates and has nothing to do with the Snowflake cloud warehouse.)

## From star to snowflake

{{< fig kicker="$ SELECT department, SUM(amount) ..." title="Normalizing one dimension, and what it costs a query" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 250">
  <g class="m" font-size="11.5">
    <rect x="20" y="50" width="150" height="120" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="34" y="72" font-size="12.5" font-weight="700" fill="#531A8A">FACT_SALES</text>
    <line x1="20" y1="80" x2="170" y2="80" stroke="#DCC9EE"/>
    <text class="m" x="34" y="100" fill="#5C5869">date_key</text><text class="m" x="34" y="116" fill="#5C5869">product_key</text>
    <text class="m" x="34" y="132" fill="#5C5869">store_key</text><text class="m" x="34" y="154" fill="#17151F" font-weight="700">amount</text>
    <line x1="170" y1="112" x2="225" y2="112" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="225" y="40" width="215" height="140" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="239" y="62" font-size="12.5" font-weight="700" fill="#17151F">DIM_PRODUCT</text>
    <line x1="225" y1="70" x2="440" y2="70" stroke="#E7E7EF"/>
    <g fill="#8C8899" font-size="11"><text class="m" x="239" y="88">key</text><text class="m" x="272" y="88">name</text><text class="m" x="360" y="88">category</text></g>
    <g fill="#17151F"><text class="m" x="239" y="110">1</text><text class="m" x="272" y="110">Latte</text><text class="m" x="360" y="110">Coffee</text>
      <text class="m" x="239" y="132">2</text><text class="m" x="272" y="132">Espresso</text><text class="m" x="360" y="132">Coffee</text>
      <text class="m" x="239" y="154">3</text><text class="m" x="272" y="154">Green tea</text><text class="m" x="360" y="154">Tea</text></g>
  </g>
  <g class="f m" data-step="1" font-size="11.5">
    <rect x="356" y="76" width="80" height="84" fill="#fff"/>
    <text class="m" x="360" y="88" fill="#8C8899" font-size="11">cat_key</text>
    <g fill="#531A8A" font-weight="700"><text class="m" x="360" y="110">1</text><text class="m" x="360" y="132">1</text><text class="m" x="360" y="154">2</text></g>
    <line x1="440" y1="105" x2="480" y2="105" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="480" y="50" width="130" height="110" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="494" y="72" font-size="12.5" font-weight="700" fill="#17151F">DIM_CATEGORY</text>
    <line x1="480" y1="80" x2="610" y2="80" stroke="#E7E7EF"/>
    <g fill="#8C8899" font-size="11"><text class="m" x="494" y="98">key</text><text class="m" x="524" y="98">name</text></g>
    <g fill="#17151F"><text class="m" x="494" y="120">1</text><text class="m" x="524" y="120">Coffee</text><text class="m" x="494" y="142">2</text><text class="m" x="524" y="142">Tea</text></g>
  </g>
  <g class="f m" data-step="2" font-size="11.5">
    <g fill="#8C8899" font-size="11"><text class="m" x="578" y="98">dept</text></g>
    <g fill="#531A8A" font-weight="700"><text class="m" x="578" y="120">1</text><text class="m" x="578" y="142">1</text></g>
    <line x1="610" y1="105" x2="635" y2="105" stroke="#3D3A49" stroke-width="1.4"/>
    <rect x="635" y="60" width="115" height="90" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text class="m" x="648" y="82" font-size="12" font-weight="700" fill="#17151F">DIM_DEPT</text>
    <line x1="635" y1="90" x2="750" y2="90" stroke="#E7E7EF"/>
    <text class="m" x="648" y="114" fill="#17151F">1</text><text class="m" x="664" y="114" fill="#17151F">Beverages</text>
  </g>
  <g class="f" data-step="3">
    <line x1="170" y1="112" x2="225" y2="112" stroke="#531A8A" stroke-width="3"/>
    <line x1="440" y1="105" x2="480" y2="105" stroke="#531A8A" stroke-width="3"/>
    <line x1="610" y1="105" x2="635" y2="105" stroke="#531A8A" stroke-width="3"/>
    <rect x="20" y="200" width="730" height="34" rx="6" fill="#260246"/>
    <text x="36" y="222" class="m" font-size="12" fill="#EEEAF5">fact_sales → dim_product → dim_category → dim_dept   <tspan fill="#E2B6FB" font-weight="700">3 joins (star: 1)</tspan></text>
  </g>
</svg>
<ol class="lx-caps">
  <li>In a star schema, <b>dim_product</b> repeats the category text on every product. Thousands of products, a handful of categories.</li>
  <li>Snowflaking moves categories into their own table. Products now store a <b>cat_key</b>; "Coffee" is written once.</li>
  <li>The hierarchy can keep going: categories point to <b>departments</b>. Each level is a small, clean table.</li>
  <li>The cost: "revenue by department" now walks <b>three joins</b> instead of one, and every BI user has to know the path.</li>
</ol>
{{< /fig >}}

## Star vs snowflake

| | Star | Snowflake |
|---|---|---|
| Dimension shape | One wide, denormalized table per dimension | Several normalized tables per dimension |
| Joins per query | Fewer (one hop) | More (one per hierarchy level) |
| Storage | Some repeated text | Less repetition |
| Updating a hierarchy name | Update many rows | Update one row |
| Ease for BI users | Easier | Harder |
| Typical fit | Most analytics on columnar warehouses | Large, shared hierarchies; strict integrity needs |

In columnar warehouses, repeated strings compress very well (dictionary encoding), so the storage saving of snowflaking is usually small. That is why most teams default to a star and snowflake only where it clearly helps.

## When snowflaking makes sense

- A hierarchy is **shared** by several dimensions (a geography table used by both stores and customers).
- A sub-dimension is **large or changes often** on its own (customer demographics updated monthly while names rarely change). Kimball splits such attributes into a **mini-dimension**; a secondary table referenced from a dimension is called an **outrigger**.
- The source is already normalized and a **semantic layer** hides the joins from users.

## Common mistakes

- Snowflaking for "cleanliness" and pushing join complexity onto every dashboard author.
- Forgetting that each extra join is another place for a missing key to silently drop rows (use left joins or "unknown" members).
- Confusing the schema with the Snowflake product: you can build either shape in any warehouse.

See also [Star Schema]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}) and [normalization vs denormalization]({{< relref "/docs/roadmap/distributed-systems-concepts/normalization-or-denormalization" >}}).

## Learning Resources

### Books
- [The Data Warehouse Toolkit, 3rd Edition](https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit%3A+The+Definitive+Guide+to+Dimensional+Modeling%2C+3rd+Edition-p-9781118530801): see the sections on snowflaking and outriggers
- [Data Warehousing Fundamentals for IT Professionals](https://www.oreilly.com/library/view/data-warehousing-fundamentals/9780471412540/): chapter on the snowflake schema

### Articles
- [Databricks: What is a snowflake schema?](https://www.databricks.com/glossary/snowflake-schema)
- [Kimball Group: Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)

### Videos
- [Star Schema vs Snowflake Schema](https://www.youtube.com/watch?v=huQJnr5bi_Y)
- [What is STAR schema | Star vs Snowflake Schema | Fact vs Dimension Table](https://www.youtube.com/watch?v=hQvCOBv_-LE)
