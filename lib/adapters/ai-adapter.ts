/**
 * AI adapter interface and implementations
 *
 * Enables AI-powered narrative suggestions and optimizations
 */

import { logger } from '../logger'

export interface NarrativeSuggestion {
  type: 'arc' | 'beat' | 'tag'
  suggestion: string
  reasoning: string
  confidence: number // 0-1
  metadata?: Record<string, unknown>
}

export interface IAIAdapter {
  suggestArcTheme(context: { communityType?: string; duration: number }): Promise<NarrativeSuggestion[]>
  suggestBeats(context: { arcId: string; theme?: string; duration: number }): Promise<NarrativeSuggestion[]>
  suggestTags(context: { beatTitle: string; description?: string }): Promise<string[]>
  optimizeBeatSequence(context: { arcId: string; beats: any[] }): Promise<NarrativeSuggestion[]>
}

/**
 * Mock AI adapter (default)
 * Returns predefined suggestions - useful for development and testing
 */
export class MockAIAdapter implements IAIAdapter {
  async suggestArcTheme(context: { communityType?: string; duration: number }): Promise<NarrativeSuggestion[]> {
    logger.debug('AI: Suggesting arc themes', undefined, context)

    return [
      {
        type: 'arc',
        suggestion: 'Journey of Transformation',
        reasoning: 'Classic hero\'s journey structure adapted for community growth',
        confidence: 0.85,
      },
      {
        type: 'arc',
        suggestion: 'Seasonal Awakening',
        reasoning: 'Aligns with natural seasonal rhythms for organic progression',
        confidence: 0.75,
      },
    ]
  }

  async suggestBeats(context: { arcId: string; theme?: string; duration: number }): Promise<NarrativeSuggestion[]> {
    logger.debug('AI: Suggesting beats', undefined, context)

    const monthCount = Math.min(context.duration, 12)
    const suggestions: NarrativeSuggestion[] = []

    if (monthCount >= 3) {
      suggestions.push({
        type: 'beat',
        suggestion: 'The Call - Initial invitation and awakening',
        reasoning: 'Strong opening beat that sets the tone',
        confidence: 0.9,
      })
    }

    if (monthCount >= 6) {
      suggestions.push({
        type: 'beat',
        suggestion: 'The Challenge - Confronting obstacles',
        reasoning: 'Mid-point crisis drives deeper engagement',
        confidence: 0.85,
      })
    }

    if (monthCount >= 9) {
      suggestions.push({
        type: 'beat',
        suggestion: 'Integration - Applying lessons learned',
        reasoning: 'Helps consolidate growth before completion',
        confidence: 0.8,
      })
    }

    return suggestions
  }

  async suggestTags(context: { beatTitle: string; description?: string }): Promise<string[]> {
    logger.debug('AI: Suggesting tags', undefined, context)

    // Simple keyword extraction simulation
    const text = `${context.beatTitle} ${context.description || ''}`.toLowerCase()
    const suggestedTags: string[] = []

    if (text.includes('start') || text.includes('begin')) suggestedTags.push('beginning')
    if (text.includes('challenge') || text.includes('obstacle')) suggestedTags.push('challenge')
    if (text.includes('celebrate') || text.includes('milestone')) suggestedTags.push('celebration')
    if (text.includes('reflect') || text.includes('review')) suggestedTags.push('reflection')
    if (text.includes('community') || text.includes('together')) suggestedTags.push('community')

    return suggestedTags.length > 0 ? suggestedTags : ['milestone']
  }

  async optimizeBeatSequence(context: { arcId: string; beats: any[] }): Promise<NarrativeSuggestion[]> {
    logger.debug('AI: Optimizing beat sequence', undefined, { arcId: context.arcId, beatCount: context.beats.length })

    return [
      {
        type: 'beat',
        suggestion: 'Consider adding a mid-point reflection beat',
        reasoning: 'Helps maintain engagement during longer arcs',
        confidence: 0.7,
      },
    ]
  }
}

/**
 * OpenAI adapter (stub)
 * Integrate with OpenAI API for actual AI suggestions
 */
export class OpenAIAdapter implements IAIAdapter {
  constructor(private apiKey?: string) {}

  async suggestArcTheme(context: { communityType?: string; duration: number }): Promise<NarrativeSuggestion[]> {
    logger.info('AI (OpenAI): Suggesting arc themes', undefined, context)

    // TODO: Implement actual OpenAI API call
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4',
    //   messages: [
    //     { role: 'system', content: 'You are a narrative arc design expert...' },
    //     { role: 'user', content: `Suggest themes for a ${context.duration}-month arc for ${context.communityType}` }
    //   ],
    // })

    // Fallback to mock for now
    return new MockAIAdapter().suggestArcTheme(context)
  }

  async suggestBeats(context: { arcId: string; theme?: string; duration: number }): Promise<NarrativeSuggestion[]> {
    return new MockAIAdapter().suggestBeats(context)
  }

  async suggestTags(context: { beatTitle: string; description?: string }): Promise<string[]> {
    return new MockAIAdapter().suggestTags(context)
  }

  async optimizeBeatSequence(context: { arcId: string; beats: any[] }): Promise<NarrativeSuggestion[]> {
    return new MockAIAdapter().optimizeBeatSequence(context)
  }
}
