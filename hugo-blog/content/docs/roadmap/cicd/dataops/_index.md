---
title: "DataOps"
description: "DataOps animated: version control, CI with data tests, deployment, monitoring and fast recovery as one loop, plus change history with git and table time travel."
weight: 1
---
<div class="lx-kicker-line">$ git switch -c fix/orders-freshness</div>

# DataOps

**DataOps** applies DevOps habits to data work: every change to pipelines, SQL models and schemas goes through **version control**, is **tested automatically** (both the code and the data it produces), is **deployed by CI/CD** through separate environments, and is **monitored** in production so problems are found by the team before users find them, and fixed fast. It is not a tool or a job title. It is a way of working that makes data changes small, frequent, safe and easy to undo.

## The loop

{{< fig kicker="$ gh pr create --title 'Add discount column to fct_orders'" title="One change, from branch to incident and back" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 310">
  <defs><marker id="dop-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8C8899"/></marker></defs>
  <g class="m">
    <g stroke="#8C8899" stroke-width="1.4" fill="none" marker-end="url(#dop-ar)">
      <line x1="170" y1="72" x2="208" y2="72"/><line x1="360" y1="72" x2="398" y2="72"/><line x1="550" y1="72" x2="588" y2="72"/>
      <line x1="665" y1="104" x2="665" y2="214"/>
      <line x1="590" y1="248" x2="552" y2="248"/><line x1="400" y1="248" x2="362" y2="248"/><line x1="210" y1="248" x2="172" y2="248"/>
      <line x1="95" y1="216" x2="95" y2="106"/>
    </g>
    <g fill="#fff" stroke="#C9C6D3" stroke-width="1.4" stroke-dasharray="4 3">
      <rect x="20" y="40" width="150" height="64" rx="6"/><rect x="210" y="40" width="150" height="64" rx="6"/><rect x="400" y="40" width="150" height="64" rx="6"/><rect x="590" y="40" width="150" height="64" rx="6"/>
      <rect x="20" y="216" width="150" height="64" rx="6"/><rect x="210" y="216" width="150" height="64" rx="6"/><rect x="400" y="216" width="150" height="64" rx="6"/><rect x="590" y="216" width="150" height="64" rx="6"/>
    </g>
    <g font-size="12" font-weight="700" fill="#8C8899" text-anchor="middle">
      <text x="95" y="62">BRANCH</text><text x="285" y="62">PULL REQUEST</text><text x="475" y="62">CI</text><text x="665" y="62">DEPLOY</text>
      <text x="665" y="238">PIPELINE RUN</text><text x="475" y="238">MONITOR</text><text x="285" y="238">ALERT</text><text x="95" y="238">FIX</text>
    </g>
    <rect x="170" y="122" width="420" height="80" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/>
    <text x="186" y="142" font-size="11" font-weight="700" fill="#5C5869">CHANGE HISTORY</text>
    <g font-size="11.5" fill="#3D3A49">
      <text x="186" y="166">git</text><text x="300" y="166">a17f</text><text x="345" y="166">3c90</text>
      <text x="186" y="188">fct_orders</text><text x="300" y="188">v40</text><text x="345" y="188">v41</text>
    </g>
  </g>
  <g class="f slide-r m" data-step="1">
    <line class="flow" x1="170" y1="72" x2="206" y2="72" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="20" y="40" width="150" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="95" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">BRANCH</text>
    <text x="95" y="80" text-anchor="middle" font-size="11" fill="#3D3A49">feat/discount</text><text x="95" y="96" text-anchor="middle" font-size="11" fill="#5C5869">edit dbt model</text>
    <rect x="210" y="40" width="150" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="285" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">PULL REQUEST</text>
    <text x="285" y="80" text-anchor="middle" font-size="11" fill="#3D3A49">PR #219</text><text x="285" y="96" text-anchor="middle" font-size="11" fill="#5C5869">code review</text>
  </g>
  <g class="f slide-r m" data-step="2">
    <line class="flow" x1="360" y1="72" x2="396" y2="72" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="400" y="40" width="150" height="64" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="475" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">CI</text>
    <text x="475" y="80" text-anchor="middle" font-size="11" fill="#3D3A49">pytest, lint ✓</text><text x="475" y="96" text-anchor="middle" font-size="11" fill="#3D3A49">dbt test on sample ✓</text>
  </g>
  <g class="f slide-r m" data-step="3">
    <line class="flow" x1="550" y1="72" x2="586" y2="72" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="590" y="40" width="150" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="665" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">DEPLOY</text>
    <text x="665" y="80" text-anchor="middle" font-size="11" fill="#3D3A49">merge → prod</text><text x="665" y="96" text-anchor="middle" font-size="11" fill="#5C5869">same artifact</text>
    <text x="390" y="166" font-size="11.5" font-weight="700" fill="#531A8A">9e2b</text>
    <text x="390" y="188" font-size="11.5" font-weight="700" fill="#531A8A">v42</text>
  </g>
  <g class="f slide-r m" data-step="4">
    <line class="flow" x1="665" y1="104" x2="665" y2="212" stroke="#531A8A" stroke-width="1.6"/>
    <circle class="pkt-dot" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M665 104 L665 214"/></circle>
    <rect x="590" y="216" width="150" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="665" y="238" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">PIPELINE RUN</text>
    <text x="665" y="256" text-anchor="middle" font-size="11" fill="#3D3A49">orders_daily</text><text x="665" y="272" text-anchor="middle" font-size="11" fill="#5C5869">02:00 · runs</text>
  </g>
  <g class="f slide-l m" data-step="5">
    <line class="flow" x1="590" y1="248" x2="554" y2="248" stroke="#531A8A" stroke-width="1.6"/>
    <rect x="400" y="216" width="150" height="64" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="475" y="238" text-anchor="middle" font-size="12" font-weight="700" fill="#C2382F">MONITOR ✗</text>
    <text x="475" y="256" text-anchor="middle" font-size="11" fill="#C2382F">discount 40% null</text><text x="475" y="272" text-anchor="middle" font-size="11" fill="#5C5869">was 0% yesterday</text>
  </g>
  <g class="f slide-l m" data-step="6">
    <line class="flow" x1="400" y1="248" x2="364" y2="248" stroke="#C2382F" stroke-width="1.6"/>
    <line class="flow" x1="210" y1="248" x2="174" y2="248" stroke="#531A8A" stroke-width="1.6"/>
    <line class="flow" x1="95" y1="216" x2="95" y2="108" stroke="#531A8A" stroke-width="1.6"/>
    <rect class="pulse" x="210" y="216" width="150" height="64" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/>
    <text x="285" y="238" text-anchor="middle" font-size="12" font-weight="700" fill="#C2382F">ALERT</text>
    <text x="285" y="256" text-anchor="middle" font-size="11" fill="#3D3A49">owner + on-call</text><text x="285" y="272" text-anchor="middle" font-size="11" fill="#5C5869">#orders-data</text>
    <rect x="20" y="216" width="150" height="64" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="95" y="238" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">FIX</text>
    <text x="95" y="256" text-anchor="middle" font-size="11" fill="#3D3A49">restore v41</text><text x="95" y="272" text-anchor="middle" font-size="11" fill="#5C5869">patch in a branch</text>
    <text x="440" y="166" font-size="11" fill="#531A8A">← git revert</text>
    <text x="440" y="188" font-size="11" fill="#531A8A">← restore to v41</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Every change goes around the same loop. Below it, two histories record what changed: the code in git, the data in table versions.</li>
  <li>An engineer adds a discount column in a <b>branch</b> and opens a <b>pull request</b> for review.</li>
  <li><b>CI</b> runs code tests and lint, then builds the changed models on a sample of production data and runs data tests on the result.</li>
  <li>After merge, the same tested artifact is <b>deployed</b>. Git gets commit 9e2b; the next write will create table version v42.</li>
  <li>The scheduled <b>pipeline run</b> picks up the new code and writes fct_orders.</li>
  <li><b>Monitoring</b> notices what the sample in CI did not: 40% of discounts are null in real data, up from 0%.</li>
  <li>An <b>alert</b> reaches the owner. The table is restored to v41 in seconds, the code is reverted, and the real fix starts in a new branch.</li>
</ol>
{{< /fig >}}

## The practices

| Practice | What it means for data | Typical tools |
|---|---|---|
| Version control | SQL, DAGs, schemas, configs and infrastructure all live in git; no edits in production | Git, GitHub/GitLab |
| Automated tests | Unit tests for code, **data tests** for outputs: keys, nulls, accepted values, reconciliation | pytest, dbt tests, Great Expectations, Soda |
| CI/CD | Every pull request is built and tested; merges deploy automatically | GitHub Actions, GitLab CI, dbt slim CI |
| Environments | Dev, CI and prod are separated; test on clones or branches of real data, not on prod | Warehouse zero-copy clones, Iceberg/Delta branches, lakeFS |
| Infrastructure as code | Warehouses, buckets, permissions and clusters are declared, reviewed and reproducible | Terraform, OpenTofu, Pulumi |
| Observability | Freshness, volume, schema and quality metrics on every table; run durations and failures per job | Orchestrator alerts, Elementary, Monte Carlo, OpenLineage |
| Fast recovery | Small changes, easy rollback of code and data, a runbook for common incidents | git revert, table time travel, backfills |

A useful scorecard is the four [DORA](https://dora.dev/) metrics applied to data: how often you deploy, how long a change takes to reach production, how often a change causes an incident, and how long it takes to recover.

## Change history: code and data

When a number looks wrong, the first question is "what changed?". DataOps answers it with two histories:

- **Code history in git.** Every model, DAG and schema change is a commit linked to a pull request, a reviewer and a CI run. `git log models/fct_orders.sql` shows who changed the logic and why; `git revert` undoes it.
- **Data history in table versions.** Lakehouse table formats keep a snapshot per write. You can list them, query the past and roll back:

```sql
-- Delta Lake
DESCRIBE HISTORY fct_orders;
SELECT * FROM fct_orders VERSION AS OF 41;
RESTORE TABLE fct_orders TO VERSION AS OF 41;

-- Apache Iceberg (Spark)
SELECT * FROM fct_orders VERSION AS OF 4348897519830128344;  -- snapshot id
CALL catalog.system.rollback_to_snapshot('db.fct_orders', 4348897519830128344);
```

Snowflake (`AT (OFFSET => -3600)`, `UNDROP TABLE`) and BigQuery (`FOR SYSTEM_TIME AS OF`) offer time travel on their native tables too. Snapshots are kept only for a retention window, and expiring them is also how deleted data really disappears, so set that window on purpose (see [Data Governance]({{< relref "/docs/roadmap/data-governance" >}})).

Together with lineage, the two histories let you answer "this table changed at 02:14 because commit 9e2b changed this join" instead of guessing.

## Common mistakes

- **Treating DataOps as a tool purchase.** An observability platform without tests in CI, owners and runbooks just produces more alerts.
- **Testing code but not data.** A model that compiles can still double revenue. Data tests in CI and in production are the core of DataOps.
- **CI on toy data only.** A hand-made fixture with five rows won't show a 40% null rate. Add a sample or clone of real data, plus production monitoring.
- **Hotfixes in production.** Editing a table or a DAG by hand breaks the history and the next deploy overwrites it. Even urgent fixes go through a branch.
- **No rollback plan for data.** Reverting code doesn't un-write bad rows. Know how you restore a table version or re-run a backfill before you need it.

## Learning Resources

- [The DataOps Manifesto](https://dataopsmanifesto.org/)
- [DORA research program](https://dora.dev/)
- [Delta Lake: table history and time travel](https://docs.delta.io/latest/delta-utility.html)
- [Apache Iceberg: Spark queries and time travel](https://iceberg.apache.org/docs/latest/spark-queries/)
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/), DataOps undercurrent: Reis and Housley

See also: [CI/CD]({{< relref "/docs/roadmap/cicd" >}}), [Observability]({{< relref "/docs/roadmap/observability" >}}), [Data Quality]({{< relref "/docs/roadmap/data-governance/data-quality" >}}), [Pipeline Orchestration]({{< relref "/docs/roadmap/pipeline-orchestration" >}})
