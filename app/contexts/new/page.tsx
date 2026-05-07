'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AuthProvider'

type TextQuestion = {
  id: string
  question: string
  type: 'text'
  placeholder: string
}

type CardOption = { emoji: string; label: string }

type CardQuestion = {
  id: string
  question: string
  type: 'cards'
  options: CardOption[]
}

type BudgetOption = { emoji: string; label: string; sub: string }

type BudgetQuestion = {
  id: string
  question: string
  type: 'budget'
  options: BudgetOption[]
}

type Question = TextQuestion | CardQuestion | BudgetQuestion

const QUESTIONS: Question[] = [
  {
    id: 'name',
    question: 'Donne un nom à ce contexte',
    type: 'text',
    placeholder: 'Ex: Quotidien, Été, Travail',
  },
  {
    id: 'style',
    question: 'Quel est ton style ?',
    type: 'cards',
    options: [
      { emoji: '🎩', label: 'Classique' },
      { emoji: '⚡', label: 'Moderne' },
      { emoji: '🔥', label: 'Streetwear' },
      { emoji: '🤍', label: 'Minimaliste' },
    ],
  },
  {
    id: 'colors',
    question: 'Quelles couleurs portes-tu ?',
    type: 'cards',
    options: [
      { emoji: '🤎', label: 'Neutres' },
      { emoji: '🌈', label: 'Colorées' },
      { emoji: '🖤', label: 'Sombres' },
      { emoji: '🎨', label: 'Mixtes' },
    ],
  },
  {
    id: 'personality',
    question: 'Tu préfères ?',
    type: 'cards',
    options: [
      { emoji: '🌿', label: 'Discret' },
      { emoji: '💥', label: 'Affirmé' },
    ],
  },
  {
    id: 'usage',
    question: 'Usage principal ?',
    type: 'cards',
    options: [
      { emoji: '👓', label: 'Quotidien' },
      { emoji: '💻', label: 'Écrans' },
      { emoji: '🏃', label: 'Sport' },
      { emoji: '☀️', label: 'Fashion' },
    ],
  },
  {
    id: 'wearing_frequency',
    question: 'Tu portes tes lunettes ?',
    type: 'cards',
    options: [
      { emoji: '🌅', label: 'Toute la journée' },
      { emoji: '🎯', label: 'Occasionnellement' },
      { emoji: '📖', label: 'Pour lire' },
    ],
  },
  {
    id: 'correction',
    question: 'Type de correction ?',
    type: 'cards',
    options: [
      { emoji: '👁️', label: 'Vue' },
      { emoji: '😎', label: 'Soleil' },
      { emoji: '✨', label: 'Les deux' },
      { emoji: '🚫', label: 'Sans correction' },
    ],
  },
  {
    id: 'material',
    question: 'Matière préférée ?',
    type: 'cards',
    options: [
      { emoji: '🎨', label: 'Acétate' },
      { emoji: '⚙️', label: 'Métal' },
      { emoji: '🔀', label: 'Mixte' },
      { emoji: '💫', label: 'Peu importe' },
    ],
  },
  {
    id: 'frame_weight',
    question: 'Tu préfères des montures ?',
    type: 'cards',
    options: [
      { emoji: '🪶', label: 'Légères' },
      { emoji: '🛡️', label: 'Robustes' },
      { emoji: '⚖️', label: 'Peu importe' },
    ],
  },
  {
    id: 'existing_glasses',
    question: 'Tu as déjà des lunettes ?',
    type: 'cards',
    options: [
      { emoji: '❤️', label: "J'aime mon style actuel" },
      { emoji: '🔄', label: 'Je veux changer' },
      { emoji: '✨', label: 'Première paire' },
    ],
  },
  {
    id: 'budget',
    question: 'Ton budget ?',
    type: 'budget',
    options: [
      { emoji: '💚', label: 'Moins de 100€', sub: '240+ montures' },
      { emoji: '💛', label: '100–300€', sub: 'Le plus populaire' },
      { emoji: '💜', label: '300€+', sub: 'Premium' },
    ],
  },
]

