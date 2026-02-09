'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { IntakeForm } from '@/components/intake/intake-form'
import { DraftScopeReview } from '@/components/intake/draft-scope-review'
import type { DraftISMSScope } from '@/lib/agents/intake-agent'

type IntakeStep = 'questionnaire' | 'review' | 'complete'

export default function IntakePage() {
  const [step, setStep] = useState<IntakeStep>('questionnaire')
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [draftScope, setDraftScope] = useState<DraftISMSScope | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formResponses: Record<string, unknown>) => {
    setIsSubmitting(true)
    setError(null)
    setResponses(formResponses)

    try {
      const response = await fetch('/api/intake/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: formResponses })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate scope')
      }

      setDraftScope(data.draftScope)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async (formResponses: Record<string, unknown>) => {
    setResponses(formResponses)
    // In a real app, this would save to the database
    console.log('Draft saved:', formResponses)
  }

  const handleApprove = async () => {
    if (!draftScope) return

    setIsApproving(true)
    setError(null)

    try {
      const response = await fetch('/api/intake/approve-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftScope })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve scope')
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsApproving(false)
    }
  }

  const handleEdit = () => {
    setStep('questionnaire')
  }

  const handleRegenerate = () => {
    handleSubmit(responses)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader subtitle="Context Intake Questionnaire" simple />

      <main className="container mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <StepIndicator
            number={1}
            label="Questionnaire"
            active={step === 'questionnaire'}
            complete={step !== 'questionnaire'}
          />
          <div className="w-16 h-0.5 bg-border" />
          <StepIndicator
            number={2}
            label="Review Scope"
            active={step === 'review'}
            complete={step === 'complete'}
          />
          <div className="w-16 h-0.5 bg-border" />
          <StepIndicator
            number={3}
            label="Complete"
            active={step === 'complete'}
            complete={false}
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Content based on step */}
        {step === 'questionnaire' && (
          <IntakeForm
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            initialResponses={responses}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'review' && draftScope && (
          <DraftScopeReview
            draftScope={draftScope}
            onApprove={handleApprove}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            isApproving={isApproving}
          />
        )}

        {step === 'complete' && (
          <CompletionMessage />
        )}
      </main>
    </div>
  )
}

function StepIndicator({
  number,
  label,
  active,
  complete
}: {
  number: number
  label: string
  active: boolean
  complete: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
          ${active ? 'bg-primary text-primary-foreground' : ''}
          ${complete ? 'bg-primary/20 text-primary' : ''}
          ${!active && !complete ? 'bg-muted text-muted-foreground' : ''}
        `}
      >
        {complete ? '✓' : number}
      </div>
      <span className={`text-sm ${active ? 'font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}

function CompletionMessage() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4">ISMS Scope Approved!</h2>
      <p className="text-muted-foreground mb-8">
        Your ISMS scope has been approved and recorded in the audit log.
        You can now proceed to the next phase: Risk Assessment.
      </p>
      <div className="space-x-4">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go to Dashboard
        </a>
        <a
          href="/risks"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Start Risk Assessment →
        </a>
      </div>
    </div>
  )
}
