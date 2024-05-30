---
title: "JSON"
---
# JSON

## Introduction

**JSON (JavaScript Object Notation)** is a lightweight data-interchange format that is easy for humans to read and write and easy for machines to parse and generate. It is based on a subset of the JavaScript Programming Language, Standard ECMA-262 3rd Edition - December 1999.

JSON is a text format that is completely language independent but uses conventions that are familiar to programmers of the C-family of languages, including C, C++, C#, Java, JavaScript, Perl, Python, and many others. These properties make JSON an ideal data-interchange language.

## Structure

JSON is built on two structures:

- A collection of name/value pairs. In various languages, this is realized as an object, record, struct, dictionary, hash table, keyed list, or associative array.
- An ordered list of values. In most languages, this is realized as an array, vector, list, or sequence.


## Sample

Here is a basic example of a JSON object:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "isAlive": true,
  "age": 27,
  "address": {
    "streetAddress": "21 2nd Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10021-3100"
  }
}
```

## Usecase

JSON is often used when data is sent from a server to a web page. The JSON format is used for serializing and transmitting structured data over network connection. It is primarily used to transmit data between a server and web applications, serving as an alternative to XML.

JSON is also used for storing data. Many NoSQL databases, such as MongoDB, use JSON to store data.

In summary, JSON is a flexible, human-readable, and widely used format for transmitting data APIs and storing complex data structures. Its simplicity and broad compatibility make it a popular choice for many use cases involving data transmission and storage.
