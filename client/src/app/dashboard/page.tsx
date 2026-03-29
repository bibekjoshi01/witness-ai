'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function DashboardPage() {
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
      <LayoutShell title="Dashboard" subtitle="What you need to focus on today.">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Today's Tasks
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
                    {totalCount}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-slate-400 dark:text-slate-600" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Completed
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {completedCount}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-400 dark:text-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    Progress
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-sky-600 dark:text-sky-400">
                    {completionPercentage}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-sky-400 dark:text-sky-500" />
              </div>
            </div>
          </div>

          {/* Today's Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                Today's Focus
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
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
                          : 'text-slate-900 dark:text-slate-100'
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
                      <span className="text-xs text-slate-500 dark:text-slate-400">{action.dueTime}</span>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Analytics
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Weekly Progress
                </h3>
              </div>
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-slate-800/45">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Chart visualization coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Insights
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Completion Trends
                </h3>
              </div>
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-slate-800/45">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
