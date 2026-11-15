---
weight: 1
description: "The core internet protocols a data engineer touches daily: TCP/IP, UDP, DNS, HTTP, HTTPS/TLS and SSH, explained with packet-level animations."
---
# Protocols

A protocol is an agreement on the format and order of messages between two programs. The internet stacks them in layers: **IP** gets a packet to the right machine, **TCP** or **UDP** gets it to the right program, and application protocols such as **HTTP**, **DNS** and **SSH** define what the bytes mean.

| Layer | Protocols here | Job |
|---|---|---|
| Application | [HTTP]({{< relref "http" >}}), [HTTPS]({{< relref "https" >}}), [DNS]({{< relref "dns" >}}), [SSH]({{< relref "ssh" >}}) | Meaning of the messages |
| Transport | [TCP]({{< relref "tcp" >}}), [UDP]({{< relref "udp" >}}) | Ports, reliability, ordering |
| Internet | IP (in [TCP/IP]({{< relref "tcp" >}})) | Addressing and routing between networks |
| Link | Ethernet, Wi-Fi | One hop on a local network |

Start with TCP/IP, then UDP, then the application protocols in any order.
