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

export type CreateNarrativeArc = z.infer<typeof createNarrativeArcSchema>
export type UpdateNarrativeArc = z.infer<typeof updateNarrativeArcSchema>
export type CreateNarrativeBeat = z.infer<typeof createNarrativeBeatSchema>
export type UpdateNarrativeBeat = z.infer<typeof updateNarrativeBeatSchema>
export type ReorderBeats = z.infer<typeof reorderBeatsSchema>
export type CreateCampaignAttachment = z.infer<typeof createCampaignAttachmentSchema>
export type UpdateCampaignAttachment = z.infer<typeof updateCampaignAttachmentSchema>
