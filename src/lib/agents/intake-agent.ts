// Context Intake Agent
// Responsibility: Gather org context, shape ISMS baseline
// Inputs: Industry, headcount, geography, data types, cloud stack, customer types
// Outputs: Draft ISMS scope, interested parties, regulatory exposure, initial Annex A assumptions

import OpenAI from 'openai'

// Lazy-load OpenAI client to avoid build-time initialization errors
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
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

const SCOPE_GENERATION_PROMPT = `Based on the intake questionnaire responses, generate a comprehensive draft ISMS scope.

Intake Responses:
{responses}

Generate a JSON response with this exact structure:
{
  "scopeStatement": "A 2-3 sentence description of what the ISMS covers",
  "boundaries": {
    "physical": ["List of physical locations/assets in scope"],
    "logical": ["List of systems, applications, networks in scope"],
    "organizational": ["List of departments, teams, processes in scope"]
  },
  "exclusions": ["Specific items explicitly excluded with justification"],
  "interestedParties": [
    {
      "name": "Party name",
      "type": "internal or external",
      "expectations": ["What they expect"],
      "requirements": ["Specific requirements they impose"]
    }
  ],
  "regulatoryRequirements": [
    {
      "regulation": "Regulation name",
      "description": "Brief description",
      "applicable": true/false,
      "reasoning": "Why applicable or not"
    }
  ],
  "annexAAssumptions": [
    {
      "controlId": "A.X.X",
      "controlName": "Control name",
      "applicability": "likely_applicable|likely_not_applicable|needs_review",
      "reasoning": "Brief reasoning"
    }
  ],
  "riskAreas": ["Key risk areas to focus on based on the profile"],
  "recommendations": ["Specific recommendations for this organization"]
}

Focus on:
1. Making the scope clear and auditable
2. Identifying ALL relevant interested parties
3. Flagging ALL potentially applicable regulations
4. Only include Annex A assumptions for controls that clearly apply or don't apply based on the context
5. Being conservative - when in doubt, mark as "needs_review"`

export async function generateDraftScope(responses: IntakeResponses): Promise<DraftISMSScope> {
  const formattedResponses = JSON.stringify(responses, null, 2)
  const prompt = SCOPE_GENERATION_PROMPT.replace('{responses}', formattedResponses)

  try {
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: INTAKE_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0].message.content
    if (!content) {
      throw new Error('No content in response')
    }

    const result = JSON.parse(content) as DraftISMSScope
    return result
  } catch (error) {
    console.error('Error generating draft scope:', error)
    throw new Error('Failed to generate draft ISMS scope')
  }
}

// Validate that all required fields are present
export function validateIntakeResponses(responses: Partial<IntakeResponses>): {
  valid: boolean
  missing: string[]
} {
  const requiredFields: (keyof IntakeResponses)[] = [
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
    'existing_certifications',
    'certification_timeline',
    'customer_types',
    'customer_security_requirements'
  ]

  const missing: string[] = []
  for (const field of requiredFields) {
    const value = responses[field]
    if (value === undefined || value === null || value === '') {
      missing.push(field)
    } else if (Array.isArray(value) && value.length === 0) {
      missing.push(field)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}
