---
title: "Protocols"
weight: 1
description: "The core internet protocols a data engineer touches daily: TCP/IP, UDP, DNS, HTTP, HTTPS/TLS and SSH, explained with packet-level animations."
---
<div class="lx-kicker-line">$ ss -tuln</div>

# Protocols

A protocol is an agreement on the format and order of messages between two programs. The internet stacks them in layers: **IP** gets a packet to the right machine, **TCP** or **UDP** gets it to the right program, and application protocols such as **HTTP**, **DNS** and **SSH** define what the bytes mean. Each page below follows real messages over the wire, step by step.

| Layer | Protocols here | Job |
|---|---|---|
| Application | [HTTP]({{< relref "http" >}}), [HTTPS]({{< relref "https" >}}), [DNS]({{< relref "dns" >}}), [SSH]({{< relref "ssh" >}}) | Meaning of the messages |
| Transport | [TCP]({{< relref "tcp" >}}), [UDP]({{< relref "udp" >}}) | Ports, reliability, ordering |
| Internet | IP (see [IP addressing]({{< relref "/docs/roadmap/networking/concepts/ip-addressing" >}})) | Addressing and routing between networks |
| Link | Ethernet, Wi-Fi, ARP | One hop on a local network |

<div class="lx-cards">
  <div class="lx-card"><div class="lab">Transport</div><h4><a href="{{< relref "tcp" >}}">TCP/IP</a></h4><p>The three-way handshake, sequence numbers, retransmission and teardown that make a reliable byte stream.</p></div>
  <div class="lx-card"><div class="lab">Transport</div><h4><a href="{{< relref "udp" >}}">UDP</a></h4><p>Datagrams without a connection, and why DNS, video and QUIC use it anyway.</p></div>
  <div class="lx-card"><div class="lab">Application</div><h4><a href="{{< relref "dns" >}}">DNS</a></h4><p>How a name becomes an IP: resolvers, root, TLD and authoritative servers, records and TTLs.</p></div>
  <div class="lx-card"><div class="lab">Application</div><h4><a href="{{< relref "http" >}}">HTTP</a></h4><p>Requests, responses, methods, status codes, caching, and HTTP/1.1 vs HTTP/2 vs HTTP/3.</p></div>
  <div class="lx-card"><div class="lab">Security</div><h4><a href="{{< relref "https" >}}">HTTPS</a></h4><p>The TLS 1.3 handshake, certificates and chains of trust, and how to debug certificate errors.</p></div>
  <div class="lx-card"><div class="lab">Remote access</div><h4><a href="{{< relref "ssh" >}}">SSH</a></h4><p>Encrypted shells, public-key login, <code>known_hosts</code>, and tunnels to private databases.</p></div>
</div>

Start with TCP/IP, then UDP, then the application protocols in any order. To see which of them your machine is using right now:

```bash
ss -tuln                          # TCP and UDP ports listening on this machine
ss -tn state established          # open TCP connections and their remote ends
curl -sI https://example.com | head -1   # which HTTP version the server speaks
```
