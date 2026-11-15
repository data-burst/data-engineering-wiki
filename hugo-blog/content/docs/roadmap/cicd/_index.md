---
weight: 26
title: CI/CD
description: "CI/CD for data engineers: pipeline stages animated, continuous delivery vs deployment, testing SQL and dbt in CI, GitOps, and the main CI tools compared."
bookToC: false
---
<div class="lx-kicker-line">$ git push origin main   # and the pipeline takes it from here</div>

# CI/CD

**CI/CD** is the practice of letting automation build, test and release every change. **Continuous Integration (CI)** means everyone merges small changes into the main branch often, and each change is automatically built and tested so breakage is caught within minutes. **Continuous Delivery (CD)** means every change that passes CI is packaged and deployable at the push of a button; **Continuous Deployment** goes one step further and ships it to production with no human gate.

For data teams the "code" includes SQL models, DAGs, schemas and infrastructure, and a broken change does not just crash: it can silently write wrong numbers into a dashboard. CI/CD is how you catch that before it reaches production data.

## A pipeline, step by step

{{< fig kicker="$ cat .github/workflows/etl.yml" title="Two runs of the same pipeline: one stopped by a test, one shipped" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 230">
  <g font-size="11" fill="#5C5869" text-anchor="middle">
    <text class="m" x="150" y="34">COMMIT</text><text class="m" x="260" y="34">BUILD</text><text class="m" x="370" y="34">TEST</text>
    <text class="m" x="480" y="34">PACKAGE</text><text class="m" x="590" y="34">STAGING</text><text class="m" x="700" y="34">PROD</text>
  </g>
  <g font-size="12" font-weight="700" fill="#17151F"><text class="m" x="16" y="89">RUN #41</text><text class="m" x="16" y="179">RUN #42</text></g>
  <g fill="none" stroke="#E7E7EF" stroke-width="1.4" stroke-dasharray="4 3">
    <rect x="100" y="56" width="100" height="58" rx="6"/><rect x="210" y="56" width="100" height="58" rx="6"/><rect x="320" y="56" width="100" height="58" rx="6"/>
    <rect x="430" y="56" width="100" height="58" rx="6"/><rect x="540" y="56" width="100" height="58" rx="6"/><rect x="650" y="56" width="100" height="58" rx="6"/>
    <rect x="100" y="146" width="100" height="58" rx="6"/><rect x="210" y="146" width="100" height="58" rx="6"/><rect x="320" y="146" width="100" height="58" rx="6"/>
    <rect x="430" y="146" width="100" height="58" rx="6"/><rect x="540" y="146" width="100" height="58" rx="6"/><rect x="650" y="146" width="100" height="58" rx="6"/>
  </g>
  <g class="f" data-step="1">
    <rect x="100" y="56" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="150" y="81" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">a1f3e2</text><text x="150" y="100" text-anchor="middle" font-size="11" fill="#5C5869">new join</text>
    <rect x="210" y="56" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="260" y="81" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#531A8A">PASS</text><text x="260" y="100" text-anchor="middle" font-size="11" fill="#5C5869">lint, compile</text>
  </g>
  <g class="f" data-step="2">
    <rect x="320" y="56" width="100" height="58" rx="6" fill="#FCEDEB" stroke="#C2382F" stroke-width="1.4"/>
    <text x="370" y="81" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#C2382F">FAIL</text><text x="370" y="100" text-anchor="middle" class="m" font-size="11" fill="#C2382F">dup order_id</text>
    <g font-size="11" fill="#8C8899" text-anchor="middle"><text x="480" y="89">skipped</text><text x="590" y="89">skipped</text><text x="700" y="89">skipped</text></g>
  </g>
  <g class="f" data-step="3">
    <rect x="100" y="146" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="150" y="171" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#17151F">b7c9d0</text><text x="150" y="190" text-anchor="middle" font-size="11" fill="#5C5869">fix join key</text>
    <rect x="210" y="146" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="260" y="171" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#531A8A">PASS</text><text x="260" y="190" text-anchor="middle" font-size="11" fill="#5C5869">lint, compile</text>
    <rect x="320" y="146" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="370" y="171" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#531A8A">PASS</text><text x="370" y="190" text-anchor="middle" font-size="11" fill="#5C5869">212 tests</text>
  </g>
  <g class="f" data-step="4">
    <rect x="430" y="146" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="480" y="171" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">etl:b7c9d0</text><text x="480" y="190" text-anchor="middle" font-size="11" fill="#5C5869">image pushed</text>
    <rect x="540" y="146" width="100" height="58" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="590" y="171" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#531A8A">PASS</text><text x="590" y="190" text-anchor="middle" font-size="11" fill="#5C5869">smoke test</text>
  </g>
  <g class="f" data-step="5">
    <rect x="650" y="146" width="100" height="58" rx="6" fill="#531A8A" stroke="#531A8A" stroke-width="1.4"/>
    <text x="700" y="171" text-anchor="middle" class="m" font-size="12" font-weight="700" fill="#fff">LIVE</text><text x="700" y="190" text-anchor="middle" font-size="11" fill="#F4EEFA">after approval</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>Every push runs the same stages, left to right. A stage only starts if the one before it passed.</li>
  <li>Run #41: a commit changes a join. <b>Build</b> passes: the code lints and the SQL compiles.</li>
  <li>The <b>test</b> stage builds the models on sample data and a uniqueness test finds <b>duplicate order_id</b>s. The pipeline stops; nothing is deployed. This is CI doing its job.</li>
  <li>Run #42 fixes the join key. Build and all <b>212 tests</b> pass.</li>
  <li>The change is <b>packaged</b> once (an image tagged with the commit) and that same artifact is deployed to <b>staging</b>, where a smoke test runs against realistic data.</li>
  <li>The same artifact goes to <b>prod</b>. With a manual approval this is <b>continuous delivery</b>; without one it is <b>continuous deployment</b>.</li>
</ol>
{{< /fig >}}

## Typical stages

| Stage | Purpose | Data examples |
|---|---|---|
| Lint and format | Fail fast on style and obvious errors | `ruff`, `sqlfluff`, `yamllint` |
| Build | Compile, resolve dependencies, parse | `dbt compile`, Airflow DAG import test, `terraform validate` |
| Unit tests | Test functions in isolation | `pytest` for transforms, dbt unit tests |
| Data tests | Run models on a sample or a clone and check the output | dbt `unique` / `not_null` tests, Great Expectations, Soda |
| Package | Produce one versioned artifact | Docker image, wheel, dbt manifest |
| Deploy | Release the artifact to an environment | Push DAGs, `dbt build` in prod, `helm upgrade`, Argo CD sync |

## CI/CD for data pipelines

Data adds problems that application CI does not have:

- **You need data to test.** Use small fixture datasets for unit tests, and a zero-copy clone or a sample of production for integration tests (Snowflake and BigQuery clones, Iceberg/Delta branches, lakeFS).
- **Only build what changed.** dbt's **slim CI** (`dbt build --select state:modified+ --defer --state prod-manifest/`) builds just the modified models and their children against production references.
- **Schema changes are deploys too.** Run migrations (Flyway, Liquibase, Alembic) in the pipeline, and check backward compatibility of event schemas in a [schema registry]({{< relref "../file-formats-and-serialization/serialization" >}}).
- **Write-Audit-Publish.** In production, write new data to a staging location, audit it with tests, then publish atomically. It is CI for data itself, not just for code.
- **Infrastructure in the same flow.** Run `terraform plan` on every pull request and `apply` on merge; see [Infrastructure as Code]({{< relref "../infrastructure-as-code" >}}).

## Tools

| Tool | Where it runs | Config | Notes |
|---|---|---|---|
| **GitHub Actions** | GitHub-hosted or self-hosted runners | `.github/workflows/*.yml` | Huge marketplace of reusable actions; default choice on GitHub |
| **GitLab CI/CD** | GitLab runners | `.gitlab-ci.yml` | Built into GitLab, strong for self-hosted setups |
| **Jenkins** | Your servers | `Jenkinsfile` (Groovy) | Most flexible, most maintenance; common in older enterprises |
| **CircleCI**, **Buildkite** | SaaS or hybrid | YAML | Fast, good caching and parallelism |
| **Argo CD**, **Flux** | Inside Kubernetes | Git repo of manifests | **GitOps**: the cluster pulls and reconciles whatever is in Git |
| **Bitbucket Pipelines** | Atlassian cloud | `bitbucket-pipelines.yml` | Natural fit for Jira/Bitbucket shops |

A minimal GitHub Actions workflow for a dbt project:

```yaml
name: dbt-ci
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: astral-sh/setup-uv@v6
      - run: uv sync
      - run: uv run sqlfluff lint models/
      # ./prod-manifest must hold manifest.json from the last production run,
      # e.g. downloaded from object storage in an earlier step
      - run: uv run dbt build --target ci --select state:modified+ --defer --state ./prod-manifest
```

## Common mistakes

- **Rebuilding per environment.** Build the artifact once and promote the same one through staging and prod; otherwise you test one thing and ship another.
- **Flaky tests that everyone ignores.** A red pipeline that is "usually fine" trains people to merge on red. Fix or delete flaky tests.
- **Production credentials in CI.** Use short-lived credentials (OIDC federation to your cloud) and read-only roles for test stages.
- **Testing only code, never data.** A pipeline that compiles but doubles revenue is still broken. Add data tests.
- **Slow pipelines.** Over 10–15 minutes and people stop waiting for them. Cache dependencies, run tests in parallel, and build only what changed.

## Learning Resources

### Foundations

- [Continuous Integration, Martin Fowler](https://martinfowler.com/articles/continuousIntegration.html)
- *Continuous Delivery*, Jez Humble and David Farley (Addison-Wesley)
- *Accelerate*, Nicole Forsgren, Jez Humble and Gene Kim: the research behind DORA metrics
- [DORA research program](https://dora.dev/)

### Tool documentation

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD documentation](https://docs.gitlab.com/ci/)
- [Jenkins User Handbook](https://www.jenkins.io/doc/book/)
- [CircleCI documentation](https://circleci.com/docs/)
- [Argo CD documentation](https://argo-cd.readthedocs.io/)
- [dbt: continuous integration](https://docs.getdbt.com/docs/deploy/continuous-integration)

### Courses

- [GitHub Actions Tutorial, TechWorld with Nana](https://www.youtube.com/watch?v=R8_veQiYBjI)
- [GitLab CI/CD Tutorial for Beginners](https://www.youtube.com/watch?v=qP8kir2GUgo)
- [DevOps with GitLab CI (freeCodeCamp)](https://www.youtube.com/watch?v=PGyhBwLyK2U)
