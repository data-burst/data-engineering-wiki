---
title: "CSV"
---
# CSV

## Introduction

**CSV (Comma-Separated Values)** is a simple file format used to store tabular data, such as a spreadsheet or database. CSV files can be easily imported into and exported from programs that store data in tables, making them a popular choice for data exchange between applications.

The format dates back to the early days of business computing and is widely used to this day. Despite the availability of more advanced technologies, CSV remains a favorite due to its simplicity and compatibility with a vast range of software.

## Structure

A CSV file consists of any number of records, separated by line breaks of some kind; each record consists of fields, separated by some other character or string, most commonly a literal comma or tab. This simple structure is what allows CSV files to be so universally compatible.

Each line of the file is a data record. Each record consists of one or more fields, separated by commas. The use of the comma as a field separator is the source of the name for this file format. However, CSV files can use delimiters other than a comma. For example, some systems use semicolons.

## Sample

Here is a simple example of a CSV file:

```csv
Name, Age, Occupation
John Doe, 35, Software Engineer
Jane Smith, 28, Data Scientist
```

In this example, each line represents a different person, and the comma-separated values on each line represent different attributes of the person (Name, Age, Occupation).

## Usecase

CSV files are commonly used for moving tabular data between two different programs. For example, they are often used as a simple method to transfer a large database between programs. 

They are also used for storing data logs or other types of structured data, due to their simplicity and wide support. Many applications allow you to import and export data in the CSV format, including spreadsheet programs like Microsoft Excel and Google Sheets, and database management systems like MySQL and PostgreSQL.

In summary, CSV is a simple, flexible, and widely supported format for data storage and transfer. Its simplicity and broad compatibility make it a popular choice for many use cases involving tabular data.