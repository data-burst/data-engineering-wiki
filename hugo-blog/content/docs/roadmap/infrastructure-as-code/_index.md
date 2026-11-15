---
title: "Infrastructure as Code"
description: "Infrastructure as Code explained: declarative vs imperative, provisioning vs configuration management, state and drift, and the main tools data teams use."
bookCollapseSection: true
weight: 27
---

# Infrastructure as Code

**Infrastructure as Code (IaC)** means describing servers, networks, buckets, databases and permissions in text files that live in Git, and letting a tool create and update the real infrastructure from them. Instead of clicking through a cloud console, you open a pull request, a reviewer reads the diff, CI shows what will change, and the merge applies it. The same files can rebuild an environment from scratch, which makes staging match production and disaster recovery a command rather than a week.

For a data platform, IaC typically manages the object-storage buckets of the lake, the warehouse and its roles, the Kubernetes cluster, Kafka topics, IAM policies and the network between them.

## Two kinds of tools

| | Provisioning | Configuration management |
|---|---|---|
| Question it answers | **What resources exist?** | **What is installed and configured on them?** |
| Examples | Terraform, OpenTofu, Pulumi, CloudFormation, CDK, Crossplane | Ansible, Puppet, Chef, Salt |
| Typical target | Cloud APIs: VPCs, buckets, managed databases, clusters | Operating systems: packages, files, services, users |
| Covered in | [Infrastructure Provisioning]({{< relref "infrastructure-provisioning" >}}) | [Configuration Management]({{< relref "configuration-management" >}}) |

With containers and managed services, much of what configuration management used to do now happens in a Dockerfile or a Helm chart. Provisioning tools have become the centre of IaC; configuration management remains essential for VMs and bare-metal fleets.

## Key ideas

- **Declarative over imperative.** You describe the end state ("a bucket named `raw` with versioning on"), not the steps. The tool computes the steps. Running it twice changes nothing the second time: it is **idempotent**.
- **State and drift.** The tool must know what it manages. Terraform keeps a **state file**; Ansible checks the live system on each run. When someone changes infrastructure by hand, reality **drifts** from code, and the next run either reverts it or reports it.
- **Plan before apply.** Good tools show a diff of what they will create, change or destroy before doing it. Reviewing that diff is the most important safety step.
- **Modules.** Wrap repeated patterns (a standard bucket, a team's warehouse schema and roles) into reusable modules with inputs.
- **Immutable infrastructure.** Prefer replacing a server or image with a new version over patching it in place.

## Common mistakes

- **Mixing console clicks with IaC.** Every manual change becomes drift. Make the console read-only for humans in production.
- **Secrets in code or state.** Terraform state can contain passwords in plain text. Store state in an encrypted, access-controlled backend and pull secrets from a secrets manager.
- **One giant state for everything.** A typo in a networking change should not be able to destroy the warehouse. Split by layer and environment.
- **Applying from laptops.** Run `apply` from CI after review, with locking, so two people never apply at once.

## Learning Resources

- [What is Infrastructure as Code? (HashiCorp)](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code)
- [What is IaC? (AWS)](https://aws.amazon.com/what-is/iac/)
- *Infrastructure as Code*, 3rd ed., Kief Morris (O'Reilly)
- [What is Infrastructure as Code? (IBM, YouTube)](https://www.youtube.com/watch?v=zWw2wuiKd5o)
