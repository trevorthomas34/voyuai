'use client'

import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types/database'

interface RiskMatrixProps {
  impact: RiskLevel
  likelihood: RiskLevel
  onSelect?: (impact: RiskLevel, likelihood: RiskLevel) => void
  readonly?: boolean
}

const levels: RiskLevel[] = ['low', 'medium', 'high']

// Risk matrix colors (Impact x Likelihood)
const matrixColors: Record<RiskLevel, Record<RiskLevel, string>> = {
  high: {
    low: 'bg-yellow-200 hover:bg-yellow-300',
    medium: 'bg-orange-300 hover:bg-orange-400',
    high: 'bg-red-400 hover:bg-red-500'
  },
  medium: {
    low: 'bg-green-200 hover:bg-green-300',
    medium: 'bg-yellow-200 hover:bg-yellow-300',
    high: 'bg-orange-300 hover:bg-orange-400'
  },
  low: {
    low: 'bg-green-100 hover:bg-green-200',
    medium: 'bg-green-200 hover:bg-green-300',
    high: 'bg-yellow-200 hover:bg-yellow-300'
  }
}

export function RiskMatrix({ impact, likelihood, onSelect, readonly = false }: RiskMatrixProps) {
  const handleCellClick = (i: RiskLevel, l: RiskLevel) => {
    if (!readonly && onSelect) {
      onSelect(i, l)
    }
  }

  return (
    <div className="inline-block">
      <div className="flex">
        {/* Y-axis label */}
        <div className="flex flex-col justify-center items-center w-8 mr-1">
          <span className="text-xs text-muted-foreground rotate-[-90deg] whitespace-nowrap">
            Impact
          </span>
        </div>

        <div>
          {/* Matrix grid - rows from top (high) to bottom (low) */}
          {[...levels].reverse().map(impactLevel => (
            <div key={impactLevel} className="flex">
              {/* Row label */}
              <div className="w-12 flex items-center justify-end pr-2">
                <span className="text-xs capitalize text-muted-foreground">{impactLevel}</span>
              </div>
              {/* Cells */}
              {levels.map(likelihoodLevel => {
                const isSelected = impact === impactLevel && likelihood === likelihoodLevel
                return (
                  <button
                    key={`${impactLevel}-${likelihoodLevel}`}
                    type="button"
                    onClick={() => handleCellClick(impactLevel, likelihoodLevel)}
                    disabled={readonly}
                    className={cn(
                      'w-12 h-12 border border-white/50 transition-all',
                      matrixColors[impactLevel][likelihoodLevel],
                      isSelected && 'ring-2 ring-primary ring-offset-2',
                      readonly ? 'cursor-default' : 'cursor-pointer'
                    )}
                    title={`Impact: ${impactLevel}, Likelihood: ${likelihoodLevel}`}
                  >
                    {isSelected && (
                      <span className="text-lg font-bold text-gray-700">●</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          {/* X-axis labels */}
          <div className="flex mt-1">
            <div className="w-12" />
            {levels.map(l => (
              <div key={l} className="w-12 text-center">
                <span className="text-xs capitalize text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-muted-foreground">Likelihood</span>
          </div>
        </div>
      </div>
    </div>
  )
}
