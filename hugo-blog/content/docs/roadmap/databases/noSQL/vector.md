---
title: "Vector"
description: "How vector databases find similar items, animated: embeddings, cosine distance, exact vs approximate search, HNSW, and pgvector vs Qdrant vs Milvus."
weight: 5
bookToC: false
---
<div class="lx-kicker-line">$ SELECT name FROM products ORDER BY embedding &lt;=&gt; :query LIMIT 3;</div>

# Vector Databases

A **vector database** stores **embeddings**, lists of numbers (typically 384 to 3,072 of them) that a machine-learning model produces for a piece of text, an image or a product, and answers one question fast: **which stored vectors are closest to this one?** Items with similar meaning end up close together, so "closest vectors" means "most similar items". This powers semantic search, recommendations, deduplication and **retrieval-augmented generation (RAG)**, where an LLM is given the most relevant document chunks before it answers.

## How similarity search works

{{< fig kicker="$ search('waterproof trail shoe', k=3)" title="Nearest-neighbour search, exact and approximate" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
  <text x="30" y="326" class="m" font-size="11" fill="#8C8899">EMBEDDING SPACE (2 of 768 dims)</text>
  <g class="f" data-step="4" stroke="#8C8899" stroke-width="1" fill="none">
    <line x1="380" y1="60" x2="400" y2="130"/><line x1="380" y1="60" x2="260" y2="60"/><line x1="400" y1="130" x2="400" y2="200"/>
    <line x1="400" y1="200" x2="350" y2="250"/><line x1="350" y1="250" x2="300" y2="290"/><line x1="300" y1="290" x2="190" y2="150"/>
    <line x1="260" y1="60" x2="110" y2="80"/><line x1="110" y1="80" x2="90" y2="170"/><line x1="90" y1="170" x2="190" y2="150"/>
    <line x1="110" y1="80" x2="190" y2="150"/><line x1="400" y1="200" x2="190" y2="150"/><line x1="260" y1="60" x2="190" y2="150"/>
  </g>
  <g class="f" data-step="2" stroke="#DCC9EE" stroke-width="1" stroke-dasharray="3 4">
    <line x1="160" y1="120" x2="110" y2="80"/><line x1="160" y1="120" x2="190" y2="150"/><line x1="160" y1="120" x2="90" y2="170"/>
    <line x1="160" y1="120" x2="260" y2="60"/><line x1="160" y1="120" x2="380" y2="60"/><line x1="160" y1="120" x2="400" y2="130"/>
    <line x1="160" y1="120" x2="400" y2="200"/><line x1="160" y1="120" x2="350" y2="250"/><line x1="160" y1="120" x2="300" y2="290"/>
  </g>
  <g fill="#3D3A49">
    <circle cx="110" cy="80" r="6"/><circle cx="190" cy="150" r="6"/><circle cx="90" cy="170" r="6"/><circle cx="260" cy="60" r="6"/>
    <circle cx="380" cy="60" r="6"/><circle cx="400" cy="130" r="6"/>
    <circle cx="400" cy="200" r="6"/><circle cx="350" cy="250" r="6"/><circle cx="300" cy="290" r="6"/>
  </g>
  <g class="m" font-size="11" fill="#3D3A49">
    <text class="m" x="120" y="76">running shoes</text><text class="m" x="200" y="166">hiking boots</text><text class="m" x="70" y="192">sneakers</text><text class="m" x="270" y="56">sports socks</text>
    <text class="m" x="390" y="56">novel</text><text class="m" x="410" y="134">cookbook</text>
    <text class="m" x="410" y="204">kettle</text><text class="m" x="360" y="254">frying pan</text><text class="m" x="310" y="294">chef knife</text>
  </g>
  <g class="f" data-step="1">
    <circle cx="160" cy="120" r="8" fill="#531A8A"/>
    <text x="150" y="124" text-anchor="end" class="m" font-size="11" font-weight="700" fill="#531A8A">query</text>
  </g>
  <g class="f" data-step="3">
    <circle cx="160" cy="120" r="92" fill="none" stroke="#531A8A" stroke-width="1.4" stroke-dasharray="5 4"/>
    <g fill="none" stroke="#531A8A" stroke-width="2"><circle cx="190" cy="150" r="10"/><circle cx="110" cy="80" r="10"/><circle cx="90" cy="170" r="10"/></g>
    <rect x="490" y="30" width="250" height="132" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
    <text x="506" y="54" class="m" font-size="12" font-weight="700" fill="#17151F">TOP-3 · cosine similarity</text>
    <g class="m" font-size="12" fill="#17151F">
      <text class="m" x="506" y="84">1  hiking boots</text><text class="m" x="724" y="84" text-anchor="end" fill="#531A8A">0.93</text>
      <text class="m" x="506" y="110">2  running shoes</text><text class="m" x="724" y="110" text-anchor="end" fill="#531A8A">0.88</text>
      <text class="m" x="506" y="136">3  sneakers</text><text class="m" x="724" y="136" text-anchor="end" fill="#531A8A">0.81</text>
    </g>
  </g>
  <g class="f" data-step="4">
    <g stroke="#531A8A" stroke-width="3" fill="none"><line x1="380" y1="60" x2="260" y2="60"/><line x1="260" y1="60" x2="190" y2="150"/></g>
    <text x="380" y="44" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#531A8A">entry</text>
    <rect x="490" y="186" width="250" height="104" rx="6" fill="#260246"/>
    <text x="506" y="212" class="m" font-size="12" font-weight="700" fill="#EEEAF5">HNSW graph search</text>
    <text x="506" y="236" font-size="11" fill="#DCC9EE">hop to whichever neighbour is closer</text>
    <text x="506" y="256" font-size="11" fill="#DCC9EE">entry → sports socks → hiking boots</text>
    <text x="506" y="276" font-size="11" fill="#DCC9EE">compares a handful, not all N</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>An embedding model turns every product into a vector. Similar meanings land <b>near each other</b>: footwear here, kitchen items there.</li>
  <li>The search text is embedded with the <b>same model</b> and becomes the <b>query</b> vector.</li>
  <li><b>Exact search</b> compares the query with every stored vector. Correct, but O(N): fine for 100k vectors, too slow for 100 million.</li>
  <li>The <b>k nearest</b> vectors are the answer, ranked by similarity. This is what you feed to a RAG prompt or show as "similar items".</li>
  <li>An <b>ANN index</b> such as <b>HNSW</b> links each vector to a few neighbours. Search starts at an entry point and greedily hops closer, touching a tiny fraction of the data and finding the true top-k <b>most of the time</b>.</li>
</ol>
{{< /fig >}}

## Key concepts

- **Distance metric.** **Cosine** similarity (angle between vectors) is the default for text embeddings; **dot product** and **Euclidean (L2)** are also common. Use the metric your embedding model was trained for.
- **Exact vs approximate (ANN).** Approximate nearest-neighbour indexes trade a little **recall** (say 95 to 99 % of the true top-k) for queries that are orders of magnitude faster.
- **Index types.** **HNSW** (layered proximity graph; fast, memory-hungry), **IVF** (cluster vectors, search only the nearest clusters), **PQ / quantization** (compress vectors to save memory), **DiskANN** (graph index that lives on SSD).
- **Filtering.** Real queries combine similarity with conditions: `category = 'shoes' AND in_stock`. How well an engine handles filtered search differs a lot between products.
- **Hybrid search.** Combine vector similarity with keyword search (BM25) and merge the rankings. Usually beats either alone for search over documents.

## Popular options

| Option | Type | Notes |
|---|---|---|
| **[pgvector](https://github.com/pgvector/pgvector)** | PostgreSQL extension | HNSW and IVFFlat indexes inside Postgres, with joins and transactions. The pragmatic default up to tens of millions of vectors. |
| **[Qdrant](https://qdrant.tech/)** | Open-source server (Rust) | Strong filtering, quantization, easy to self-host. |
| **[Milvus](https://milvus.io/)** | Open-source, distributed | Built for billions of vectors; many index types; managed as Zilliz Cloud. |
| **[Weaviate](https://weaviate.io/)** | Open-source server | Built-in embedding modules and hybrid search. |
| **[Pinecone](https://www.pinecone.io/)** | Managed service | Serverless, no infrastructure to run. |
| **Elasticsearch / OpenSearch, Cassandra 5, MongoDB Atlas, Redis** | Vector search added to existing systems | Useful when the data already lives there. |

## For data engineers

A vector store is fed by a pipeline: **extract** documents, **chunk** them, **embed** each chunk, **upsert** vectors with metadata (source id, timestamp, permissions). The hard parts are operational:

- **Changing the embedding model means re-embedding everything.** Vectors from different models are not comparable. Store the model name and version with each vector.
- **Freshness and deletes.** When a source document changes or is deleted, its chunks must be updated or removed, or the RAG system will cite stale data.
- **Memory.** 100 million 1,024-dimension float32 vectors are about 400 GB before index overhead. Quantization helps.

## Common mistakes

- Adding a dedicated vector database for a few hundred thousand vectors that pgvector would handle.
- Embedding queries and documents with different models, or forgetting to normalize vectors when the metric assumes it.
- Judging quality by eye instead of measuring recall and relevance on a labeled set.

## Learning Resources

- [Efficient and robust approximate nearest neighbor search using HNSW graphs](https://arxiv.org/abs/1603.09320): Malkov and Yashunin, the HNSW paper
- [Pinecone Learn: vector database guides](https://www.pinecone.io/learn/)
- [pgvector README](https://github.com/pgvector/pgvector)
- [Qdrant documentation](https://qdrant.tech/documentation/) and [Milvus documentation](https://milvus.io/docs)
- [ANN-Benchmarks](https://ann-benchmarks.com/): recall vs speed for ANN algorithms
- [A fun and absurd introduction to Vector Databases](https://www.youtube.com/watch?v=Si-TFUSo2wk): video
