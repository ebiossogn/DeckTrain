import { ExerciseListSkeleton } from '@/components/ui/skeleton'

export default function ExercisesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-light-text/8 dark:bg-dark-surface rounded-xl animate-pulse" />
      <ExerciseListSkeleton />
    </div>
  )
}
