---
title: "DNS"
description: "How DNS resolves a name to an IP, animated: stub and recursive resolvers, root, TLD and authoritative servers, record types, TTL caching and debugging."
bookToC: false
---
<div class="lx-kicker-line">$ dig www.example.com   # RFC 1034 / 1035, 1987</div>

# DNS

The **Domain Name System** is the internet's phone book: it turns a name like `www.example.com` into an IP address like `203.0.113.10`. It is not one database but a **distributed hierarchy**: the root servers know who runs `.com`, the `.com` servers know who runs `example.com`, and that domain's own servers hold its records. Answers are cached everywhere along the way for a time set by the record's **TTL**.

## Following one lookup

{{< fig kicker="$ dig +trace www.example.com" title="Resolving a hostname from an empty cache" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 432">
<defs>
<marker id="dns-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="dns-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="90" y1="62" x2="90" y2="424" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="24" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="90" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">LAPTOP</text>
<text x="90" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">stub resolver</text>
<line x1="235" y1="62" x2="235" y2="424" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="170" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="235" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">RESOLVER</text>
<text x="235" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">1.1.1.1</text>
<line x1="380" y1="62" x2="380" y2="424" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="314" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="380" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">ROOT</text>
<text x="380" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">.</text>
<line x1="525" y1="62" x2="525" y2="424" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="460" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="525" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">TLD</text>
<text x="525" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">.com</text>
<line x1="670" y1="62" x2="670" y2="424" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="604" y="14" width="131" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="670" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">AUTHORITATIVE</text>
<text x="670" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">ns1.example.com</text>
<g class="f" data-step="1"><rect x="32" y="84" width="116" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="90" y="99" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">OS cache: miss</text></g>
<g class="f" data-step="1"><line x1="94" y1="133" x2="231" y2="133" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dns-a)"/><text x="162" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">A? www.example.com</text></g>
<g class="f" data-step="2"><line x1="239" y1="167" x2="376" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dns-a)"/><text x="308" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">A? www.example.com</text></g>
<g class="f" data-step="2"><line x1="376" y1="201" x2="239" y2="201" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dns-a)"/><text x="308" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">referral → .com</text></g>
<g class="f" data-step="3"><line x1="239" y1="235" x2="521" y2="235" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dns-a)"/><text x="380" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">A? www.example.com</text></g>
<g class="f" data-step="3"><line x1="521" y1="269" x2="239" y2="269" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dns-a)"/><text x="380" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">referral → ns1</text></g>
<g class="f" data-step="4"><line x1="239" y1="303" x2="666" y2="303" stroke="#531A8A" stroke-width="1.6" marker-end="url(#dns-a)"/><text x="452" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">A? www.example.com</text></g>
<g class="f" data-step="4"><line x1="666" y1="337" x2="239" y2="337" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dns-a)"/><text x="452" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">A 203.0.113.10 TTL 3600</text></g>
<g class="f" data-step="5"><line x1="231" y1="371" x2="94" y2="371" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#dns-a)"/><text x="162" y="364" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">A 203.0.113.10</text></g>
<g class="f" data-step="5"><rect x="166" y="390" width="137" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="235" y="405" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">cached for 3600 s</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>laptop</td><td>resolver</td><td class="tag">QUERY</td><td>A? www.example.com (UDP 53, recursion desired)</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>resolver</td><td>root</td><td class="tag">QUERY</td><td>A? www.example.com</td></tr>
<tr class="f" data-step="2"><td>3</td><td>02</td><td>root</td><td>resolver</td><td class="tag">REFERRAL</td><td>NS a.gtld-servers.net (+ glue IPs)</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>resolver</td><td>tld</td><td class="tag">QUERY</td><td>A? www.example.com</td></tr>
<tr class="f" data-step="3"><td>5</td><td>03</td><td>tld</td><td>resolver</td><td class="tag">REFERRAL</td><td>NS ns1.example.com, ns2.example.com</td></tr>
<tr class="f" data-step="4"><td>6</td><td>04</td><td>resolver</td><td>auth</td><td class="tag">QUERY</td><td>A? www.example.com</td></tr>
<tr class="f" data-step="4"><td>7</td><td>04</td><td>auth</td><td>resolver</td><td class="tag">ANSWER</td><td>A 203.0.113.10, TTL 3600, AA flag set</td></tr>
<tr class="f" data-step="5"><td>8</td><td>05</td><td>resolver</td><td>laptop</td><td class="tag">ANSWER</td><td>A 203.0.113.10 (now cached)</td></tr>
</table>
<ol class="lx-caps">
  <li>Your laptop needs the IP of <b>www.example.com</b>. It only knows one server: its <b>recursive resolver</b>.</li>
  <li>The OS cache is empty, so the stub resolver sends one query to the recursive resolver and waits.</li>
  <li>The resolver starts at a <b>root server</b>. Root doesn't know the answer, it returns a <b>referral</b> to the .com servers.</li>
  <li>The <b>.com TLD</b> server doesn't know either. It refers the resolver to the domain's <b>authoritative</b> name servers.</li>
  <li>The authoritative server owns the zone and returns the real answer: an <b>A record</b> with a <b>TTL</b>.</li>
  <li>The resolver answers the laptop and <b>caches</b> the record. For the next hour, the same question costs one hop.</li>
