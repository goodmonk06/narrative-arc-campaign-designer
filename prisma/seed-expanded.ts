import { PrismaClient } from '@prisma/client'
import { addMonths } from 'date-fns'

const prisma = new PrismaClient()

const DEMO_USER_IDS = {
  organizer: 'user-organizer-001',
  collaborator1: 'user-collab-001',
  collaborator2: 'user-collab-002',
  member: 'user-member-001',
}

async function seedTags() {
  console.log('🏷️  Creating tags...')

  const tags = [
    // Theme tags
    { name: 'intention-setting', category: 'theme', color: '#3B82F6', description: 'Setting intentions and goals' },
    { name: 'new-beginnings', category: 'theme', color: '#10B981', description: 'Fresh starts and new chapters' },
    { name: 'reflection', category: 'theme', color: '#8B5CF6', description: 'Looking inward and reviewing' },
    { name: 'action', category: 'theme', color: '#EF4444', description: 'Taking concrete steps' },
    { name: 'growth', category: 'theme', color: '#22C55E', description: 'Personal and collective growth' },
    { name: 'challenge', category: 'theme', color: '#F59E0B', description: 'Facing obstacles' },
    { name: 'resilience', category: 'theme', color: '#EC4899', description: 'Building strength' },
    { name: 'celebration', category: 'theme', color: '#14B8A6', description: 'Celebrating wins' },
    { name: 'integration', category: 'theme', color: '#6366F1', description: 'Bringing it all together' },

    // Milestone tags
    { name: 'milestone', category: 'milestone', color: '#FCD34D', description: 'Key achievement point' },
    { name: 'checkpoint', category: 'milestone', color: '#A78BFA', description: 'Review and assess' },
    { name: 'pivot', category: 'milestone', color: '#FB7185', description: 'Direction change' },

    // Audience tags
    { name: 'community', category: 'audience', color: '#34D399', description: 'Full community involvement' },
    { name: 'leadership', category: 'audience', color: '#60A5FA', description: 'Leadership focus' },
    { name: 'newcomers', category: 'audience', color: '#F472B6', description: 'New member focus' },
  ]

  const createdTags = []
  for (const tag of tags) {
    const created = await prisma.tag.create({ data: tag })
    createdTags.push(created)
    console.log(`  ✅ Created tag: ${tag.name}`)
  }

  return createdTags
}

async function seedTemplates() {
  console.log('📋 Creating templates...')

  const template1 = await prisma.arcTemplate.create({
    data: {
      key: 'transformation-journey-template',
      name: 'Transformation Journey',
      description: 'A proven 12-month pattern for community transformation',
      category: 'growth',
      visibility: 'PUBLIC',
      durationMonths: 12,
      metadataJson: JSON.stringify({ difficulty: 'medium', recommendedSize: '50-200 members' }),
    },
  })

  const template1Beats = [
    { orderIndex: 0, title: 'Awakening', suggestedMonth: 0, defaultTags: JSON.stringify(['intention-setting', 'new-beginnings']) },
    { orderIndex: 1, title: 'Commitment', suggestedMonth: 1, defaultTags: JSON.stringify(['action', 'milestone']) },
    { orderIndex: 2, title: 'Deep Work', suggestedMonth: 3, defaultTags: JSON.stringify(['growth', 'challenge']) },
    { orderIndex: 3, title: 'Mid-Point Celebration', suggestedMonth: 5, defaultTags: JSON.stringify(['celebration', 'checkpoint']) },
    { orderIndex: 4, title: 'Renewal', suggestedMonth: 7, defaultTags: JSON.stringify(['reflection', 'pivot']) },
    { orderIndex: 5, title: 'Integration', suggestedMonth: 10, defaultTags: JSON.stringify(['integration', 'milestone']) },
    { orderIndex: 6, title: 'Completion', suggestedMonth: 11, defaultTags: JSON.stringify(['celebration', 'reflection']) },
  ]

  for (const beat of template1Beats) {
    await prisma.templateBeat.create({
      data: { ...beat, templateId: template1.id },
    })
  }

  console.log(`  ✅ Created template: ${template1.name} with ${template1Beats.length} beats`)

  return [template1]
}

