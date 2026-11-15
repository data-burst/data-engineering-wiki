---
title: "TCP/IP"
weight: 1
description: "How TCP/IP works, animated: the four-layer model, IP addresses and ports, the TCP three-way handshake, sequence numbers, retransmission and teardown."
bookToC: false
---
<div class="lx-kicker-line">$ man 7 tcp   # RFC 791 (IP) · RFC 9293 (TCP)</div>

# TCP/IP

**TCP/IP** is the protocol suite the internet runs on. **IP** (Internet Protocol) moves individual packets from one machine to another by address, with no promises: packets can be lost, duplicated or reordered. **TCP** (Transmission Control Protocol) runs on top and turns that unreliable packet service into a **reliable, ordered byte stream** between two programs. Your database driver, HTTP client and Kafka producer all sit on a TCP connection.

## The layers

| Layer | Example | Unit | Addresses with |
|---|---|---|---|
| Application | HTTP, PostgreSQL wire protocol, Kafka | message | URLs, topic names |
| Transport | TCP, UDP | segment / datagram | **port** (5432, 443, 9092) |
| Internet | IPv4, IPv6 | packet | **IP address** (10.0.1.20, 2001:db8::1) |
| Link | Ethernet, Wi-Fi | frame | MAC address |

Each layer wraps the one above in its own header. A connection is identified by five values: protocol, source IP, source port, destination IP, destination port. That is how one server can hold thousands of connections on port 5432 at once.

The OSI model has seven layers. TCP/IP merges OSI's top three into "application", which matches how real software is built.

## A TCP connection, step by step

{{< fig kicker="$ tcpdump -n 'tcp port 5432'" title="TCP connection: handshake, data, teardown" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 500">
<defs>
<marker id="tcp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="tcp-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="200" y1="62" x2="200" y2="492" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="130" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="200" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
<text x="200" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">10.0.0.5:52114</text>
<line x1="560" y1="62" x2="560" y2="492" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="490" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="560" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">SERVER</text>
<text x="560" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">10.0.1.20:5432</text>
<g class="f" data-step="1"><rect x="163" y="84" width="74" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="200" y="99" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN_SENT</text></g>
<g class="f" data-step="1"><line x1="204" y1="133" x2="556" y2="133" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tcp-a)"/><text x="380" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN  seq=1000</text></g>
<g class="f" data-step="2"><line x1="556" y1="167" x2="204" y2="167" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tcp-a)"/><text x="380" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN-ACK  seq=5000 ack=1001</text></g>
<g class="f" data-step="3"><line x1="204" y1="201" x2="556" y2="201" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tcp-a)"/><text x="380" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ACK  ack=5001</text></g>
<g class="f" data-step="3"><rect x="152" y="220" width="95" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="200" y="235" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ESTABLISHED</text></g>
<g class="f" data-step="3"><rect x="512" y="220" width="95" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="560" y="235" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ESTABLISHED</text></g>
<g class="f" data-step="4"><line x1="204" y1="269" x2="556" y2="269" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tcp-a)"/><text x="380" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">data  seq=1001 len=100</text></g>
<g class="f" data-step="4"><line x1="556" y1="303" x2="204" y2="303" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tcp-a)"/><text x="380" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ACK  ack=1101</text></g>
<g class="f" data-step="5"><line x1="204" y1="337" x2="556" y2="337" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tcp-a)"/><text x="380" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">FIN  seq=1101</text></g>
<g class="f" data-step="5"><line x1="556" y1="371" x2="204" y2="371" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tcp-a)"/><text x="380" y="364" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ACK  ack=1102</text></g>
<g class="f" data-step="5"><line x1="556" y1="405" x2="204" y2="405" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#tcp-a)"/><text x="380" y="398" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">FIN  seq=5001</text></g>
<g class="f" data-step="5"><line x1="204" y1="439" x2="556" y2="439" stroke="#531A8A" stroke-width="1.6" marker-end="url(#tcp-a)"/><text x="380" y="432" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ACK  ack=5002</text></g>
<g class="f" data-step="5"><rect x="124" y="458" width="151" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="200" y="473" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">TIME_WAIT (2 x MSL)</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>client</td><td>server</td><td class="tag">SYN</td><td>seq=1000, win=64240, MSS=1460</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>server</td><td>client</td><td class="tag">SYN-ACK</td><td>seq=5000, ack=1001</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>client</td><td>server</td><td class="tag">ACK</td><td>ack=5001 → connection established</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>client</td><td>server</td><td class="tag">PSH,ACK</td><td>seq=1001, len=100 (query bytes)</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>server</td><td>client</td><td class="tag">ACK</td><td>ack=1101 (got bytes 1001–1100)</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>client</td><td>server</td><td class="tag">FIN</td><td>seq=1101</td></tr>
<tr class="f" data-step="5"><td>7</td><td>05</td><td>server</td><td>client</td><td class="tag">ACK</td><td>ack=1102</td></tr>
<tr class="f" data-step="5"><td>8</td><td>05</td><td>server</td><td>client</td><td class="tag">FIN</td><td>seq=5001</td></tr>
<tr class="f" data-step="5"><td>9</td><td>05</td><td>client</td><td>server</td><td class="tag">ACK</td><td>ack=5002 → client in TIME_WAIT</td></tr>
</table>
<ol class="lx-caps">
  <li>A client (say, a Python app) wants to talk to PostgreSQL on port 5432. No connection exists yet.</li>
  <li>The client sends <b>SYN</b> with a random starting <b>sequence number</b>.</li>
  <li>The server replies <b>SYN-ACK</b>: its own sequence number, and an acknowledgment of the client's (1000 + 1).</li>
  <li>The client sends <b>ACK</b>. Both sides are <b>ESTABLISHED</b>. That cost one full round trip before any data.</li>
  <li>Data flows. Every byte is numbered, and the receiver <b>acknowledges</b> what it got. Missing bytes are resent.</li>
  <li>Closing takes four segments: each side sends <b>FIN</b> and ACKs the other's. The side that closed first waits in <b>TIME_WAIT</b>.</li>
