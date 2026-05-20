import { DashboardSkeleton } from '@/components/ui/skeleton'

export default function OverviewLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-light-text/8 dark:bg-dark-surface rounded-xl" />
      <DashboardSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-light-text/8 dark:bg-dark-surface rounded-xl" />
        <div className="h-64 bg-light-text/8 dark:bg-dark-surface rounded-xl" />
      </div>
    </div>
  )
}
