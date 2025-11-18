import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create "Year of Inner Expansion" narrative arc
  const arc = await prisma.narrativeArc.create({
    data: {
      communityId: 'community-demo',
      key: 'year-of-inner-expansion-2025',
      title: 'Year of Inner Expansion',
      theme: 'Growth, Discovery, and Transformation',
      descriptionMarkdown: `A year-long journey designed to guide our community through profound personal and collective growth. This narrative arc weaves together monthly themes, rituals, and content to create a cohesive experience of inner expansion.

Each beat represents a key moment in the journey, with carefully designed rituals and content to support our members' transformation.`,
      horizonStart: new Date('2025-01-01'),
      horizonEnd: new Date('2025-12-31'),
    },
  })

  console.log(`✅ Created arc: ${arc.title}`)

  // Create narrative beats
  const beats = [
    {
      orderIndex: 0,
      title: 'The Awakening',
      descriptionMarkdown: 'Setting intentions for the year ahead. A month of reflection on who we are and who we wish to become.',
      targetMonth: '2025-01',
      tagsJson: JSON.stringify(['intention-setting', 'new-beginnings', 'reflection']),
      linkedRitualTemplateId: 'ritual-template-004',
      linkedCampaignId: 'campaign-004',
    },
    {
      orderIndex: 1,
      title: 'Seeds of Change',
      descriptionMarkdown: 'Planting the seeds of transformation. Taking the first concrete steps toward our aspirations.',
      targetMonth: '2025-02',
      tagsJson: JSON.stringify(['action', 'commitment', 'growth']),
      linkedRitualTemplateId: 'ritual-template-001',
      linkedCampaignId: 'campaign-001',
    },
    {
      orderIndex: 2,
      title: 'Breaking Ground',
      descriptionMarkdown: 'Confronting the challenges and obstacles that emerge. Building resilience and community support.',
      targetMonth: '2025-03',
      tagsJson: JSON.stringify(['challenge', 'resilience', 'support']),
      linkedRitualTemplateId: 'ritual-template-003',
      linkedCampaignId: null,
    },
    {
      orderIndex: 3,
      title: 'Spring Renewal',
      descriptionMarkdown: 'Celebrating early wins and renewed energy. A time of expansion and opening.',
      targetMonth: '2025-04',
      tagsJson: JSON.stringify(['celebration', 'milestone', 'expansion']),
      linkedRitualTemplateId: 'ritual-template-002',
      linkedCampaignId: 'campaign-002',
    },
    {
      orderIndex: 4,
      title: 'The Deep Dive',
      descriptionMarkdown: 'Going deeper into practice and understanding. Intensive personal work and community exploration.',
      targetMonth: '2025-06',
      tagsJson: JSON.stringify(['depth', 'practice', 'intensive']),
      linkedRitualTemplateId: 'ritual-template-002',
      linkedCampaignId: 'campaign-001',
    },
    {
      orderIndex: 5,
      title: 'Summer Harvest',
      descriptionMarkdown: 'Reaping the fruits of our labor. Sharing stories and celebrating transformations.',
      targetMonth: '2025-08',
      tagsJson: JSON.stringify(['celebration', 'harvest', 'sharing']),
      linkedRitualTemplateId: 'ritual-template-001',
      linkedCampaignId: 'campaign-003',
    },
    {
      orderIndex: 6,
      title: 'Autumn Integration',
      descriptionMarkdown: 'Integrating lessons learned. Preparing for the next cycle of growth.',
      targetMonth: '2025-10',
      tagsJson: JSON.stringify(['integration', 'reflection', 'wisdom']),
      linkedRitualTemplateId: 'ritual-template-002',
      linkedCampaignId: 'campaign-004',
    },
    {
      orderIndex: 7,
      title: 'Year-End Reflection',
      descriptionMarkdown: 'Looking back on the journey. Honoring growth and setting the stage for what comes next.',
      targetMonth: '2025-12',
      tagsJson: JSON.stringify(['reflection', 'completion', 'gratitude']),
      linkedRitualTemplateId: 'ritual-template-004',
      linkedCampaignId: 'campaign-004',
    },
  ]

  for (const beatData of beats) {
    const beat = await prisma.narrativeBeat.create({
      data: {
        ...beatData,
        arcId: arc.id,
      },
    })
    console.log(`  ✅ Created beat: ${beat.title}`)
  }

  // Create campaign attachments
  const attachments = [
    {
      externalSystem: 'ritual-event-orchestrator',
      externalRef: 'ritual-template-001',
      descriptionMarkdown: 'Monthly community gatherings scheduled throughout the arc',
    },
    {
      externalSystem: 'content-calendar',
      externalRef: 'campaign-001',
      descriptionMarkdown: 'Blog series supporting the narrative themes',
    },
    {
      externalSystem: 'content-calendar',
      externalRef: 'campaign-002',
      descriptionMarkdown: 'Podcast episodes featuring member transformation stories',
    },
  ]

  for (const attachmentData of attachments) {
    const attachment = await prisma.campaignAttachment.create({
      data: {
        ...attachmentData,
        arcId: arc.id,
      },
    })
    console.log(`  ✅ Created attachment: ${attachment.externalSystem}/${attachment.externalRef}`)
  }

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
