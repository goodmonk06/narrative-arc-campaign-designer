# Narrative Arc Campaign Designer

> コミュニティの1年・1クールをストーリーアークとして設計し、イベントやコンテンツを「物語キャンペーン」に落とし込むデザイナー。

A fullstack Next.js application for designing narrative arcs and campaigns for communities. Model 3-12 month story arcs, break them into beats, chapters, and key events, and connect them to real-world rituals and content.

## Overview

The Narrative Arc Campaign Designer helps community organizers orchestrate cohesive narratives across multiple channels and touchpoints. Instead of treating events, content, and rituals as isolated activities, this tool enables you to weave them into a unified story that guides your community through transformation over time.

### Key Concepts

- **Narrative Arc**: A 3-12 month story arc that defines the overarching theme and journey for your community
- **Narrative Beat**: Individual moments or milestones within an arc, each with a specific theme and target month
- **Campaign Attachment**: Links to external systems (ritual templates, content campaigns) that support the narrative

## Features

- ✨ **Full CRUD** for narrative arcs and beats
- 📅 **Timeline Visualization** with month-based horizontal/vertical layouts
- 🔗 **Integration Stubs** for discovering rituals and content from external systems
- 📱 **Responsive Design** optimized for both desktop and mobile
- 🎯 **Beat Ordering** with validation and reordering capabilities
- 🔄 **REST API** for all operations
- 🧪 **Test Coverage** for core business logic
- 🌱 **Seed Data** with sample "Year of Inner Expansion" arc

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Styling**: Tailwind CSS
- **API**: REST endpoints
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Make (optional, for convenience commands)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd narrative-arc-campaign-designer
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start the PostgreSQL database:
```bash
make db-up
# or
docker-compose up -d
```

5. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

6. Seed the database with sample data:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Make Commands

For convenience, several Make commands are available:

```bash
make help          # Show all available commands
make install       # Install dependencies
make dev          # Start development server
make db-up        # Start PostgreSQL
make db-down      # Stop PostgreSQL
make db-reset     # Reset database and re-seed
make db-studio    # Open Prisma Studio
make test         # Run tests
```

## Project Structure

```
narrative-arc-campaign-designer/
├── app/
│   ├── api/                    # REST API routes
│   │   ├── arcs/              # Arc CRUD endpoints
│   │   ├── beats/             # Beat CRUD + reordering
│   │   └── attachments/       # Campaign attachment endpoints
│   ├── arcs/                  # Arc pages
│   │   ├── page.tsx          # List all arcs
│   │   ├── new/              # Create new arc
│   │   └── [id]/             # Arc detail with timeline
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── timeline.tsx          # Timeline visualization
│   └── beat-editor.tsx       # Beat creation/editing modal
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── validators.ts         # Zod validation schemas
│   ├── narrative-utils.ts    # Utility functions
│   └── integrations/         # External system integrations
│       ├── ritual-event-orchestrator.ts
│       ├── content-calendar.ts
│       └── index.ts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
├── __tests__/                # Test files
│   └── lib/
│       └── narrative-utils.test.ts
├── docker-compose.yml        # PostgreSQL container
├── Makefile                  # Convenience commands
└── README.md                 # This file
```

## Database Schema

### NarrativeArc

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| communityId | String | Community identifier |
| key | String (unique) | URL-safe key (lowercase, hyphens) |
| title | String | Display title |
| theme | String? | Optional theme |
| descriptionMarkdown | String? | Markdown description |
| horizonStart | DateTime | Arc start date |
| horizonEnd | DateTime | Arc end date |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### NarrativeBeat

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| arcId | String | Foreign key to NarrativeArc |
| orderIndex | Int | Position in sequence (0-based) |
| title | String | Beat title |
| descriptionMarkdown | String? | Markdown description |
| targetMonth | String | Target month (YYYY-MM format) |
| tagsJson | String? | JSON array of tags |
| linkedRitualTemplateId | String? | Reference to ritual template |
| linkedCampaignId | String? | Reference to content campaign |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### CampaignAttachment

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| arcId | String | Foreign key to NarrativeArc |
| externalSystem | String | System type (enum) |
| externalRef | String | External reference ID |
| descriptionMarkdown | String? | Markdown description |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

## API Documentation

### Narrative Arcs

#### GET `/api/arcs`
List all narrative arcs, optionally filtered by communityId.

Query Parameters:
- `communityId` (optional): Filter by community

Response:
```json
{
  "arcs": [
    {
      "id": "...",
      "title": "Year of Inner Expansion",
      "beats": [...],
      "attachments": [...]
    }
  ]
}
```

#### POST `/api/arcs`
Create a new narrative arc.

Request Body:
```json
{
  "communityId": "community-123",
  "key": "year-of-expansion-2025",
  "title": "Year of Inner Expansion",
  "theme": "Growth and Discovery",
  "descriptionMarkdown": "A year-long journey...",
  "horizonStart": "2025-01-01T00:00:00Z",
  "horizonEnd": "2025-12-31T23:59:59Z"
}
```

