---
title: "Python"
description: "Python for data engineering in 2026: the libraries that matter (Polars, DuckDB, PySpark, Airflow, dbt), uv for packaging, typing, performance and the GIL."
weight: 1
---

# Python

**Python** is a high-level, dynamically typed, interpreted language known for readable syntax and a huge library ecosystem. It is the default language of data engineering: orchestrators (Airflow, Dagster, Prefect) are configured in Python, Spark and Flink expose Python APIs, and most ingestion scripts, data tests and ML handoffs are written in it. If you learn one general-purpose language for data work, make it Python.

## What Python is used for in data engineering

| Task | Libraries and tools |
|---|---|
| Orchestration | Apache Airflow (3.x), Dagster, Prefect |
| Transformation in SQL, managed from Python | dbt Core, SQLMesh |
| DataFrames on one machine | **Polars**, **DuckDB**, pandas |
| Distributed processing | PySpark, Ray, Dask, PyFlink |
| Ingestion and connectors | dlt, Airbyte connectors, `requests` / `httpx`, cloud SDKs (boto3, google-cloud) |
| Columnar data and files | PyArrow (Parquet, Arrow Flight), fsspec |
| Data quality and validation | Great Expectations, Soda, Pandera, Pydantic |
| Databases | psycopg, SQLAlchemy, Kafka clients (confluent-kafka) |

```python
import polars as pl

# Lazy query: Polars plans the work, reads only needed columns and pushes filters into Parquet
daily = (
    pl.scan_parquet("s3://acme-lake/orders/*.parquet")
      .filter(pl.col("status") == "paid")
      .group_by(pl.col("created_at").dt.date().alias("day"))
      .agg(pl.col("amount").sum().alias("revenue"))
      .sort("day")
      .collect()
)
```

## How Python performs, honestly

Pure Python loops are slow: often 10 to 100 times slower than compiled code. Data engineering works around this by keeping Python as the **control layer** and doing heavy work in native engines: Polars and DuckDB (Rust and C++), Arrow, NumPy, or the JVM under PySpark. Vectorized DataFrame or SQL operations are fast; `for row in df.iterrows()` is not.

The **Global Interpreter Lock (GIL)** lets only one thread run Python bytecode at a time, so CPU-bound threads do not run in parallel. Workarounds: multiprocessing, native libraries that release the GIL, or async for I/O-bound work. Since Python 3.13 there is an optional **free-threaded** build without the GIL (officially supported from 3.14), but library support is still catching up, so check before relying on it.

## Modern tooling

- **uv** (from Astral, written in Rust) has become the go-to tool for installing Python, creating virtual environments and locking dependencies, replacing a mix of pip, venv, pip-tools and pyenv. Poetry and plain pip remain common.
- **ruff** for linting and formatting; **mypy** or **pyright** for type checking.
- **Type hints** and **Pydantic** models make pipeline code and configs safer to change.
- `pyproject.toml` is the standard place for project metadata and tool configuration.

## Common mistakes

- **Loading everything into pandas.** A 20 GB CSV will not fit in 16 GB of RAM. Use Polars or DuckDB lazy scans, or process in chunks.
- **Row-by-row logic** where a vectorized expression or SQL would do.
- **Unpinned dependencies.** A new library release breaks the nightly job. Commit a lock file.
- **Mutable default arguments** (`def f(rows=[])`): the list is shared across calls.
- **Mixing system Python and project dependencies.** Always use a virtual environment or a container.

## Learning Resources

### Official

- [The Python Tutorial](https://docs.python.org/3/tutorial/)
- [Python Packaging User Guide](https://packaging.python.org/) and [uv documentation](https://docs.astral.sh/uv/)

### Books

- *Fluent Python*, 2nd ed., Luciano Ramalho (O'Reilly): idiomatic, intermediate-to-advanced Python
- *Python for Data Analysis*, 3rd ed., Wes McKinney ([free online](https://wesmckinney.com/book/))
- *Effective Python*, 3rd ed., Brett Slatkin (Addison-Wesley)
- *Clean Code in Python*, Mariano Anaya (Packt)

### Courses

- [CS50's Introduction to Programming with Python (Harvard)](https://cs50.harvard.edu/python/)
- [Python Full Course for Beginners, Programming with Mosh](https://www.youtube.com/watch?v=_uQrJ0TkZlc)

### Data libraries

- [Polars user guide](https://docs.pola.rs/) · [DuckDB Python API](https://duckdb.org/docs/stable/clients/python/overview) · [PySpark documentation](https://spark.apache.org/docs/latest/api/python/)
