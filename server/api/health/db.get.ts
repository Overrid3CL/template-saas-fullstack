import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`

    return {
      ok: true,
      database: 'postgresql',
      result: rows[0]?.ok === 1
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed',
      data: {
        ok: false,
        database: 'postgresql',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})
