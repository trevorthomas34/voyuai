import { NextRequest, NextResponse } from 'next/server'
import { buildScopeStream, validateIntakeResponses, type IntakeResponses } from '@/lib/agents/intake-agent'

export const runtime = 'edge'

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

    // Stream Claude's response directly — keeps connection alive, avoids inactivity timeout
    const stream = buildScopeStream(responses as IntakeResponses)
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Error generating scope:', error)
    return NextResponse.json(
      { error: 'Failed to generate draft scope', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
