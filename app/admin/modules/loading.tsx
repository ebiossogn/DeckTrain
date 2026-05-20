import { ModuleCardSkeleton } from '@/components/ui/skeleton'

export default function ModulesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-light-text/8 dark:bg-dark-surface rounded-xl animate-pulse" />
        <div className="h-10 w-36 bg-light-text/8 dark:bg-dark-surface rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ModuleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
