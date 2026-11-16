---
title: "Data Quality"
description: "Data quality dimensions animated: completeness, uniqueness, validity, accuracy, consistency and timeliness, plus where to test, tools and data contracts."
weight: 1
---
<div class="lx-kicker-line">$ dbt build --select fct_orders   # tests run before anyone sees the data</div>

# Data Quality

**Data quality** is how well data fits the job it is used for: are all the rows there, is each one recorded once, are values allowed and true, do systems agree, and did it arrive in time? You can't improve "quality" in general, so data teams break it into **dimensions**, write each as a testable rule, and run those rules inside the pipeline. Rows that fail are stopped and reported before they reach a dashboard, a model or a customer.

## A batch through the checks

{{< fig kicker="$ soda scan -d warehouse checks/orders.yml" title="Six dimensions, one batch of orders" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 400">
  <g class="m">
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.2">
      <rect x="20" y="18" width="112" height="28" rx="14"/><rect x="142" y="18" width="112" height="28" rx="14"/><rect x="263" y="18" width="112" height="28" rx="14"/>
      <rect x="385" y="18" width="112" height="28" rx="14"/><rect x="506" y="18" width="112" height="28" rx="14"/><rect x="628" y="18" width="112" height="28" rx="14"/>
    </g>
    <g font-size="11" text-anchor="middle" fill="#5C5869">
      <text x="76" y="36">completeness</text><text x="198" y="36">uniqueness</text><text x="319" y="36">validity</text>
      <text x="441" y="36">accuracy</text><text x="562" y="36">consistency</text><text x="684" y="36">timeliness</text>
    </g>
    <g font-size="11" fill="#8C8899"><text x="30" y="74">order_id</text><text x="100" y="74">customer</text><text x="250" y="74" text-anchor="end">amount</text><text x="268" y="74">status</text></g>
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.2">
      <rect x="20" y="82" width="320" height="24" rx="3"/><rect x="20" y="108" width="320" height="24" rx="3"/><rect x="20" y="134" width="320" height="24" rx="3"/><rect x="20" y="160" width="320" height="24" rx="3"/>
      <rect x="20" y="186" width="320" height="24" rx="3"/><rect x="20" y="212" width="320" height="24" rx="3"/><rect x="20" y="238" width="320" height="24" rx="3"/><rect x="20" y="264" width="320" height="24" rx="3"/>
    </g>
    <g font-size="11.5" fill="#17151F">
      <text x="30" y="98">1001</text><text x="100" y="98">c-12</text><text x="250" y="98" text-anchor="end">40.00</text><text x="268" y="98">paid</text>
      <text x="30" y="124">1002</text><text x="100" y="124" fill="#8C8899">NULL</text><text x="250" y="124" text-anchor="end">25.50</text><text x="268" y="124">paid</text>
      <text x="30" y="150">1003</text><text x="100" y="150">c-31</text><text x="250" y="150" text-anchor="end">12.00</text><text x="268" y="150">shipped</text>
      <text x="30" y="176">1001</text><text x="100" y="176">c-12</text><text x="250" y="176" text-anchor="end">40.00</text><text x="268" y="176">paid</text>
      <text x="30" y="202">1004</text><text x="100" y="202">c-08</text><text x="250" y="202" text-anchor="end">18.20</text><text x="268" y="202">shiped</text>
      <text x="30" y="228">1005</text><text x="100" y="228">c-19</text><text x="250" y="228" text-anchor="end">990.00</text><text x="268" y="228">paid</text>
      <text x="30" y="254">1006</text><text x="100" y="254">c-77</text><text x="250" y="254" text-anchor="end">33.10</text><text x="268" y="254">paid</text>
      <text x="30" y="280">1007</text><text x="100" y="280">c-12</text><text x="250" y="280" text-anchor="end">64.90</text><text x="268" y="280">placed</text>
    </g>
  </g>
  <g class="f slide-r m" data-step="1">
    <rect x="20" y="18" width="112" height="28" rx="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="76" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">completeness</text>
    <rect x="20" y="108" width="320" height="24" rx="3" fill="#C2382F" fill-opacity="0.08" stroke="#C2382F" stroke-width="1.4"/>
    <text x="352" y="124" font-size="11" fill="#C2382F">✗ customer_id is null</text>
  </g>
  <g class="f slide-r m" data-step="2">
    <rect x="142" y="18" width="112" height="28" rx="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="198" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">uniqueness</text>
    <rect x="20" y="160" width="320" height="24" rx="3" fill="#C2382F" fill-opacity="0.08" stroke="#C2382F" stroke-width="1.4"/>
    <text x="352" y="176" font-size="11" fill="#C2382F">✗ order_id 1001 appears twice</text>
  </g>
  <g class="f slide-r m" data-step="3">
    <rect x="263" y="18" width="112" height="28" rx="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="319" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">validity</text>
    <rect x="20" y="186" width="320" height="24" rx="3" fill="#C2382F" fill-opacity="0.08" stroke="#C2382F" stroke-width="1.4"/>
    <text x="352" y="202" font-size="11" fill="#C2382F">✗ status 'shiped' not allowed</text>
  </g>
  <g class="f slide-r m" data-step="4">
    <rect x="385" y="18" width="112" height="28" rx="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="441" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">accuracy</text>
    <rect x="20" y="212" width="320" height="24" rx="3" fill="#C2382F" fill-opacity="0.08" stroke="#C2382F" stroke-width="1.4"/>
    <text x="352" y="228" font-size="11" fill="#C2382F">✗ payments system says 99.00</text>
  </g>
  <g class="f slide-r m" data-step="5">
    <rect x="506" y="18" width="112" height="28" rx="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="562" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">consistency</text>
    <rect x="20" y="238" width="320" height="24" rx="3" fill="#C2382F" fill-opacity="0.08" stroke="#C2382F" stroke-width="1.4"/>
    <text x="352" y="254" font-size="11" fill="#C2382F">✗ c-77 not in customers table</text>
  </g>
  <g class="f slide-r m" data-step="6">
    <rect x="628" y="18" width="112" height="28" rx="14" fill="#fff" stroke="#1F8A55" stroke-width="1.4"/><text x="684" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#1F8A55">timeliness ✓</text>
    <text x="740" y="74" text-anchor="end" font-size="11" fill="#1F8A55">batch landed 05:12 · SLA 06:00</text>
  </g>
  <g class="f pop m" data-step="7">
    <g fill="none" stroke="#531A8A" stroke-width="1.4">
      <rect x="20" y="82" width="320" height="24" rx="3"/><rect x="20" y="134" width="320" height="24" rx="3"/><rect x="20" y="264" width="320" height="24" rx="3"/>
    </g>
    <line class="flow" x1="150" y1="288" x2="135" y2="324" stroke="#531A8A" stroke-width="1.6"/>
    <line class="flow" x1="210" y1="288" x2="380" y2="324" stroke="#C2382F" stroke-width="1.6"/>
    <line class="flow" x1="495" y1="354" x2="510" y2="354" stroke="#C2382F" stroke-width="1.6"/>
    <circle class="pkt-dot" r="5"><animateMotion dur="1.4s" repeatCount="indefinite" path="M150 288 L135 324"/></circle>
    <circle class="pkt-dot bad" r="5"><animateMotion dur="1.8s" repeatCount="indefinite" path="M210 288 L380 324"/></circle>
    <rect x="20" y="324" width="230" height="60" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="135" y="348" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">fct_orders</text>
    <text x="135" y="368" text-anchor="middle" font-size="11" fill="#1F8A55">3 rows loaded ✓</text>
    <rect x="265" y="324" width="230" height="60" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="380" y="348" text-anchor="middle" font-size="12" font-weight="700" fill="#C2382F">quarantine.orders</text>
    <text x="380" y="368" text-anchor="middle" font-size="11" fill="#3D3A49">5 rows + failing rule</text>
    <rect class="pulse" x="510" y="324" width="230" height="60" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text x="625" y="348" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">ALERT #orders-data</text>
    <text x="625" y="368" text-anchor="middle" font-size="11" fill="#5C5869">owner: checkout team</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A batch of eight orders lands. Each check below tests one dimension and flags the rows that break its rule.</li>
  <li><b>Completeness</b>: required fields are present. Order 1002 has no customer.</li>
  <li><b>Uniqueness</b>: each order is recorded once. Order 1001 arrived twice, a typical retry or replay bug.</li>
  <li><b>Validity</b>: values match the allowed format, type or set. <code>shiped</code> is not a known status.</li>
  <li><b>Accuracy</b>: the value matches reality. Order 1005 says 990.00, but the payments system charged 99.00.</li>
  <li><b>Consistency</b>: datasets agree with each other. Customer c-77 does not exist in the customers table.</li>
  <li><b>Timeliness</b> is checked per batch, not per row: the data landed at 05:12, before the 06:00 SLA.</li>
  <li>Three clean rows load into <b>fct_orders</b>. The five bad rows go to <b>quarantine</b> with the rule they broke, and the owner gets an <b>alert</b>.</li>
</ol>
{{< /fig >}}

## The dimensions

| Dimension | Question | Example rule |
|---|---|---|
| Completeness | Is everything there? | `customer_id` is not null; today's row count is within 30% of the 7-day average |
| Uniqueness | Is each thing recorded once? | `order_id` is unique |
| Validity | Does it follow the format and allowed values? | `status` in ('placed', 'paid', 'shipped', 'cancelled'); `amount >= 0`; email matches a pattern |
| Accuracy | Is it true? | `amount` matches the payment provider's record; spot checks against the source |
| Consistency | Do datasets agree? | every `customer_id` exists in `customers`; sum of order lines equals order total |
| Timeliness / freshness | Is it recent enough to use? | `max(loaded_at)` within the last 2 hours; daily batch lands before 06:00 |

Accuracy is the hardest: a value can be complete, valid and consistent and still wrong. It usually needs a trusted reference to compare with (the source system, a ledger, a sample checked by a person). **Volume** and **distribution** checks (sudden drops in row count, a column's null rate jumping from 1% to 40%) catch the problems no one thought to write a rule for.

## Where to check

- **At ingestion**: schema, required fields, types and duplicates on raw data, as close to the source as possible. Cheapest place to catch a broken producer.
- **After transformation**: uniqueness of keys, referential integrity, business rules (revenue is never negative, totals reconcile). Joins and aggregations are where duplicates and fan-out bugs appear.
- **Before serving**: freshness, volume and reconciliation on the tables people actually read. Use **write-audit-publish**: build into a staging table or branch, run the checks, then swap it in atomically so consumers never see a bad version.

Decide what each failure does. **Blocking** checks stop the pipeline (duplicate primary keys, broken schema). **Warning** checks alert but let data through (a slightly late batch). **Quarantining** routes bad rows aside so good rows still load. Every check needs an owner who receives the alert.

## Tools

| Tool | Style | Notes |
|---|---|---|
| [dbt data tests](https://docs.getdbt.com/docs/build/data-tests) | SQL tests in the transformation project | `unique`, `not_null`, `accepted_values`, `relationships` built in; packages like dbt-expectations add more |
| [Great Expectations](https://greatexpectations.io/) | Python "expectations" | Rich rule library, data docs, works with pandas, Spark and SQL engines |
| [Soda](https://www.soda.io/) | YAML checks (SodaCL) | Readable checks run from the CLI, an orchestrator or CI |
| Monte Carlo, Elementary, Bigeye | Data observability | Learn baselines for freshness, volume and schema, and alert on anomalies without hand-written rules |
| Pipeline-native | Delta Live Tables / Lakeflow expectations, Spark checks with Deequ | Checks declared next to the transformation |

A dbt example for the figure above:

```yaml
models:
  - name: fct_orders
    columns:
      - name: order_id
        data_tests: [unique, not_null]
      - name: customer_id
        data_tests:
          - not_null
          - relationships: {to: ref('dim_customers'), field: customer_id}
      - name: status
        data_tests:
          - accepted_values: {values: ['placed', 'paid', 'shipped', 'cancelled']}
```

## Data contracts

Most bad data is created upstream, by a team that didn't know anyone depended on a column. A **data contract** is an agreement, written as code, between a producer and its consumers: the schema, the meaning of each field, quality rules, a freshness SLO and how breaking changes are announced. The producer's CI checks changes against the contract, and the pipeline enforces the rules at runtime. Contracts move quality checks to the place where problems start. The [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/) is one open format for writing them.

## Common mistakes

- **Testing only what is easy.** `not_null` on every column, nothing on business rules or reconciliation with the source.
- **Alerts no one owns.** A failing test that pings a shared channel is ignored within a week. Route each alert to an owner.
- **Checks that only warn.** If bad data still reaches the dashboard, the test only documents the problem. Block or quarantine.
- **Too many noisy checks.** Hundreds of flaky warnings train people to ignore all of them. Fewer, sharper checks win.
- **Dropping bad rows silently.** Filtering them out hides the problem and skews totals. Quarantine and count them.
- **Forgetting freshness.** A perfectly valid table that stopped updating three days ago is the most common incident of all.

## Learning Resources

### Books
- *Data Quality Fundamentals* (O'Reilly): Barr Moses, Lior Gavish and Molly Vorwerck
- [Data Contracts](https://www.oreilly.com/library/view/data-contracts/9781098157623/): Chad Sanderson, Mark Freeman and B. E. Schmidt

### Docs
- [dbt data tests](https://docs.getdbt.com/docs/build/data-tests)
- [Great Expectations documentation](https://docs.greatexpectations.io/)
- [Soda documentation](https://docs.soda.io/)

See also: [Data Governance]({{< relref "/docs/roadmap/data-governance" >}}), [DataOps]({{< relref "/docs/roadmap/cicd/dataops" >}}), [Pipeline Orchestration]({{< relref "/docs/roadmap/pipeline-orchestration" >}})
