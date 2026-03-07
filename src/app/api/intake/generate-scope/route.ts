import { NextRequest, NextResponse } from 'next/server'
import { generateDraftScope, validateIntakeResponses, type IntakeResponses } from '@/lib/agents/intake-agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const responses = body.responses as Partial<IntakeResponses>

    const validation = validateIntakeResponses(responses)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: validation.missing },
        { status: 400 }
      )
    }

    const draftScope = await generateDraftScope(responses as IntakeResponses)

    return NextResponse.json({ success: true, draftScope })
  } catch (error) {
    console.error('Error generating scope:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate draft scope',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
