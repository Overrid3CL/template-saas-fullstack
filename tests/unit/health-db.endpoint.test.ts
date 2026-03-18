import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EventHandler } from 'h3'

const queryRawMock = vi.fn();
const defineEventHandlerMock = <T extends EventHandler>(handler: T) => handler
Object.assign(globalThis as object, { defineEventHandler: defineEventHandlerMock })

vi.mock('../../server/utils/prisma', () => ({
  prisma: {
    $queryRaw: queryRawMock
  }
}))

describe('/api/health/db.get', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an ok envelope when database is reachable', async () => {
    queryRawMock.mockResolvedValue([{ ok: 1 }])
    const handler = (await import('../../server/api/health/db.get')).default
    const event = {} as Parameters<typeof handler>[0]

    await expect(handler(event)).resolves.toEqual({
      ok: true,
      data: {
        database: 'postgresql',
        result: true
      }
    })
  })

  it('returns controlled error payload when database is unreachable', async () => {
    queryRawMock.mockRejectedValue(new Error('db error'))
    const handler = (await import('../../server/api/health/db.get')).default
    const event = {} as Parameters<typeof handler>[0]

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 503,
      data: {
        ok: false,
        error: 'DATABASE_UNAVAILABLE'
      }
    })
  })
})
