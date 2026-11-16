---
weight: 20
title: "Pipeline Orchestration"
description: "Pipeline orchestration animated: DAGs, task dependencies, retries and backfills, plus how Airflow 3, Dagster, Prefect, Argo and Kestra compare in 2026."
bookToC: false
---
<div class="lx-kicker-line">$ airflow dags trigger sales_daily</div>

# Pipeline Orchestration

**Pipeline orchestration** is running many data tasks in the right order, on a schedule or in response to events, and dealing with what goes wrong. An orchestrator knows that the sales report can only be built after both the orders and the users tables are loaded, starts each task when its inputs are ready, retries tasks that fail, alerts someone when retries run out, and can re-run any past day on demand.

Cron can start a script at 02:00. It can't tell you that step three failed, wait for step two before starting step three, or re-run last Tuesday. That gap is what orchestrators fill.

## A DAG, run by run

Workflows are described as a **DAG** (directed acyclic graph): tasks are nodes, dependencies are arrows, and there are no cycles, so there is always a valid order to run them in.

{{< fig kicker="$ airflow dags trigger sales_daily --logical-date 2026-11-15" title="Dependencies, a retry, then a backfill" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 310">
  <defs><marker id="orc-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8C8899"/></marker></defs>
  <text x="20" y="24" class="m" font-size="11" fill="#8C8899">DAG sales_daily · @daily · run for 2026-11-15</text>
  <g stroke="#8C8899" stroke-width="1.4" fill="none" marker-end="url(#orc-ar)">
    <line x1="200" y1="67" x2="284" y2="108"/><line x1="200" y1="167" x2="284" y2="126"/>
    <line x1="470" y1="108" x2="554" y2="67"/><line x1="470" y1="126" x2="554" y2="167"/>
  </g>
  <g class="m">
    <rect x="20" y="40" width="180" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="62" font-size="12" font-weight="600" fill="#17151F">extract_orders</text><text x="34" y="82" font-size="11" fill="#8C8899">queued</text>
    <rect x="20" y="140" width="180" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="162" font-size="12" font-weight="600" fill="#17151F">extract_users</text><text x="34" y="182" font-size="11" fill="#8C8899">queued</text>
    <rect x="290" y="90" width="180" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="304" y="112" font-size="12" font-weight="600" fill="#17151F">build_sales</text><text x="304" y="132" font-size="11" fill="#8C8899">waiting on 2 upstream</text>
    <rect x="560" y="40" width="180" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="574" y="62" font-size="12" font-weight="600" fill="#17151F">refresh_dashboard</text><text x="574" y="82" font-size="11" fill="#8C8899">queued</text>
    <rect x="560" y="140" width="180" height="54" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="574" y="162" font-size="12" font-weight="600" fill="#17151F">sync_crm</text><text x="574" y="182" font-size="11" fill="#8C8899">queued</text>
  </g>
  <g class="f m" data-step="1">
    <rect x="20" y="40" width="180" height="54" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="34" y="62" font-size="12" font-weight="600" fill="#17151F">extract_orders</text><text x="34" y="82" font-size="11" fill="#531A8A">success · 2m</text>
    <rect x="20" y="140" width="180" height="54" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="34" y="162" font-size="12" font-weight="600" fill="#17151F">extract_users</text><text x="34" y="182" font-size="11" fill="#531A8A">success · 40s</text>
  </g>
  <g class="f m" data-step="2">
    <rect x="290" y="90" width="180" height="54" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.6"/><text x="304" y="112" font-size="12" font-weight="600" fill="#17151F">build_sales</text><text x="304" y="132" font-size="11" fill="#C2382F">failed · try 1 of 4</text>
    <text x="380" y="166" text-anchor="middle" font-size="11" fill="#C2382F">warehouse timeout</text>
  </g>
  <g class="f m" data-step="3">
    <rect x="290" y="90" width="180" height="54" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="304" y="112" font-size="12" font-weight="600" fill="#17151F">build_sales</text><text x="304" y="132" font-size="11" fill="#531A8A">success · try 2</text>
    <rect x="300" y="154" width="160" height="18" fill="#FBFBFE"/><text x="380" y="166" text-anchor="middle" font-size="11" fill="#5C5869">retried after 5 min</text>
  </g>
  <g class="f m" data-step="4">
    <rect x="560" y="40" width="180" height="54" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="574" y="62" font-size="12" font-weight="600" fill="#17151F">refresh_dashboard</text><text x="574" y="82" font-size="11" fill="#531A8A">success</text>
    <rect x="560" y="140" width="180" height="54" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="574" y="162" font-size="12" font-weight="600" fill="#17151F">sync_crm</text><text x="574" y="182" font-size="11" fill="#531A8A">success</text>
  </g>
  <g class="f m" data-step="5">
    <text x="20" y="236" font-size="11" fill="#8C8899">BACKFILL · same DAG, one run per past day</text>
    <g font-size="11.5" text-anchor="middle">
      <rect x="20" y="248" width="96" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="68" y="275" fill="#17151F">11-08 ✓</text>
      <rect x="124" y="248" width="96" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="172" y="275" fill="#17151F">11-09 ✓</text>
      <rect x="228" y="248" width="96" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="276" y="275" fill="#17151F">11-10 ✓</text>
      <rect x="332" y="248" width="96" height="44" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="380" y="275" fill="#17151F">11-11 ✓</text>
      <rect x="436" y="248" width="96" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="484" y="275" fill="#5C5869">11-12 run</text>
      <rect x="540" y="248" width="96" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="588" y="275" fill="#8C8899">11-13</text>
      <rect x="644" y="248" width="96" height="44" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="692" y="275" fill="#8C8899">11-14</text>
    </g>
  </g>
</svg>
<ol class="lx-caps">
  <li>Five tasks, four dependencies. The scheduler creates a <b>run</b> for the 2026-11-15 data interval. Nothing can start until its upstream tasks succeed.</li>
  <li>The two extracts have no upstream tasks, so they run <b>in parallel</b> and both succeed.</li>
  <li>build_sales starts and <b>fails</b>: the warehouse timed out. It has <b>retries = 3</b> (up to 4 tries), so nothing downstream runs and no one is paged yet.</li>
  <li>After the retry delay, try 2 <b>succeeds</b>. Transient failures heal themselves; only exhausted retries alert.</li>
  <li>Both downstream tasks were waiting on build_sales. Now they run in parallel. The run is green.</li>
  <li>A bug was fixed in build_sales. A <b>backfill</b> re-runs the DAG for each past day, each with its own data interval. This only works if every task is <b>idempotent</b>.</li>
</ol>
{{< /fig >}}

## Core concepts

- **Schedule and data interval**: a daily run for 2026-11-15 processes that day's data, even if it actually starts on the 16th or is re-run a month later. Tasks should read the logical date or data interval from the run context, never from `now()`.
- **Dependencies**: explicit task-to-task edges, or **asset/data-aware scheduling**, where a DAG runs when the table it reads has been updated (Airflow assets, Dagster software-defined assets).
- **Retries and timeouts**: retry transient errors with a delay; set a timeout so a hung task doesn't block the pipeline forever.
- **Idempotency**: running a task twice for the same interval gives the same result. Overwrite a partition or `MERGE`, never blindly `INSERT`. See [idempotent tasks](#idempotent-tasks) below.
- **Backfills and catch-up**: re-run history after a bug fix or for a new pipeline.
- **Sensors and events**: start when a file lands, a Kafka message arrives or an upstream system finishes, instead of guessing a time.
- **Observability**: run history, logs per task, durations, SLAs and alerts.

The orchestrator should **coordinate** work, not do it. Heavy lifting belongs in Spark, the warehouse, dbt or a container; the orchestrator just triggers it and watches.

## Idempotent tasks

A task is **idempotent** when running it once or ten times for the same data interval leaves the target in the same state. Orchestrators assume this: a [retry and a backfill](#a-dag-run-by-run) both simply run the task again. If the task appends, every re-run adds another copy of the day.

{{< fig kicker="$ airflow tasks clear sales_daily -t build_sales -s 2026-11-15" title="Run the same day twice: append vs overwrite" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <g class="m">
    <rect x="230" y="14" width="300" height="46" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="380" y="33" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">build_sales · 2026-11-15</text>
    <text x="380" y="51" text-anchor="middle" font-size="11" fill="#5C5869">computes 3 rows · SUM 77.50</text>
    <g stroke="#8C8899" stroke-width="1.4"><line x1="300" y1="60" x2="195" y2="76"/><line x1="460" y1="60" x2="565" y2="76"/></g>
    <rect x="20" y="76" width="350" height="248" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/>
    <rect x="390" y="76" width="350" height="248" rx="8" fill="#F7F7FB" stroke="#E7E7EF" stroke-width="1.4"/>
    <text x="30" y="98" font-size="12" font-weight="700" fill="#17151F">APPEND</text>
    <text x="30" y="116" font-size="11" fill="#5C5869">INSERT INTO sales SELECT …</text>
    <text x="400" y="98" font-size="12" font-weight="700" fill="#17151F">OVERWRITE THE PARTITION</text>
    <text x="400" y="116" font-size="11" fill="#5C5869">DELETE WHERE dt = '2026-11-15'; INSERT …</text>
    <g font-size="11" fill="#8C8899"><text x="38" y="140">order_id</text><text x="104" y="140">dt</text><text x="242" y="140" text-anchor="end">amount</text>
      <text x="408" y="140">order_id</text><text x="474" y="140">dt</text><text x="612" y="140" text-anchor="end">amount</text></g>
  </g>
  <g class="f slide-r m" data-step="1" font-size="11.5">
    <g fill="#fff" stroke="#3D3A49" stroke-width="1.2">
      <rect x="30" y="148" width="220" height="22" rx="3"/><rect x="30" y="172" width="220" height="22" rx="3"/><rect x="30" y="196" width="220" height="22" rx="3"/>
      <rect x="400" y="148" width="220" height="22" rx="3"/><rect x="400" y="172" width="220" height="22" rx="3"/><rect x="400" y="196" width="220" height="22" rx="3"/>
    </g>
    <g fill="#17151F">
      <text x="38" y="163">1001</text><text x="104" y="163">2026-11-15</text><text x="242" y="163" text-anchor="end">40.00</text>
      <text x="38" y="187">1002</text><text x="104" y="187">2026-11-15</text><text x="242" y="187" text-anchor="end">25.50</text>
      <text x="38" y="211">1003</text><text x="104" y="211">2026-11-15</text><text x="242" y="211" text-anchor="end">12.00</text>
      <text x="408" y="163">1001</text><text x="474" y="163">2026-11-15</text><text x="612" y="163" text-anchor="end">40.00</text>
      <text x="408" y="187">1002</text><text x="474" y="187">2026-11-15</text><text x="612" y="187" text-anchor="end">25.50</text>
      <text x="408" y="211">1003</text><text x="474" y="211">2026-11-15</text><text x="612" y="211" text-anchor="end">12.00</text>
    </g>
    <g font-size="11" fill="#5C5869"><text x="262" y="163">run 1 · +3</text><text x="632" y="163">run 1 · 3 rows</text></g>
  </g>
  <g class="f slide-r m" data-step="2" font-size="11.5">
    <circle class="pkt-dot bad" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M300 60 L195 76"/></circle>
    <g fill="#FCEDEB" stroke="#C2382F" stroke-width="1.2">
      <rect x="30" y="220" width="220" height="22" rx="3"/><rect x="30" y="244" width="220" height="22" rx="3"/><rect x="30" y="268" width="220" height="22" rx="3"/>
    </g>
    <g fill="#C2382F">
      <text x="38" y="235">1001</text><text x="104" y="235">2026-11-15</text><text x="242" y="235" text-anchor="end">40.00</text>
      <text x="38" y="259">1002</text><text x="104" y="259">2026-11-15</text><text x="242" y="259" text-anchor="end">25.50</text>
      <text x="38" y="283">1003</text><text x="104" y="283">2026-11-15</text><text x="242" y="283" text-anchor="end">12.00</text>
      <text x="262" y="235" font-size="11">run 2 · +3</text>
      <text x="30" y="312" font-weight="700">SUM 155.00 ✗ day counted twice</text>
    </g>
  </g>
  <g class="f pop m" data-step="3" font-size="11.5">
    <circle class="pkt-dot" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M460 60 L565 76"/></circle>
    <g fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4">
      <rect x="400" y="148" width="220" height="22" rx="3"/><rect x="400" y="172" width="220" height="22" rx="3"/><rect x="400" y="196" width="220" height="22" rx="3"/>
    </g>
    <g fill="#17151F">
      <text x="408" y="163">1001</text><text x="474" y="163">2026-11-15</text><text x="612" y="163" text-anchor="end">40.00</text>
      <text x="408" y="187">1002</text><text x="474" y="187">2026-11-15</text><text x="612" y="187" text-anchor="end">25.50</text>
      <text x="408" y="211">1003</text><text x="474" y="211">2026-11-15</text><text x="612" y="211" text-anchor="end">12.00</text>
    </g>
    <text x="632" y="211" font-size="11" fill="#531A8A">run 2 · same 3</text>
    <text x="400" y="312" font-weight="700" fill="#1F8A55">SUM 77.50 ✓ same result</text>
  </g>
  <g class="f pop m" data-step="4">
    <rect x="400" y="228" width="330" height="66" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text x="412" y="247" font-size="11.5" fill="#17151F">MERGE INTO sales t USING new s</text>
    <text x="412" y="264" font-size="11.5" fill="#17151F">ON t.order_id = s.order_id</text>
    <text x="412" y="283" font-size="11" fill="#531A8A">update if matched, else insert</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>The daily task for <b>2026-11-15</b> computes three orders worth 77.50. Two versions of it write to the same kind of table.</li>
  <li>Run 1: both tables get the same three rows. On the first run you can't tell them apart.</li>
  <li>The task is retried after a timeout, or a backfill re-runs the day. The <b>append</b> version inserts the three rows again: revenue doubles, silently.</li>
  <li>The <b>overwrite</b> version deletes the 2026-11-15 partition and writes it again, in one transaction. Still three rows, still 77.50.</li>
  <li>When rows can change or arrive late, a <b>MERGE</b> on the business key does the same job: re-running updates the same rows instead of adding new ones.</li>
</ol>
{{< /fig >}}

Ways to make a task idempotent:

- **Overwrite the partition** for the run's data interval: `INSERT OVERWRITE ... PARTITION (dt = '{{ ds }}')`, Spark's dynamic partition overwrite, or `DELETE` + `INSERT` in one transaction. The simplest and most common pattern.
- **MERGE / upsert on a key** (`order_id`) when a run touches rows across many partitions, or for late-arriving updates.
- **Derive everything from the run context**: the data interval decides which rows are read and which partition is written. A task that reads "the last 24 hours" from `now()` reads different data on every retry.
- **Deterministic file names** for file outputs (`s3://.../dt=2026-11-15/part-000.parquet`, overwritten) instead of random ones that pile up.
- **Side effects** (emails, API calls, payments) need an idempotency key or a "sent" table checked before sending.

## A minimal Airflow 3 DAG

```python
from datetime import timedelta
from airflow.sdk import dag, task

@dag(schedule="@daily", catchup=False,
     default_args={"retries": 3, "retry_delay": timedelta(minutes=5)})
def sales_daily():
    @task
    def extract_orders(): ...
    @task
    def extract_users(): ...
    @task
    def build_sales(orders, users): ...
    @task
    def refresh_dashboard(sales): ...
    @task
    def sync_crm(sales): ...

    sales = build_sales(extract_orders(), extract_users())
    refresh_dashboard(sales)
    sync_crm(sales)

sales_daily()
```

Backfill a week: `airflow backfill create --dag-id sales_daily --from-date 2026-11-08 --to-date 2026-11-14`.

One Airflow 3 detail: by default a cron schedule such as `@daily` no longer gets a one-day data interval; the run's interval is zero-length and its logical date is the moment it is scheduled. If tasks should process "the previous day" from the interval, as in Airflow 2, pass `CronDataIntervalTimetable` (from `airflow.sdk`) as the schedule or set `[scheduler] create_cron_data_intervals = True`.

## Tools in 2026

| Tool | Model | Good fit |
|---|---|---|
| [Apache Airflow](https://airflow.apache.org/) | Task DAGs in Python | The default. Huge provider ecosystem; managed as MWAA, Cloud Composer, Astronomer. Airflow 3 (2025) added DAG versioning, a new React UI, assets (renamed from datasets), the Task SDK and scheduler-managed backfills. |
| [Dagster](https://dagster.io/) | Data assets in Python | Teams who think in tables, not tasks; strong lineage, testing and dbt integration |
| [Prefect](https://www.prefect.io/) | Python functions as flows | Dynamic, Python-heavy workflows with little boilerplate |
| [Argo Workflows](https://argoproj.github.io/workflows/) | Kubernetes CRDs (YAML) | Container-native jobs, ML pipelines, teams already on Kubernetes |
| [Kestra](https://kestra.io/) | Declarative YAML | Event-driven flows, mixed-language teams |
| [Mage](https://www.mage.ai/) | Notebook-style blocks | Small teams wanting a UI-first experience |
| Cloud-native | Step Functions, Databricks Lakeflow Jobs, Azure Data Factory | Pipelines that live entirely inside one platform |

## Common mistakes

- **Doing heavy processing inside the orchestrator's workers.** It turns the scheduler into a bottleneck. Push work to the right engine.
- **Using `datetime.now()` in tasks.** Backfills then process today's data for every past day. Use the run's data interval.
- **Non-idempotent tasks**, which make retries and backfills create duplicates.
- **One giant DAG** for everything. Split by domain and connect with assets or events.
- **Alerting on every failed try.** Alert when retries are exhausted or an SLA is missed, or people learn to ignore alerts.

## Learning Resources

### Docs
- [Apache Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/index.html) and [Airflow best practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [Dagster: Software-defined assets](https://docs.dagster.io/)
- [Prefect documentation](https://docs.prefect.io/)
- [Argo Workflows documentation](https://argo-workflows.readthedocs.io/)

### Books and articles
- [Data Pipelines with Apache Airflow](https://www.manning.com/books/data-pipelines-with-apache-airflow): Harenslak and de Ruiter
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/), Chapter 2 "Orchestration" undercurrent: Reis and Housley
- [Functional Data Engineering](https://maximebeauchemin.medium.com/functional-data-engineering-a-modern-paradigm-for-batch-data-processing-2327ec32c42a): Maxime Beauchemin, creator of Airflow

### Videos
- [Airflow Tutorial for Beginners: Full Course in 2 Hours](https://www.youtube.com/watch?v=K9AnJ9_ZAXE)
- [Top 5 Open Source Data Orchestration tools](https://www.youtube.com/watch?v=8WeNYROA-Tw)

See also: [ETL]({{< relref "/docs/roadmap/data-integration/etl" >}}), [ELT]({{< relref "/docs/roadmap/data-integration/elt" >}})
