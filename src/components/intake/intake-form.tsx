'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  intakeQuestions,
  questionCategories,
  calculateProgress,
  type IntakeQuestion,
  type QuestionCategory
} from '@/lib/intake-questions'

interface IntakeFormProps {
  onSubmit: (responses: Record<string, unknown>) => void
  onSaveDraft: (responses: Record<string, unknown>) => void
  initialResponses?: Record<string, unknown>
  isSubmitting?: boolean
}

export function IntakeForm({
  onSubmit,
  onSaveDraft,
  initialResponses = {},
  isSubmitting = false
}: IntakeFormProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>(initialResponses)
  const [currentCategory, setCurrentCategory] = useState<QuestionCategory>('organization')

  const progress = calculateProgress(responses)

  const updateResponse = (questionId: string, value: unknown) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleMultiSelectToggle = (questionId: string, value: string) => {
    const current = (responses[questionId] as string[]) || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    updateResponse(questionId, updated)
  }

  const currentQuestions = intakeQuestions.filter(q => q.category === currentCategory)
  const currentCategoryIndex = questionCategories.findIndex(c => c.id === currentCategory)

  const goToNextCategory = () => {
    const nextIndex = currentCategoryIndex + 1
    if (nextIndex < questionCategories.length) {
      setCurrentCategory(questionCategories[nextIndex].id)
    }
  }

  const goToPrevCategory = () => {
    const prevIndex = currentCategoryIndex - 1
    if (prevIndex >= 0) {
      setCurrentCategory(questionCategories[prevIndex].id)
    }
  }

  const isLastCategory = currentCategoryIndex === questionCategories.length - 1
  const isFirstCategory = currentCategoryIndex === 0

  const renderQuestion = (question: IntakeQuestion) => {
    const value = responses[question.id]

    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            value={(value as string) || ''}
            onChange={e => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={question.id}
            value={(value as string) || ''}
            onChange={e => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
          />
        )

      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={(value as number) || ''}
            onChange={e => updateResponse(question.id, parseInt(e.target.value, 10))}
            placeholder={question.placeholder}
          />
        )

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={v => updateResponse(question.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multi-select':
        const selectedValues = (value as string[]) || []
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleMultiSelectToggle(question.id, option.value)}
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Progress: {progress}% complete
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSaveDraft(responses)}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Category navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {questionCategories.map(category => {
          const categoryQuestions = intakeQuestions.filter(q => q.category === category.id)
          const answeredCount = categoryQuestions.filter(q => {
            const r = responses[q.id]
            if (Array.isArray(r)) return r.length > 0
            return r !== undefined && r !== '' && r !== null
          }).length
          const isComplete = answeredCount === categoryQuestions.length

          return (
            <Button
              key={category.id}
              variant={currentCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentCategory(category.id)}
              className="relative"
            >
              {category.label}
              {isComplete && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  ✓
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Questions for current category */}
      <Card>
        <CardHeader>
          <CardTitle>
            {questionCategories.find(c => c.id === currentCategory)?.label}
          </CardTitle>
          <CardDescription>
            {currentCategory === 'organization' && 'Tell us about your organization structure and operations'}
            {currentCategory === 'data' && 'Help us understand the types of data you handle'}
            {currentCategory === 'technology' && 'Describe your technology infrastructure'}
            {currentCategory === 'compliance' && 'What are your compliance goals and existing frameworks?'}
            {currentCategory === 'customers' && 'Tell us about your customer base and their requirements'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestions.map(question => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id} className="text-base font-medium">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {question.description && (
                <p className="text-sm text-muted-foreground">{question.description}</p>
              )}
              {renderQuestion(question)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={goToPrevCategory}
          disabled={isFirstCategory}
        >
          ← Previous
        </Button>

        {isLastCategory ? (
          <Button
            onClick={() => onSubmit(responses)}
            disabled={isSubmitting || progress < 100}
          >
            {isSubmitting ? 'Generating Scope...' : 'Generate Draft Scope'}
          </Button>
        ) : (
          <Button onClick={goToNextCategory}>
            Next →
          </Button>
        )}
      </div>

      {isLastCategory && progress < 100 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Please complete all required questions before generating your draft scope.
        </p>
      )}
    </div>
  )
}
