import { z } from 'zod'

// NarrativeArc validation schemas
export const createNarrativeArcSchema = z.object({
  communityId: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  theme: z.string().optional(),
  descriptionMarkdown: z.string().optional(),
  horizonStart: z.string().datetime(),
  horizonEnd: z.string().datetime(),
})

export const updateNarrativeArcSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  theme: z.string().optional(),
  descriptionMarkdown: z.string().optional(),
  horizonStart: z.string().datetime().optional(),
  horizonEnd: z.string().datetime().optional(),
})

// NarrativeBeat validation schemas
export const createNarrativeBeatSchema = z.object({
  arcId: z.string(),
  orderIndex: z.number().int().min(0),
  title: z.string().min(1).max(200),
  descriptionMarkdown: z.string().optional(),
  targetMonth: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
  tagsJson: z.string().optional(),
  linkedRitualTemplateId: z.string().optional(),
  linkedCampaignId: z.string().optional(),
})

export const updateNarrativeBeatSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  title: z.string().min(1).max(200).optional(),
  descriptionMarkdown: z.string().optional(),
  targetMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  tagsJson: z.string().optional(),
  linkedRitualTemplateId: z.string().optional(),
  linkedCampaignId: z.string().optional(),
})

export const reorderBeatsSchema = z.object({
  beatIds: z.array(z.string()),
})

// CampaignAttachment validation schemas
export const createCampaignAttachmentSchema = z.object({
  arcId: z.string(),
  externalSystem: z.enum(['ritual-event-orchestrator', 'content-calendar', 'other']),
  externalRef: z.string().min(1),
  descriptionMarkdown: z.string().optional(),
})

export const updateCampaignAttachmentSchema = z.object({
  externalSystem: z.enum(['ritual-event-orchestrator', 'content-calendar', 'other']).optional(),
  externalRef: z.string().min(1).optional(),
  descriptionMarkdown: z.string().optional(),
})

// PHASE 3: Additional validation schemas

// ArcTemplate validation schemas
export const createArcTemplateSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).default('PRIVATE'),
  durationMonths: z.number().int().min(1).max(36),
  metadataJson: z.string().optional(),
  createdBy: z.string().optional(),
})

export const updateArcTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  visibility: z.enum(['PRIVATE', 'COMMUNITY', 'PUBLIC']).optional(),
  durationMonths: z.number().int().min(1).max(36).optional(),
  metadataJson: z.string().optional(),
})

export const instantiateTemplateSchema = z.object({
  templateId: z.string(),
  communityId: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  horizonStart: z.string().datetime(),
})

// TemplateBeat validation schemas
export const createTemplateBeatSchema = z.object({
  templateId: z.string(),
  orderIndex: z.number().int().min(0),
  title: z.string().min(1).max(200),
  descriptionMarkdown: z.string().optional(),
  suggestedMonth: z.number().int().min(0).max(35),
  defaultTags: z.string().optional(),
})

export const updateTemplateBeatSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  title: z.string().min(1).max(200).optional(),
  descriptionMarkdown: z.string().optional(),
  suggestedMonth: z.number().int().min(0).max(35).optional(),
  defaultTags: z.string().optional(),
})

// Tag validation schemas
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  category: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const addTagToBeatSchema = z.object({
  beatId: z.string(),
  tagId: z.string(),
})

// BeatComment validation schemas
export const createBeatCommentSchema = z.object({
  beatId: z.string(),
  userId: z.string().min(1),
  content: z.string().min(1).max(5000),
  type: z.enum(['FEEDBACK', 'QUESTION', 'APPROVAL', 'SUGGESTION']).default('FEEDBACK'),
  parentId: z.string().optional(),
})

export const updateBeatCommentSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  type: z.enum(['FEEDBACK', 'QUESTION', 'APPROVAL', 'SUGGESTION']).optional(),
})

export const resolveCommentSchema = z.object({
  resolved: z.boolean(),
  resolvedBy: z.string().optional(),
})

// ArcMetrics validation schemas
export const createArcMetricsSchema = z.object({
  arcId: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  viewCount: z.number().int().min(0).default(0),
  beatCompletionRate: z.number().min(0).max(100).default(0),
  memberEngagement: z.number().int().min(0).default(0),
  commentCount: z.number().int().min(0).default(0),
  metricsJson: z.string().optional(),
})

export const updateArcMetricsSchema = z.object({
  viewCount: z.number().int().min(0).optional(),
  beatCompletionRate: z.number().min(0).max(100).optional(),
  memberEngagement: z.number().int().min(0).optional(),
  commentCount: z.number().int().min(0).optional(),
  metricsJson: z.string().optional(),
})

// Type exports
export type CreateNarrativeArc = z.infer<typeof createNarrativeArcSchema>
export type UpdateNarrativeArc = z.infer<typeof updateNarrativeArcSchema>
export type CreateNarrativeBeat = z.infer<typeof createNarrativeBeatSchema>
export type UpdateNarrativeBeat = z.infer<typeof updateNarrativeBeatSchema>
export type ReorderBeats = z.infer<typeof reorderBeatsSchema>
export type CreateCampaignAttachment = z.infer<typeof createCampaignAttachmentSchema>
export type UpdateCampaignAttachment = z.infer<typeof updateCampaignAttachmentSchema>

// Phase 3 type exports
export type CreateArcTemplate = z.infer<typeof createArcTemplateSchema>
export type UpdateArcTemplate = z.infer<typeof updateArcTemplateSchema>
export type InstantiateTemplate = z.infer<typeof instantiateTemplateSchema>
export type CreateTemplateBeat = z.infer<typeof createTemplateBeatSchema>
export type UpdateTemplateBeat = z.infer<typeof updateTemplateBeatSchema>
export type CreateTag = z.infer<typeof createTagSchema>
export type UpdateTag = z.infer<typeof updateTagSchema>
export type AddTagToBeat = z.infer<typeof addTagToBeatSchema>
export type CreateBeatComment = z.infer<typeof createBeatCommentSchema>
export type UpdateBeatComment = z.infer<typeof updateBeatCommentSchema>
export type ResolveComment = z.infer<typeof resolveCommentSchema>
export type CreateArcMetrics = z.infer<typeof createArcMetricsSchema>
export type UpdateArcMetrics = z.infer<typeof updateArcMetricsSchema>