#### GET `/api/arcs/[id]`
Get a specific arc with all beats and attachments.

#### PATCH `/api/arcs/[id]`
Update an arc's properties.

#### DELETE `/api/arcs/[id]`
Delete an arc (cascades to beats and attachments).

### Narrative Beats

#### GET `/api/beats?arcId=[arcId]`
List beats for a specific arc.

#### POST `/api/beats`
Create a new beat.

Request Body:
```json
{
  "arcId": "...",
  "orderIndex": 0,
  "title": "The Awakening",
  "descriptionMarkdown": "Setting intentions...",
  "targetMonth": "2025-01",
  "tagsJson": "[\"reflection\", \"intention\"]",
  "linkedRitualTemplateId": "ritual-template-001",
  "linkedCampaignId": "campaign-001"
}
```

#### PATCH `/api/beats/[id]`
Update a beat.

#### DELETE `/api/beats/[id]`
Delete a beat.

#### POST `/api/beats/reorder`
Reorder multiple beats at once.

Request Body:
```json
{
  "beatIds": ["id1", "id2", "id3"]
}
```

### Campaign Attachments

#### GET `/api/attachments?arcId=[arcId]`
List attachments for a specific arc.

#### POST `/api/attachments`
Create a new attachment.

#### PATCH `/api/attachments/[id]`
Update an attachment.

#### DELETE `/api/attachments/[id]`
Delete an attachment.

## Integration with External Systems

The application provides stub modules for integrating with external systems:

### Ritual Event Orchestrator

Located in `lib/integrations/ritual-event-orchestrator.ts`, this module provides:

- `fetchRitualTemplates()`: Get available ritual templates
- `getRitualTemplate(id)`: Get a specific template
- `searchRitualTemplates(query)`: Search templates

Currently returns mock data. Replace with actual API calls in production.

### Content Calendar

Located in `lib/integrations/content-calendar.ts`, this module provides:

- `fetchContentCampaigns()`: Get available campaigns
- `getContentCampaign(id)`: Get a specific campaign
- `searchContentCampaigns(query)`: Search campaigns

Currently returns mock data. Replace with actual API calls in production.

### Adding New Integrations

1. Create a new file in `lib/integrations/`
2. Define your data types and functions
3. Export from `lib/integrations/index.ts`
4. Update the `EXTERNAL_SYSTEMS` enum if needed

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The project includes tests for:
- Beat ordering and validation
- Month range calculations
- Grouping beats by month

## Development Workflow

### Creating a New Narrative Arc

1. Navigate to `/arcs`
2. Click "New Arc"
3. Fill in the arc details:
   - Community ID
   - Unique key (lowercase, hyphens only)
   - Title and theme
   - Description
   - Start and end dates
4. Click "Create Arc"

### Adding Beats to an Arc

1. Open the arc detail page
2. Click "Add Beat"
3. Specify:
   - Title
   - Order index
   - Target month
   - Description
   - Tags (comma-separated)
   - Optional ritual/campaign links
4. Click "Create Beat"

### Visualizing the Timeline

The timeline shows all beats organized by month:
- **Desktop**: Horizontal scrollable timeline
- **Mobile**: Vertical month-by-month list
- Click any beat to edit it
- Empty months show "No beats"

## How This Orchestrates Narrative Across Tools

The Narrative Arc Campaign Designer acts as a central orchestration layer for your community's story:

1. **Unified Vision**: Define the overarching narrative that guides all activities
2. **Cross-System Coordination**: Link beats to rituals (events) and content campaigns
3. **Temporal Coherence**: Ensure events and content align with the narrative timeline
4. **Thematic Consistency**: Tag and theme beats to maintain narrative integrity
5. **Measurement Points**: Use beats as milestones to assess progress

### Example Flow

```
Narrative Arc: "Year of Inner Expansion"
    ↓
Beat: "The Awakening" (Jan 2025)
    ↓
    ├─→ Ritual: "New Moon Intention Circle" (ritual-event-orchestrator)
    ├─→ Content: "Monthly Newsletter" (content-calendar)
    └─→ Tags: [reflection, intention-setting, new-beginnings]
```

When your ritual orchestrator schedules events or your content calendar publishes posts, they reference the narrative beat, ensuring all touchpoints tell the same story.

## Production Considerations

Before deploying to production:

1. **Environment Variables**: Update `.env` with production database credentials
2. **Database Migrations**: Use `prisma migrate deploy` instead of `db:push`
3. **External Integrations**: Replace stub modules with actual API clients
4. **Authentication**: Add auth middleware to protect API routes
5. **Rate Limiting**: Implement rate limiting on API endpoints
6. **Monitoring**: Add logging and error tracking
7. **CORS**: Configure CORS policies if needed
8. **Validation**: Add additional input validation as needed

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

See [LICENSE](LICENSE) file for details.

## Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ for community narrative orchestration.
