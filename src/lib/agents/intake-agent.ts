// Context Intake Agent
// Responsibility: Gather org context, shape ISMS baseline
// Inputs: Industry, headcount, geography, data types, cloud stack, customer types
// Outputs: Draft ISMS scope, interested parties, regulatory exposure, initial Annex A assumptions

function getAnthropicApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }
  return apiKey
}

export interface IntakeResponses {
  org_name: string
  industry: string
  headcount: string
  geography: string[]
  data_types: string[]
  data_volume: string
  cloud_providers: string[]
  primary_workspace: string
  development_practices: string
  remote_work: string
  compliance_drivers: string[]
  existing_certifications: string[]
  certification_timeline: string
  customer_types: string[]
  customer_security_requirements: string
}

export interface InterestedParty {
  name: string
  type: 'internal' | 'external'
  expectations: string[]
  requirements: string[]
}

export interface RegulatoryRequirement {
  regulation: string
  description: string
  applicable: boolean
  reasoning: string
}

export interface AnnexAAssumption {
  controlId: string
  controlName: string
  applicability: 'likely_applicable' | 'likely_not_applicable' | 'needs_review'
  reasoning: string
}

export interface DraftISMSScope {
  scopeStatement: string
  boundaries: {
    physical: string[]
    logical: string[]
    organizational: string[]
  }
  exclusions: string[]
  interestedParties: InterestedParty[]
  regulatoryRequirements: RegulatoryRequirement[]
  annexAAssumptions: AnnexAAssumption[]
  riskAreas: string[]
  recommendations: string[]
}

const INTAKE_SYSTEM_PROMPT = `You are the Context Intake Agent for Voyu, an ISO 27001 compliance management system.

Your role is to analyze organization context and generate a draft ISMS scope that will be reviewed and approved by humans.

CRITICAL RULES:
1. You DRAFT - humans APPROVE. Never assume anything is final.
2. Be conservative in your assumptions - when uncertain, flag for review.
3. All outputs must reference specific ISO 27001:2022 clauses or Annex A controls where relevant.
4. Consider the organization's size, industry, and risk profile in all recommendations.
5. Focus on what's NECESSARY for certification, not what's ideal.

When analyzing responses, consider:
- Industry-specific regulations (HIPAA for healthcare, PCI DSS for payment data, etc.)
- Geographic regulations (GDPR for EU, CCPA for California, etc.)
- Customer expectations based on their types (enterprise customers have stricter requirements)
- Technical complexity based on their stack and development practices
- Timeline urgency for prioritization

Output JSON only, no markdown formatting.`

const SCOPE_GENERATION_PROMPT = `Based on the intake responses, generate a concise draft ISMS scope as JSON.

Intake Responses:
{responses}

Return ONLY this JSON (no markdown, keep values brief):
{"scopeStatement":"2 sentences max","boundaries":{"physical":["max 2 items"],"logical":["max 3 items"],"organizational":["max 3 items"]},"exclusions":["max 2 items"],"interestedParties":[{"name":"","type":"internal","expectations":["brief"],"requirements":["brief"]}],"regulatoryRequirements":[{"regulation":"","description":"brief","applicable":true,"reasoning":"brief"}],"annexAAssumptions":[],"riskAreas":["max 4 items"],"recommendations":["max 4 items"]}

Limits: max 4 interestedParties, max 4 regulatoryRequirements, empty annexAAssumptions array.`

export function buildScopeStream(responses: IntakeResponses): ReadableStream<Uint8Array> {
  const formattedResponses = JSON.stringify(responses, null, 2)
  const prompt = SCOPE_GENERATION_PROMPT.replace('{responses}', formattedResponses)
  const apiKey = getAnthropicApiKey()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2000,
            stream: true,
            system: INTAKE_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        if (!response.ok) {
          const err = await response.text()
          controller.error(new Error(`Anthropic API error ${response.status}: ${err}`))
          return
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const event = JSON.parse(data)
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                controller.enqueue(encoder.encode(event.delta.text))
              }
            } catch { /* skip malformed SSE */ }
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    }
  })
}

// Validate that all required fields are present
export function validateIntakeResponses(responses: Partial<IntakeResponses>): {
  valid: boolean
  missing: string[]
} {
  // Fields that must be non-empty (arrays must have at least one value)
  const requiredNonEmpty: (keyof IntakeResponses)[] = [
    'org_name',
    'industry',
    'headcount',
    'geography',
    'data_types',
    'data_volume',
    'cloud_providers',
    'primary_workspace',
    'development_practices',
    'remote_work',
    'compliance_drivers',
    'certification_timeline',
    'customer_types',
    'customer_security_requirements'
  ]
  // Fields that must be present but can be empty arrays (e.g. no existing certifications)
  const requiredPresent: (keyof IntakeResponses)[] = [
    'existing_certifications',
  ]

  const missing: string[] = []
  for (const field of requiredNonEmpty) {
    const value = responses[field]
    if (value === undefined || value === null || value === '') {
      missing.push(field)
    } else if (Array.isArray(value) && value.length === 0) {
      missing.push(field)
    }
  }
  for (const field of requiredPresent) {
    const value = responses[field]
    if (value === undefined || value === null) {
      missing.push(field)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}
