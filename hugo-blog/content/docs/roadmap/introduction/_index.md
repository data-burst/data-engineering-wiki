---
weight: -10
title: "Introduction"
description: "What data engineering is, animated: the lifecycle from source to dashboard, the five Vs, who uses data and why, and how to follow this roadmap step by step."
bookToC: false
---
<div class="lx-kicker-line">$ cat what-is-data-engineering.md</div>

# What is data engineering?

**Data engineering** is the work of building and running the systems that collect data from where it is created, store it, clean and reshape it, and deliver it to the people and programs that need it, reliably and on time. A data engineer turns scattered, messy source data (app databases, event streams, files, third-party APIs) into trustworthy tables, feeds and features that analysts, data scientists, ML models and business tools can use without thinking about where the data came from.

Put simply: every chart, report and model depends on data that someone moved, checked and organized first. That someone is the data engineer.

## The data engineering lifecycle

A useful way to see the whole job is the **data engineering lifecycle**, popularized by the book *Fundamentals of Data Engineering*. Data passes through five stages, and a set of **undercurrents** support every stage. Follow one order in an online shop through it:

{{< fig kicker="$ trace order --id 1042" title="One order, from the shop app to the dashboard" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 350">
  <defs><marker id="intro-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m">
    <rect x="16" y="56" width="112" height="64" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="72" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">GENERATION</text>
    <text x="72" y="102" text-anchor="middle" font-size="11" fill="#5C5869">app database</text>
    <text x="72" y="144" text-anchor="middle" font-size="11" fill="#17151F">order #1042</text>
    <text x="72" y="160" text-anchor="middle" font-size="11" fill="#5C5869">Alice · $59.00</text>
  </g>
  <g class="f slide-r m" data-step="1">
    <line x1="128" y1="88" x2="166" y2="88" stroke="#531A8A" stroke-width="1.4" class="flow" marker-end="url(#intro-ar)"/>
    <rect x="170" y="56" width="112" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="226" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">INGESTION</text>
    <text x="226" y="102" text-anchor="middle" font-size="11" fill="#5C5869">CDC · batch</text>
    <text x="226" y="144" text-anchor="middle" font-size="11" fill="#17151F">copied out</text>
    <text x="226" y="160" text-anchor="middle" font-size="11" fill="#5C5869">every change</text>
    <circle class="pkt-dot" r="4"><animateMotion dur="1.6s" repeatCount="indefinite" path="M128 88 H166"/></circle>
  </g>
  <g class="f slide-r m" data-step="2">
    <line x1="282" y1="88" x2="320" y2="88" stroke="#531A8A" stroke-width="1.4" class="flow" marker-end="url(#intro-ar)"/>
    <rect x="324" y="56" width="112" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="380" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">STORAGE</text>
    <text x="380" y="102" text-anchor="middle" font-size="11" fill="#5C5869">data lake</text>
    <text x="380" y="144" text-anchor="middle" font-size="11" fill="#17151F">raw, kept</text>
    <text x="380" y="160" text-anchor="middle" font-size="11" fill="#5C5869">as it landed</text>
  </g>
  <g class="f slide-r m" data-step="3">
    <line x1="436" y1="88" x2="474" y2="88" stroke="#531A8A" stroke-width="1.4" class="flow" marker-end="url(#intro-ar)"/>
    <rect x="478" y="56" width="112" height="64" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="534" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#17151F">TRANSFORM</text>
    <text x="534" y="102" text-anchor="middle" font-size="11" fill="#5C5869">SQL · Spark</text>
    <text x="534" y="144" text-anchor="middle" font-size="11" fill="#17151F">cleaned, joined</text>
    <text x="534" y="160" text-anchor="middle" font-size="11" fill="#5C5869">→ fct_orders</text>
  </g>
  <g class="f slide-r m" data-step="4">
    <line x1="590" y1="88" x2="628" y2="88" stroke="#531A8A" stroke-width="1.4" class="flow" marker-end="url(#intro-ar)"/>
    <rect x="632" y="56" width="112" height="64" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="688" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#531A8A">SERVING</text>
    <text x="688" y="102" text-anchor="middle" font-size="11" fill="#5C5869">to its users</text>
    <line x1="640" y1="120" x2="640" y2="200" stroke="#3D3A49" stroke-width="1.2"/>
    <line x1="640" y1="144" x2="652" y2="144" stroke="#3D3A49" stroke-width="1.2"/>
    <line x1="640" y1="172" x2="652" y2="172" stroke="#3D3A49" stroke-width="1.2"/>
    <line x1="640" y1="200" x2="652" y2="200" stroke="#3D3A49" stroke-width="1.2"/>
    <rect x="652" y="132" width="92" height="24" rx="4" fill="#fff" stroke="#3D3A49"/><text x="698" y="148" text-anchor="middle" font-size="11" fill="#17151F">dashboard</text>
    <rect x="652" y="160" width="92" height="24" rx="4" fill="#fff" stroke="#3D3A49"/><text x="698" y="176" text-anchor="middle" font-size="11" fill="#17151F">ML model</text>
    <rect x="652" y="188" width="92" height="24" rx="4" fill="#fff" stroke="#3D3A49"/><text x="698" y="204" text-anchor="middle" font-size="11" fill="#17151F">reverse ETL</text>
  </g>
  <g class="f pop m" data-step="5">
    <rect x="16" y="236" width="728" height="102" rx="8" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="30" y="257" font-size="12" font-weight="700" fill="#531A8A">UNDERCURRENTS</text>
    <text x="150" y="257" font-size="11" fill="#5C5869">apply to every stage above</text>
    <rect x="28" y="268" width="224" height="26" rx="4" fill="#fff" stroke="#531A8A"/><text x="140" y="285" text-anchor="middle" font-size="11.5" fill="#17151F">security</text>
    <rect x="268" y="268" width="224" height="26" rx="4" fill="#fff" stroke="#531A8A"/><text x="380" y="285" text-anchor="middle" font-size="11.5" fill="#17151F">data management</text>
    <rect x="508" y="268" width="224" height="26" rx="4" fill="#fff" stroke="#531A8A"/><text x="620" y="285" text-anchor="middle" font-size="11.5" fill="#17151F">DataOps</text>
    <rect x="28" y="302" width="224" height="26" rx="4" fill="#fff" stroke="#531A8A"/><text x="140" y="319" text-anchor="middle" font-size="11.5" fill="#17151F">data architecture</text>
    <rect x="268" y="302" width="224" height="26" rx="4" fill="#fff" stroke="#531A8A"/><text x="380" y="319" text-anchor="middle" font-size="11.5" fill="#17151F">orchestration</text>
    <rect x="508" y="302" width="224" height="26" rx="4" fill="#fff" stroke="#531A8A"/><text x="620" y="319" text-anchor="middle" font-size="11.5" fill="#17151F">software engineering</text>
  </g>
</svg>
<ol class="lx-caps">
  <li><b>Generation</b>: Alice buys a $59 item. The shop app writes order #1042 into its own database. Data engineers don't own this system, but they must understand it.</li>
  <li><b>Ingestion</b>: the order is copied out of the app database, either in nightly batches or continuously with change data capture (CDC).</li>
  <li><b>Storage</b>: the raw copy lands in a data lake or warehouse and is kept, so it can be reprocessed later.</li>
  <li><b>Transformation</b>: the raw rows are cleaned, deduplicated and joined with customers and products into a tidy <code>fct_orders</code> table.</li>
  <li><b>Serving</b>: the result feeds a sales dashboard, a recommendation model, and reverse ETL back into the CRM.</li>
  <li><b>Undercurrents</b>: security, data management, DataOps, architecture, orchestration and software engineering run under all five stages.</li>
</ol>
{{< /fig >}}

| Stage | Question it answers | Typical tools |
|---|---|---|
| Generation | Where does the data come from? | App databases, event trackers, SaaS tools, IoT devices |
| Ingestion | How do we get it out, and how often? | CDC (Debezium), Kafka, Airbyte, custom extract jobs |
| Storage | Where do we keep it, and in what format? | Object storage (S3), warehouses, lakehouse tables, Parquet |
| Transformation | How do we make it correct and useful? | SQL, dbt, Spark, Flink |
| Serving | Who uses it, and how? | BI dashboards, ML features, APIs, reverse ETL |

The **undercurrents** are what separate a pipeline that works once from one that works every day: **security** (who may see what), **data management** (quality, lineage, catalogs, governance), **DataOps** (testing, CI/CD and monitoring for data), **data architecture** (how the pieces fit and scale), **orchestration** (scheduling and dependencies between jobs) and **software engineering** (version control, code review, clean code).

## The five Vs of big data

The classic way to describe what makes data hard to handle:

| V | Meaning | Online shop example |
|---|---|---|
| **Volume** | How much data there is | Millions of orders and billions of page-view events |
| **Velocity** | How fast it arrives and must be processed | Thousands of clicks per second during a sale |
| **Variety** | How many shapes and formats it comes in | Database rows, JSON events, CSV files, product images |
| **Veracity** | How trustworthy and accurate it is | Duplicate orders, missing prices, wrong time zones |
| **Value** | Whether it is worth the effort | Better stock planning and recommendations |

You don't need all five to need a data engineer. Even a small shop with messy data from three tools has a veracity problem.

## One dataset, many questions

Several roles work with data, and they often look at the **same tables**. What differs is the question they ask and what they build:

{{< fig kicker="$ grep -r orders ./team" title="Same orders table, five different jobs" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 360">
  <g class="m">
    <rect x="16" y="112" width="184" height="136" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="30" y="136" font-size="12.5" font-weight="700" fill="#531A8A">orders</text>
    <text y="162" font-size="11" fill="#5C5869"><tspan x="30">id</tspan><tspan x="80">amount</tspan><tspan x="140">city</tspan></text>
    <line x1="30" y1="170" x2="186" y2="170" stroke="#DCC9EE"/>
    <text y="188" font-size="11" fill="#17151F"><tspan x="30">1042</tspan><tspan x="80">59.00</tspan><tspan x="140">Lyon</tspan></text>
    <text y="208" font-size="11" fill="#17151F"><tspan x="30">1043</tspan><tspan x="80">12.50</tspan><tspan x="140">Oslo</tspan></text>
    <text y="228" font-size="11" fill="#17151F"><tspan x="30">1044</tspan><tspan x="80">80.00</tspan><tspan x="140">Lima</tspan></text>
  </g>
  <g class="f slide-l m" data-step="1">
    <path d="M200 180 C220 180 220 46 240 46" fill="none" stroke="#531A8A" stroke-width="1.2" class="flow"/>
    <rect x="240" y="16" width="504" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="254" y="36" font-size="12.5" font-weight="700" fill="#531A8A">DATA ENGINEER</text>
    <text x="254" y="54" font-size="11.5" fill="#17151F">"Do all orders arrive complete and on time?"</text>
    <text x="254" y="69" font-size="11" fill="#5C5869">builds: pipelines, storage, raw → clean tables</text>
  </g>
  <g class="f slide-l m" data-step="2">
    <path d="M200 180 C220 180 220 114 240 114" fill="none" stroke="#531A8A" stroke-width="1.2" class="flow"/>
    <rect x="240" y="84" width="504" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="254" y="104" font-size="12.5" font-weight="700" fill="#531A8A">ANALYTICS ENGINEER</text>
    <text x="254" y="122" font-size="11.5" fill="#17151F">"What is our one trusted definition of revenue?"</text>
    <text x="254" y="137" font-size="11" fill="#5C5869">builds: tested SQL models (dbt), fct_orders, metrics</text>
  </g>
  <g class="f slide-l m" data-step="3">
    <path d="M200 180 C220 180 220 182 240 182" fill="none" stroke="#531A8A" stroke-width="1.2" class="flow"/>
    <rect x="240" y="152" width="504" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="254" y="172" font-size="12.5" font-weight="700" fill="#531A8A">DATA ANALYST</text>
    <text x="254" y="190" font-size="11.5" fill="#17151F">"Which cities grew last quarter, and why?"</text>
    <text x="254" y="205" font-size="11" fill="#5C5869">builds: SQL queries, dashboards, reports</text>
  </g>
  <g class="f slide-l m" data-step="4">
    <path d="M200 180 C220 180 220 250 240 250" fill="none" stroke="#531A8A" stroke-width="1.2" class="flow"/>
    <rect x="240" y="220" width="504" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="254" y="240" font-size="12.5" font-weight="700" fill="#531A8A">DATA SCIENTIST</text>
    <text x="254" y="258" font-size="11.5" fill="#17151F">"Which customers are likely to stop buying?"</text>
    <text x="254" y="273" font-size="11" fill="#5C5869">builds: experiments, statistical and predictive models</text>
  </g>
  <g class="f slide-l m" data-step="5">
    <path d="M200 180 C220 180 220 318 240 318" fill="none" stroke="#531A8A" stroke-width="1.2" class="flow"/>
    <rect x="240" y="288" width="504" height="60" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="254" y="308" font-size="12.5" font-weight="700" fill="#531A8A">ML / AI ENGINEER</text>
    <text x="254" y="326" font-size="11.5" fill="#17151F">"How do we show each shopper good picks in 50 ms?"</text>
    <text x="254" y="341" font-size="11" fill="#5C5869">builds: model serving, feature pipelines, LLM apps</text>
  </g>
  <g class="f m" data-step="6">
    <rect x="236" y="12" width="512" height="68" rx="8" fill="none" stroke="#531A8A" stroke-width="2" class="pulse"/>
    <text x="108" y="272" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">delivered by the</text>
    <text x="108" y="288" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">data engineer</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>An online shop has one <b>orders</b> table. Let's see who uses it.</li>
  <li>The <b>data engineer</b> makes sure the orders get there: complete, on time, in the right shape.</li>
  <li>The <b>analytics engineer</b> models the clean data into trusted, tested tables and shared metric definitions.</li>
  <li>The <b>data analyst</b> answers business questions with SQL and dashboards.</li>
  <li>The <b>data scientist</b> looks for patterns and builds models that predict what happens next.</li>
  <li>The <b>ML / AI engineer</b> puts models into production, where they answer in milliseconds.</li>
  <li>Every role above depends on the first one. Without reliable pipelines, the others have no data to work with.</li>
</ol>
{{< /fig >}}

Titles blur in practice: in a small company one person may do all five jobs; in a large one each is a team. Newer roles are appearing too, such as **inference engineers**, who make models cheaper and faster to run, and **forward deployed engineers**, who build data and AI solutions on site with a customer. All of them rely on the same foundations this roadmap covers.

## How to use this roadmap

The roadmap is ordered so each stage builds on the one before it. You don't have to finish a stage before peeking at the next, but the order saves time: it is hard to understand Kafka without knowing networking, or a lakehouse without knowing file formats.

1. **Foundations**: [Programming Language]({{< relref "/docs/roadmap/programming-language" >}}), [Operating System]({{< relref "/docs/roadmap/operating-system" >}}), [Networking]({{< relref "/docs/roadmap/networking" >}}), [General Software Engineering Skills]({{< relref "/docs/roadmap/general-software-engineering-skills" >}}), [Web Frameworks and API Development]({{< relref "/docs/roadmap/web-frameworks-and-api-development" >}}), [Version Control]({{< relref "/docs/roadmap/version-control-system" >}}) and [Version Control Hosting]({{< relref "/docs/roadmap/version-control-system-hosting" >}}).
2. **Distributed systems, SQL and databases**: [Distributed Systems Concepts]({{< relref "/docs/roadmap/distributed-systems-concepts" >}}), [SQL Fundamentals]({{< relref "/docs/roadmap/sql-fundamentals" >}}) and [Databases]({{< relref "/docs/roadmap/databases" >}}).
3. **Modeling, architecture and storage**: [Data Modeling]({{< relref "/docs/roadmap/data-modeling" >}}), [Data Management Architecture]({{< relref "/docs/roadmap/data-management-architecture" >}}), [Data Integration]({{< relref "/docs/roadmap/data-integration" >}}), [Storage]({{< relref "/docs/roadmap/storage" >}}), [File Formats and Serialization]({{< relref "/docs/roadmap/file-formats-and-serialization" >}}), [Query Engines]({{< relref "/docs/roadmap/query-engine" >}}) and [Data Architecture]({{< relref "/docs/roadmap/data-architecture" >}}).
4. **Processing, orchestration and governance**: [Data Processing]({{< relref "/docs/roadmap/data-processing" >}}), [Pipeline Orchestration]({{< relref "/docs/roadmap/pipeline-orchestration" >}}), [Messaging and Streaming Platforms]({{< relref "/docs/roadmap/messaging-and-streaming-platform" >}}) and [Data Governance]({{< relref "/docs/roadmap/data-governance" >}}).
5. **Visualization, infrastructure and observability**: [Data Visualization]({{< relref "/docs/roadmap/data-visualization" >}}), [Containerization]({{< relref "/docs/roadmap/containerization" >}}), [Container Orchestration]({{< relref "/docs/roadmap/container-orchestration" >}}), [CI/CD]({{< relref "/docs/roadmap/cicd" >}}), [Infrastructure as Code]({{< relref "/docs/roadmap/infrastructure-as-code" >}}) and [Observability]({{< relref "/docs/roadmap/observability" >}}).

The stages mirror what data engineering job ads actually ask for: a programming language (usually Python and SQL), databases, distributed processing (Spark, Kafka), an orchestrator, a cloud platform and containers. New to a term? Look it up in the [Glossary]({{< relref "/docs/roadmap/glossary" >}}).

## Learning Resources

### Books
- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/): Joe Reis and Matt Housley. The best place to start; the lifecycle above comes from it.
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/): Martin Kleppmann. How databases and distributed systems really work.
- [The Data Warehouse Toolkit](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/books/data-warehouse-dw-toolkit/): Ralph Kimball and Margy Ross. Dimensional modeling and star schemas.
- [Streaming Systems](https://www.oreilly.com/library/view/streaming-systems/9781491983867/): Tyler Akidau, Slava Chernyak and Reuven Lax. Watermarks, windows and exactly-once processing.
- [Data Pipelines Pocket Reference](https://www.oreilly.com/library/view/data-pipelines-pocket/9781492087823/): James Densmore. Short and practical guide to building pipelines.
- [AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/): Chip Huyen. Building applications on top of foundation models.

### Roadmap
- [DataBurst Data Engineering Roadmap on GitHub](https://github.com/data-burst/data-engineering-roadmap)
