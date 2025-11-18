# Phase 3 Overview: Narrative Arc Campaign Designer

## Purpose Statement

The Narrative Arc Campaign Designer is a specialized orchestration tool designed to help community organizers and operators design, manage, and execute cohesive multi-month narrative campaigns. Rather than treating events, content, and rituals as isolated activities, this system enables users to craft unified story arcs (3-12 months) that guide communities through transformative journeys.

The system bridges the gap between high-level strategic narrative thinking and tactical execution across multiple channels (events, content, rituals). It serves as a central "narrative backbone" that other community systems can reference and align with, ensuring temporal and thematic coherence across the entire community experience.

## Current State Assessment

### Existing Features
- ✅ Complete CRUD operations for narrative arcs
- ✅ Beat management with ordering and month-based targeting
- ✅ Campaign attachments linking to external systems
- ✅ Interactive timeline visualization (horizontal/vertical layouts)
- ✅ REST API with Zod validation
- ✅ PostgreSQL + Prisma ORM persistence
- ✅ Integration stubs for ritual-event-orchestrator and content-calendar
- ✅ Seed data with "Year of Inner Expansion" sample arc (8 beats)
- ✅ Basic utility tests
- ✅ Docker Compose for PostgreSQL
- ✅ Comprehensive documentation (README, QUICKSTART)

### Current Limitations
- ⚠️ Single vertical slice only (basic arc management)
- ⚠️ No collaboration features (comments, reviews, approvals)
- ⚠️ No template system for reusable arc patterns
- ⚠️ No analytics or metrics tracking
- ⚠️ Limited extensibility (no event system or plugin architecture)
- ⚠️ No centralized error handling or logging
- ⚠️ Missing Dockerfile for the application itself
- ⚠️ Limited test coverage (only utility tests)
- ⚠️ No CLI tools for maintenance operations
- ⚠️ Tags are unstructured (stored as JSON)
- ⚠️ No versioning or history for beats/arcs
- ⚠️ No AI-assisted narrative suggestions

## Phase 3 Implementation Plan

### 1. Foundation & Infrastructure (Phase 2 completion)
- ✅ Add Dockerfile for Next.js application
- ✅ Update docker-compose.yml to orchestrate full stack
- ✅ Implement centralized error handler with consistent API responses
- ✅ Add structured logging utility (contextual, leveled)
- ✅ Add metrics abstraction for observability
- ✅ Add typecheck and format scripts
- ✅ Enhance .env.example with all configuration

### 2. Domain Model Expansion
- **ArcTemplate**: Reusable narrative arc patterns that can be instantiated
  - Fields: name, description, category, visibility, templateBeats, metadata
  - Enables sharing "proven" arc structures across communities

- **BeatComment**: Collaboration and feedback on narrative beats
  - Fields: beatId, userId, content, type (feedback/question/approval), resolved
  - Enables team collaboration on narrative design

- **ArcMetrics**: Track engagement and completion metrics per arc
  - Fields: arcId, viewCount, beatCompletionRate, memberEngagement, periodStart/End
  - Enables data-driven narrative optimization

- **Tag**: Normalize tag system with taxonomy
  - Fields: id, name, category, description, color
  - Many-to-many relationship with beats
  - Enables consistent thematic tagging

- **BeatHistory**: Version tracking for narrative beats
  - Fields: beatId, version, changes, changedBy, timestamp
  - Enables auditing and rollback capabilities

### 3. Vertical Slices (3 new flows)

**Slice 1: Template Management**
- Create arc templates from existing arcs
- Browse template library with filtering
- Instantiate new arcs from templates
- Share templates across communities
- API: `/api/templates/*`
- UI: `/templates` pages

**Slice 2: Collaboration & Comments**
- Add comments to beats for team feedback
- Mark comments as resolved
- Comment threading and mentions
- Approval workflow for beats
- API: `/api/comments/*`
- UI: Comment panel in beat detail

**Slice 3: Analytics & Metrics**
- Track arc and beat engagement metrics
- Generate completion reports
- Visualize metric trends over time
- Export analytics data
- API: `/api/metrics/*`
- UI: `/arcs/[id]/analytics` dashboard

### 4. Extensibility Architecture

**Domain Event System**
- Event types: ArcCreated, BeatUpdated, CommentAdded, MetricsRecorded
- Event bus with pub/sub pattern
- Typed event handlers
- Location: `lib/events/`

**Adapter Interfaces**
- `INotificationAdapter`: Send notifications on arc milestones
- `IMetricsAdapter`: Push metrics to external analytics systems
- `IAISuggestionsAdapter`: Get AI-powered narrative suggestions
- `IStorageAdapter`: Alternative storage backends
- Location: `lib/adapters/`

