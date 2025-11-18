# Architecture Documentation

## Overview

The Narrative Arc Campaign Designer is a fullstack TypeScript application built on Next.js 15, designed to orchestrate multi-month community narrative campaigns. The architecture emphasizes extensibility, type safety, and clean separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  React UI    │  │   Timeline   │  │    Forms     │           │
│  │  Components  │  │  Visualizer  │  │   (Beats,    │           │
│  │              │  │              │  │  Templates)  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes (REST)                     │   │
│  │  /arcs  /beats  /templates  /comments  /tags  /metrics   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Error       │  │   Logging    │  │   Metrics    │           │
│  │  Handler     │  │   System     │  │   Recording  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Domain Events                           │   │
│  │  ArcCreated | BeatUpdated | TemplateInstantiated | ...    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Plugin      │  │   Event      │  │   Adapters   │           │
│  │  Registry    │  │   Bus        │  │  (AI, Notif) │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  PostgreSQL Database                       │   │
│  │  NarrativeArc | Beat | Template | Comment | Tag | Metrics │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Ritual     │  │   Content    │  │     AI       │           │
│  │  Orchestr.   │  │   Calendar   │  │  Services    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Layer (`app/api/`)

REST API organized by resource:

- **/arcs**: Narrative arc CRUD
- **/beats**: Beat management and reordering
- **/templates**: Template library and instantiation
- **/comments**: Collaboration and feedback
- **/tags**: Tag management and beat associations
- **/metrics**: Analytics and tracking
- **/attachments**: External system linkages

**Key Patterns:**
- `withErrorHandler()` wrapper for consistent error handling
- Zod validation on all inputs
- Event emission for domain events
- Metrics recording for observability
- Pagination support with `getPaginationParams()`

### 2. Domain Model (`prisma/schema.prisma`)

**Core Entities:**

```
NarrativeArc
├── beats (1:N)
├── attachments (1:N)
├── metrics (1:N)
└── sourceTemplate (N:1)

NarrativeBeat
├── arc (N:1)
├── tags (N:M via BeatTag)
├── comments (1:N)
└── history (1:N)

ArcTemplate
├── templateBeats (1:N)
└── instantiatedArcs (1:N)

Tag
└── beats (N:M via BeatTag)

BeatComment
├── beat (N:1)
├── parent (self-referential for threading)
└── replies (1:N)

ArcMetrics
└── arc (N:1)
```

**Design Decisions:**
- CUIDs for all primary keys (collision-resistant, sortable)
- Cascade deletes for dependent entities
- JSON fields for flexible metadata
- Enums for status and type fields
- Timestamps on all entities (createdAt, updatedAt)

### 3. Event System (`lib/events/`)

