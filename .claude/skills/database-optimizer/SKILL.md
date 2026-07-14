---
name: database-optimizer
description: Optimize MongoDB queries and improve database performance. Use when investigating slow queries, analyzing query plans, or optimizing indexes. Trigger on keywords like database optimization, slow query, MongoDB, index, query performance, aggregation.
---

# Database Optimizer (MongoDB)

## When to Use

- Investigating slow queries
- Analyzing query execution plans
- Designing index strategies
- Optimizing aggregation pipelines
- Reducing query latency
- Improving read/write performance

## Core Workflow

1. **Analyze Performance** — Capture baseline metrics before changes
2. **Identify Bottlenecks** — Find inefficient queries, missing indexes
3. **Design Solutions** — Create index strategies, query rewrites
4. **Implement Changes** — Apply optimizations incrementally
5. **Validate Results** — Measure improvement, document changes

## MongoDB Query Analysis

### Explain Plans
```javascript
// Analyze query performance
db.users.explain("executionStats").find({ email: "user@example.com" })

// Key metrics to check:
// - totalDocsExamined: should be close to nReturned
// - totalKeysExamined: should be close to nReturned
// - executionTimeMillis: baseline for comparison
```

### Common Issues

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Collection scan (no index) | totalDocsExamined >> nReturned | Add index |
| Sort without index | `SORT` stage in explain | Add compound index |
| Partial filter | High docsExamined | Add partial/filter index |
| Large result set | High memory usage | Add projection, limit |

## Index Strategies

### Create Index
```javascript
// Single field
db.users.createIndex({ email: 1 }, { unique: true })

// Compound index
db.games.createIndex({ status: 1, createdAt: -1 })

// Partial index (only index active users)
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { active: true } }
)

// TTL index (auto-expire)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
)
```

### Index Best Practices
- Query fields should match index prefix
- Sort fields should match index direction
- Use `explain()` to verify index usage
- Avoid over-indexing (write performance cost)
- Use `sparse: true` for fields with many nulls

## Aggregation Pipeline Optimization

### Push Filters Early
```javascript
// BAD - $match after $unwind
db.orders.aggregate([
  { $unwind: "$items" },
  { $match: { "items.category": "electronics" } }
])

// GOOD - $match first
db.orders.aggregate([
  { $match: { "items.category": "electronics" } },
  { $unwind: "$items" }
])
```

### Use Indexes in Aggregation
```javascript
// Use $match with indexed fields
db.games.aggregate([
  { $match: { status: "active", createdAt: { $gte: lastWeek } } },
  { $group: { _id: "$gameType", count: { $sum: 1 } } }
])
```

### Limit Early
```javascript
// Add $limit early to reduce pipeline processing
db.users.aggregate([
  { $match: { role: "player" } },
  { $sample: { size: 10 } }  // Instead of $limit after $sort
])
```

## Mongoose Optimization

### Select Only Needed Fields
```typescript
// BAD - fetches all fields
const users = await this.userModel.find({ active: true });

// GOOD - only needed fields
const users = await this.userModel.find({ active: true })
  .select('username email avatar')
  .lean();  // Returns plain objects (faster)
```

### Use lean() for Read-Only
```typescript
// When you don't need Mongoose documents
const users = await User.find().lean();
// Returns plain JS objects, ~2x faster
```

### Avoid N+1 Queries
```typescript
// BAD - N+1 queries
const games = await this.gameModel.find();
for (const game of games) {
  game.players = await this.userModel.find({ _id: { $in: game.playerIds } });
}

// GOOD - single query with populate
const games = await this.gameModel.find().populate('players');
```

## Common Mongoose Patterns

### Efficient Pagination
```typescript
// Cursor-based pagination (faster for large datasets)
async findAll(cursor?: string, limit = 20) {
  const query = cursor ? { _id: { $gt: cursor } } : {};
  return this.model.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();
}
```

### Bulk Operations
```typescript
// Bulk write for multiple operations
await this.model.bulkWrite([
  { updateOne: { filter: { _id: id1 }, update: { $set: { status: 'active' } } } },
  { updateOne: { filter: { _id: id2 }, update: { $set: { status: 'inactive' } } } },
]);
```

## Monitoring Queries

### Enable Query Profiling
```javascript
// Profile slow queries (>= 100ms)
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### Key Metrics
- Query execution time
- Documents examined vs returned
- Index usage ratio
- Connection pool utilization
- Memory usage

## Constraints

### MUST DO
- Use `explain()` before and after index changes
- Measure performance before optimizing
- Test in non-production first
- Document all optimization decisions
- Use `lean()` for read-only queries

### MUST NOT DO
- Add indexes without measuring impact
- Use `$where` (JavaScript execution, slow)
- Fetch large result sets without pagination
- Use `populate()` without `select` (fetches all fields)
- Ignore query profiling data
