---
title: "XML"
---
# XML

XML (eXtensible Markup Language) is a markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable. It is a textual data format with strong support via Unicode for different human languages. Although the design of XML focuses on documents, it is widely used for the representation of arbitrary data structures such as those used in web services.

## Introduction

XML is a flexible way to create information formats and electronically share structured data via the public internet, as well as via corporate networks. Its primary purpose is to facilitate the sharing of data across different systems, particularly systems connected via the internet. Languages based on XML (for example, Geography Markup Language (GML), Physical Markup Language, SensorML, etc.) are defined in a formal way, allowing programs to modify and validate documents in these languages without prior knowledge of their form.

## Structure

An XML document has a hierarchical structure and can conceptually be interpreted as a tree known as an XML tree. It starts at a root element and branches from the root to child elements. The terms parent, child, and sibling are used to describe the relationships between elements. All elements can have sub-elements (child elements). The relationships are as follows:

- **Parent**: An element that encloses other elements.
- **Child**: An element enclosed by another element.
- **Sibling**: Elements that have the same parent.

## Sample

Here is a simple example of an XML document:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>Tove</to>
  <from>Jani</from>
  <heading>Reminder</heading>
  <body>Don't forget me this weekend!</body>
</note>
```

In this example, `<note>` is the root element, and `<to>`, `<from>`, `<heading>`, and `<body>` are child elements.

## Usecase

XML is used extensively to underpin various publishing formats, including RSS, Atom, SOAP, and XHTML. XML is also used in many aspects of web development, often to simplify data storage and sharing. If you need to share structured data between two applications, XML is a good option. It's platform-independent, so you can use it to communicate between systems running on different operating systems. It's also a great way for storing data that can be read by both humans and machines.
