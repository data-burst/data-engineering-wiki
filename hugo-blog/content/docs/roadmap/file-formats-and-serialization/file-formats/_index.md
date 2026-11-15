---
bookCollapseSection: true
weight: 1
title: "File Formats"
description: "Overview of the data file formats every data engineer meets: CSV, JSON, XML and Parquet, how they differ, and when each one is the right choice."
---

# File Formats

A file format decides how records are laid out on disk. Text formats (CSV, JSON, XML) are easy to open and debug but carry no reliable types and are slow to scan. Binary columnar formats (Parquet) are unreadable in a text editor but are smaller and much faster for analytics.

| Page | One-line summary |
|---|---|
| [CSV]({{< relref "csv" >}}) | Flat rows, comma-separated. Universal, but no types and full of quoting traps. |
| [JSON]({{< relref "json" >}}) | Nested key-value text. The language of APIs and event logs. |
| [XML]({{< relref "xml" >}}) | Tagged tree with optional strict schemas. Still common in finance, government and legacy systems. |
| [Parquet]({{< relref "parquet" >}}) | Columnar binary with statistics. The default storage format for analytics and lakehouses. |

A common pattern: receive CSV or JSON at the edge, then convert it to Parquet as early as possible so everything downstream is typed, compressed and fast.