**Plugin Registry**
- Dynamic plugin loading system
- Plugin lifecycle hooks (init, beforeArcCreate, afterBeatUpdate)
- Type-safe plugin API
- Location: `lib/plugins/`

### 5. Developer Experience Enhancements

**CLI Tool** (`scripts/cli.ts`)
- `narrative-cli seed --scenario=<name>`: Load specific scenarios
- `narrative-cli template create --from-arc=<id>`: Create template from arc
- `narrative-cli metrics export --arc=<id>`: Export metrics
- `narrative-cli validate --arc=<id>`: Validate arc integrity

**Enhanced Scripts**
- Add `typecheck`: TypeScript type checking
- Add `format`: Prettier formatting
- Add `test:integration`: Integration test suite
- Add `test:e2e`: End-to-end tests

### 6. Quality & Reliability

**Centralized Error Handling**
- Custom error classes (ValidationError, NotFoundError, UnauthorizedError)
- Error middleware with consistent response shape
- Error logging with context

**Structured Logging**
- Logger utility with levels (debug, info, warn, error)
- Request correlation IDs
- Performance timing logs

**Metrics & Observability**
- Counter, gauge, histogram abstractions
- Default in-memory implementation
- Adapter for external systems (Prometheus, Datadog)

### 7. Testing Strategy

**Unit Tests**
- Domain logic (services, utilities)
- Validation schemas
- Event handlers
- Target: 80%+ coverage

**Integration Tests**
- API endpoint tests
- Database integration tests
- Event system tests

**Test Fixtures**
- Factory functions for all entities
- Realistic test data scenarios
- Database seeding for tests

### 8. Enhanced Seed Data

**Multiple Scenarios**
- Scenario 1: "Startup Growth Journey" (tech company)
- Scenario 2: "Wellness Transformation" (health community)
- Scenario 3: "Learning Cohort" (educational program)
- Each with 6-12 beats, comments, metrics, tags

**Demo Personas**
- Organizer: Full access to all features
- Collaborator: Can comment and suggest
- Viewer: Read-only access to arcs

### 9. Documentation Expansion

**Architecture Documentation**
- System architecture diagrams (text-based)
- Data flow diagrams
- Extension point documentation
- API reference

**Domain Notes**
- Detailed entity relationship explanations
- Business rules and constraints
- Domain language glossary
- Use case descriptions

**Integration Recipes**
- How to integrate with auth systems
- How to connect notification services
- How to add AI narrative suggestions
- How to sync with external calendars

**API Reference**
- Complete endpoint documentation
- Request/response examples
- Error code reference
- Rate limiting guidelines

### 10. Future Extensions (Phase 4+)

- **AI-Powered Features**
  - Narrative arc suggestions based on community type
  - Beat optimization recommendations
  - Auto-tagging and categorization
  - Sentiment analysis on comments

- **Advanced Collaboration**
  - Real-time collaborative editing
  - Version branching and merging
  - Approval workflows with roles
  - Change notifications

- **Multi-Community Management**
  - Arc sharing across communities
  - Cross-community analytics
  - Template marketplace
  - Community archetypes

- **Advanced Analytics**
  - Predictive completion analytics
  - A/B testing for narrative variations
  - Correlation with community metrics
  - ML-based optimization

- **Integration Ecosystem**
  - Zapier/Make.com integrations
  - Calendar sync (Google, Outlook)
  - Slack/Discord notifications
  - Notion/Airtable exports

- **Mobile Experience**
  - Native mobile apps (React Native)
  - Progressive Web App (PWA)
  - Mobile-optimized timeline
  - Push notifications

## Success Metrics for Phase 3

- ✅ 3+ complete vertical slices fully implemented
- ✅ 5+ new domain entities with full CRUD
- ✅ 80%+ test coverage on core logic
- ✅ Full Docker orchestration (app + DB)
- ✅ Extensibility demonstrated with 3+ adapters
- ✅ Rich seed data with 3+ scenarios
- ✅ Comprehensive documentation (architecture, domain, integration)
- ✅ CLI tool with 5+ useful commands
- ✅ Production-ready error handling and logging

## Timeline Estimate

- **Week 1**: Foundation (Docker, error handling, logging, metrics)
- **Week 2**: Domain expansion (new entities, migrations)
- **Week 3**: Vertical slice 1 (Templates)
- **Week 4**: Vertical slice 2 (Collaboration)
- **Week 5**: Vertical slice 3 (Analytics)
- **Week 6**: Extensibility (events, adapters, plugins)
- **Week 7**: Testing & quality
- **Week 8**: Documentation & polish

---

**Document Version**: 1.0
**Last Updated**: 2025-11-18
**Owner**: Engineering Team