</ol>
{{< /fig >}}

Four roles take part:

- **Stub resolver**: the tiny client inside your OS. It asks one question and expects a final answer.
- **Recursive resolver**: your ISP's, your cloud VPC's, or a public one such as 1.1.1.1 or 8.8.8.8. It does the legwork and caches results.
- **Root and TLD servers**: they never know the final answer, only who to ask next (a **referral**).
- **Authoritative server**: the source of truth for a zone, run by your DNS provider (Route 53, Cloudflare, Cloud DNS).

## Record types you will meet

| Type | Maps | Example |
|---|---|---|
| A / AAAA | name → IPv4 / IPv6 | `db.shop.com A 10.0.1.20` |
| CNAME | name → another name | `warehouse.shop.com CNAME abc123.snowflakecomputing.com` |
| MX | domain → mail servers | `shop.com MX 10 mail.shop.com` |
| TXT | name → text | domain verification, SPF, DKIM |
| NS | zone → its name servers | `shop.com NS ns1.provider.net` |
| SRV | service → host + port | service discovery, e.g. Kafka or LDAP |

## DNS in data platforms

- **Service discovery.** Kubernetes gives every Service a name such as `kafka.data.svc.cluster.local`. Kafka clients bootstrap through DNS and then connect to each broker's advertised hostname.
- **Private DNS.** Managed databases and warehouses expose private endpoints that resolve only inside your VPC. "Works on my laptop, fails in the job" is often a resolver difference.
- **Failover.** Managed databases fail over by repointing a DNS name. A client that caches the old IP forever keeps talking to a dead primary.

## Common mistakes

- **Ignoring TTL when migrating.** Lower the TTL (say to 60 s) a day before you change a record, or clients keep the old IP for hours.
- **Clients that cache forever.** The JVM's DNS cache is configurable via `networkaddress.cache.ttl`; long-lived pools must re-resolve to notice a failover.
- **Assuming DNS is private.** Classic DNS over UDP port 53 is plain text. **DNS over HTTPS** (DoH) and **DNS over TLS** (DoT) encrypt it. **DNSSEC** signs records so they can't be forged, but doesn't hide them.
- **Blaming the network for `ENOTFOUND`.** Check with `dig` against a specific resolver first; the record may simply not exist in that view.

## Try it

```bash
dig +short www.example.com          # just the answer
dig +trace www.example.com          # walk root → TLD → authoritative yourself
dig @8.8.8.8 db.shop.com AAAA       # ask a specific resolver for a specific type
resolvectl query db.shop.com        # what the OS resolver (systemd) returns
```

## Learning Resources

### Books

- [DNS and BIND, 5th edition](https://www.oreilly.com/library/view/dns-and-bind/0596100574/): Cricket Liu, Paul Albitz

### Articles

- [What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/): Cloudflare Learning Center
- [How DNS works (comic)](https://howdns.works/)
- [Mess with DNS](https://messwithdns.net/) and [Julia Evans on DNS](https://jvns.ca/categories/dns/): experiment with real records

### Specifications

- [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034) and [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035): the original DNS specs
- [RFC 8484: DNS over HTTPS](https://www.rfc-editor.org/rfc/rfc8484)

### Videos

- [Everything You Need to Know About DNS](https://www.youtube.com/watch?v=27r4Bzuj5NQ)

See also: [UDP]({{< relref "udp" >}}), [HTTPS]({{< relref "https" >}}).
