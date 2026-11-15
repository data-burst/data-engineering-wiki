---
weight: 23
title: "Data Visualization"
description: "Data visualization for data engineers: picking the right chart for the question, dashboard rules, common mistakes, and BI tools like Power BI and Superset."
---
<div class="lx-kicker-line">$ chart --for question</div>

# Data Visualization

**Data visualization** turns numbers into pictures so people can see patterns, compare values and spot problems faster than they could by reading a table. For data engineers it matters in two ways: the tables you build feed dashboards, so their shape decides what is easy to chart, and you will build plenty of charts yourself for monitoring pipelines and explaining data. A good chart answers **one question** clearly; the chart type follows from that question, not from what looks impressive.

## Start from the question

{{< fig kicker="$ chart --for question" title="Pick the chart from the question you are answering" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 252">
  <g>
    <rect x="8" y="10" width="142" height="232" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="20" y="32" class="m" font-size="11" font-weight="700" fill="#531A8A">COMPARE</text>
    <text x="20" y="54" font-size="12.5" fill="#17151F">Revenue</text><text x="20" y="70" font-size="12.5" fill="#17151F">by city?</text>
    <line x1="20" y1="196" x2="138" y2="196" stroke="#E7E7EF"/>
    <rect x="22" y="88" width="108" height="15" rx="2" fill="#531A8A"/>
    <rect x="22" y="109" width="84" height="15" rx="2" fill="#531A8A"/>
    <rect x="22" y="130" width="62" height="15" rx="2" fill="#531A8A"/>
    <rect x="22" y="151" width="44" height="15" rx="2" fill="#531A8A"/>
    <rect x="22" y="172" width="26" height="15" rx="2" fill="#531A8A"/>
    <text x="79" y="226" text-anchor="middle" class="m" font-size="11.5" font-weight="700" fill="#17151F">BAR, SORTED</text>
  </g>
  <g class="f" data-step="1">
    <rect x="158" y="10" width="142" height="232" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="170" y="32" class="m" font-size="11" font-weight="700" fill="#531A8A">TREND</text>
    <text x="170" y="54" font-size="12.5" fill="#17151F">Orders</text><text x="170" y="70" font-size="12.5" fill="#17151F">per day?</text>
    <line x1="170" y1="196" x2="288" y2="196" stroke="#E7E7EF"/>
    <polyline points="174,176 186,168 198,172 210,150 222,156 234,138 246,128 258,134 270,112 282,100" fill="none" stroke="#531A8A" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="229" y="226" text-anchor="middle" class="m" font-size="11.5" font-weight="700" fill="#17151F">LINE</text>
  </g>
  <g class="f" data-step="2">
    <rect x="308" y="10" width="142" height="232" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="320" y="32" class="m" font-size="11" font-weight="700" fill="#531A8A">PART OF WHOLE</text>
    <text x="320" y="54" font-size="12.5" fill="#17151F">Share of</text><text x="320" y="70" font-size="12.5" fill="#17151F">sales by channel?</text>
    <line x1="320" y1="196" x2="438" y2="196" stroke="#E7E7EF"/>
    <rect x="322" y="110" width="58" height="34" fill="#531A8A"/><rect x="380" y="110" width="32" height="34" fill="#3D3A49"/><rect x="412" y="110" width="24" height="34" fill="#DCC9EE"/>
    <text x="322" y="166" class="m" font-size="11" fill="#5C5869">web 52 · app 28</text><text x="322" y="182" class="m" font-size="11" fill="#5C5869">store 20 (%)</text>
    <text x="379" y="226" text-anchor="middle" class="m" font-size="11.5" font-weight="700" fill="#17151F">STACKED BAR</text>
  </g>
  <g class="f" data-step="3">
    <rect x="458" y="10" width="142" height="232" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="470" y="32" class="m" font-size="11" font-weight="700" fill="#531A8A">DISTRIBUTION</text>
    <text x="470" y="54" font-size="12.5" fill="#17151F">How are order</text><text x="470" y="70" font-size="12.5" fill="#17151F">values spread?</text>
    <line x1="470" y1="196" x2="588" y2="196" stroke="#E7E7EF"/>
    <rect x="474" y="184" width="13" height="12" fill="#531A8A"/>
    <rect x="488" y="162" width="13" height="34" fill="#531A8A"/>
    <rect x="502" y="134" width="13" height="62" fill="#531A8A"/>
    <rect x="516" y="106" width="13" height="90" fill="#531A8A"/>
    <rect x="530" y="122" width="13" height="74" fill="#531A8A"/>
    <rect x="544" y="150" width="13" height="46" fill="#531A8A"/>
    <rect x="558" y="172" width="13" height="24" fill="#531A8A"/>
    <rect x="572" y="186" width="13" height="10" fill="#531A8A"/>
    <text x="529" y="226" text-anchor="middle" class="m" font-size="11.5" font-weight="700" fill="#17151F">HISTOGRAM</text>
  </g>
  <g class="f" data-step="4">
    <rect x="608" y="10" width="142" height="232" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="620" y="32" class="m" font-size="11" font-weight="700" fill="#531A8A">RELATIONSHIP</text>
    <text x="620" y="54" font-size="12.5" fill="#17151F">Discount vs</text><text x="620" y="70" font-size="12.5" fill="#17151F">basket size?</text>
    <line x1="620" y1="196" x2="738" y2="196" stroke="#E7E7EF"/>
    <circle cx="630" cy="180" r="3.5" fill="#531A8A"/>
    <circle cx="640" cy="170" r="3.5" fill="#531A8A"/>
    <circle cx="648" cy="172" r="3.5" fill="#531A8A"/>
    <circle cx="656" cy="156" r="3.5" fill="#531A8A"/>
    <circle cx="664" cy="160" r="3.5" fill="#531A8A"/>
    <circle cx="672" cy="146" r="3.5" fill="#531A8A"/>
    <circle cx="680" cy="140" r="3.5" fill="#531A8A"/>
    <circle cx="688" cy="144" r="3.5" fill="#531A8A"/>
    <circle cx="698" cy="128" r="3.5" fill="#531A8A"/>
    <circle cx="706" cy="132" r="3.5" fill="#531A8A"/>
    <circle cx="716" cy="116" r="3.5" fill="#531A8A"/>
    <circle cx="726" cy="110" r="3.5" fill="#531A8A"/>
    <circle cx="734" cy="118" r="3.5" fill="#531A8A"/>
    <text x="679" y="226" text-anchor="middle" class="m" font-size="11.5" font-weight="700" fill="#17151F">SCATTER</text>
  </g>
</svg>
<ol class="lx-caps">
  <li><b>Compare</b> categories: a bar chart, sorted, starting at zero. Length is the easiest thing for eyes to compare.</li>
  <li><b>Trend over time</b>: a line chart, time on the x-axis. Lines show direction and change; the axis need not start at zero.</li>
  <li><b>Part of a whole</b>: a stacked bar (or a pie with at most 3 to 5 slices). Beyond that, use sorted bars.</li>
  <li><b>Distribution</b>: a histogram (or box plot) shows where most values sit and whether there are long tails. An average alone hides this.</li>
  <li><b>Relationship</b> between two measures: a scatter plot, one dot per item. Add a trend line, but remember correlation is not causation.</li>
</ol>
{{< /fig >}}

Other useful types: **tables** when people need exact values, **heatmaps** for two categorical dimensions (hour by weekday), **maps** only when geography is the point, and a single **big number** with a comparison ("1,285 orders, +8% vs last week") for KPIs.

## Rules that make charts honest and readable

- **One message per chart.** Put it in the title: "Shiraz orders doubled since March", not "Orders by city".
- **Bars start at zero.** A truncated axis makes small differences look huge.
- **Sort categories** by value unless they have a natural order (months, sizes).
- **Use color with intent.** Grey for context, one highlight color for what matters. Keep palettes colorblind-safe and don't rely on color alone.
- **No 3D, no dual y-axes** unless you have a very good reason. Both distort comparisons.
- **Label directly** on lines and bars instead of forcing readers to a legend.
- **Show uncertainty and context**: targets, last year, confidence ranges.

## Dashboards

- Put the **most important number top-left**; people read in a Z pattern.
- Design for a **specific audience and decision**: an executive weekly review, an ops team watching a pipeline, an analyst exploring.
- Keep it to a handful of charts; link to detail views instead of cramming.
- Show **data freshness** ("updated 09:12") so users know whether to trust it.
- Back every metric with a single definition, ideally in a **semantic layer** (dbt Semantic Layer, Cube, LookML, Power BI semantic models) so the same "revenue" appears everywhere.

## What data engineers should provide

- **Modeled tables** at a clear grain, usually [star schemas]({{< relref "/docs/roadmap/data-modeling/star-schema" >}}), so BI tools can filter and aggregate without custom SQL.
- **Pre-aggregated tables** for heavy dashboards, refreshed on a schedule.
- **Consistent naming** and descriptions that show up in the BI tool.
- **Freshness and quality checks** so a dashboard never silently shows yesterday's partial data.

## Tools

| Tool | Type | Strengths | Good fit |
|---|---|---|---|
| Power BI | Commercial (Microsoft, part of Fabric) | Strong modeling (DAX), Excel / Microsoft 365 integration, Copilot | Microsoft-centric organizations |
| Tableau | Commercial (Salesforce) | Very flexible visual exploration | Analysts building rich interactive views |
| Looker | Commercial (Google Cloud) | LookML semantic layer, governed metrics | Teams that want metrics defined as code |
| Apache Superset | Open source (Preset hosts it) | SQL Lab, many chart types, scales to large orgs | Self-hosted BI on a warehouse or lakehouse |
| Metabase | Open source + cloud | Very easy setup, question builder, embedding | Small teams, quick self-service, embedded analytics |
| Grafana | Open source + cloud | Time series, alerting | Operational and pipeline monitoring |
| Code-based (Evidence, Streamlit, Observable) | Open source | Version control, custom apps | Data apps and reports maintained by engineers |

The tool matters less than the model under it. Any of them will produce wrong numbers from a fact table with an undefined grain.

## Common mistakes

- Pie charts with ten slices, or 3D charts of any kind.
- A dashboard per request, until nobody knows which "revenue" is right.
- Averages without distributions: the average order is 40, but most orders are 10 and a few are 2,000.
- Querying raw event tables live from the dashboard, making every page load a full scan.
- Charts with no units, no time range and no freshness indicator.

## Learning Resources

### Books
- [Fundamentals of Data Visualization](https://clauswilke.com/dataviz/): Claus Wilke, free online
- [Storytelling with Data](https://www.storytellingwithdata.com/books): Cole Nussbaumer Knaflic
- [The Visual Display of Quantitative Information](https://www.edwardtufte.com/book/the-visual-display-of-quantitative-information/): Edward Tufte

### References
- [Financial Times Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): which chart for which relationship
- [From Data to Viz](https://www.data-to-viz.com/): decision tree for chart types
- [Tableau: What is data visualization?](https://www.tableau.com/learn/articles/data-visualization)

### Tool docs
- [Apache Superset](https://superset.apache.org/docs/intro)
- [Metabase](https://www.metabase.com/docs/latest/)
- [Power BI](https://learn.microsoft.com/en-us/power-bi/)
