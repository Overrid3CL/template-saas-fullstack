import { beforeEach, describe, expect, it, vi } from 'vitest'

const getSessionMock = vi.fn()
const findMembershipMock = vi.fn()

vi.mock('~~/lib/auth', () => ({
  auth: {
    api: {
      getSession: getSessionMock
    }
  }
}))

vi.mock('../../server/utils/prisma', () => ({
  prisma: {
    member: {
      findFirst: findMembershipMock
    }
  }
}))

describe('requireTenantContext', () => {
  const event = { headers: new Headers() }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when there is no active session', async () => {
    getSessionMock.mockResolvedValue(null)
    const { requireTenantContext } = await import('../../server/utils/tenant-context')

    await expect(requireTenantContext(event as Parameters<typeof requireTenantContext>[0])).rejects.toMatchObject({
      statusCode: 401,
      data: {
        error: 'AUTH_REQUIRED'
      }
    })
  })

  it('returns 403 when there is no active organization', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'session-1', activeOrganizationId: null }
    })

    const { requireTenantContext } = await import('../../server/utils/tenant-context')

    await expect(requireTenantContext(event as Parameters<typeof requireTenantContext>[0])).rejects.toMatchObject({
      statusCode: 403,
      data: {
        error: 'ACTIVE_ORGANIZATION_REQUIRED'
      }
    })
  })

  it('returns 403 when user is not a member of active organization', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'session-1', activeOrganizationId: 'org-1' }
    })
    findMembershipMock.mockResolvedValue(null)

    const { requireTenantContext } = await import('../../server/utils/tenant-context')

    await expect(requireTenantContext(event as Parameters<typeof requireTenantContext>[0])).rejects.toMatchObject({
      statusCode: 403,
      data: {
        error: 'ACTIVE_ORGANIZATION_MEMBERSHIP_REQUIRED'
      }
    })
  })

  it('returns tenant context when session and membership are valid', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { id: 'session-1', activeOrganizationId: 'org-1' }
    })
    findMembershipMock.mockResolvedValue({ id: 'member-1' })

    const { requireTenantContext } = await import('../../server/utils/tenant-context')

    await expect(requireTenantContext(event as Parameters<typeof requireTenantContext>[0])).resolves.toEqual({
      userId: 'user-1',
      organizationId: 'org-1',
      sessionId: 'session-1'
    })
  })
})