</ol>
{{< /fig >}}

## What TCP gives you, and what it costs

- **Reliability.** Every byte has a sequence number. Unacknowledged data is retransmitted after a timeout or after duplicate ACKs.
- **Ordering.** The receiver reassembles bytes in order before handing them to the app.
- **Flow control.** The receiver advertises a **window**: how much it can buffer. A slow consumer slows the sender.
- **Congestion control.** The sender probes the network's capacity (slow start, then CUBIC or BBR) and backs off on loss.

The costs: one round trip for the handshake before any data, and **head-of-line blocking**: if one segment is lost, everything after it waits, even if it already arrived. That second cost is why HTTP/3 moved to QUIC over UDP.

## Common mistakes

- **Opening a new connection per query.** Each one costs a handshake, often plus TLS and database authentication. Use a connection pool (PgBouncer, HikariCP, SQLAlchemy's pool).
- **No timeouts.** A peer that vanishes without a FIN leaves your socket waiting forever. Set connect and read timeouts, and enable TCP keepalive for long-idle connections.
- **Running out of ephemeral ports.** A client that opens and closes thousands of short connections piles up sockets in `TIME_WAIT`. Reuse connections instead of tuning the kernel.
- **Confusing "connection refused" with "timeout".** Refused (an RST) means the host is up but nothing listens on that port. A timeout usually means a firewall silently dropped the SYN.

## Try it

```bash
ss -tan state established        # open TCP connections on Linux
nc -vz db1.internal 5432         # can I reach the port at all?
sudo tcpdump -n -i any 'tcp port 5432 and tcp[tcpflags] & (tcp-syn|tcp-fin) != 0'
```

## Learning Resources

### Books

- [TCP/IP Illustrated, Volume 1: The Protocols](https://www.oreilly.com/library/view/tcpip-illustrated-volume/9780132808200/): W. Richard Stevens, Kevin Fall
- *Computer Networking: A Top-Down Approach*, Kurose and Ross: chapter 3 (transport layer)
- [High Performance Browser Networking: Building Blocks of TCP](https://hpbn.co/building-blocks-of-tcp/): Ilya Grigorik, free online

### Specifications

- [RFC 9293: Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 791: Internet Protocol](https://www.rfc-editor.org/rfc/rfc791)

### Videos

- [TCP/IP Tutorial: What Is TCP/IP And How Does It Work?](https://www.youtube.com/watch?v=kE7OLr9zTqk)

See also: [UDP]({{< relref "udp" >}}), [HTTP]({{< relref "http" >}}), [Firewalls]({{< relref "../concepts/firewalls" >}}).
