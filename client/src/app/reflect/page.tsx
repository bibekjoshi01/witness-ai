'use client'

import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useCreateJournalMutation, useGenerateQuestionsQuery, useListJournalsQuery } from '@/features/journal/journal.api'
import { IGeneratedQuestion, IQuestionField } from '@/features/journal/journal.types'
import { Check, RefreshCcw, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ReflectPage() {
  const { data: generatedQuestions, isLoading, isError, refetch: refetchQuestions } = useGenerateQuestionsQuery()
  const {
    data: latestJournal,
    isFetching: isFetchingLatest,
    refetch: refetchLatest,
  } = useListJournalsQuery({ limit: 1, offset: 0 })
  const [createJournal, { isLoading: isSubmitting }] = useCreateJournalMutation()

  const [freeText, setFreeText] = useState('')
  const [insightsInput, setInsightsInput] = useState('')
  const [actionsInput, setActionsInput] = useState('')
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, Record<string, unknown>>>({})

  const parseList = (value: string) =>
    value
      .split('\n')
      .flatMap((line) => line.split(','))
      .map((item) => item.trim())
      .filter(Boolean)

  const handleFieldChange = (questionIndex: number, fieldName: string, value: unknown) => {
    const key = String(questionIndex)
    setAnswersByQuestion((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? {}),
        [fieldName]: value,
      },
    }))
  }

  const toggleMultiSelect = (questionIndex: number, fieldName: string, option: string) => {
    const key = String(questionIndex)
    const currentValues = (answersByQuestion[key]?.[fieldName] as string[] | undefined) ?? []
    const nextValues = currentValues.includes(option)
      ? currentValues.filter((item) => item !== option)
      : [...currentValues, option]
    handleFieldChange(questionIndex, fieldName, nextValues)
  }

  const handleSubmit = async () => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      toast.error('No reflection questions available right now')
      return
    }

    try {
      await createJournal({
        date: new Date().toISOString().slice(0, 10),
        free_text: freeText.trim(),
        questions: generatedQuestions.map((question, index) => ({
          question_text: question.question_text,
          schema: question.schema,
          answer_data: answersByQuestion[String(index)] ?? {},
        })),
        insights: parseList(insightsInput),
        micro_actions: parseList(actionsInput),
      }).unwrap()

      toast.success('Reflection saved successfully')
      setFreeText('')
      setInsightsInput('')
      setActionsInput('')
      setAnswersByQuestion({})
      refetchLatest()
    } catch {
      toast.error('Unable to save reflection')
    }
  }

  const renderField = (field: IQuestionField, question: IGeneratedQuestion, questionIndex: number) => {
    const questionKey = String(questionIndex)
    const value = answersByQuestion[questionKey]?.[field.name]

    if (field.type === 'text') {
      return (
        <textarea
          id={`${question.question_text}-${field.name}`}
          value={String(value ?? '')}
          onChange={(event) => handleFieldChange(questionIndex, field.name, event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          placeholder={field.label}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          id={`${question.question_text}-${field.name}`}
          value={String(value ?? '')}
          onChange={(event) => handleFieldChange(questionIndex, field.name, event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        >
          <option value="">Select an option</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {(field.options ?? []).map((option) => {
          const selectedValues = (value as string[] | undefined) ?? []
          const isSelected = selectedValues.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleMultiSelect(questionIndex, field.name, option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isSelected
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <Protected>
      <LayoutShell title="Reflect" subtitle="Answer guided prompts and save your reflection.">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900">Daily reflection</h2>
                <p className="mt-1 text-sm text-slate-600">
                  We generated personalized questions for you. Fill them out and save to your journal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetchQuestions()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Regenerate questions
              </button>
            </div>

            <div className="mt-6">
              <label htmlFor="free-text" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Free reflection
              </label>
              <textarea
                id="free-text"
                value={freeText}
                onChange={(event) => setFreeText(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="Write anything about your day, emotions, and what stood out to you."
              />
            </div>

            {isLoading ? <p className="mt-6 text-sm text-slate-600">Generating questions...</p> : null}

            {isError ? (
              <p className="mt-6 text-sm text-rose-600">Could not generate questions right now. Try regenerate.</p>
            ) : null}

            {generatedQuestions?.length ? (
              <div className="mt-6 space-y-4">
                {generatedQuestions.map((question, questionIndex) => (
                  <article key={`${question.question_text}-${questionIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-base font-semibold text-slate-900">{question.question_text}</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {(question.schema.fields ?? []).map((field) => (
                        <div key={field.name} className={field.type === 'text' ? 'md:col-span-2' : ''}>
                          <label
                            htmlFor={`${question.question_text}-${field.name}`}
                            className="text-xs font-semibold uppercase tracking-wide text-slate-700"
                          >
                            {field.label}
                          </label>
                          {renderField(field, question, questionIndex)}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="insights" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Insights (comma or new line separated)
                </label>
                <textarea
                  id="insights"
                  value={insightsInput}
                  onChange={(event) => setInsightsInput(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="I get anxious before status calls"
                />
              </div>
              <div>
                <label htmlFor="actions" className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Micro actions (comma or new line separated)
                </label>
                <textarea
                  id="actions"
                  value={actionsInput}
                  onChange={(event) => setActionsInput(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="Take 3 deep breaths before meetings"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isSubmitting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : 'Save reflection'}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-slate-900">Latest journal entry</h3>
              <button
                type="button"
                onClick={() => refetchLatest()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            {isFetchingLatest ? <p className="mt-4 text-sm text-slate-600">Loading latest entry...</p> : null}

            {!isFetchingLatest && !latestJournal?.items?.length ? (
              <p className="mt-4 text-sm text-slate-600">No journal entry found yet.</p>
            ) : null}

            {latestJournal?.items?.[0] ? (
              <article className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {latestJournal.items[0].date}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(latestJournal.items[0].created_at).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{latestJournal.items[0].free_text}</p>

                {latestJournal.items[0].insights?.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Insights</p>
                    <ul className="mt-1 space-y-1 text-sm text-slate-700">
                      {latestJournal.items[0].insights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {latestJournal.items[0].micro_actions?.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Micro actions</p>
                    <ul className="mt-1 space-y-1 text-sm text-slate-700">
                      {latestJournal.items[0].micro_actions.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            ) : null}
          </section>
        </div>
      </LayoutShell>
    </Protected>
  )
}
