#!/usr/bin/env tsx

/**
 * CLI tool for Narrative Arc Campaign Designer
 *
 * Provides command-line utilities for domain operations
 */

import { Command } from 'commander'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

const program = new Command()

program
  .name('narrative-cli')
  .description('CLI tool for Narrative Arc Campaign Designer')
  .version('1.0.0')

// Seed command
program
  .command('seed')
  .description('Seed the database with sample data')
  .option('-s, --scenario <name>', 'Seed specific scenario (default, startup, wellness, learning, all)')
  .action(async (options) => {
    const scenario = options.scenario || 'default'
    logger.info(`Seeding database with scenario: ${scenario}`)

    try {
      // Run seed script
      const { execSync } = require('child_process')
      execSync(`SEED_SCENARIO=${scenario} npm run db:seed`, { stdio: 'inherit' })
      logger.info('Database seeded successfully')
    } catch (error) {
      logger.error('Failed to seed database', error as Error)
      process.exit(1)
    }
  })

// Validate command
program
  .command('validate')
  .description('Validate arc data integrity')
  .option('-a, --arc <id>', 'Validate specific arc')
  .action(async (options) => {
    try {
      const where = options.arc ? { id: options.arc } : {}

      const arcs = await prisma.narrativeArc.findMany({
        where,
        include: {
          beats: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      })

      logger.info(`Validating ${arcs.length} arc(s)`)

      for (const arc of arcs) {
        // Check beat ordering
        const orderIndices = arc.beats.map(b => b.orderIndex)
        const expectedIndices = Array.from({ length: arc.beats.length }, (_, i) => i)
        const isOrdered = JSON.stringify(orderIndices) === JSON.stringify(expectedIndices)

        if (!isOrdered) {
          console.log(`❌ Arc ${arc.id} (${arc.title}): Beats not consecutively ordered`)
        } else {
          console.log(`✅ Arc ${arc.id} (${arc.title}): Valid`)
        }

        // Check date range
        if (arc.horizonEnd <= arc.horizonStart) {
          console.log(`❌ Arc ${arc.id}: Invalid date range`)
        }
      }

      logger.info('Validation complete')
    } catch (error) {
      logger.error('Validation failed', error as Error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  })

// Template command
program
  .command('template')
  .description('Template operations')
  .argument('<action>', 'Action: create-from-arc, list')
  .option('-a, --arc <id>', 'Source arc ID')
  .option('-k, --key <key>', 'Template key')
  .option('-n, --name <name>', 'Template name')
  .option('-c, --category <category>', 'Template category')
  .action(async (action, options) => {
    try {
      if (action === 'create-from-arc') {
        if (!options.arc || !options.key || !options.name) {
          console.error('Error: --arc, --key, and --name are required')
          process.exit(1)
        }

        // Fetch arc with beats
        const arc = await prisma.narrativeArc.findUnique({
          where: { id: options.arc },
          include: {
            beats: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        })

        if (!arc) {
          console.error(`Arc ${options.arc} not found`)
          process.exit(1)
        }

        // Calculate duration in months
        const durationMs = arc.horizonEnd.getTime() - arc.horizonStart.getTime()
        const durationMonths = Math.ceil(durationMs / (1000 * 60 * 60 * 24 * 30))

        // Create template
        const template = await prisma.arcTemplate.create({
          data: {
            key: options.key,
            name: options.name,
            description: arc.descriptionMarkdown || undefined,
            category: options.category || 'general',
            visibility: 'PRIVATE',
            durationMonths,
          },
        })

        // Create template beats
        for (const beat of arc.beats) {
          await prisma.templateBeat.create({
            data: {
              templateId: template.id,
              orderIndex: beat.orderIndex,
              title: beat.title,
              descriptionMarkdown: beat.descriptionMarkdown || undefined,
              suggestedMonth: beat.orderIndex,
            },
          })
        }

        console.log(`✅ Template created: ${template.id}`)
      } else if (action === 'list') {
        const templates = await prisma.arcTemplate.findMany({
          include: {
            _count: {
              select: {
                templateBeats: true,
                instantiatedArcs: true,
              },
            },
          },
        })

        console.log(`\n📋 Templates (${templates.length}):\n`)
        for (const template of templates) {
          console.log(`  ${template.name} (${template.key})`)
          console.log(`    Category: ${template.category}`)
          console.log(`    Beats: ${template._count.templateBeats}`)
          console.log(`    Instances: ${template._count.instantiatedArcs}`)
          console.log()
        }
      }
    } catch (error) {
      logger.error('Template operation failed', error as Error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  })

// Metrics command
program
  .command('metrics')
  .description('Metrics operations')
  .argument('<action>', 'Action: export, summary')
  .option('-a, --arc <id>', 'Arc ID')
  .action(async (action, options) => {
    try {
      if (action === 'export') {
        if (!options.arc) {
          console.error('Error: --arc is required')
          process.exit(1)
        }

        const metrics = await prisma.arcMetrics.findMany({
          where: { arcId: options.arc },
          orderBy: { periodStart: 'asc' },
        })

        console.log(JSON.stringify(metrics, null, 2))
      } else if (action === 'summary') {
        const arcs = await prisma.narrativeArc.findMany({
          include: {
            metrics: {
              orderBy: { periodStart: 'desc' },
              take: 1,
            },
            _count: {
              select: {
                beats: true,
              },
            },
          },
        })

        console.log(`\n📊 Metrics Summary:\n`)
        for (const arc of arcs) {
          console.log(`  ${arc.title}`)
          console.log(`    Beats: ${arc._count.beats}`)
          if (arc.metrics.length > 0) {
            const latest = arc.metrics[0]
            console.log(`    Latest views: ${latest.viewCount}`)
            console.log(`    Completion rate: ${latest.beatCompletionRate}%`)
            console.log(`    Engagement: ${latest.memberEngagement}`)
          }
          console.log()
        }
      }
    } catch (error) {
      logger.error('Metrics operation failed', error as Error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  })

// Stats command
program
  .command('stats')
  .description('Show database statistics')
  .action(async () => {
    try {
      const [arcs, beats, templates, comments, tags, metrics] = await Promise.all([
        prisma.narrativeArc.count(),
        prisma.narrativeBeat.count(),
        prisma.arcTemplate.count(),
        prisma.beatComment.count(),
        prisma.tag.count(),
        prisma.arcMetrics.count(),
      ])

      console.log(`\n📈 Database Statistics:\n`)
      console.log(`  Narrative Arcs: ${arcs}`)
      console.log(`  Beats: ${beats}`)
      console.log(`  Templates: ${templates}`)
      console.log(`  Comments: ${comments}`)
      console.log(`  Tags: ${tags}`)
      console.log(`  Metrics Records: ${metrics}`)
      console.log()
    } catch (error) {
      logger.error('Stats operation failed', error as Error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  })

program.parse()
