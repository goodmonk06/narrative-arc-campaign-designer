# Quick Start Guide

Get the Narrative Arc Campaign Designer running in 5 minutes.

## Prerequisites

Ensure you have installed:
- Node.js 20+ and npm
- Docker and Docker Compose
- (Optional) Make

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database

```bash
# Using Make
make db-up

# Or using Docker Compose directly
docker-compose up -d
```

Wait a few seconds for PostgreSQL to be ready.

### 3. Setup Database Schema

```bash
npm run db:generate
npm run db:push
```

### 4. Seed Sample Data

```bash
npm run db:seed
```

This creates a sample "Year of Inner Expansion" arc with 8 narrative beats.

### 5. Start Development Server

```bash
npm run dev
```

### 6. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

## What to Try

1. **View Arcs**: Navigate to `/arcs` to see the sample arc
2. **Explore Timeline**: Click into the arc to see the month-based timeline
3. **Edit Beats**: Click any beat card to edit its details
4. **Add Beats**: Use the "Add Beat" button to create new narrative moments
5. **Create Arc**: Try creating your own narrative arc

## Sample Arc Structure

The seeded "Year of Inner Expansion" arc includes:

- **Jan**: The Awakening - Setting intentions
- **Feb**: Seeds of Change - Taking first steps
- **Mar**: Breaking Ground - Confronting challenges
- **Apr**: Spring Renewal - Celebrating early wins
- **Jun**: The Deep Dive - Intensive exploration
- **Aug**: Summer Harvest - Sharing transformations
- **Oct**: Autumn Integration - Integrating lessons
- **Dec**: Year-End Reflection - Honoring growth

## API Endpoints

Try the REST API:

```bash
# List all arcs
curl http://localhost:3000/api/arcs

# Get specific arc
curl http://localhost:3000/api/arcs/{arc-id}

# Create a beat
curl -X POST http://localhost:3000/api/beats \
  -H "Content-Type: application/json" \
  -d '{
    "arcId": "...",
    "orderIndex": 8,
    "title": "New Beat",
    "targetMonth": "2025-05",
    "descriptionMarkdown": "A new narrative moment"
  }'
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

```bash
# Ensure PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose logs postgres

# Restart database
make db-down
make db-up
```

### Port Already in Use

If port 3000 is busy:

```bash
# Use a different port
PORT=3001 npm run dev
```

If port 5432 (PostgreSQL) is busy, edit `docker-compose.yml` and `.env`:

```yaml
# docker-compose.yml
ports:
  - "5433:5432"  # Change to 5433
```

```env
# .env
DATABASE_URL="postgresql://narrativeuser:narrativepass@localhost:5433/narrative_arc_db?schema=public"
```

### Reset Everything

To start fresh:

```bash
make db-reset
# or
make db-down
make db-up
npm run db:push
npm run db:seed
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the [integration stubs](lib/integrations/) for external systems
- Check the [API routes](app/api/) for available endpoints
- Run tests with `npm test`
- Open Prisma Studio: `npm run db:studio`

## Development Tips

### Using Prisma Studio

Visual database browser:

```bash
npm run db:studio
# Opens at http://localhost:5555
```

### Running Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

### Database Migrations

For production-ready migrations (instead of `db:push`):

```bash
npx prisma migrate dev --name your_migration_name
```

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

## Need Help?

- Check the [README.md](README.md) for full documentation
- Review the [database schema](prisma/schema.prisma)
- Explore the [test files](__tests__/) for usage examples
- Open an issue on GitHub

Happy narrative designing! 🎭✨
