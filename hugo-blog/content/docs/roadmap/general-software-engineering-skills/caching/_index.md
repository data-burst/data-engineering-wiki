---
title: "Caching"
weight: 6
description: "Caching explained, animated: cache-aside hits, misses and LRU eviction, write strategies, TTLs and invalidation, cache stampedes, and Redis vs Valkey vs CDN."
bookToC: false
---
<div class="lx-kicker-line">$ redis-cli info stats | grep keyspace</div>

# Caching

A **cache** is a small, fast store that keeps copies of data that is expensive to fetch or compute, so the next request can be answered from the copy. A Redis lookup takes well under a millisecond; the database query it replaces might take 10 ms, and an external API call 300 ms. Caches appear at every layer: CPU caches, the OS page cache, a database's buffer pool, an in-process dictionary, Redis, a CDN at the edge, and your browser.

The price is that a cache can be **stale**: the copy may no longer match the source. Every caching decision is a trade between speed and freshness.

## Cache-aside, step by step

**Cache-aside** (lazy loading) is the most common pattern: the application checks the cache, and on a miss loads from the database and fills the cache itself.

{{< fig kicker="$ redis-cli monitor" title="Cache-aside: miss, fill, hit, eviction" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 500">
<defs>
<marker id="cache-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="cache-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="90" y1="62" x2="90" y2="492" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="20" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="90" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">APP</text>
<text x="90" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">orders-api</text>
<line x1="380" y1="62" x2="380" y2="492" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="310" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="380" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CACHE</text>
<text x="380" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">Redis · 3 keys max</text>
<line x1="670" y1="62" x2="670" y2="492" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="600" y="14" width="140" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="670" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">DATABASE</text>
<text x="670" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">PostgreSQL</text>
<g class="f" data-step="1"><line x1="94" y1="99" x2="376" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="235" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET user:42</text></g>
<g class="f" data-step="1"><line x1="376" y1="133" x2="94" y2="133" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#cache-a)"/><text x="235" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">nil (miss)</text></g>
<g class="f" data-step="2"><line x1="94" y1="167" x2="666" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="380" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SELECT * FROM users WHERE id=42</text></g>
<g class="f" data-step="2"><line x1="666" y1="201" x2="94" y2="201" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#cache-a)"/><text x="380" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">row  (~8 ms)</text></g>
<g class="f" data-step="2"><line x1="94" y1="235" x2="376" y2="235" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="235" y="228" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SET user:42 EX 300</text></g>
<g class="f" data-step="3"><line x1="94" y1="269" x2="376" y2="269" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="235" y="262" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET user:42</text></g>
<g class="f" data-step="3"><line x1="376" y1="303" x2="94" y2="303" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#cache-a)"/><text x="235" y="296" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">hit  (~0.3 ms)</text></g>
<g class="f" data-step="4"><line x1="94" y1="337" x2="376" y2="337" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="235" y="330" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SET user:99 (cache is full)</text></g>
<g class="f" data-step="4"><rect x="308" y="356" width="144" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="380" y="371" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">LRU evicts user:42</text></g>
<g class="f" data-step="5"><line x1="94" y1="405" x2="376" y2="405" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="235" y="398" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET user:42</text></g>
<g class="f" data-step="5"><line x1="376" y1="439" x2="94" y2="439" stroke="#C2382F" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#cache-r)"/><text x="235" y="432" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">nil (miss again)</text></g>
<g class="f" data-step="5"><line x1="94" y1="473" x2="666" y2="473" stroke="#531A8A" stroke-width="1.6" marker-end="url(#cache-a)"/><text x="380" y="466" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">SELECT ... id=42</text></g>
</svg>
<table class="lx-log">
<tr><th>NO.</th><th>STEP</th><th>FROM</th><th>TO</th><th>TYPE</th><th>INFO</th></tr>
<tr class="f" data-step="1"><td>1</td><td>01</td><td>app</td><td>cache</td><td class="tag">MISS</td><td>GET user:42 → (nil)</td></tr>
<tr class="f" data-step="2"><td>2</td><td>02</td><td>app</td><td>db</td><td class="tag">QUERY</td><td>SELECT * FROM users WHERE id = 42 · 8 ms</td></tr>
<tr class="f" data-step="2"><td>3</td><td>02</td><td>app</td><td>cache</td><td class="tag">SET</td><td>SET user:42 '{…}' EX 300</td></tr>
<tr class="f" data-step="3"><td>4</td><td>03</td><td>app</td><td>cache</td><td class="tag">HIT</td><td>GET user:42 → '{"id":42,"name":"sam"}' · 0.3 ms</td></tr>
<tr class="f" data-step="4"><td>5</td><td>04</td><td>cache</td><td>cache</td><td class="tag">EVICT</td><td>maxmemory reached · allkeys-lru drops user:42</td></tr>
<tr class="f" data-step="5"><td>6</td><td>05</td><td>app</td><td>cache</td><td class="err">MISS</td><td>GET user:42 → (nil) · back to the database</td></tr>
</table>
<ol class="lx-caps">
  <li>The app owns the logic: it talks to both the <b>cache</b> and the <b>database</b>. The cache starts empty and holds at most 3 keys.</li>
  <li>A request for user 42 checks the cache first. Nothing there: a <b>cache miss</b>.</li>
  <li>The app reads the row from the database, then <b>writes it into the cache</b> with a TTL of 300 seconds.</li>
  <li>The next request for user 42 is a <b>cache hit</b>: served from memory, about 25 times faster, and the database is not touched.</li>
  <li>Other users have since been read and the cache is full. Writing user 99 forces an <b>eviction</b>: the <b>least recently used</b> key, now user:42, is dropped.</li>
  <li>The next read of user 42 is a miss again and goes to the database. <b>Hit ratio</b> depends on cache size, TTL and access pattern.</li>
</ol>
{{< /fig >}}

```python
def get_user(user_id):
    key = f"user:{user_id}"
    if (hit := redis.get(key)) is not None:
        return json.loads(hit)
    row = db.fetch_one("SELECT * FROM users WHERE id = %s", user_id)
    redis.set(key, json.dumps(row), ex=300)   # TTL bounds staleness
    return row

def update_user(user_id, fields):
    db.execute("UPDATE users SET ... WHERE id = %s", user_id)
    redis.delete(f"user:{user_id}")           # invalidate, don't update
```

## Write strategies

| Strategy | On write | Pros | Cons |
|---|---|---|---|
| **Cache-aside** + delete | Write DB, delete the key | Simple, cache holds only what is read | First read after a write is a miss |
| **Write-through** | Write cache and DB together | Reads are always warm | Writes slower; caches data nobody reads |
| **Write-behind** | Write cache, flush to DB later | Very fast writes | Data loss if the cache dies before flushing |
| **Read-through** | Cache library loads from DB itself | App code stays simple | Needs a cache that knows your data source |

## Eviction policies

When memory is full, the cache must drop something:

- **LRU** (least recently used): the usual default. Redis's `allkeys-lru` approximates it by sampling.
- **LFU** (least frequently used): better when a few keys are hot for a long time.
- **TTL-based**: keys expire after a fixed time, whether memory is full or not.

## Where caching shows up in data engineering

- **Query result caches** in Snowflake and BigQuery return repeated identical queries without re-running them, at no compute cost.
- **Dashboard caches** in Superset or Metabase stop BI tools from re-running the same expensive query every page load.
- **Spark `cache()` / `persist()`** keeps a DataFrame in memory when several actions reuse it.
- **Lookup caches** in stream processing hold dimension tables (user → country) next to a Flink job instead of querying a database per event.
- **HTTP caching** with `Cache-Control` and `ETag` (see [HTTP]({{< relref "/docs/roadmap/networking/protocols/http" >}})) saves API quota in ingestion jobs.

## Common mistakes

- **Cache stampede.** A hot key expires and 1,000 requests miss at once and hammer the database. Fix with a lock or "single flight" per key, early refresh, or random jitter on TTLs.
- **No TTL.** Without expiry, a missed invalidation leaves wrong data forever.
- **Updating the cache on write instead of deleting.** Two concurrent writers can leave the older value in the cache. Delete, and let the next read reload.
- **Caching errors or empty results without a short TTL**, so one bad response is served for an hour.
- **Treating the cache as the source of truth.** It can be flushed or evicted at any moment. Everything must still work, slower, with an empty cache.

## Tools in 2026

- **Redis** (back to an open-source AGPL option since Redis 8) and **Valkey**, the Linux Foundation fork created in 2024, offered as a managed service by AWS, Google Cloud and others. Both speak the same protocol.
- **Memcached**: simple, multi-threaded, strings only.
- **In-process**: Python `functools.lru_cache` / `cachetools`, Java Caffeine, Go `ristretto`.
- **CDNs**: Cloudflare, Fastly, CloudFront cache HTTP responses at the edge.

## Learning Resources

- *Designing Data-Intensive Applications* (2nd ed.), Martin Kleppmann: derived data and cache consistency
- [AWS: Caching best practices](https://aws.amazon.com/caching/best-practices/)
- [Scaling Memcache at Facebook](https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala): NSDI 2013 paper on leases, stampedes and invalidation
- [Redis documentation: eviction policies](https://redis.io/docs/latest/develop/reference/eviction/)
- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Even Faster Web Sites](https://www.oreilly.com/library/view/even-faster-web/9780596803087/): Steve Souders, browser-side caching

See also: [REST]({{< relref "../rest" >}}).
