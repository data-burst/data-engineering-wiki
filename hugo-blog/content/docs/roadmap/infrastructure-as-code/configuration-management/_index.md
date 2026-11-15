---
title: "Configuration Management"
description: "Configuration management explained: idempotent desired state, push vs pull, agentless vs agent-based, and how Ansible, Puppet, Chef and Salt compare in 2026."
weight: 1
---

# Configuration Management

**Configuration management** tools make sure the software, files, users and services **on** your machines are in a known, declared state. Where [provisioning]({{< relref "../infrastructure-provisioning" >}}) creates a VM, configuration management turns it into a Kafka broker: installs Java, writes `server.properties`, creates the `kafka` user, opens the firewall and starts the service. Run it on one server or five hundred and you get the same result.

## Core ideas

- **Desired state.** You describe the end result ("package `openjdk-21` present, service `kafka` running"), not shell commands.
- **Idempotence.** Running the same playbook twice changes nothing the second time. Each task checks the current state first and acts only if it differs. This makes re-runs safe and turns the tool into a drift detector.
- **Push vs pull.** In **push** mode a control machine connects to targets and applies changes (Ansible). In **pull** mode an agent on each machine periodically fetches its configuration from a server and converges (Puppet, Chef).
- **Inventory.** The list of machines, grouped by role (`brokers`, `airflow_workers`), with per-group variables.

```yaml
# Ansible playbook: idempotent setup of Kafka brokers
- hosts: brokers
  become: true
  tasks:
    - name: Java runtime
      ansible.builtin.package: { name: openjdk-21-jre-headless, state: present }
    - name: Broker config
      ansible.builtin.template: { src: server.properties.j2, dest: /opt/kafka/config/server.properties }
      notify: restart kafka            # restart only if the file actually changed
    - name: Kafka running
      ansible.builtin.service: { name: kafka, state: started, enabled: true }
  handlers:
    - name: restart kafka
      ansible.builtin.service: { name: kafka, state: restarted }
```

## The tools

| | Ansible | Puppet | Chef | Salt |
|---|---|---|---|---|
| Model | Push over SSH | Pull, agent-based | Pull, agent-based | Push or pull, agent (minion) or SSH |
| Language | YAML playbooks + Jinja2 | Puppet DSL (declarative) | Ruby DSL (recipes, cookbooks) | YAML + Jinja2 |
| Agent needed | No | Yes | Yes | Usually |
| Learning curve | Low | Medium | Higher (Ruby) | Medium |
| Owner (2026) | Red Hat (IBM) | Perforce | Progress | Broadcom (via VMware) |

**Ansible** is the most common choice today: agentless, readable YAML, and a large collection ecosystem (including modules for Kubernetes, cloud services and databases). **Puppet** and **Chef** shine on very large fleets where agents continuously enforce state and report compliance. Note that since 2025 Perforce no longer publishes open-source Puppet builds publicly; the community fork **OpenVox** continues the open-source line.

## Where it fits in 2026

Containers and managed services moved a lot of configuration into **images** (a Dockerfile) and **Kubernetes manifests**. Configuration management still matters for:

- **VMs and bare metal**: self-managed Kafka, Hadoop, ClickHouse or Postgres clusters.
- **Base images**: building golden VM images with Packer plus Ansible.
- **Day-2 operations**: rolling restarts, OS patching, certificate rotation across a fleet.

A common split: Terraform creates the machines, Ansible configures them, and everything runs from [CI/CD]({{< relref "../../cicd" >}}).

## Common mistakes

- **`shell:` everywhere.** Raw shell tasks are not idempotent and always report "changed". Use the proper module, or add `creates:` / `changed_when:`.
- **Snowflake servers.** Fixing a machine by hand and not in code means the next run (or the next new server) loses the fix.
- **Secrets in playbooks.** Use Ansible Vault or a secrets manager lookup, never plain text in Git.
- **Never running in check mode.** `ansible-playbook --check --diff` shows what would change. Run it in CI and before every production run.

## Learning Resources

### Official

- [Ansible: getting started](https://docs.ansible.com/ansible/latest/getting_started/index.html)
- [Puppet documentation](https://www.puppet.com/docs/puppet/8/puppet_index.html) and [OpenVox](https://voxpupuli.org/openvox/)
- [Chef documentation](https://docs.chef.io/)
- [Salt documentation](https://docs.saltproject.io/)

### Books

- *Ansible for DevOps*, Jeff Geerling (Leanpub), plus his free Ansible 101 video series on YouTube
- *Ansible: Up and Running*, 3rd ed. (O'Reilly)
- *Puppet 8 for DevOps Engineers* (Packt)

### Courses

- [Ansible Full Course (YouTube)](https://www.youtube.com/watch?v=9Ua2b06oAr4)
- [Ansible Full Course | Zero to Hero (YouTube)](https://www.youtube.com/watch?v=GROqwFFLl3s)
