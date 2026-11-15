---
title: "UDP"
description: "UDP explained: connectionless datagrams, the 8-byte header, why DNS, streaming and QUIC use it, and an animated side-by-side comparison with TCP."
bookToC: false
---
<div class="lx-kicker-line">$ man 7 udp   # RFC 768, 1980</div>

# UDP

**UDP** (User Datagram Protocol) sends independent messages, called **datagrams**, from one port to another with no connection, no acknowledgments, no retransmission and no ordering. Each datagram either arrives whole or not at all. That makes UDP fast and simple, and it leaves reliability to the application, if the application wants it.

## TCP and UDP under the same packet loss

{{< fig kicker="$ send 3 messages, 1 gets lost" title="TCP and UDP, same network, same loss" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 398">
<defs>
<marker id="udp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="udp-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="380" y1="10" x2="380" y2="400" stroke="#E7E7EF" stroke-width="1.5"/>
<line x1="75" y1="62" x2="75" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="7" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="75" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">TCP CLIENT</text>
<line x1="305" y1="62" x2="305" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="237" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="305" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">TCP SERVER</text>
<line x1="455" y1="62" x2="455" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="387" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="455" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">UDP CLIENT</text>
<line x1="685" y1="62" x2="685" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="617" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="685" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">UDP SERVER</text>
<g class="f" data-step="1"><line x1="79" y1="99" x2="301" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="190" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN</text></g>
<g class="f" data-step="1"><line x1="301" y1="133" x2="79" y2="133" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#udp-a)"/><text x="190" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN-ACK</text></g>
<g class="f" data-step="1"><line x1="79" y1="167" x2="301" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="190" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">ACK</text></g>
<g class="f" data-step="1"><line x1="459" y1="99" x2="681" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="570" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">datagram #1</text></g>
<g class="f" data-step="1"><line x1="459" y1="133" x2="570" y2="133" stroke="#C2382F" stroke-width="1.6" marker-end="url(#udp-r)"/><text x="580" y="138" text-anchor="middle" font-size="15" font-weight="700" fill="#C2382F">✕</text><text x="522" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">datagram #2</text></g>
<g class="f" data-step="1"><line x1="459" y1="167" x2="681" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="570" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">datagram #3</text></g>
<g class="f" data-step="2"><rect x="390" y="186" width="130" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="455" y="201" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">done, no waiting</text></g>
<g class="f" data-step="2"><rect x="641" y="220" width="88" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="685" y="235" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">got #1, #3</text></g>
<g class="f" data-step="3"><line x1="79" y1="201" x2="301" y2="201" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="190" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">seg 1</text></g>
<g class="f" data-step="3"><line x1="79" y1="235" x2="190" y2="235" stroke="#C2382F" stroke-width="1.6" marker-end="url(#udp-r)"/><text x="200" y="240" text-anchor="middle" font-size="15" font-weight="700" fill="#C2382F">✕</text><text x="142" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">seg 2</text></g>
<g class="f" data-step="3"><line x1="79" y1="269" x2="301" y2="269" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="190" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">seg 3</text></g>
<g class="f" data-step="4"><line x1="301" y1="303" x2="79" y2="303" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#udp-a)"/><text x="190" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">dup ACK: still need 2</text></g>
<g class="f" data-step="4"><line x1="79" y1="337" x2="301" y2="337" stroke="#531A8A" stroke-width="1.6" marker-end="url(#udp-a)"/><text x="190" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">retransmit seg 2</text></g>
<g class="f" data-step="5"><rect x="240" y="356" width="130" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="305" y="371" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">1, 2, 3 in order</text></g>
<g class="f" data-step="5"><rect x="603" y="254" width="151" height="22" rx="5" fill="#fff" stroke="#C2382F"/><text x="678" y="269" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">#2 is gone for good</text></g>
</svg>
<ol class="lx-caps">
  <li>Left: TCP. Right: UDP. Each side sends three messages over the same lossy network.</li>
  <li>TCP spends a round trip on the <b>handshake</b> before any data. UDP just sends: three <b>datagrams</b>, and #2 is lost.</li>
  <li>UDP is already finished. The receiver got <b>#1 and #3</b>. Nothing tells either side that #2 is missing.</li>
  <li>TCP sends its three segments. Segment 2 is lost too.</li>
  <li>The receiver <b>ACKs</b> only what arrived in order, so the sender <b>retransmits</b> segment 2. Segment 3 waits in a buffer meanwhile.</li>
  <li>TCP delivers <b>all three, in order</b>, but later. UDP delivered <b>two, immediately</b>. Which is better depends on the app.</li>
</ol>
{{< /fig >}}

## The whole header is 8 bytes

| Field | Size | Meaning |
|---|---|---|
| Source port | 16 bits | Where replies go |
| Destination port | 16 bits | Which program receives it (53 = DNS) |
| Length | 16 bits | Header + data, in bytes |
| Checksum | 16 bits | Detects corruption (mandatory in IPv6) |

Compare that with TCP's 20 to 60 bytes of sequence numbers, ACKs, windows and flags. Because there is no connection, the server keeps no per-client state, which is why one DNS server can answer millions of clients.

## TCP vs UDP

| | TCP | UDP |
|---|---|---|
| Connection | Handshake first | None, send immediately |
| Delivery | Guaranteed or the connection fails | Best effort |
| Ordering | In order | Any order |
| Message boundaries | No: a byte stream | Yes: one send = one datagram |
| Head-of-line blocking | Yes | No |
| Typical use | Databases, HTTP/1.1 and HTTP/2, Kafka, SSH | DNS, video calls, games, metrics (StatsD), QUIC / HTTP/3 |

## When UDP is the right choice

- **Small request, small reply.** A DNS lookup fits in one datagram each way. A TCP handshake would triple the latency.
- **Fresh beats complete.** In a voice call, a packet that arrives 300 ms late is useless. Skip it and play the next one.
- **You want to build your own reliability.** **QUIC**, the transport under **HTTP/3**, runs over UDP and implements streams, retransmission and TLS 1.3 itself. Losing one stream's packet no longer blocks the others, and it can be updated in user space instead of the OS kernel.
- **Fire-and-forget telemetry.** StatsD and many syslog setups send metrics over UDP so a slow collector never slows the app.

## Common mistakes

- **Assuming UDP delivery is "usually fine".** On a busy host, receive buffers overflow and datagrams are dropped silently. Watch `netstat -su` for receive errors.
- **Sending datagrams larger than the path MTU.** Anything above roughly 1,200 to 1,400 bytes may be fragmented or dropped. DNS falls back to TCP for large answers for this reason.
- **Forgetting UDP is easy to spoof.** No handshake means the source IP is not verified, which enables reflection and amplification DDoS attacks.

## Learning Resources

- [RFC 768: User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768): the whole spec is three pages
- [RFC 9000: QUIC](https://www.rfc-editor.org/rfc/rfc9000) and [HTTP/3 explained](https://http3-explained.haxx.se/): Daniel Stenberg
- [What is UDP?](https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/): Cloudflare Learning Center
- [TCP/IP Illustrated, Volume 1](https://www.oreilly.com/library/view/tcpip-illustrated-volume/9780132808200/): chapter on UDP and IP fragmentation
- [TCP vs UDP Comparison: Cisco CCNA](https://www.youtube.com/watch?v=cA9ZJdqzOoU)

See also: [TCP/IP]({{< relref "tcp" >}}), [DNS]({{< relref "dns" >}}).