async function seedScenario1WellnessTransformation(tags: any[]) {
  console.log('\n🌿 SCENARIO 1: Wellness Transformation Journey')

  const arc = await prisma.narrativeArc.create({
    data: {
      communityId: 'wellness-community-001',
      key: 'wellness-transformation-2025',
      title: 'Wellness Transformation Journey',
      theme: 'Holistic Health and Well-being',
      descriptionMarkdown: `A 9-month journey guiding our wellness community through comprehensive transformation. This arc integrates physical health, mental clarity, emotional balance, and spiritual growth into a cohesive narrative.

Each beat builds on the previous, creating momentum and sustainable change patterns.`,
      horizonStart: new Date('2025-01-01'),
      horizonEnd: new Date('2025-09-30'),
      status: 'ACTIVE',
      createdBy: DEMO_USER_IDS.organizer,
    },
  })

  const beatData = [
    {
      orderIndex: 0,
      title: 'Foundation Setting',
      description: 'Establishing baseline health metrics and setting personalized wellness goals',
      targetMonth: '2025-01',
      status: 'COMPLETED',
      tags: ['intention-setting', 'new-beginnings', 'community'],
    },
    {
      orderIndex: 1,
      title: 'Movement & Energy',
      description: 'Building sustainable exercise habits and boosting daily energy levels',
      targetMonth: '2025-02',
      status: 'IN_PROGRESS',
      tags: ['action', 'growth', 'milestone'],
    },
    {
      orderIndex: 2,
      title: 'Nutrition Revolution',
      description: 'Transforming relationship with food through mindful eating practices',
      targetMonth: '2025-03',
      status: 'PENDING',
      tags: ['challenge', 'growth'],
    },
    {
      orderIndex: 3,
      title: 'Mental Clarity',
      description: 'Developing meditation and mindfulness practices for mental health',
      targetMonth: '2025-04',
      status: 'PENDING',
      tags: ['reflection', 'resilience'],
    },
    {
      orderIndex: 4,
      title: 'Mid-Journey Check-in',
      description: 'Celebrating progress and adjusting goals based on results',
      targetMonth: '2025-05',
      status: 'PENDING',
      tags: ['celebration', 'checkpoint', 'milestone'],
    },
    {
      orderIndex: 5,
      title: 'Sleep & Recovery',
      description: 'Optimizing rest and recovery for sustained wellness',
      targetMonth: '2025-06',
      status: 'PENDING',
      tags: ['integration', 'growth'],
    },
    {
      orderIndex: 6,
      title: 'Emotional Balance',
      description: 'Cultivating emotional intelligence and resilience',
      targetMonth: '2025-07',
      status: 'PENDING',
      tags: ['challenge', 'resilience'],
    },
    {
      orderIndex: 7,
      title: 'Community Connection',
      description: 'Strengthening social bonds and support networks',
      targetMonth: '2025-08',
      status: 'PENDING',
      tags: ['community', 'celebration'],
    },
    {
      orderIndex: 8,
      title: 'Sustainable Living',
      description: 'Integrating all practices into lifelong healthy habits',
      targetMonth: '2025-09',
      status: 'PENDING',
      tags: ['integration', 'milestone', 'reflection'],
    },
  ]

  const tagMap = new Map(tags.map(t => [t.name, t]))

  for (const beat of beatData) {
    const createdBeat = await prisma.narrativeBeat.create({
      data: {
        arcId: arc.id,
        orderIndex: beat.orderIndex,
        title: beat.title,
        descriptionMarkdown: beat.description,
        targetMonth: beat.targetMonth,
        status: beat.status as any,
      },
    })

    // Add tags to beat
    for (const tagName of beat.tags) {
      const tag = tagMap.get(tagName)
      if (tag) {
        await prisma.beatTag.create({
          data: { beatId: createdBeat.id, tagId: tag.id },
        })
      }
    }

    console.log(`  ✅ Created beat: ${beat.title} (${beat.status})`)
  }

  // Add sample comments
  const firstBeat = await prisma.narrativeBeat.findFirst({ where: { arcId: arc.id } })
  if (firstBeat) {
    const comment1 = await prisma.beatComment.create({
      data: {
        beatId: firstBeat.id,
        userId: DEMO_USER_IDS.collaborator1,
        content: 'Great start! The baseline health metrics were really eye-opening for our members.',
        type: 'FEEDBACK',
      },
    })

    await prisma.beatComment.create({
      data: {
        beatId: firstBeat.id,
        userId: DEMO_USER_IDS.organizer,
        content: 'Thanks! We saw 85% participation in the initial assessment.',
        type: 'FEEDBACK',
        parentId: comment1.id,
      },
    })

    console.log(`  💬 Added 2 comments to ${firstBeat.title}`)
  }

  // Add metrics
  await prisma.arcMetrics.create({
    data: {
      arcId: arc.id,
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-31'),
      viewCount: 342,
      beatCompletionRate: 85.0,
      memberEngagement: 127,
      commentCount: 23,
      metricsJson: JSON.stringify({ activeMembers: 150, newSignups: 12 }),
    },
  })

  console.log(`  📊 Added metrics for January`)
  console.log(`✅ Scenario 1 complete: ${arc.title}`)
}

