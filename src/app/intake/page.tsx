'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { IntakeForm } from '@/components/intake/intake-form'
import { DraftScopeReview } from '@/components/intake/draft-scope-review'
import type { DraftISMSScope } from '@/lib/agents/intake-agent'
import {
  getIntakeResponses,
  saveIntakeResponses,
  getScope,
  type SavedScope,
} from '@/lib/data/intake'

type IntakeStep = 'loading' | 'questionnaire' | 'review' | 'scope'

export default function IntakePage() {
  const [step, setStep] = useState<IntakeStep>('loading')
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [draftScope, setDraftScope] = useState<DraftISMSScope | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // On mount, load saved responses and scope from DB
  useEffect(() => {
    async function loadSavedData() {
      try {
        const [savedResponses, savedScope] = await Promise.all([
          getIntakeResponses().catch(() => ({})),
          getScope().catch(() => null),
        ])

        if (Object.keys(savedResponses).length > 0) {
          setResponses(savedResponses)
        }

        if (savedScope) {
          // Reconstruct a DraftISMSScope from the saved scope + approval log metadata
          setDraftScope(scopeToDraft(savedScope))
          setStep('scope')
        } else if (Object.keys(savedResponses).length > 0) {
          setStep('questionnaire')
        } else {
          setStep('questionnaire')
        }
      } catch {
        // If loading fails, just start fresh
        setStep('questionnaire')
      }
    }
    loadSavedData()
  }, [])

  const handleSubmit = async (formResponses: Record<string, unknown>) => {
    setIsSubmitting(true)
    setError(null)
    setResponses(formResponses)

    try {
      // Save responses to DB before generating
      await saveIntakeResponses(formResponses).catch((err) =>
        console.error('Failed to save responses:', err)
      )

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
    try {
      await saveIntakeResponses(formResponses)
    } catch (err) {
      console.error('Failed to save draft:', err)
    }
  }

  const handleApprove = async () => {
    if (!draftScope) return

    setIsApproving(true)
    setError(null)

    try {
      const response = await fetch('/api/intake/approve-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftScope, responses })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve scope')
      }

      // After approval, show the scope in read-only mode
      setStep('scope')
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

  const handleUpdateResponses = () => {
    setStep('questionnaire')
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader subtitle="Context Intake Questionnaire" simple />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    )
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
            complete={step === 'review' || step === 'scope'}
          />
          <div className="w-16 h-0.5 bg-border" />
          <StepIndicator
            number={2}
            label="Review Scope"
            active={step === 'review'}
            complete={step === 'scope'}
          />
          <div className="w-16 h-0.5 bg-border" />
          <StepIndicator
            number={3}
            label="Approved"
            active={step === 'scope'}
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

        {step === 'scope' && draftScope && (
          <DraftScopeReview
            draftScope={draftScope}
            onApprove={handleApprove}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            isApproving={false}
            readOnly
            onUpdateResponses={handleUpdateResponses}
          />
        )}
      </main>
    </div>
  )
}

/**
 * Reconstruct a DraftISMSScope from the saved DB scope + approval log metadata.
 */
function scopeToDraft(saved: SavedScope): DraftISMSScope {
  const { scope } = saved
  const boundaries = (scope.boundaries ?? { physical: [], logical: [], organizational: [] }) as DraftISMSScope['boundaries']

  return {
    scopeStatement: scope.scope_statement,
    boundaries,
    exclusions: scope.exclusions ? scope.exclusions.split('\n').filter(Boolean) : [],
    interestedParties: (scope.interested_parties ?? []) as unknown as DraftISMSScope['interestedParties'],
    regulatoryRequirements: (scope.regulatory_requirements ?? []) as unknown as DraftISMSScope['regulatoryRequirements'],
    annexAAssumptions: saved.annexAAssumptions,
    riskAreas: saved.riskAreas,
    recommendations: saved.recommendations,
  }
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
