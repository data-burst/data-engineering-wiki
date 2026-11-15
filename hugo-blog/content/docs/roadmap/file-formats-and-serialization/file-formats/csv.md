---
title: "CSV"
description: "What CSV is, how RFC 4180 quoting works, why naive comma splitting corrupts data, and how to load CSV safely with explicit types, encodings and delimiters."
---

# CSV

**CSV (comma-separated values)** is a plain-text format for tables: one record per line, fields separated by a delimiter (usually a comma), and an optional header row with column names. Every spreadsheet, database and programming language can read and write it, which is why it is still the most common way to hand data from one system to another.

```csv
order_id,city,amount,created_at
1,New York,250,2026-11-01T10:15:00Z
2,Toronto,120,2026-11-01T10:17:42Z
3,"New York, NY",450,2026-11-01T10:20:05Z
```

## How it works

There is no single CSV standard, but [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180) describes what most tools agree on:

- Records end with a line break (CRLF in the RFC, LF in practice).
- Fields are separated by commas.
- A field that contains a comma, a quote or a line break **must be wrapped in double quotes**.
- A double quote inside a quoted field is written twice: `"He said ""hi"""`.

Everything else is convention: the header row, the encoding, the delimiter, how `NULL` is written, and the date format. CSV stores **only strings**; every type is a guess made by the reader.

## Why you never split on commas

{{< fig kicker="$ sed -n 4p orders.csv | parse" title="Naive split vs a real CSV parser" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 270">
  <text x="24" y="34" class="m" font-size="11" fill="#8C8899">RAW LINE</text>
  <rect x="24" y="44" width="712" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text x="40" y="70" class="m" font-size="15" fill="#17151F">3,"New York, NY",450</text>
  <g class="f" data-step="1">
    <text x="24" y="118" class="m" font-size="11" fill="#8C8899">line.split(",")  →  4 FIELDS</text>
    <g class="m" font-size="13">
      <rect x="24" y="128" width="110" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="79" y="150" text-anchor="middle">3</text>
      <rect x="142" y="128" width="160" height="34" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/><text x="222" y="150" text-anchor="middle" fill="#C2382F">"New York</text>
      <rect x="310" y="128" width="160" height="34" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/><text x="390" y="150" text-anchor="middle" fill="#C2382F"> NY"</text>
      <rect x="478" y="128" width="110" height="34" rx="6" fill="#fff" stroke="#C2382F" stroke-width="1.4"/><text x="533" y="150" text-anchor="middle" fill="#C2382F">450</text>
    </g>
    <text x="600" y="150" font-size="12" fill="#C2382F">amount = ' NY"'</text>
  </g>
  <g class="f" data-step="2">
    <text x="24" y="196" class="m" font-size="11" fill="#8C8899">csv.reader(...)  →  3 FIELDS</text>
    <g class="m" font-size="13">
      <rect x="24" y="206" width="110" height="34" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/><text x="79" y="228" text-anchor="middle">3</text>
      <rect x="142" y="206" width="328" height="34" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/><text x="306" y="228" text-anchor="middle">New York, NY</text>
      <rect x="478" y="206" width="110" height="34" rx="6" fill="#F4EEFA" stroke="#DCC9EE" stroke-width="1.4"/><text x="533" y="228" text-anchor="middle">450</text>
    </g>
    <text x="600" y="228" font-size="12" fill="#531A8A">amount = 450</text>
  </g>
  <g class="f" data-step="3">
    <text x="24" y="262" class="m" font-size="11" fill="#5C5869">Quote inside a field is doubled:  "He said ""hi"""  →  He said "hi"</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>One order whose city contains a comma. The writer correctly wrapped it in <b>quotes</b>.</li>
  <li><b>Naive split</b> on commas gives 4 fields. Every column after the city shifts, and <b>amount</b> now holds text.</li>
  <li>A real <b>CSV parser</b> tracks quote state, so the comma inside quotes is data, not a separator.</li>
  <li>The same parser also handles <b>escaped quotes</b> and line breaks inside quoted fields.</li>
</ol>
{{< /fig >}}

## Strengths and weaknesses

| Strength | Weakness |
|---|---|
| Opens anywhere, readable by humans | No types: `007`, `1e5`, `TRUE` and dates are all guesses |
| Streams well, easy to append | No schema: a new column in the middle shifts every reader |
| Compresses well with gzip or zstd | Slow to parse; every query reads every byte |
| Universal import/export format | No standard for NULL, encoding, delimiter or nested data |

## Common mistakes

- **Splitting lines yourself.** Use the language's CSV module, DuckDB, Spark or `COPY`, never `split(",")`.
- **Trusting type inference.** Excel turns the ZIP code `02134` into the number `2134` and gene names into dates. Declare column types when loading.
- **Ignoring encoding.** Ask for UTF-8. Files from Excel often come with a byte-order mark (BOM) or as Windows-1252, which garbles accented and non-Latin text.
- **Using CSV as the storage layer.** Fine for landing files. For anything queried repeatedly, convert to [Parquet]({{< relref "parquet" >}}).
- **Empty string vs NULL.** `,,` and `,"",` may mean different things to different tools. Agree on a NULL marker.

## Load it safely

```python
import duckdb
duckdb.sql("""
  SELECT * FROM read_csv('orders.csv',
      header = true, delim = ',', quote = '"',
      columns = {'order_id': 'BIGINT', 'city': 'VARCHAR',
                 'amount': 'DECIMAL(12,2)', 'created_at': 'TIMESTAMPTZ'})
""").write_parquet('orders.parquet')
```

## Learning Resources

- [RFC 4180: Common Format and MIME Type for CSV Files](https://www.rfc-editor.org/rfc/rfc4180)
- [DuckDB: CSV import](https://duckdb.org/docs/data/csv/overview)
- [Python `csv` module](https://docs.python.org/3/library/csv.html)
- [Falsehoods programmers believe about CSVs](https://donatstudios.com/Falsehoods-Programmers-Believe-About-CSVs)
- See also: [JSON]({{< relref "json" >}}), [Parquet]({{< relref "parquet" >}})
