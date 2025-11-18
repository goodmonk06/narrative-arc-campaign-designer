/**
 * Integration stub for Content Calendar
 *
 * This module provides functions to discover and link content campaigns
 * from the content-calendar system.
 */

export interface ContentCampaign {
  id: string
  title: string
  description: string
  contentType: string
  status: 'draft' | 'scheduled' | 'published'
  publishDate?: string
}

/**
 * Fetch available content campaigns from the external system
 * In production, this would make an API call to the content-calendar system
 */
export async function fetchContentCampaigns(): Promise<ContentCampaign[]> {
  // Stub implementation - returns mock data
  // In production, replace with actual API call:
  // const response = await fetch('https://content-calendar.example.com/api/campaigns')
  // return response.json()

  return [
    {
      id: 'campaign-001',
      title: 'Inner Growth Blog Series',
      description: 'Weekly blog posts on personal development',
      contentType: 'blog',
      status: 'published',
      publishDate: '2025-01-01',
    },
    {
      id: 'campaign-002',
      title: 'Community Stories Podcast',
      description: 'Monthly podcast featuring member journeys',
      contentType: 'podcast',
      status: 'scheduled',
      publishDate: '2025-02-15',
    },
    {
      id: 'campaign-003',
      title: 'Transformation Video Series',
      description: 'Video content documenting community transformations',
      contentType: 'video',
      status: 'draft',
    },
    {
      id: 'campaign-004',
      title: 'Monthly Newsletter',
      description: 'Email newsletter with updates and reflections',
      contentType: 'newsletter',
      status: 'published',
      publishDate: '2025-01-01',
    },
  ]
}

/**
 * Get details for a specific content campaign
 */
export async function getContentCampaign(id: string): Promise<ContentCampaign | null> {
  const campaigns = await fetchContentCampaigns()
  return campaigns.find(c => c.id === id) || null
}

/**
 * Search content campaigns by keyword
 */
export async function searchContentCampaigns(query: string): Promise<ContentCampaign[]> {
  const campaigns = await fetchContentCampaigns()
  const lowerQuery = query.toLowerCase()
  return campaigns.filter(
    c => c.title.toLowerCase().includes(lowerQuery) ||
         c.description.toLowerCase().includes(lowerQuery) ||
         c.contentType.toLowerCase().includes(lowerQuery)
  )
}
