import { prisma } from '@/lib/prisma'

interface PlanLimits {
  maxModules: number
  maxSlides: number
  maxParticipants: number
  maxSurveys: number
  maxAdmins: number
}

const FREE_LIMITS: PlanLimits = {
  maxModules: 3,
  maxSlides: 30,
  maxParticipants: 10,
  maxSurveys: 2,
  maxAdmins: 1,
}

export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  })

  if (!sub || sub.status !== 'active') return FREE_LIMITS

  return {
    maxModules: sub.plan.maxModules,
    maxSlides: sub.plan.maxSlides,
    maxParticipants: sub.plan.maxParticipants,
    maxSurveys: sub.plan.maxSurveys,
    maxAdmins: sub.plan.maxAdmins,
  }
}

// -1 signifie illimité
export function isWithinLimit(current: number, max: number): boolean {
  if (max === -1) return true
  return current < max
}

export async function checkModuleLimit(userId: string, currentModuleCount: number): Promise<{ allowed: boolean; current: number; max: number }> {
  const limits = await getUserPlanLimits(userId)
  return { allowed: isWithinLimit(currentModuleCount, limits.maxModules), current: currentModuleCount, max: limits.maxModules }
}

export async function checkSurveyLimit(userId: string, currentSurveyCount: number): Promise<{ allowed: boolean; current: number; max: number }> {
  const limits = await getUserPlanLimits(userId)
  return { allowed: isWithinLimit(currentSurveyCount, limits.maxSurveys), current: currentSurveyCount, max: limits.maxSurveys }
}
