---
title: "XML"
description: "XML for data engineers: elements, attributes and namespaces, XSD validation, streaming parsers for large files, and how to turn XML trees into tables."
---

# XML

**XML (eXtensible Markup Language)** is a text format that stores data as a tree of **elements** wrapped in opening and closing tags, with optional **attributes** on each tag. It is a W3C standard from 1998, and although JSON replaced it for most new APIs, data engineers still meet it constantly: bank and payment messages (ISO 20022), government and tax feeds, SOAP services, RSS, Office files (`.xlsx` and `.docx` are zipped XML) and many legacy exports.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders xmlns="https://example.com/shop/v1">
  <order id="7" currency="IRR">
    <city>Tehran</city>
    <item sku="TEA-01" qty="2"/>
    <item sku="CUP-07" qty="1"/>
    <paid>true</paid>
  </order>
</orders>
```

## Building blocks

- **Element**: `<city>Tehran</city>`. Elements nest to form the tree; there is exactly one root (`<orders>`).
- **Attribute**: `id="7"` on the opening tag. Good for short metadata; there is no hard rule about what goes in an attribute vs a child element, so every producer chooses differently.
- **Namespace**: `xmlns="..."` scopes element names so two vocabularies can mix in one document. Forgetting the namespace is the most common reason an XPath query returns nothing.
- **Schema (XSD)**: an optional XML Schema Definition that fixes structure and types. Unlike JSON, many XML feeds ship a strict XSD you can validate against.
- **XPath**: a query language for selecting nodes, for example `/orders/order[@id='7']/city`.

## Reading large XML

There are two ways to parse XML:

| Parser | How it works | Use when |
|---|---|---|
| **DOM** | Loads the whole tree into memory | Files up to a few hundred MB, random access |
| **Streaming (SAX, StAX, `iterparse`)** | Emits events as tags open and close | Multi-GB files; process one record, then discard it |

```python
from lxml import etree
ns = {"s": "https://example.com/shop/v1"}
for _, order in etree.iterparse("orders.xml", tag="{https://example.com/shop/v1}order"):
    print(order.get("id"), order.findtext("s:city", namespaces=ns))
    order.clear()          # free memory as you go
```

Spark reads XML natively since 4.0 (`spark.read.xml(path, rowTag="order")`), which is the easiest way to flatten big XML feeds into tables.

## XML vs JSON

| | XML | JSON |
|---|---|---|
| Size | Verbose: every tag is written twice | Smaller |
| Schema and validation | Mature (XSD), often provided | Optional (JSON Schema) |
| Mixed content and documents | Yes | No |
| Types | Strings unless an XSD says otherwise | A few native types |
| New APIs in 2026 | Rare | The default |

## Common mistakes

- **Ignoring namespaces** in XPath or `find()` calls, then getting empty results.
- **Loading a 5 GB file with a DOM parser** and running out of memory.
- **Parsing untrusted XML with external entities enabled.** That opens XXE attacks; use a hardened parser (`defusedxml` in Python).
- **Regex on XML.** Use a parser.

## Learning Resources

- [W3C XML 1.0 Specification](https://www.w3.org/TR/xml/)
- [XPath tutorial (MDN)](https://developer.mozilla.org/en-US/docs/Web/XML/XPath)
- [lxml documentation](https://lxml.de/)
- [Spark: XML data source](https://spark.apache.org/docs/latest/sql-data-sources-xml.html)
- [OWASP: XXE Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html)
- See also: [JSON]({{< relref "json" >}}), [CSV]({{< relref "csv" >}})