**Event Bus Architecture:**
- Pub/sub pattern for decoupled communication
- Type-safe event payloads
- Wildcard subscriptions (`onAll`)
- Async event handlers
- Error isolation (failing handler doesn't break others)

**Event Flow:**
```
API Route Handler
    ↓
Domain Operation (e.g., create arc)
    ↓
Emit Event (eventBus.emit())
    ↓
Event Handlers Execute
    ├→ Plugin hooks
    ├→ Notification adapters
    ├→ Metrics recording
    └→ Audit logging
```

**Event Types:**
- Arc events: created, updated, deleted, status_changed
- Beat events: created, updated, deleted, reordered, status_changed
- Template events: created, instantiated
- Comment events: created, resolved
- Metrics events: recorded, analytics_generated

### 4. Adapter Pattern (`lib/adapters/`)

Adapters provide extension points for external integrations:

**INotificationAdapter:**
- `send(notification)` - single notification
- `sendBatch(notifications[])` - batch notifications
- Implementations: Console, Email, Webhook

**IAIAdapter:**
- `suggestArcTheme(context)` - theme suggestions
- `suggestBeats(context)` - beat recommendations
- `suggestTags(context)` - tag extraction
- `optimizeBeatSequence(context)` - sequence optimization
- Implementations: Mock, OpenAI

**IStorageAdapter:**
- `upload(key, data)` - file upload
- `download(key)` - file retrieval
- `getUrl(key)` - presigned URLs
- Implementations: Local, S3

**IMetricsAdapter:**
- `recordCounter(name, value, labels)`
- `recordGauge(name, value, labels)`
- `recordHistogram(name, value, labels)`
- Implementation: InMemory (extensible to Prometheus, Datadog)

### 5. Plugin System (`lib/plugins/`)

Dynamic plugin loading with lifecycle hooks:

**Plugin Hooks:**
- Lifecycle: `onInit`, `onShutdown`
- Arc: `beforeArcCreate`, `afterArcCreate`, `beforeArcUpdate`, etc.
- Beat: `beforeBeatCreate`, `afterBeatCreate`, etc.
- Template: `beforeTemplateInstantiate`, `afterTemplateInstantiate`
- Event: `onEvent` (receives all events)

**Plugin Registry:**
- `register(plugin)` - add plugin
- `unregister(name)` - remove plugin
- `executeHook(hookName, ...args)` - run hook across all plugins
- `initialize()` / `shutdown()` - lifecycle management

### 6. Infrastructure (`lib/`)

**Error Handling:**
- Custom error classes (ValidationError, NotFoundError, etc.)
- HTTP status code mapping
- Consistent error response format
- Prisma error translation
- Zod validation error handling

**Logging:**
- Structured logging with levels (debug, info, warn, error)
- Request correlation IDs
- Contextual metadata
- Production JSON format / Development human-readable format
- Child loggers for request scoping

**Metrics:**
- Counter, gauge, histogram abstractions
- Time measurement utilities
- In-memory default implementation
- Label support for dimensionality
- Flush mechanism for batching

## Data Flow Examples

### Creating an Arc from Template

```
1. Client: POST /api/templates/{id}/instantiate
2. API validates request (Zod)
3. Fetch template with beats
4. Calculate arc duration
5. Transaction:
   a. Create NarrativeArc
   b. Create NarrativeBeats from TemplateBeats
6. Emit TemplateInstantiated event
7. Record metric (template_instantiated)
8. Return created arc
```

### Adding Comment to Beat

```
1. Client: POST /api/comments
2. API validates request
3. Verify beat exists
4. Create BeatComment
5. Emit CommentCreated event
   ├→ Notification adapter sends notification
   └→ Metrics adapter records comment_created
6. Return created comment
```

### Timeline Visualization

```
1. Client requests /arcs/{id}
2. Server fetches arc with beats
3. Client renders Timeline component
4. Timeline groups beats by targetMonth
5. For each month in range:
   a. Render month header
   b. Render beat cards in that month
6. Click beat → open BeatEditor
```

## Security Considerations

**Current State (Pre-Auth):**
- No authentication implemented
- All APIs are public
- User IDs stored but not verified
- Suitable for internal/demo use only

**Future Auth Integration:**
- Add NextAuth.js or similar
- JWT token validation middleware
- User context in request
- Role-based access control (RBAC)
- Row-level security in Prisma queries

**Input Validation:**
- All inputs validated with Zod
- SQL injection prevented by Prisma
- XSS prevention via React escaping
- File upload validation (when added)

## Performance Considerations

**Database:**
- Indexes on foreign keys
- Indexes on frequently queried fields (status, targetMonth, category)
- Pagination to limit result sets
- `include` instead of separate queries

**Caching Strategy (Future):**
- Redis for frequently accessed arcs
- Cache invalidation on updates
- Stale-while-revalidate pattern

**Query Optimization:**
- Use `select` to limit fields
- Batch operations where possible
- Consider adding database connection pooling

## Deployment Architecture

**Development:**
```
Local Machine
├── Next.js dev server (:3000)
├── PostgreSQL (Docker :5432)
└── Redis (Docker :6379)
```

**Production:**
```
                    ┌──────────────┐
                    │  Load        │
                    │  Balancer    │
                    └──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Next.js  │    │ Next.js  │    │ Next.js  │
    │ Instance │    │ Instance │    │ Instance │
    └──────────┘    └──────────┘    └──────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  PostgreSQL     │
                  │  (RDS/managed)  │
                  └─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Redis          │
                  │  (ElastiCache)  │
                  └─────────────────┘
```

## Testing Strategy

**Unit Tests:**
- Domain logic functions
- Utility functions
- Event handlers
- Validation schemas

**Integration Tests:**
- API endpoint tests
- Database operations
- Event emission
- Plugin execution

**E2E Tests (Future):**
- Full user workflows
- Timeline interaction
- Template instantiation
- Comment collaboration

## Extension Points

**Adding New Features:**

1. **New Entity Type:**
   - Add to Prisma schema
   - Generate migration
   - Create Zod validators
   - Implement API routes
   - Add to seed data

2. **New Adapter:**
   - Define interface in `lib/adapters/`
   - Implement concrete adapter
   - Register in configuration
   - Use in relevant domain logic

3. **New Plugin:**
   - Create plugin with metadata and hooks
   - Register in startup
   - Subscribe to relevant events
   - Implement hook logic

4. **New Event Type:**
   - Add to `EVENT_TYPES` constant
   - Define payload interface
   - Emit from relevant operations
   - Add handlers as needed

## Configuration Management

**Environment Variables:**
```
DATABASE_URL         - PostgreSQL connection
REDIS_URL            - Redis connection
LOG_LEVEL            - Logging verbosity
METRICS_ENABLED      - Enable metrics collection
*_API_KEY            - External service credentials
```

**Runtime Configuration:**
- Plugin registry (code-based)
- Adapter selection (environment-based)
- Feature flags (future)

## Monitoring & Observability

**Current:**
- Structured logging to console
- In-memory metrics
- Error tracking via logs

**Future:**
- APM integration (Datadog, New Relic)
- Prometheus metrics export
- Distributed tracing (OpenTelemetry)
- Alert configuration

## Scalability Considerations

**Horizontal Scaling:**
- Stateless Next.js instances
- Shared database (with connection pooling)
- Redis for session/cache sharing
- Load balancer for distribution

**Vertical Scaling:**
- Database read replicas
- Caching layer
- CDN for static assets
- Background job queue (Bull, BullMQ)

**Data Growth:**
- Archive old arcs
- Metrics aggregation
- Beat history pruning policies
- File storage externalization

---

**Last Updated:** 2025-11-18
**Version:** 2.0 (Phase 3 Complete)