async function seedScenario2StartupGrowth(tags: any[]) {
  console.log('\n🚀 SCENARIO 2: Startup Growth Journey')

  const arc = await prisma.narrativeArc.create({
    data: {
      communityId: 'startup-community-002',
      key: 'startup-growth-q1-q4-2025',
      title: 'Startup Growth: Seed to Series A',
      theme: 'Building and Scaling',
      descriptionMarkdown: `A 12-month narrative for our startup community's journey from initial funding to Series A readiness. Each quarter focuses on specific growth milestones while maintaining culture and team cohesion.

This arc aligns with typical startup evolution patterns while providing support structure.`,
      horizonStart: new Date('2025-01-01'),
      horizonEnd: new Date('2025-12-31'),
      status: 'ACTIVE',
      createdBy: DEMO_USER_IDS.organizer,
    },
  })

  const beatData = [
    {
      orderIndex: 0,
      title: 'Vision & Foundation (Q1)',
      description: 'Crystalizing vision, forming core team, establishing product-market fit',
      targetMonth: '2025-01',
      tags: ['intention-setting', 'new-beginnings', 'leadership'],
    },
    {
      orderIndex: 1,
      title: 'First Customer Wins',
      description: 'Landing initial customers and iterating based on feedback',
      targetMonth: '2025-03',
      tags: ['action', 'milestone', 'celebration'],
    },
    {
      orderIndex: 2,
      title: 'Team Building Sprint',
      description: 'Strategic hiring and culture establishment',
      targetMonth: '2025-04',
      tags: ['growth', 'community', 'challenge'],
    },
    {
      orderIndex: 3,
      title: 'Product Evolution',
      description: 'Major product iteration based on early traction',
      targetMonth: '2025-05',
      tags: ['pivot', 'growth'],
    },
    {
      orderIndex: 4,
      title: 'Revenue Acceleration',
      description: 'Scaling sales and hitting key revenue milestones',
      targetMonth: '2025-07',
      tags: ['action', 'milestone', 'celebration'],
    },
    {
      orderIndex: 5,
      title: 'Systems & Process',
      description: 'Implementing scalable systems for sustainable growth',
      targetMonth: '2025-08',
      tags: ['integration', 'challenge'],
    },
    {
      orderIndex: 6,
      title: 'Market Expansion',
      description: 'Entering new markets or verticals',
      targetMonth: '2025-09',
      tags: ['action', 'growth', 'milestone'],
    },
    {
      orderIndex: 7,
      title: 'Series A Preparation',
      description: 'Building metrics, narrative, and relationships for fundraising',
      targetMonth: '2025-11',
      tags: ['checkpoint', 'leadership'],
    },
    {
      orderIndex: 8,
      title: 'Year in Review',
      description: 'Celebrating growth and planning for next phase',
      targetMonth: '2025-12',
      tags: ['reflection', 'celebration', 'milestone'],
    },
  ]

  const tagMap = new Map(tags.map(t => [t.name, t]))

  for (const beat of beatData) {
    const createdBeat = await prisma.narrativeBeat.create({
      data: {
        arcId: arc.id,
        orderIndex: beat.orderIndex,
        title: beat.title,
        descriptionMarkdown: beat.description,
        targetMonth: beat.targetMonth,
        status: 'PENDING',
      },
    })

    for (const tagName of beat.tags) {
      const tag = tagMap.get(tagName)
      if (tag) {
        await prisma.beatTag.create({
          data: { beatId: createdBeat.id, tagId: tag.id },
        })
      }
    }

    console.log(`  ✅ Created beat: ${beat.title}`)
  }

  console.log(`✅ Scenario 2 complete: ${arc.title}`)
}

