'use client'

import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useCreateJournalMutation, useGenerateQuestionsQuery } from '@/features/journal/journal.api'
import { IGeneratedQuestion, IQuestionField, IQuestionSchema } from '@/features/journal/journal.types'
import { ChevronLeft, ChevronRight, RefreshCcw, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ReflectPage() {
  const { data: generatedQuestions, isLoading, isError } = useGenerateQuestionsQuery()
  const [createJournal, { isLoading: isSubmitting }] = useCreateJournalMutation()

  const [freeText, setFreeText] = useState('')
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, unknown>>({})
  const [currentStep, setCurrentStep] = useState(0)

  const questions = generatedQuestions ?? []
  const totalSteps = questions.length + 1
  const isFinalStep = currentStep === questions.length
  const activeQuestion = !isFinalStep ? questions[currentStep] : null
  const progress = Math.max(1, currentStep + 1)

  useEffect(() => {
    if (currentStep > questions.length) {
      setCurrentStep(0)
    }
  }, [currentStep, questions.length])

  const handleFieldChange = (questionIndex: number, fieldName: string, value: unknown) => {
    const key = String(questionIndex)
    setAnswersByQuestion((prev) => ({
      ...prev,
      [key]: {
        ...((prev[key] as Record<string, unknown> | undefined) ?? {}),
        [fieldName]: value,
      },
    }))
  }

  const handlePrimitiveAnswerChange = (questionIndex: number, value: unknown) => {
    const key = String(questionIndex)
    setAnswersByQuestion((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleMultiSelect = (questionIndex: number, fieldName: string, option: string) => {
    const key = String(questionIndex)
    const currentAnswer = (answersByQuestion[key] as Record<string, unknown> | undefined) ?? {}
    const currentValues = (currentAnswer[fieldName] as string[] | undefined) ?? []
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
        questions: questions.map((question, index) => ({
          schema: question.schema,
          question_text: question.question_text,
          answer_data:
            question.schema?.type === 'multi_input'
              ? ((answersByQuestion[String(index)] as Record<string, unknown> | undefined) ?? {})
              : { answer: answersByQuestion[String(index)] ?? null },
        })),
        insights: [],
        micro_actions: [],
      }).unwrap()

      toast.success('Reflection saved successfully')
      setFreeText('')
      setAnswersByQuestion({})
      setCurrentStep(0)
    } catch {
      toast.error('Unable to save reflection')
    }
  }

  const renderField = (field: IQuestionField, question: IGeneratedQuestion, questionIndex: number) => {
    const questionKey = String(questionIndex)
    const questionAnswer = (answersByQuestion[questionKey] as Record<string, unknown> | undefined) ?? {}
    const value = questionAnswer[field.name]
    const options = field.options ?? []

    if (field.type === 'scale') {
      const min = typeof field.scale_min === 'number' ? field.scale_min : 1
      const max = typeof field.scale_max === 'number' ? field.scale_max : 10
      const numericValue = typeof value === 'number' ? value : min
      const range = Math.max(1, max - min)
      const progressPercent = ((numericValue - min) / range) * 100

      return (
        <div className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Adjust value</p>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">{numericValue}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleFieldChange(questionIndex, field.name, Math.max(min, numericValue - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
              aria-label="Decrease value"
            >
              -
            </button>

            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-slate-900" style={{ width: `${progressPercent}%` }} />
              <input
                id={`${question.question_text}-${field.name}`}
                type="range"
                min={min}
                max={max}
                value={numericValue}
                onChange={(event) => handleFieldChange(questionIndex, field.name, Number(event.target.value))}
                className="relative h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={() => handleFieldChange(questionIndex, field.name, Math.min(max, numericValue + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
              aria-label="Increase value"
            >
              +
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      )
    }

    if (field.type === 'text') {
      return (
        <textarea
          id={`${question.question_text}-${field.name}`}
          value={String(value ?? '')}
          onChange={(event) => handleFieldChange(questionIndex, field.name, event.target.value)}
          rows={4}
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder={field.label}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <div className="mt-3 flex flex-wrap gap-3">
          {options.map((option) => {
            const isSelected = value === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleFieldChange(questionIndex, field.name, option)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700'
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
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => {
          const selectedValues = (value as string[] | undefined) ?? []
          const isSelected = selectedValues.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleMultiSelect(questionIndex, field.name, option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
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

  const renderPrimitiveQuestion = (schema: IQuestionSchema, questionIndex: number, questionText: string) => {
    const questionKey = String(questionIndex)
    const value = answersByQuestion[questionKey]
    const primitiveOptions = (schema.enum as string[] | undefined) ?? (schema.options as string[] | undefined) ?? []

    if (schema.type === 'number') {
      const min = typeof schema.minimum === 'number' ? schema.minimum : undefined
      const max = typeof schema.maximum === 'number' ? schema.maximum : undefined

      return (
        <input
          id={`q-${questionIndex}`}
          type="number"
          min={min}
          max={max}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(event) => {
            const parsedValue = event.target.value === '' ? null : Number(event.target.value)
            handlePrimitiveAnswerChange(questionIndex, parsedValue)
          }}
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter a number"
        />
      )
    }

    if (schema.type === 'boolean') {
      return (
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handlePrimitiveAnswerChange(questionIndex, true)}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              value === true
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handlePrimitiveAnswerChange(questionIndex, false)}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              value === false
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            No
          </button>
        </div>
      )
    }

    if (schema.type === 'string' && primitiveOptions.length > 0) {
      return (
        <div className="mt-3 flex flex-wrap gap-3">
          {primitiveOptions.map((option) => {
            const isSelected = value === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => handlePrimitiveAnswerChange(questionIndex, option)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700'
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
      <textarea
        id={`q-${questionIndex}`}
        value={String(value ?? '')}
        onChange={(event) => handlePrimitiveAnswerChange(questionIndex, event.target.value)}
        rows={4}
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        placeholder={questionText}
      />
    )
  }

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <Protected>
      <LayoutShell title="Reflect">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:p-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">Daily reflection</h2>
              <p className="text-base font-medium text-slate-600 dark:text-slate-400">
                Step {progress} of {totalSteps}
              </p>
            </div>

            <div className="mt-5 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-300 dark:bg-sky-500"
                style={{ width: `${(progress / totalSteps) * 100}%` }}
              />
            </div>

            {isLoading ? <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">Generating questions...</p> : null}

            {isError ? (
              <p className="mt-6 text-sm text-rose-600">Could not generate questions right now.</p>
            ) : null}

            {!isLoading && !isError && questions.length === 0 ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">No questions returned yet.</p>
            ) : null}

            {!isLoading && !isError && questions.length > 0 ? (
              <article className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800 lg:p-7">
                {!isFinalStep && activeQuestion ? (
                  <>
                    <h3 className="text-2xl font-semibold leading-snug text-slate-900 dark:text-slate-100">{activeQuestion.question_text}</h3>
                    {activeQuestion.schema?.type === 'multi_input' ? (
                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        {(activeQuestion.schema.fields ?? []).map((field) => (
                          <div key={field.name} className={field.type === 'text' ? 'md:col-span-2' : ''}>
                            <label
                              htmlFor={`${activeQuestion.question_text}-${field.name}`}
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              {field.label}
                            </label>
                            {renderField(field, activeQuestion, currentStep)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      renderPrimitiveQuestion(activeQuestion.schema, currentStep, activeQuestion.question_text)
                    )}
                  </>
                ) : (
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Final note</h3>
                    <p className="mt-2 text-base text-slate-600 dark:text-slate-400">Add anything else before saving your reflection.</p>
                    <label htmlFor="free-text" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Free reflection
                    </label>
                    <textarea
                      id="free-text"
                      value={freeText}
                      onChange={(event) => setFreeText(event.target.value)}
                      rows={6}
                      className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Write anything about your day, emotions, and what stood out to you."
                    />
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>

                  {!isFinalStep ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500"
                    >
                      {isSubmitting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isSubmitting ? 'Saving...' : 'Submit reflection'}
                    </button>
                  )}
                </div>
              </article>
            ) : null}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(0)
                  setAnswersByQuestion({})
                  setFreeText('')
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Restart
              </button>
            </div>
          </section>

        </div>
      </LayoutShell>
    </Protected>
  )
}
