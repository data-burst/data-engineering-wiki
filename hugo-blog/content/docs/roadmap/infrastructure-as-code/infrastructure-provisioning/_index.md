---
title: "Infrastructure Provisioning"
description: "How Terraform and OpenTofu provision infrastructure: providers, state, plan and apply animated, drift, remote backends and locking, plus the alternatives."
weight: 2
bookToC: false
---
<div class="lx-kicker-line">$ terraform plan -out=tfplan &amp;&amp; terraform apply tfplan</div>

# Infrastructure Provisioning

**Infrastructure provisioning** is creating and changing cloud resources (networks, buckets, databases, clusters, IAM roles) from code. You declare the resources you want; a provisioning tool calls the cloud APIs to make reality match, and remembers what it created so it can update or delete it later.

**Terraform** is the most widely used tool, and its open-source fork **OpenTofu** is a drop-in alternative. Both use **HCL** (HashiCorp Configuration Language) and the same **providers**: plugins that translate resources into API calls for AWS, GCP, Azure, Kubernetes, Snowflake, Databricks, Confluent and hundreds more.

## Three views of the same infrastructure

Terraform compares three things: your **code** (what you want), the **state file** (what Terraform created last time, with IDs) and the **real cloud** (what actually exists).

{{< fig kicker="$ terraform plan" title="Plan and apply: code, state and the real cloud" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 270">
<rect x="10" y="10" width="238" height="196" rx="10" fill="#F7F7FB" stroke="#E7E7EF"/>
<text x="24" y="32" class="m" font-size="11" font-weight="700" fill="#5C5869">CODE · main.tf</text>
<rect x="22" y="46" width="214" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="71" class="m" font-size="12" font-weight="600" fill="#17151F">aws_s3_bucket.raw</text>
<rect x="22" y="94" width="214" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="34" y="114" class="m" font-size="12" font-weight="600" fill="#17151F">aws_db_instance.dwh</text><text x="34" y="132" class="m" font-size="11" fill="#5C5869">class = small</text>
<rect x="261" y="10" width="238" height="196" rx="10" fill="#F7F7FB" stroke="#E7E7EF"/>
<text x="275" y="32" class="m" font-size="11" font-weight="700" fill="#5C5869">STATE · terraform.tfstate</text>
<rect x="273" y="46" width="214" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="285" y="71" class="m" font-size="12" font-weight="600" fill="#17151F">aws_s3_bucket.raw</text>
<rect x="273" y="94" width="214" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="285" y="114" class="m" font-size="12" font-weight="600" fill="#17151F">aws_db_instance.dwh</text><text x="285" y="132" class="m" font-size="11" fill="#5C5869">class = small</text>
<rect x="512" y="10" width="238" height="196" rx="10" fill="#F7F7FB" stroke="#E7E7EF"/>
<text x="526" y="32" class="m" font-size="11" font-weight="700" fill="#5C5869">REAL CLOUD · AWS API</text>
<rect x="524" y="46" width="214" height="40" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="536" y="71" class="m" font-size="12" font-weight="600" fill="#17151F">aws_s3_bucket.raw</text>
<rect x="524" y="94" width="214" height="48" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="536" y="114" class="m" font-size="12" font-weight="600" fill="#17151F">aws_db_instance.dwh</text><text x="536" y="132" class="m" font-size="11" fill="#5C5869">class = small</text>
<g class="f" data-step="1"><rect x="22" y="150" width="214" height="40" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="34" y="175" class="m" font-size="12" font-weight="600" fill="#17151F">aws_s3_bucket.curated</text><rect x="30" y="119" width="196" height="18" fill="#fff"/><text x="34" y="132" class="m" font-size="11" font-weight="700" fill="#531A8A">class = medium</text></g>
<g class="f" data-step="2"><text x="14" y="232" class="m" font-size="12" font-weight="700" fill="#531A8A">Plan: 1 to add, 1 to change, 0 to destroy.</text></g>
<g class="f" data-step="3"><rect x="524" y="150" width="214" height="40" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="536" y="175" class="m" font-size="12" font-weight="600" fill="#17151F">aws_s3_bucket.curated</text><rect x="532" y="119" width="196" height="18" fill="#fff"/><text x="536" y="132" class="m" font-size="11" font-weight="700" fill="#531A8A">class = medium</text></g>
<g class="f" data-step="4"><rect x="273" y="150" width="214" height="40" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="285" y="175" class="m" font-size="12" font-weight="600" fill="#17151F">aws_s3_bucket.curated</text><rect x="281" y="119" width="196" height="18" fill="#fff"/><text x="285" y="132" class="m" font-size="11" font-weight="700" fill="#531A8A">class = medium</text></g>
<g class="f" data-step="5"><rect x="532" y="119" width="196" height="18" fill="#fff"/><text x="536" y="132" class="m" font-size="11" font-weight="700" fill="#C2382F">class = large  (console edit)</text><text x="14" y="256" class="m" font-size="12" font-weight="700" fill="#C2382F">Drift: next plan shows ~ dwh class large → medium</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>COMMAND</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="2"><td>1</td><td>02</td><td>plan</td><td class="tag">REFRESH</td><td>read raw, dwh from AWS: match state</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>plan</td><td class="tag">+ CREATE</td><td>aws_s3_bucket.curated</td></tr>
<tr class="f" data-step="2"><td>3</td><td>02</td><td>plan</td><td class="tag">~ UPDATE</td><td>aws_db_instance.dwh: class small → medium</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>apply</td><td class="tag">LOCK</td><td>state lock acquired</td></tr>
<tr class="f" data-step="3"><td>5</td><td>03</td><td>apply</td><td class="tag">API</td><td>CreateBucket curated · ModifyDBInstance dwh</td></tr>
<tr class="f" data-step="4"><td>6</td><td>04</td><td>apply</td><td class="tag">STATE</td><td>state written (serial 42 → 43), lock released</td></tr>
<tr class="f" data-step="5"><td>7</td><td>05</td><td>console</td><td class="err">DRIFT</td><td>someone resized dwh to large by hand</td></tr>
</table>
<ol class="lx-caps">
  <li>Code, state and cloud agree: a <b>raw</b> bucket and a small <b>dwh</b> database.</li>
  <li>You edit <b>main.tf</b>: add a <b>curated</b> bucket and resize the database to medium. Nothing changes in the cloud yet.</li>
  <li><b>terraform plan</b> refreshes from the cloud, diffs it with your code and prints the changes: <b>1 to add, 1 to change, 0 to destroy</b>. A reviewer reads this in the pull request.</li>
  <li><b>terraform apply</b> takes a <b>lock</b> on the state and calls the cloud APIs. The bucket is created and the database resized.</li>
  <li>Terraform writes the new IDs and attributes into the <b>state</b> and releases the lock. All three views agree again.</li>
  <li>Someone resizes the database in the console. Reality has <b>drifted</b> from code; the next plan will propose reverting it, so either import the change into code or stop manual edits.</li>
</ol>
{{< /fig >}}

The code behind the figure:

```hcl
terraform {
  backend "s3" {                       # remote, shared, locked state
    bucket       = "acme-tf-state"
    key          = "data-platform/prod.tfstate"
    region       = "eu-central-1"
    use_lockfile = true
  }
}

resource "aws_s3_bucket" "raw"     { bucket = "acme-lake-raw" }
resource "aws_s3_bucket" "curated" { bucket = "acme-lake-curated" }

resource "aws_db_instance" "dwh" {
  identifier     = "dwh"
  engine         = "postgres"
  instance_class = "db.m7g.large"      # "medium" in the figure
  # ...
}
```

## The workflow

| Command | What it does |
|---|---|
| `terraform init` | Download providers and modules, configure the backend |
| `terraform fmt` / `validate` | Format and statically check the code |
| `terraform plan` | Show the diff between code and reality; changes nothing |
| `terraform apply` | Execute a plan, then update state |
| `terraform import` or `import {}` blocks | Bring existing resources under management |
| `terraform destroy` | Delete everything in this state |

In a team, run `plan` automatically on every pull request and `apply` only from CI after merge, with tools such as **Atlantis**, **HCP Terraform**, **Spacelift** or plain [CI/CD]({{< relref "../../cicd" >}}).

## Terraform, OpenTofu and alternatives

In 2023 HashiCorp moved Terraform from the open-source MPL license to the source-available **Business Source License**, and IBM completed its acquisition of HashiCorp in 2025. The community forked the last open version as **OpenTofu**, now governed by the Linux Foundation. For most users the two are interchangeable; OpenTofu adds features such as client-side state encryption.

| Tool | Language | State | Best for |
|---|---|---|---|
| **Terraform** / **OpenTofu** | HCL | State file in a backend | Multi-cloud, largest provider ecosystem |
| **Pulumi** | Python, TypeScript, Go, C#, Java | Pulumi Cloud or a backend | Teams that want loops, types and tests in a general-purpose language |
| **AWS CloudFormation** / **CDK** | YAML/JSON / TypeScript, Python… | Managed by AWS | AWS-only shops |
| **Azure Bicep** | Bicep DSL | Managed by Azure | Azure-only shops |
| **Crossplane** | Kubernetes YAML | Kubernetes etcd | Platforms that manage everything as Kubernetes resources with continuous reconciliation |

## Common mistakes

- **Local state.** A `terraform.tfstate` on a laptop gets lost or overwritten. Use a remote backend with locking and versioning from day one.
- **Not reading the plan.** A renamed resource can show up as **destroy and create**. For a database, that means data loss. Look for `-/+` and `destroy` in every plan; use `moved {}` blocks and `prevent_destroy` on stateful resources.
- **Hard-coding per environment.** Copy-pasted `prod/` and `dev/` folders drift apart. Use modules with variables, one root per environment.
- **Unpinned providers.** A new major provider version can change behaviour. Pin versions and commit `.terraform.lock.hcl`.

## Learning Resources

### Official

- [Terraform tutorials (HashiCorp)](https://developer.hashicorp.com/terraform/tutorials)
- [Terraform language documentation](https://developer.hashicorp.com/terraform/language)
- [OpenTofu documentation](https://opentofu.org/docs/)
- [Pulumi documentation](https://www.pulumi.com/docs/)
- [Crossplane documentation](https://docs.crossplane.io/)

### Books

- *Terraform: Up and Running*, 3rd ed., Yevgeniy Brikman (O'Reilly)
- *Terraform in Action*, Scott Winkler (Manning)

### Courses

- [Complete Terraform Course: From Beginner to Pro (DevOps Directive)](https://www.youtube.com/watch?v=7xngnjfIlK4)
- [Terraform Course: Automate your AWS cloud infrastructure (freeCodeCamp)](https://www.youtube.com/watch?v=SLB_c_ayRMo)
