---
title: "SSH"
description: "How SSH works, animated: key exchange, host keys and known_hosts, public-key login with ed25519, plus SSH config, agent forwarding and tunnels to databases."
bookToC: false
---
<div class="lx-kicker-line">$ ssh deploy@db1.internal   # RFC 4251–4254</div>

# SSH

**SSH** (Secure Shell) gives you an encrypted, authenticated connection to a remote machine over an untrusted network, usually on TCP port 22. You use it to get a shell on a server, run a remote command, copy files (`scp`, `sftp`, `rsync`), and **tunnel** other traffic, such as a PostgreSQL connection to a database that only accepts traffic from inside a private network. OpenSSH is the implementation on almost every Linux and macOS machine, and it ships with Windows.

## Logging in with a key

{{< fig kicker="$ ssh -v deploy@db1.internal" title="SSH public-key login" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 364">
<defs>
<marker id="ssh-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="ssh-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="200" y1="62" x2="200" y2="356" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="130" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="200" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">LAPTOP</text>
<text x="200" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">~/.ssh/id_ed25519</text>
<line x1="560" y1="62" x2="560" y2="356" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="490" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="560" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">SERVER</text>
<text x="560" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">sshd, authorized_keys</text>
<g class="f" data-step="1"><line x1="204" y1="99" x2="556" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#ssh-a)"/><text x="380" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">TCP :22 + version exchange</text></g>
<g class="f" data-step="1"><line x1="204" y1="133" x2="556" y2="133" stroke="#531A8A" stroke-width="1.6" marker-end="url(#ssh-a)"/><text x="380" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">KEX init: client key share</text></g>
<g class="f" data-step="2"><line x1="556" y1="167" x2="204" y2="167" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#ssh-a)"/><text x="380" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">KEX reply: key share, host key, sig</text></g>
<g class="f" data-step="2"><rect x="132" y="186" width="137" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="200" y="201" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">check known_hosts</text></g>
<g class="f" data-step="2"><rect x="491" y="186" width="138" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="560" y="201" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">session keys</text></g>
<g class="f" data-step="3"><line x1="204" y1="235" x2="556" y2="235" stroke="#531A8A" stroke-width="1.6" marker-end="url(#ssh-a)"/><text x="380" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">publickey: ed25519 pub + signature</text></g>
<g class="f" data-step="4"><rect x="432" y="254" width="256" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="560" y="269" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">pub in authorized_keys? sig valid?</text></g>
<g class="f" data-step="4"><line x1="556" y1="303" x2="204" y2="303" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#ssh-a)"/><text x="380" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">auth success</text></g>
<g class="f" data-step="5"><line x1="204" y1="337" x2="556" y2="337" stroke="#531A8A" stroke-width="1.6" marker-end="url(#ssh-a)"/><text x="380" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">channel: shell / exec / port-forward</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>laptop</td><td>server</td><td class="tag">BANNER</td><td>SSH-2.0-OpenSSH_10.0</td></tr>
<tr class="f" data-step="1"><td>2</td><td>01</td><td>laptop</td><td>server</td><td class="tag">KEX</td><td>algorithm negotiation (mlkem768x25519-sha256) · client ephemeral key share</td></tr>
<tr class="f" data-step="2"><td>3</td><td>02</td><td>server</td><td>laptop</td><td class="tag">KEX REPLY</td><td>server key share · host key ssh-ed25519 SHA256:3f9a… · signature over exchange hash → both derive session keys (NEWKEYS)</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>laptop</td><td>server</td><td class="tag">USERAUTH</td><td>publickey, user=deploy, ssh-ed25519 AAAAC3…, signature</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>server</td><td>laptop</td><td class="tag">SUCCESS</td><td>SSH_MSG_USERAUTH_SUCCESS</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>laptop</td><td>server</td><td class="tag">CHANNEL</td><td>session → exec "pg_dump analytics"</td></tr>
</table>
<ol class="lx-caps">
  <li>You generated a key pair with <code>ssh-keygen -t ed25519</code>. The <b>public key</b> sits in the server's <code>~/.ssh/authorized_keys</code>. The <b>private key</b> never leaves the laptop.</li>
  <li>After TCP and a version banner, the client starts the <b>key exchange</b> by sending its ephemeral key share.</li>
  <li>The server replies with its key share, its <b>host key</b> and a signature over the exchange, proving <b>its</b> identity first. The client compares the host key with <code>known_hosts</code> (a mismatch means a possible man-in-the-middle). Both sides derive session keys; from here on, everything is encrypted.</li>
  <li>The client proves <b>your</b> identity: it signs the unique session ID with the private key and sends the signature plus the public key.</li>
  <li>The server checks that the public key is authorized and that the signature verifies. No password crossed the network.</li>
  <li>The authenticated connection now carries <b>channels</b>: an interactive shell, a remote command, an scp/sftp transfer or a tunnel.</li>
</ol>
{{< /fig >}}

In the real protocol the client may first ask "would you accept this key?" without a signature, and sign only if the server says yes. The idea is the same: proof of the private key without revealing it.

## Keys and files

| File | Where | Holds |
|---|---|---|
| `~/.ssh/id_ed25519` | Your laptop | **Private key.** Protect it with a passphrase. Never copy it to servers. |
| `~/.ssh/id_ed25519.pub` | Your laptop | Public key: safe to share |
| `~/.ssh/authorized_keys` | Server, per user | Public keys allowed to log in as that user |
| `~/.ssh/known_hosts` | Your laptop | Host keys of servers you trust |
| `~/.ssh/config` | Your laptop | Aliases, users, jump hosts, ports |

Use **ed25519** keys. RSA is fine at 3072 bits or more; DSA is gone from OpenSSH. Since OpenSSH 10.0 (2025) the default key exchange is the hybrid post-quantum `mlkem768x25519-sha256`.

## Tunnels: reaching a private database

A database in a private subnet has no public IP. A **bastion** (jump host) does. SSH can forward a local port through it:

```bash
# local 15432 → bastion → db.internal:5432
ssh -N -L 15432:db.internal:5432 me@bastion.shop.com
psql "host=localhost port=15432 dbname=analytics user=analyst"
```

Or put it in `~/.ssh/config` once:

```text
Host bastion
  HostName bastion.shop.com
  User me
Host db1
  HostName 10.0.1.20
  User deploy
  ProxyJump bastion
```

Then `ssh db1` hops through the bastion automatically.

## Common mistakes

- **Answering "yes" to a changed host key without checking.** The warning exists to catch man-in-the-middle attacks. Confirm the fingerprint out of band.
- **Sharing one private key across a team.** You lose the ability to revoke one person. One key per person, or short-lived **SSH certificates** signed by a CA.
- **Leaving password login on.** Set `PasswordAuthentication no` and `PermitRootLogin no` in `sshd_config`.
- **`ForwardAgent yes` to untrusted hosts.** Root on that host can use your agent to log in elsewhere as you. Prefer `ProxyJump`.
- **Long-lived open port 22 to the internet.** Restrict it with a firewall, a VPN, or a cloud session manager (AWS SSM, GCP IAP) instead of a bastion.

## Learning Resources

- [OpenSSH manual pages](https://www.openssh.com/manual.html): `ssh`, `ssh_config`, `sshd_config`, `ssh-keygen`
- [SSH Mastery, 2nd edition](https://mwl.io/nonfiction/tools#ssh): Michael W. Lucas, practical and current
- [SSH, The Secure Shell: The Definitive Guide](https://www.oreilly.com/library/view/ssh-the-secure/0596008953/): deep protocol background
- [RFC 4253: SSH Transport Layer Protocol](https://www.rfc-editor.org/rfc/rfc4253)
- [SSH Tips and Tricks](https://carlosbecker.com/posts/ssh-tips-and-tricks/): Carlos Becker
- [SSH Tutorial: Crash Course](https://www.youtube.com/watch?v=UnM4QAumuCQ)

See also: [HTTPS]({{< relref "https" >}}), [Firewalls]({{< relref "../concepts/firewalls" >}}), [Linux]({{< relref "/docs/roadmap/operating-system/linux" >}}).
