---
bookCollapseSection: true
weight: 2
title: Snowflake
---

# Snowflake

## Introduction

The Snowflake Schema is a variant of the star schema where dimension tables are normalized, splitting them into additional tables. This schema reduces data redundancy and improves data integrity.

### Characteristics:

- **Normalization:** Dimension tables are normalized into multiple related tables, reducing redundancy and potentially saving storage space.
- **Complexity:** More complex joins are needed to execute queries, which can slow down query performance compared to the star schema.
- **Maintenance:** Easier to maintain due to normalization, as changes in data structure are localized to specific areas of the schema.


## Learning Resources

### Books
- [DATA WAREHOUSING FUNDAMENTALS: A Comprehensive Guide for IT Professionals (11.4. THE SNOWFLAKE SCHEMA)](https://www.oreilly.com/library/view/data-warehousing-fundamentals/9780471412540/)

### Courses
- [What is STAR schema | Star vs Snowflake Schema | Fact vs Dimension Table](https://www.youtube.com/watch?v=hQvCOBv_-LE&t=1s)
- [Star Schema vs Snowflake Schema I Data Modelling I Data Warehousing I Schema I SQL I Power BI](https://www.youtube.com/watch?v=huQJnr5bi_Y)
- [Star and SnowFlake Schema in Data Warehouse](https://www.youtube.com/watch?v=VOJ54hu2e2Q)
- [Snowflake Schema Basics](https://www.youtube.com/watch?v=RgYG-hjk1hw)

### Miscellaneous
- [What is a snowflake schema?](https://www.databricks.com/glossary/snowflake-schema)
- [Snowflake Schema in Data Warehouse Model](https://www.geeksforgeeks.org/snowflake-schema-in-data-warehouse-model/)
- [What is Snowflake Schema?](https://www.javatpoint.com/data-warehouse-what-is-snowflake-schema)