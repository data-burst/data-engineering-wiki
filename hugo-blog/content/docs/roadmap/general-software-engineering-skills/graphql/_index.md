---
title: "GraphQL"
weight: 3
description: "GraphQL explained, animated: schemas, queries and resolvers, how it avoids over- and under-fetching compared to REST, the N+1 problem, and when not to use it."
bookToC: false
---
<div class="lx-kicker-line">$ curl -X POST /graphql -d '{"query":"{ user(id: 42) { name } }"}'</div>

# GraphQL

**GraphQL** is a query language for APIs. Instead of many fixed endpoints, the server publishes one **typed schema**, and each client sends a query that describes **exactly the fields it wants**, nested as deep as it needs. The response has the same shape as the query. Facebook built it in 2012 for its mobile apps and open-sourced it in 2015; it is now governed by the GraphQL Foundation. GitHub, Shopify and many internal "backend for frontend" layers use it.

## REST vs GraphQL for one screen

{{< fig kicker="$ show user 42 with last 3 order totals" title="Same screen, REST vs GraphQL" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 262">
<defs>
<marker id="gql-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker>
<marker id="gql-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#C2382F"/></marker>
</defs>
<line x1="380" y1="10" x2="380" y2="400" stroke="#E7E7EF" stroke-width="1.5"/>
<line x1="75" y1="62" x2="75" y2="254" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="7" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="75" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
<text x="75" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">REST</text>
<line x1="305" y1="62" x2="305" y2="254" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="237" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="305" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">REST API</text>
<line x1="455" y1="62" x2="455" y2="254" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="387" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="455" y="33" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">CLIENT</text>
<text x="455" y="50" text-anchor="middle" class="m" font-size="11" fill="#8C8899">GraphQL</text>
<line x1="685" y1="62" x2="685" y2="254" stroke="#DCDAE6" stroke-width="1.2" stroke-dasharray="2 5"/>
<rect x="617" y="14" width="136" height="46" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
<text x="685" y="42" text-anchor="middle" class="m" font-size="12" font-weight="600" fill="#17151F">GRAPHQL API</text>
<g class="f" data-step="1"><line x1="79" y1="99" x2="301" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gql-a)"/><text x="190" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /users/42</text></g>
<g class="f" data-step="1"><line x1="301" y1="133" x2="79" y2="133" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#gql-a)"/><text x="190" y="126" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">user: 30 fields</text></g>
<g class="f" data-step="2"><line x1="79" y1="167" x2="301" y2="167" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gql-a)"/><text x="190" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">GET /users/42/orders</text></g>
<g class="f" data-step="2"><line x1="301" y1="201" x2="79" y2="201" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#gql-a)"/><text x="190" y="194" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">50 orders, all fields</text></g>
<g class="f" data-step="2"><rect x="6" y="220" width="172" height="22" rx="5" fill="#fff" stroke="#C2382F"/><text x="92" y="235" text-anchor="middle" class="m" font-size="11.5" fill="#C2382F">over-fetched + 2 trips</text></g>
<g class="f" data-step="3"><line x1="459" y1="99" x2="681" y2="99" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gql-a)"/><text x="570" y="92" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">POST /graphql  { query }</text></g>
<g class="f" data-step="3"><rect x="596" y="118" width="158" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="675" y="133" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">resolve user, orders</text></g>
<g class="f" data-step="3"><line x1="681" y1="167" x2="459" y2="167" stroke="#531A8A" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#gql-a)"/><text x="570" y="160" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">exactly: name, 3 totals</text></g>
<g class="f" data-step="4"><rect x="589" y="186" width="165" height="22" rx="5" fill="#F4EEFA" stroke="#DCC9EE"/><text x="672" y="201" text-anchor="middle" class="m" font-size="11.5" fill="#17151F">N+1 risk → DataLoader</text></g>
</svg>
<ol class="lx-caps">
  <li>A mobile screen needs one user's <b>name</b> and the <b>totals of their last 3 orders</b>.</li>
  <li>REST: the user resource returns <b>every field</b> of the user, whether the screen needs it or not.</li>
  <li>A second round trip fetches the orders. The client receives far more than it shows: <b>over-fetching</b> and <b>under-fetching</b> at once.</li>
  <li>GraphQL: one request describes the exact shape. The server's <b>resolvers</b> fill it in and the response mirrors the query.</li>
  <li>The cost moves to the server: naive resolvers run one DB query per order (<b>N+1</b>). Batching with a DataLoader fixes it.</li>
</ol>
{{< /fig >}}

## How it works

The **schema** declares types and the entry points (`Query`, `Mutation`, `Subscription`):

```graphql
type User   { id: ID!  name: String!  orders(last: Int): [Order!]! }
type Order  { id: ID!  total: Float!  status: String! }
type Query  { user(id: ID!): User }
type Mutation { cancelOrder(id: ID!): Order }
```

A client query:

```graphql
query {
  user(id: 42) {
    name
    orders(last: 3) { total }
  }
}
```

On the server, each field has a **resolver**: a function that fetches that piece. The engine walks the query, calls resolvers, and assembles the JSON. **Mutations** change data, and **subscriptions** push updates over a WebSocket or server-sent events.

## Trade-offs

| Strength | Cost |
|---|---|
| Clients get exactly what they need in one round trip | The server must protect itself from expensive queries (depth and complexity limits, persisted queries) |
| Strong typing and introspection: great tooling and autocompletion | HTTP caching mostly doesn't apply; caching moves to the client (Apollo, Relay) or per resolver |
| Evolve the API by adding fields, deprecating old ones | Naive resolvers cause **N+1** database queries; you need batching (DataLoader) |
| One schema can stitch many back-end services (federation) | More moving parts than a simple REST API |

## When to use it

- **Good fit:** UIs with many screens that each need different slices of related data; aggregating many microservices behind one API.
- **Poor fit:** bulk data export, simple CRUD services, file uploads, or public APIs where HTTP caching matters. For moving large volumes into a warehouse, a REST bulk endpoint or a database replica is usually simpler.

For data engineers, the practical skill is **consuming** GraphQL APIs (GitHub, Shopify, Linear): paginate with cursors (`first`, `after`, `pageInfo.endCursor`) and respect the API's query-cost rate limits.

## Common mistakes

- **No query cost limits**, so one deeply nested query takes the server down.
- **Exposing the database schema 1:1** instead of designing a schema around client needs.
- **Treating every error as an HTTP status.** GraphQL usually returns 200 with an `errors` array; check it.

## Learning Resources

- [graphql.org: Learn](https://graphql.org/learn/) and the [GraphQL specification](https://spec.graphql.org/)
- [Learning GraphQL](https://www.oreilly.com/library/view/learning-graphql/9781492030706/): Eve Porcello, Alex Banks
- [Production Ready GraphQL](https://book.productionreadygraphql.com/): Marc-André Giroux
- [GitHub GraphQL API explorer](https://docs.github.com/en/graphql/overview/explorer): try real queries
- [DataLoader](https://github.com/graphql/dataloader): the batching pattern for N+1
- [Exploring GraphQL (edX, Linux Foundation)](https://www.edx.org/learn/graphql/the-linux-foundation-exploring-graphql-a-query-language-for-apis)

See also: [REST]({{< relref "../rest" >}}), [gRPC]({{< relref "../grpc" >}}).
