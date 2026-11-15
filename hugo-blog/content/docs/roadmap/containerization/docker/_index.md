---
title: "Docker"
description: "How Docker builds images from a Dockerfile, why layers and the build cache matter, how containers run from images, and Docker Compose for local data stacks."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ docker build -t etl:1.0 . &amp;&amp; docker run etl:1.0</div>

# Docker

**Docker** is the toolset that made containers mainstream: you describe an environment in a **Dockerfile**, `docker build` turns it into an **image**, and `docker run` starts a **container** from that image. Images are pushed to a **registry** (Docker Hub, GHCR, ECR) so any machine can pull and run exactly the same bits.

Under the hood, Docker Engine (`dockerd`) delegates to [containerd]({{< relref "../containerd" >}}) and `runc` to actually start containers. Docker itself is the friendly layer on top: the CLI, the builder (**BuildKit**, the default since Engine 23), networking, volumes and Compose.

## Images are stacks of layers

Each instruction in a Dockerfile that changes the filesystem produces a **layer**: a read-only tarball of changes, identified by its content hash. An image is an ordered list of layers. A container adds one thin **writable layer** on top.

{{< fig kicker="$ docker build -t etl:1.0 ." title="From Dockerfile to image to running containers" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 330">
  <rect x="20" y="20" width="280" height="150" rx="8" fill="#260246"/>
  <text x="34" y="44" class="m" font-size="11" fill="#B9A6D3">Dockerfile</text>
  <g font-size="11.5" fill="#EEEAF5">
    <text class="m" x="34" y="72">1 FROM python:3.12-slim</text>
    <text class="m" x="34" y="98">2 COPY requirements.txt .</text>
    <text class="m" x="34" y="124">3 RUN pip install -r requirements.txt</text>
    <text class="m" x="34" y="150">4 COPY etl.py .</text>
  </g>
  <text x="430" y="315" text-anchor="middle" class="m" font-size="11" fill="#5C5869">IMAGE etl:1.0 (READ-ONLY)</text>
  <g class="f" data-step="1"><rect x="320" y="262" width="220" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="332" y="284" class="m" font-size="12" fill="#17151F">L1 python:3.12-slim</text><text x="552" y="284" class="m" font-size="11" fill="#5C5869">~45 MB</text></g>
  <g class="f" data-step="2"><rect x="320" y="222" width="220" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="332" y="244" class="m" font-size="12" fill="#17151F">L2 requirements.txt</text><text x="552" y="244" class="m" font-size="11" fill="#5C5869">1 KB</text>
    <rect x="320" y="182" width="220" height="34" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="332" y="204" class="m" font-size="12" fill="#17151F">L3 pandas, pyarrow…</text><text x="552" y="204" class="m" font-size="11" fill="#5C5869">~180 MB</text></g>
  <g class="f" data-step="3"><rect x="320" y="142" width="220" height="34" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
    <text x="332" y="164" class="m" font-size="12" fill="#17151F">L4 etl.py</text><text x="552" y="164" class="m" font-size="11" fill="#5C5869">6 KB</text>
    <path d="M312 142 h-6 v154 h6" fill="none" stroke="#531A8A" stroke-width="1.4"/></g>
  <g class="f" data-step="4"><rect x="320" y="88" width="104" height="40" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="372" y="104" text-anchor="middle" class="m" font-size="11" font-weight="600" fill="#531A8A">CONTAINER A</text><text x="372" y="120" text-anchor="middle" class="m" font-size="11" fill="#5C5869">rw layer</text></g>
  <g class="f" data-step="5"><rect x="436" y="88" width="104" height="40" rx="6" fill="#fff" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="4 3"/>
    <text x="488" y="104" text-anchor="middle" class="m" font-size="11" font-weight="600" fill="#531A8A">CONTAINER B</text><text x="488" y="120" text-anchor="middle" class="m" font-size="11" fill="#5C5869">rw layer</text>
    <text x="430" y="72" text-anchor="middle" font-size="12" fill="#3D3A49">both share L1 to L4 on disk</text></g>
  <g class="f" data-step="6"><text x="20" y="208" class="m" font-size="12" font-weight="600" fill="#531A8A">edit etl.py, rebuild:</text>
    <text x="20" y="232" class="m" font-size="12" fill="#3D3A49">L1 to L3: CACHED</text>
    <text x="20" y="256" class="m" font-size="12" fill="#531A8A">L4: REBUILT (6 KB)</text>
    <text x="20" y="280" class="m" font-size="12" fill="#3D3A49">push: only L4 uploads</text></g>
</svg>
<ol class="lx-caps">
  <li>A four-line <b>Dockerfile</b> for a small Python ETL job. Nothing is built yet.</li>
  <li><b>FROM</b> pulls the base image. Its layers become the bottom of our stack.</li>
  <li><b>COPY</b> and <b>RUN</b> each add a layer. The dependency layer is the big one.</li>
  <li><b>COPY etl.py</b> adds the last layer. Together, L1 to L4 are the read-only image <b>etl:1.0</b>.</li>
  <li><b>docker run</b> starts a container: the image plus a thin <b>writable layer</b>. Files the job writes go there and vanish with the container.</li>
  <li>A second container from the same image <b>shares every image layer</b>. Only its own writable layer is new, so starting it is near-instant.</li>
  <li>Change only <b>etl.py</b> and rebuild: layers above the change are rebuilt, the rest come from the <b>build cache</b>. That is why dependency installs go before code copies.</li>
</ol>
{{< /fig >}}

## A practical Dockerfile for a data job

```dockerfile
# Stage 1: build wheels in the full image, which has compilers
FROM python:3.12 AS build
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --wheel-dir /wheels -r requirements.txt

# Stage 2: small runtime image, no compilers
FROM python:3.12-slim
RUN useradd --create-home etl
WORKDIR /app
COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY etl.py .
USER etl
ENTRYPOINT ["python", "etl.py"]
```

Two habits matter most: put rarely-changing steps (dependencies) **before** often-changing ones (code) so the cache works, and use a **multi-stage** build so build tools never reach the final image.

## Docker Compose for local stacks

`docker compose` (Compose v2, built into the CLI) starts several containers from one YAML file. It is the usual way to run a local data stack: Postgres as a source, Kafka, MinIO as fake S3, and Airflow, all on one private network where containers reach each other by service name.

```yaml
services:
  postgres:
    image: postgres:17
    environment: { POSTGRES_PASSWORD: dev }
    volumes: [pgdata:/var/lib/postgresql/data]
  minio:
    image: minio/minio
    command: server /data
    ports: ["9000:9000"]
volumes:
  pgdata:
```

MinIO stopped publishing community Docker images in late 2025, so `minio/minio` no longer gets updates; it is fine for a throwaway local stack, but for anything longer-lived consider an S3-compatible alternative such as SeaweedFS or Garage.

Compose is for development and single-host setups. For many hosts, use [Kubernetes]({{< relref "../../container-orchestration/kubernetes" >}}).

## Key commands

| Command | What it does |
|---|---|
| `docker build -t etl:1.0 .` | Build an image from the Dockerfile in `.` |
| `docker run --rm -e ENV=dev etl:1.0` | Start a container, remove it on exit |
| `docker run -v $PWD/data:/data etl:1.0` | Mount a host folder (a **bind mount**) |
| `docker ps`, `docker logs -f <id>` | List containers, follow their output |
| `docker exec -it <id> sh` | Open a shell in a running container (debug only) |
| `docker image history etl:1.0` | Show the layers and their sizes |
| `docker push registry/etl:1.0` | Upload the image to a registry |

## Common mistakes

- **`latest` in production.** Tags are mutable. Pin a version, or better, the image digest (`@sha256:…`).
- **Secrets in layers.** A password in a `COPY`ed file or `ENV` stays in the image history even if a later step deletes it. Use BuildKit secrets (`RUN --mount=type=secret`) and runtime env vars.
- **No `.dockerignore`.** Without it, `.git`, local data dumps and virtualenvs are sent to the builder and may end up in the image.
- **Licensing surprise.** Docker Engine and CLI are open source, but **Docker Desktop** requires a paid subscription for larger companies. Check the current terms, or use Podman Desktop, Rancher Desktop, Colima or OrbStack.

## Learning Resources

### Official

- [Docker documentation and guides](https://docs.docker.com/guides/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) and [build best practices](https://docs.docker.com/build/building/best-practices/)
- [Docker Compose documentation](https://docs.docker.com/compose/)

### Books

- [Docker Deep Dive, Nigel Poulton](https://nigelpoulton.com/books/)
- [Docker in Action, 2nd ed. (Manning)](https://www.manning.com/books/docker-in-action-second-edition)

### Courses and tutorials

- [Docker Curriculum](https://docker-curriculum.com/)
- [Complete Docker Course (YouTube)](https://www.youtube.com/watch?v=RqTEHSBrYFw)
- [Docker Tutorial for Beginners (YouTube)](https://www.youtube.com/watch?v=3c-iBn73dDE)
