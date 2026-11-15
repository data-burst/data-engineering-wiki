---
title: "Firewalls"
description: "How firewalls work, animated: stateless vs stateful packet filtering, connection tracking, default deny, egress rules, cloud security groups and WAFs."
bookToC: false
---
<div class="lx-kicker-line">$ sudo nft list ruleset</div>

# Firewalls

A **firewall** checks each network packet or connection against a list of rules and decides to **allow** it or **drop** it. Rules match on things like source and destination IP, port, protocol and, in a **stateful** firewall, whether the packet belongs to a connection that was already allowed. Firewalls run on a single host (Linux `nftables`, Windows Defender Firewall), at the network edge (appliances from Palo Alto, Fortinet, Cisco), and in the cloud as **security groups** and network ACLs.

## A stateful firewall at work

{{< fig kicker="$ nft list ruleset" title="A stateful firewall deciding packet by packet" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 398">
<defs>
<marker id="fw-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="fw-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="90" y1="62" x2="90" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="20" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="90" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">INTERNET</text>
<text x="90" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">203.0.113.9</text>
<line x1="380" y1="62" x2="380" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="310" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="380" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">FIREWALL</text>
<text x="380" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">stateful</text>
<line x1="670" y1="62" x2="670" y2="390" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="600" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="670" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">WEB SERVER</text>
<text x="670" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">10.0.1.10</text>
<g class="f" data-step="1"><line x1="94" y1="99" x2="376" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#fw-a)"/><text x="235" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN → :443</text></g>
<g class="f" data-step="1"><rect x="301" y="118" width="158" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="380" y="133" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">rule 1 allow · track</text></g>
<g class="f" data-step="1"><line x1="384" y1="167" x2="666" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#fw-a)"/><text x="525" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN → :443</text></g>
<g class="f" data-step="2"><line x1="666" y1="201" x2="384" y2="201" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#fw-a)"/><text x="525" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN-ACK</text></g>
<g class="f" data-step="2"><line x1="376" y1="235" x2="94" y2="235" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#fw-a)"/><text x="235" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SYN-ACK (state ok)</text></g>
<g class="f" data-step="3"><line x1="94" y1="269" x2="376" y2="269" stroke="#C2382F" stroke-width="1.6" marker-end="url(#fw-r)"/><text x="235" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">SYN → :22</text></g>
<g class="f" data-step="3"><rect x="318" y="288" width="123" height="22" rx="5" fill="#fff" stroke="#C2382F"/><text x="380" y="303" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">no match → DROP</text></g>
<g class="f" data-step="4"><line x1="666" y1="337" x2="384" y2="337" stroke="#C2382F" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#fw-r)"/><text x="525" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">SYN → 198.51.100.7:25</text></g>
<g class="f" data-step="4"><rect x="329" y="356" width="102" height="22" rx="5" fill="#fff" stroke="#C2382F"/><text x="380" y="371" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">egress: DROP</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>203.0.113.9</td><td>10.0.1.10</td><td class="tag">ACCEPT</td><td>tcp dport 443 · rule 1 · conntrack: NEW</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>10.0.1.10</td><td>203.0.113.9</td><td class="tag">ACCEPT</td><td>tcp sport 443 · ct state established · rule 2</td></tr>
<tr class="f" data-step="3"><td>3</td><td>03</td><td>203.0.113.9</td><td>10.0.1.10</td><td class="err">DROP</td><td>tcp dport 22 · no rule · policy drop</td></tr>
<tr class="f" data-step="4"><td>4</td><td>04</td><td>10.0.1.10</td><td>198.51.100.7</td><td class="err">DROP</td><td>tcp dport 25 · output policy drop</td></tr>
</table>
<ol class="lx-caps">
  <li>Rules: (1) allow TCP 443 in, (2) allow packets of <b>established</b> connections, (3) <b>drop everything else</b>, in and out.</li>
  <li>A new HTTPS connection matches rule 1. The firewall forwards it and records the flow in its <b>connection-tracking table</b>.</li>
  <li>The server's reply has no rule of its own. It passes because it belongs to a <b>tracked connection</b>: that is what <b>stateful</b> means.</li>
  <li>Someone probes SSH on port 22. No rule allows it, so the <b>default deny</b> drops it silently.</li>
  <li>The server itself tries to open an SMTP connection out. <b>Egress filtering</b> blocks it, a common sign of malware or a leak.</li>
</ol>
{{< /fig >}}

The same rules written for Linux `nftables`:

```text
table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state established,related accept      # replies to allowed connections
    iif "lo" accept
    tcp dport 443 accept                     # HTTPS from anywhere
    ip saddr 10.0.0.0/16 tcp dport 22 accept # SSH only from inside the VPC
  }
}
```

## Types of firewall

| Type | Decides on | Strength | Weakness |
|---|---|---|---|
| Stateless packet filter | Each packet alone: IPs, ports, protocol | Very fast, simple | Must open return traffic explicitly; easy to get wrong |
| Stateful | Packet + connection-tracking table | Replies allowed automatically; the default today | Table can fill up under heavy load or attack |
| Application-level / proxy | The application protocol (HTTP, SQL) | Can inspect content, terminate TLS | Slower, protocol-specific |
| Next-generation (NGFW) | Apps, users, threat signatures, TLS inspection | Deep visibility | Cost, complexity, privacy concerns of decryption |
| WAF | HTTP requests to a web app | Blocks SQL injection, XSS, bots | Only for HTTP, needs tuning |

## Firewalls in the cloud

- **Security groups** (AWS, also GCP and Azure firewall rules) are stateful and attached to instances, load balancers and managed databases. A typical setup: the database's group allows port 5432 only from the app's security group, not from an IP range.
- **Network ACLs** are stateless and apply to a whole subnet. Remember to allow the ephemeral return ports (1024 to 65535).
- **Kubernetes NetworkPolicies** do the same between pods, enforced by the CNI plugin (Calico, Cilium).

## Common mistakes

- **`0.0.0.0/0` on a database port.** Exposed databases are found by scanners within hours. Allow only the subnets or security groups that need access.
- **No egress rules.** Most setups allow all outbound traffic. Restricting it limits data exfiltration and malware call-backs.
- **Debugging blind.** A dropped SYN looks like a timeout; a rejected one looks like "connection refused". Test with `nc -vz host port` from the actual source machine, and enable flow logs (VPC Flow Logs) to see drops.
- **Treating the firewall as the only defense.** Once an attacker is inside the perimeter, flat networks let them move freely. Combine with authentication on every service (zero trust).

## Learning Resources

- [What is a firewall?](https://www.cloudflare.com/learning/security/what-is-a-firewall/): Cloudflare Learning Center
- [nftables wiki: quick reference](https://wiki.nftables.org/wiki-nftables/index.php/Quick_reference-nftables_in_10_minutes)
- [AWS: Security groups vs network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html)
- [Kubernetes Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [Firewalls and Internet Security: Repelling the Wily Hacker](https://www.oreilly.com/library/view/firewalls-and-internet/020163466X/): Cheswick, Bellovin, Rubin, a classic
- [Google Cybersecurity Professional Certificate](https://www.coursera.org/professional-certificates/google-cybersecurity): includes network security and firewalls

See also: [TCP/IP]({{< relref "../protocols/tcp" >}}), [VPN]({{< relref "vpn" >}}).
