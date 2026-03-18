import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemberService } from '../../server/services/member.service'
import type { DomainError } from '../../server/utils/domain-error'

const repository = {
  getByUserId: vi.fn(),
  getById: vi.fn(),
  countOwners: vi.fn(),
  updateRole: vi.fn(),
  list: vi.fn(),
  remove: vi.fn(),
  invalidateSessionsForOrganization: vi.fn(),
  existsMemberByEmail: vi.fn(),
  existsPendingInvitationByEmail: vi.fn(),
  createInvitation: vi.fn()
}

vi.mock('../../server/repositories/member.repository', () => ({
  MemberRepository: class {
    getByUserId = repository.getByUserId
    getById = repository.getById
    countOwners = repository.countOwners
    updateRole = repository.updateRole
    list = repository.list
    remove = repository.remove
    invalidateSessionsForOrganization = repository.invalidateSessionsForOrganization
    existsMemberByEmail = repository.existsMemberByEmail
    existsPendingInvitationByEmail = repository.existsPendingInvitationByEmail
    createInvitation = repository.createInvitation
  }
}))

describe('MemberService RBAC and tenant safety', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires owner role to invite members', async () => {
    repository.getByUserId.mockResolvedValue({
      id: 'member-actor',
      userId: 'user-actor',
      organizationId: 'org-1',
      role: 'member',
      createdAt: new Date()
    })

    const service = new MemberService('org-1')

    await expect(service.invite({
      email: 'new.user@example.com',
      role: 'member',
      inviterId: 'user-actor'
    })).rejects.toMatchObject<Partial<DomainError>>({
      code: 'AUTHZ_OWNER_REQUIRED'
    })
  })

  it('prevents demoting the last owner', async () => {
    repository.getByUserId.mockResolvedValue({
      id: 'member-actor',
      userId: 'user-owner',
      organizationId: 'org-1',
      role: 'owner',
      createdAt: new Date()
    })
    repository.getById.mockResolvedValue({
      id: 'member-target',
      userId: 'user-target',
      organizationId: 'org-1',
      role: 'owner',
      createdAt: new Date()
    })
    repository.countOwners.mockResolvedValue(1)

    const service = new MemberService('org-1')

    await expect(service.updateRole('member-target', 'member', 'user-owner')).rejects.toMatchObject<Partial<DomainError>>({
      code: 'VALIDATION_LAST_OWNER'
    })
  })

  it('invalidates removed user sessions for current organization', async () => {
    repository.getByUserId.mockResolvedValue({
      id: 'member-owner',
      userId: 'owner-user',
      organizationId: 'org-1',
      role: 'owner',
      createdAt: new Date()
    })
    repository.list.mockResolvedValue([
      {
        id: 'member-owner',
        userId: 'owner-user',
        organizationId: 'org-1',
        role: 'owner',
        createdAt: new Date(),
        user: {
          id: 'owner-user',
          name: 'Owner',
          email: 'owner@example.com',
          image: null
        }
      },
      {
        id: 'member-target',
        userId: 'target-user',
        organizationId: 'org-1',
        role: 'member',
        createdAt: new Date(),
        user: {
          id: 'target-user',
          name: 'Target',
          email: 'target@example.com',
          image: null
        }
      }
    ])
    repository.remove.mockResolvedValue({
      id: 'member-target',
      userId: 'target-user',
      organizationId: 'org-1',
      role: 'member',
      createdAt: new Date()
    })
    repository.invalidateSessionsForOrganization.mockResolvedValue(undefined)

    const service = new MemberService('org-1')

    await service.remove('member-target', 'owner-user')

    expect(repository.invalidateSessionsForOrganization).toHaveBeenCalledWith('target-user')
  })
})
