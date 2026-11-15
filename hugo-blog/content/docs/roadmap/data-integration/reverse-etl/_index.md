---
weight: 4
title: Reverse ETL
description: "Reverse ETL animated: how modeled warehouse data is diffed and synced into CRMs, ad platforms and support tools, plus API limits, keys and common pitfalls."
bookToC: false
---
<div class="lx-kicker-line">$ hightouch sync run customer_360_to_crm</div>

# Reverse ETL

**Reverse ETL** copies modeled data **out of** the data warehouse and **into** the operational tools people work in every day: the CRM, the marketing platform, the ad network, the support desk. Regular [ETL]({{< relref "../etl" >}}) and [ELT]({{< relref "../elt" >}}) bring data into the warehouse for analysis; reverse ETL sends the results of that analysis back out, so a salesperson sees a customer's lifetime value in Salesforce instead of in a dashboard they never open.

The pattern is also called **data activation** or **operational analytics**, and it is a core feature of composable customer data platforms (CDPs).

## How a sync works

{{< fig kicker="$ hightouch sync run customer_360_to_crm" title="Warehouse model to CRM, only what changed" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 290">
  <defs><marker id="retl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m">
    <rect x="20" y="30" width="280" height="190" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="36" y="54" font-size="12" font-weight="600" fill="#17151F">WAREHOUSE · customer_360</text>
    <g font-size="11" fill="#8C8899"><text x="36" y="80">email</text><text x="150" y="80">ltv</text><text x="206" y="80">segment</text></g>
    <line x1="30" y1="88" x2="290" y2="88" stroke="#E7E7EF"/>
    <g font-size="11.5" fill="#3D3A49">
      <text x="36" y="110">alice@</text><text x="150" y="110">900</text><text x="206" y="110">regular</text>
      <text x="36" y="136">sam@</text><text x="150" y="136">300</text><text x="206" y="136">regular</text>
      <text x="36" y="162">ryan@</text><text x="150" y="162">120</text><text x="206" y="162">regular</text>
    </g>
    <rect x="530" y="30" width="210" height="190" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="546" y="54" font-size="12" font-weight="600" fill="#17151F">CRM · contacts</text>
    <g font-size="11" fill="#8C8899"><text x="546" y="80">email</text><text x="636" y="80">segment</text></g>
    <line x1="540" y1="88" x2="730" y2="88" stroke="#E7E7EF"/>
    <g font-size="11.5" fill="#3D3A49">
      <text x="546" y="110">alice@</text><text x="636" y="110">regular</text>
      <text x="546" y="136">sam@</text><text x="636" y="136">regular</text>
      <text x="546" y="162">ryan@</text><text x="636" y="162">regular</text>
    </g>
  </g>
  <g class="f m" data-step="1">
    <rect x="28" y="96" width="264" height="20" rx="3" fill="#F4EEFA"/>
    <g font-size="11.5" fill="#531A8A"><text x="36" y="110">alice@</text><text x="150" y="110">1300</text><text x="206" y="110">VIP</text></g>
    <rect x="28" y="174" width="264" height="20" rx="3" fill="#F4EEFA"/>
    <g font-size="11.5" fill="#531A8A"><text x="36" y="188">maya@</text><text x="150" y="188">2100</text><text x="206" y="188">VIP</text></g>
    <text x="36" y="212" font-size="11" fill="#8C8899">refreshed by dbt at 06:00</text>
  </g>
  <g class="f m" data-step="2">
    <rect x="340" y="80" width="150" height="90" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="415" y="104" text-anchor="middle" font-size="12" font-weight="600" fill="#17151F">SYNC ENGINE</text>
    <text x="415" y="128" text-anchor="middle" font-size="11" fill="#5C5869">diff vs last run</text>
    <text x="415" y="150" text-anchor="middle" font-size="11.5" fill="#531A8A">2 changed · 2 same</text>
    <line x1="300" y1="125" x2="334" y2="125" stroke="#531A8A" stroke-width="1.4" marker-end="url(#retl-ar)"/>
  </g>
  <g class="f m" data-step="3">
    <line x1="490" y1="125" x2="524" y2="125" stroke="#531A8A" stroke-width="1.4" marker-end="url(#retl-ar)"/>
    <text x="415" y="196" text-anchor="middle" font-size="11" fill="#531A8A">upsert by email</text>
    <text x="415" y="212" text-anchor="middle" font-size="11" fill="#531A8A">2 records sent, not 4</text>
    <rect x="538" y="96" width="194" height="20" rx="3" fill="#F4EEFA"/>
    <g font-size="11.5" fill="#531A8A"><text x="546" y="110">alice@</text><text x="636" y="110">VIP</text></g>
    <rect x="538" y="174" width="194" height="20" rx="3" fill="#F4EEFA"/>
    <g font-size="11.5" fill="#531A8A"><text x="546" y="188">maya@</text><text x="636" y="188">VIP</text></g>
  </g>
  <g class="f" data-step="4">
    <rect x="20" y="236" width="720" height="40" rx="6" fill="#260246"/>
    <text x="380" y="261" text-anchor="middle" font-size="13" fill="#EEEAF5">Sales sees "VIP" on Alice's contact; a CRM workflow assigns an account manager.</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>A <b>customer_360</b> model in the warehouse and the CRM's contact list. Right now they agree.</li>
  <li>The nightly dbt run updates the model: Alice crossed the <b>VIP</b> threshold and Maya is a new customer.</li>
  <li>The sync engine compares the model with what it sent last time. Only <b>2 of 4 rows</b> changed.</li>
  <li>It <b>upserts</b> just those rows through the CRM's API, matched on a stable key (email or CRM id), within the API's rate limits.</li>
  <li>The insight now lives where the work happens. No one has to open a dashboard.</li>
</ol>
{{< /fig >}}

## Why not just call the API from a script?

You can, and for one field it works. A reverse ETL tool, or a well-built script, has to solve the same problems:

- **Diffing**: send only rows that changed, or you will burn API quotas and overwrite edits made in the CRM.
- **Identity mapping**: match warehouse rows to CRM records (email, external ID, CRM object ID) and decide what to do with duplicates.
- **Rate limits and batching**: Salesforce, HubSpot and ad platforms all cap calls per second and per day.
- **Partial failures**: one invalid email must not fail the other 9,999 records. Failed rows need a log and a retry.
- **Field mapping and types**: picklists, required fields, date formats and custom objects differ per destination.

## Typical use cases

| Team | Data synced | Destination |
|---|---|---|
| Sales | Lifetime value, product usage, lead score | Salesforce, HubSpot |
| Marketing | Audiences such as "churn risk" or "bought twice" | Braze, Iterable, Google and Meta Ads |
| Support | Plan, open invoices, VIP flag | Zendesk, Intercom |
| Product / finance | Usage-based billing quantities | Stripe, internal services |

## Common mistakes

- **No owner for synced fields.** If both the CRM user and the sync can edit `segment`, they will overwrite each other. Make synced fields read-only in the destination.
- **Syncing raw tables.** Sync from tested, documented models with a primary key, not from raw data.
- **Full syncs every run.** They are slow, expensive and can trigger thousands of CRM workflows at once.
- **Treating it as real time.** Reverse ETL is usually batch (minutes to hours). If a feature must react in seconds, it needs an event stream, not a warehouse sync.

## Tools in 2026

Hightouch, Census (acquired by Fivetran in 2025), RudderStack and Segment Reverse ETL are the common managed options. The DIY route is a scheduled job (Airflow, Dagster) that diffs a model against the last snapshot and calls the destination's bulk API.

## Learning Resources

- [Fundamentals of Data Engineering](https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/), Chapter 9 "Serving Data for Analytics, Machine Learning, and Reverse ETL"
- [Hightouch: What is Reverse ETL?](https://hightouch.com/blog/reverse-etl)
- [Segment: What is reverse ETL?](https://segment.com/blog/reverse-etl/)
- [What is Reverse ETL? (Explained by the Creator)](https://www.youtube.com/watch?v=G_aq03cSa8Y)

See also: [ELT]({{< relref "../elt" >}}), [CDC]({{< relref "../cdc" >}})