async function seedScenario3LearningCohort(tags: any[]) {
  console.log('\n📚 SCENARIO 3: Learning Cohort Journey')

  const arc = await prisma.narrativeArc.create({
    data: {
      communityId: 'learning-community-003',
      key: 'web-dev-mastery-cohort-2025',
      title: 'Web Development Mastery Cohort',
      theme: 'From Beginner to Professional',
      descriptionMarkdown: `A 6-month intensive learning journey transforming beginners into job-ready web developers. Structured curriculum combined with peer learning and real-world projects.

Each beat represents a major skill acquisition phase with hands-on projects and community support.`,
      horizonStart: new Date('2025-02-01'),
      horizonEnd: new Date('2025-07-31'),
      status: 'DRAFT',
      createdBy: DEMO_USER_IDS.organizer,
    },
  })

  const beatData = [
    {
      orderIndex: 0,
      title: 'Foundations Week',
      description: 'HTML, CSS, JavaScript basics. First "Hello World" deployment',
      targetMonth: '2025-02',
      tags: ['new-beginnings', 'newcomers', 'action'],
    },
    {
      orderIndex: 1,
      title: 'Interactive Web Apps',
      description: 'React fundamentals and building first interactive applications',
      targetMonth: '2025-03',
      tags: ['growth', 'challenge', 'community'],
    },
    {
      orderIndex: 2,
      title: 'Backend Integration',
      description: 'Node.js, APIs, databases - connecting frontend to backend',
      targetMonth: '2025-04',
      tags: ['growth', 'challenge', 'milestone'],
    },
    {
      orderIndex: 3,
      title: 'Mid-Cohort Project',
      description: 'Team project building real-world application',
      targetMonth: '2025-05',
      tags: ['action', 'community', 'checkpoint'],
    },
    {
      orderIndex: 4,
      title: 'Advanced Patterns',
      description: 'State management, testing, performance optimization',
      targetMonth: '2025-06',
      tags: ['growth', 'challenge'],
    },
    {
      orderIndex: 5,
      title: 'Portfolio & Job Prep',
      description: 'Building portfolio, resume, interview prep, job applications',
      targetMonth: '2025-07',
      tags: ['integration', 'milestone', 'celebration'],
    },
  ]

  const tagMap = new Map(tags.map(t => [t.name, t]))

  for (const beat of beatData) {
    const createdBeat = await prisma.narrativeBeat.create({
      data: {
        arcId: arc.id,
        orderIndex: beat.orderIndex,
        title: beat.title,
        descriptionMarkdown: beat.description,
        targetMonth: beat.targetMonth,
        status: 'PENDING',
      },
    })

    for (const tagName of beat.tags) {
      const tag = tagMap.get(tagName)
      if (tag) {
        await prisma.beatTag.create({
          data: { beatId: createdBeat.id, tagId: tag.id },
        })
      }
    }

    console.log(`  ✅ Created beat: ${beat.title}`)
  }

  // Add some approval comments
  const beats = await prisma.narrativeBeat.findMany({ where: { arcId: arc.id }, take: 2 })

  if (beats.length >= 2) {
    await prisma.beatComment.create({
      data: {
        beatId: beats[0].id,
        userId: DEMO_USER_IDS.collaborator2,
        content: 'Curriculum looks solid. Should we add more hands-on exercises in week 1?',
        type: 'QUESTION',
      },
    })

    await prisma.beatComment.create({
      data: {
        beatId: beats[1].id,
        userId: DEMO_USER_IDS.collaborator1,
        content: 'Approved! React fundamentals are well-structured.',
        type: 'APPROVAL',
        resolved: true,
        resolvedBy: DEMO_USER_IDS.organizer,
        resolvedAt: new Date(),
      },
    })

    console.log(`  💬 Added comments to learning cohort beats`)
  }

  console.log(`✅ Scenario 3 complete: ${arc.title}`)
}

async function main() {
  console.log('🌱 Seeding expanded database with 3 complete scenarios...\n')

  // Seed shared resources
  const tags = await seedTags()
  const templates = await seedTemplates()

  // Seed the 3 scenarios
  await seedScenario1WellnessTransformation(tags)
  await seedScenario2StartupGrowth(tags)
  await seedScenario3LearningCohort(tags)

  console.log('\n✨ Comprehensive seeding complete!')
  console.log(`   📊 3 narrative arcs created`)
  console.log(`   🎯 ${tags.length} tags created`)
  console.log(`   📋 ${templates.length} templates created`)
  console.log(`   💬 Multiple comments and metrics added`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
