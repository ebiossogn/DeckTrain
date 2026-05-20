import { NextResponse } from 'next/server'
import { type ZodTypeAny, type z } from 'zod'

export function validateBody<S extends ZodTypeAny>(
  schema: S,
  body: unknown
): { data: z.infer<S> } | { error: NextResponse } {
  const result = schema.safeParse(body)

  if (!result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = (result.error as any).issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return {
      error: NextResponse.json(
        { error: 'Données invalides', details: errors },
        { status: 400 }
      ),
    }
  }

  return { data: result.data }
}
