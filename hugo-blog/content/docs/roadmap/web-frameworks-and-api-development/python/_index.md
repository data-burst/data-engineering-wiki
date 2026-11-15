---
weight: 1
description: "Python web frameworks in 2026: FastAPI, Django, Flask and Litestar compared, WSGI vs ASGI, async pitfalls, servers like Uvicorn and Granian, and how to choose."
---
# Python

Python is the most common language in data work, so it is often the natural choice when a data team needs an API: the same models, database drivers and libraries (pandas, Polars, DuckDB, scikit-learn) are already there. Python web frameworks fall into two families, defined by how they talk to the web server:

- **WSGI** (synchronous): one request occupies one worker thread or process until it finishes. Flask and classic Django.
- **ASGI** (asynchronous): one worker can juggle thousands of requests that are waiting on I/O, and it supports WebSockets and streaming. FastAPI, Litestar, Starlette, and Django's async views.

## The frameworks

### FastAPI

**FastAPI** builds an API from ordinary Python **type hints**. It uses **Pydantic** (v2, with a Rust core) to validate and serialize data and **Starlette** for the ASGI web layer, and it generates an **OpenAPI** schema with interactive docs at `/docs` automatically. It is the default choice for new APIs and ML model serving in 2026.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Order(BaseModel):
    id: int
    user: str
    total: float

@app.get("/orders/{order_id}")
async def get_order(order_id: int) -> Order:     # "abc" → 422 automatically
    # db: an asyncpg pool created at startup; "user" is quoted because it is a reserved word
    row = await db.fetchrow('SELECT id, "user", total FROM orders WHERE id = $1', order_id)
    if row is None:
        raise HTTPException(status_code=404, detail="order not found")
    return Order(**row)
```

Run it with `fastapi dev main.py` locally, and `fastapi run` or `uvicorn main:app --workers 4` in production.

### Django

**Django** is the "batteries included" framework: ORM, migrations, authentication, an auto-generated **admin** interface, forms, templates and security defaults in one package. Django 5.2 is the current LTS release and the 6.x series is current. For APIs, add **Django REST Framework** (mature, huge ecosystem) or **Django Ninja** (FastAPI-style type hints on top of Django). Choose Django when you need a full application with users and an admin panel, for example an internal tool for managing pipeline configuration or data quality rules.

### Flask

**Flask** (3.x) is a small WSGI micro-framework: routing, request handling and templates, and you add everything else through extensions (SQLAlchemy, Flask-Login). It is simple to learn and still widely used: Airflow 2's web UI is a Flask app (Airflow 3 moved its API server to FastAPI). For new JSON APIs, FastAPI usually gives you more for the same effort.

### Litestar

**Litestar** is an ASGI framework in the same spirit as FastAPI, with built-in dependency injection, DTOs, and support for Pydantic, msgspec and attrs models. A good option if you want more structure than FastAPI provides.

## How to choose

| Need | Pick |
|---|---|
| JSON API, model serving, typed contracts | **FastAPI** (or Litestar) |
| Full web app with users, admin, ORM, migrations | **Django** (+ DRF or Django Ninja for the API) |
| Small, simple synchronous service or legacy codebase | **Flask** |
| Dashboard or data app, not an API | Streamlit, Dash or Panel instead of a web framework |

## Servers

| Server | Interface | Notes |
|---|---|---|
| **Uvicorn** | ASGI | The standard for FastAPI and Starlette |
| **Granian** | ASGI, WSGI | Rust-based, fast, one server for both kinds |
| **Gunicorn** | WSGI | Process manager for Flask/Django; can also run Uvicorn workers |
| **Hypercorn** | ASGI | Supports HTTP/2 and HTTP/3 |

## Common mistakes

- **Blocking calls inside `async def`.** `requests.get()`, `time.sleep()` or a sync database driver inside an async endpoint freezes the whole event loop and every other request with it. Use async libraries (`httpx`, `asyncpg`, `psycopg` async) or declare the endpoint with plain `def` so FastAPI runs it in a thread pool.
- **Heavy CPU work in the request.** Training a model or crunching a big DataFrame in an endpoint blocks workers. Hand it to a task queue (Celery, Dramatiq, Arq) or a pipeline and return a job ID.
- **Loading a model or a big file per request.** Load once at startup with FastAPI's `lifespan` handler.
- **Using the development server in production** (`flask run`, `manage.py runserver`).
- **Returning whole tables.** Paginate, and stream large exports instead of building them in memory.

## Learning Resources

### Official tutorials

- [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Django tutorial](https://docs.djangoproject.com/en/stable/intro/) and [Django REST Framework](https://www.django-rest-framework.org/)
- [Flask tutorial](https://flask.palletsprojects.com/en/stable/tutorial/)
- [Litestar documentation](https://docs.litestar.dev/)
- [Pydantic documentation](https://docs.pydantic.dev/latest/)

### Books

- [FastAPI: Modern Python Web Development](https://www.oreilly.com/library/view/fastapi/9781098135492/): Bill Lubanovic
- [Microservice APIs: Using Python, Flask, FastAPI, OpenAPI and more](https://www.manning.com/books/microservice-apis): José Haro Peralta
- [Two Scoops of Django](https://daniel.feldroy.com/books/tech): Daniel and Audrey Feldroy
- [Flask Web Development, 2nd edition](https://www.oreilly.com/library/view/flask-web-development/9781491991725/): Miguel Grinberg

### Courses

- [Python API Development: Comprehensive Course for Beginners](https://www.youtube.com/watch?v=0sOvCWFmrtA): freeCodeCamp, FastAPI + PostgreSQL
- [Django for Everybody](https://www.dj4e.com/): Charles Severance
- [The Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-2024-edition-chapter-i-hello-world): Miguel Grinberg

See also: [Python language]({{< relref "/docs/roadmap/programming-language/python" >}}), [REST]({{< relref "/docs/roadmap/general-software-engineering-skills/rest" >}}).
