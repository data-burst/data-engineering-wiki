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
- **Idempotency**: running a task twice for the same interval gives the same result. Overwrite a partition or `MERGE`, never blindly `INSERT`.
- **Backfills and catch-up**: re-run history after a bug fix or for a new pipeline.
- **Sensors and events**: start when a file lands, a Kafka message arrives or an upstream system finishes, instead of guessing a time.
- **Observability**: run history, logs per task, durations, SLAs and alerts.

The orchestrator should **coordinate** work, not do it. Heavy lifting belongs in Spark, the warehouse, dbt or a container; the orchestrator just triggers it and watches.

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
