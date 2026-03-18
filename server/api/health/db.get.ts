import { createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { errorData, ok } from '../../utils/api-response'

export default defineEventHandler(async () => {
  try {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`

    return ok({
      database: 'postgresql',
      result: rows[0]?.ok === 1
    })
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database connection failed',
      data: errorData('DATABASE_UNAVAILABLE')
    })
  }
})