const TOTAL = QUESTIONS.length

export default function NewContextPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const question = QUESTIONS[step]
  const currentAnswer = answers[question.id] ?? ''
  const canContinue =
    question.type === 'text' ? currentAnswer.trim().length > 0 : !!currentAnswer

  const advance = (nextStep: number) => {
    setVisible(false)
    setTimeout(() => {
      setStep(nextStep)
      setVisible(true)
    }, 180)
  }

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  const handleContinue = async () => {
    if (step < TOTAL - 1) {
      advance(step + 1)
    } else {
      await handleSubmit()
    }
  }

  const handleBack = () => {
    if (step === 0) router.back()
    else advance(step - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          user_id: session?.user?.id,
          is_active: true,
        }),
      })
    } catch {}
    router.push('/results')
  }

  const progress = ((step + 1) / TOTAL) * 100

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-border bg-white">
        <button
          onClick={handleBack}
          className="text-sm text-muted hover:text-subtle transition-colors"
        >
          ← Retour
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 pt-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted font-medium">
            {step + 1} / {TOTAL}
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question area */}
      <div
        className={`flex-1 flex flex-col px-6 py-10 max-w-lg mx-auto w-full transition-all duration-200 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <h1 className="text-2xl font-bold text-primary mb-8">{question.question}</h1>

        {/* Text input */}
        {question.type === 'text' && (
          <input
            type="text"
            placeholder={question.placeholder}
            value={currentAnswer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) handleContinue() }}
            autoFocus
            className="w-full border border-border rounded-xl px-4 py-3 text-base text-ink placeholder:text-muted focus:outline-none focus:border-secondary focus:shadow-focus transition-colors"
          />
        )}

        {/* Card options — emoji + label */}
        {question.type === 'cards' && (
          <div className="flex flex-wrap gap-3">
            {question.options.map((opt) => {
              const selected = currentAnswer === opt.label
              return (
                <button
                  key={opt.label}
                  onClick={() => setAnswer(opt.label)}
                  className={`w-[calc(50%-6px)] sm:w-[140px] h-[120px] sm:h-[140px] flex flex-col items-center justify-center gap-2 rounded-card border transition-all ${
                    selected
                      ? 'border-2 border-[#1E3A8A] bg-[#EEF2FF] scale-105 shadow-card'
                      : 'border-border bg-white hover:border-[#1E3A8A]/40 hover:shadow-card'
                  }`}
                >
                  <span className="text-5xl leading-none">{opt.emoji}</span>
                  <span className={`text-xs font-bold text-center px-1 leading-tight ${selected ? 'text-[#1E3A8A]' : 'text-primary'}`}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Budget options — emoji + label + sub */}
        {question.type === 'budget' && (
          <div className="flex flex-wrap gap-3">
            {question.options.map((opt) => {
              const selected = currentAnswer === opt.label
              return (
                <button
                  key={opt.label}
                  onClick={() => setAnswer(opt.label)}
                  className={`w-[calc(50%-6px)] sm:w-[140px] h-[120px] sm:h-[140px] flex flex-col items-center justify-center gap-1.5 rounded-card border transition-all ${
                    selected
                      ? 'border-2 border-[#1E3A8A] bg-[#EEF2FF] scale-105 shadow-card'
                      : 'border-border bg-white hover:border-[#1E3A8A]/40 hover:shadow-card'
                  }`}
                >
                  <span className="text-5xl leading-none">{opt.emoji}</span>
                  <span className={`text-xs font-bold text-center px-1 leading-tight ${selected ? 'text-[#1E3A8A]' : 'text-primary'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-muted">{opt.sub}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Continue button — appears when an option is selected */}
        {canContinue && (
          <div className="mt-8">
            <button
              onClick={handleContinue}
              disabled={submitting}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting
                ? 'Enregistrement…'
                : step === TOTAL - 1
                  ? 'Terminer'
                  : 'Continuer'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
