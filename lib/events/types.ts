/**
 * Domain event types for the Narrative Arc Campaign Designer
 *
 * Events enable decoupled communication between different parts of the system
 * and provide extension points for plugins and adapters.
 */

export interface DomainEvent<T = unknown> {
  type: string
  timestamp: Date
  payload: T
  metadata?: {
    userId?: string
    requestId?: string
    [key: string]: unknown
  }
}

// Arc Events
export interface ArcCreatedPayload {
  arcId: string
  communityId: string
  key: string
  title: string
  createdBy?: string
}

export interface ArcUpdatedPayload {
  arcId: string
  changes: Record<string, unknown>
  updatedBy?: string
}

export interface ArcDeletedPayload {
  arcId: string
  deletedBy?: string
}

export interface ArcStatusChangedPayload {
  arcId: string
  oldStatus: string
  newStatus: string
  changedBy?: string
}

// Beat Events
export interface BeatCreatedPayload {
  beatId: string
  arcId: string
  title: string
  orderIndex: number
  createdBy?: string
}

export interface BeatUpdatedPayload {
  beatId: string
  arcId: string
  changes: Record<string, unknown>
  updatedBy?: string
}

export interface BeatDeletedPayload {
  beatId: string
  arcId: string
  deletedBy?: string
}

export interface BeatsReorderedPayload {
  arcId: string
  beatIds: string[]
  reorderedBy?: string
}

export interface BeatStatusChangedPayload {
  beatId: string
  arcId: string
  oldStatus: string
  newStatus: string
  changedBy?: string
}

// Template Events
export interface TemplateCreatedPayload {
  templateId: string
  key: string
  name: string
  category: string
  createdBy?: string
}

export interface TemplateInstantiatedPayload {
  templateId: string
  arcId: string
  communityId: string
  instantiatedBy?: string
}

// Comment Events
export interface CommentCreatedPayload {
  commentId: string
  beatId: string
  arcId: string
  userId: string
  type: string
}

export interface CommentResolvedPayload {
  commentId: string
  beatId: string
  arcId: string
  resolvedBy: string
}

// Metrics Events
export interface MetricsRecordedPayload {
  arcId: string
  metricType: string
  value: number
  labels?: Record<string, string | number>
}

export interface AnalyticsGeneratedPayload {
  arcId: string
  periodStart: Date
  periodEnd: Date
  metricsId: string
}

// Event type constants
export const EVENT_TYPES = {
  // Arc events
  ARC_CREATED: 'arc.created',
  ARC_UPDATED: 'arc.updated',
  ARC_DELETED: 'arc.deleted',
  ARC_STATUS_CHANGED: 'arc.status_changed',

  // Beat events
  BEAT_CREATED: 'beat.created',
  BEAT_UPDATED: 'beat.updated',
  BEAT_DELETED: 'beat.deleted',
  BEATS_REORDERED: 'beats.reordered',
  BEAT_STATUS_CHANGED: 'beat.status_changed',

  // Template events
  TEMPLATE_CREATED: 'template.created',
  TEMPLATE_INSTANTIATED: 'template.instantiated',

  // Comment events
  COMMENT_CREATED: 'comment.created',
  COMMENT_RESOLVED: 'comment.resolved',

  // Metrics events
  METRICS_RECORDED: 'metrics.recorded',
  ANALYTICS_GENERATED: 'analytics.generated',

  // Tag events
  TAG_CREATED: 'tag.created',
  TAG_ADDED_TO_BEAT: 'tag.added_to_beat',
  TAG_REMOVED_FROM_BEAT: 'tag.removed_from_beat',
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
