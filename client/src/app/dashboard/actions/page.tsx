'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ActionsPage() {
  // Mock data for today's actions
  const todayActions = [
    {
      id: 1,
      title: 'Complete morning reflection',
      priority: 'high',
      dueTime: '08:00 AM',
      completed: false,
    },
    {
      id: 2,
      title: 'Review today\'s goals',
      priority: 'high',
      dueTime: '08:30 AM',
      completed: true,
    },
    {
      id: 3,
      title: 'Practice breathing exercise',
      priority: 'medium',
      dueTime: '12:00 PM',
      completed: false,
    },
    {
      id: 4,
      title: 'Evening journaling session',
      priority: 'medium',
      dueTime: '09:00 PM',
      completed: false,
    },
    {
      id: 5,
      title: 'Reflection on today\'s insights',
      priority: 'low',
      dueTime: '10:00 PM',
      completed: false,
    },
  ]

  const completedCount = todayActions.filter((a) => a.completed).length
  const totalCount = todayActions.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'
      case 'medium':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
      case 'low':
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-rose-700 dark:text-rose-300'
      case 'medium':
        return 'text-amber-700 dark:text-amber-300'
      case 'low':
        return 'text-slate-600 dark:text-slate-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <Protected>
      <LayoutShell title="Actions" subtitle="What you need to focus on today.">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                    Today's Tasks
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-[var(--wa-text)]">
                    {totalCount}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-[var(--wa-muted)]" />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                    Completed
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {completedCount}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-400 dark:text-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                    Progress
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-[var(--wa-accent)]">
                    {completionPercentage}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-[var(--wa-accent)]" />
              </div>
            </div>
          </div>

          {/* Today's Actions */}
          <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                Today's Focus
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--wa-text)]">
                Action Items
              </h2>
            </div>

            <div className="space-y-3">
              {todayActions.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition ${getPriorityColor(action.priority)} ${
                    action.completed ? 'opacity-60' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={action.completed}
                    readOnly
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-emerald-600 accent-emerald-600 dark:border-slate-600"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        action.completed
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-[var(--wa-text)]'
                      }`}
                    >
                      {action.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getPriorityTextColor(
                          action.priority
                        )}`}
                      >
                        {action.priority}
                      </span>
                      <span className="text-xs text-[var(--wa-muted)]">{action.dueTime}</span>
                    </div>
                  </div>
                  {action.priority === 'high' && !action.completed && (
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Charts Placeholder Section */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Chart 1 */}
            <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Analytics
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-[var(--wa-text)]">
                  Weekly Progress
                </h3>
              </div>
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[var(--wa-border)] bg-[var(--wa-panel-soft)]">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-[var(--wa-muted)]" />
                  <p className="mt-2 text-sm text-[var(--wa-muted)]">
                    Chart visualization coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Insights
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-[var(--wa-text)]">
                  Completion Trends
                </h3>
              </div>
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[var(--wa-border)] bg-[var(--wa-panel-soft)]">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-[var(--wa-muted)]" />
                  <p className="mt-2 text-sm text-[var(--wa-muted)]">
                    Chart visualization coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutShell>
    </Protected>
  )
}
