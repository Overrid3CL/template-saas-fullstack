import { addDays } from 'date-fns'
import { DomainError } from '../utils/domain-error'
import { MemberRepository } from '../repositories/member.repository'
import { logger } from '../utils/logger'

type MemberRole = 'member' | 'owner'

function usernameFromEmail(email: string) {
  return email.split('@')[0] || email
}

export class MemberService {
  private readonly repository: MemberRepository

  constructor(private readonly organizationId: string) {
    this.repository = new MemberRepository(organizationId)
  }

  async list() {
    const members = await this.repository.list()
    return members.map(member => ({
      id: member.id,
      userId: member.userId,
      name: member.user.name || member.user.email,
      email: member.user.email,
      username: usernameFromEmail(member.user.email),
      role: member.role as MemberRole,
      avatar: {
        src: member.user.image || undefined,
        alt: member.user.name || member.user.email
      }
    }))
  }

  private async ensureOwnerActor(actorUserId: string) {
    const actorMember = await this.repository.getByUserId(actorUserId)

    if (!actorMember) {
      throw new DomainError('MEMBER_NOT_FOUND')
    }

    if (actorMember.role !== 'owner') {
      throw new DomainError('AUTHZ_OWNER_REQUIRED')
    }

    return actorMember
  }

  async updateRole(memberId: string, role: MemberRole, actorUserId: string) {
    await this.ensureOwnerActor(actorUserId)

    const target = await this.repository.getById(memberId)
    if (!target) {
      throw new DomainError('MEMBER_NOT_FOUND')
    }

    if (target.role === 'owner' && role !== 'owner') {
      const owners = await this.repository.countOwners()
      if (owners <= 1) {
        throw new DomainError('VALIDATION_LAST_OWNER')
      }
    }

    const updated = await this.repository.updateRole(memberId, role)

    if (updated.userId !== actorUserId) {
      await this.repository.invalidateSessionsForOrganization(updated.userId)
    }

    logger.info('member.role.updated', {
      organizationId: this.organizationId,
      actorUserId,
      targetUserId: updated.userId,
      role
    })

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.user.name || updated.user.email,
      email: updated.user.email,
      username: usernameFromEmail(updated.user.email),
      role: updated.role as MemberRole,
      avatar: {
        src: updated.user.image || undefined,
        alt: updated.user.name || updated.user.email
      }
    }
  }

  async remove(memberId: string, actorUserId: string) {
    await this.ensureOwnerActor(actorUserId)

    const members = await this.repository.list()
    const owners = members.filter(member => member.role === 'owner')
    const target = members.find(member => member.id === memberId)

    if (!target) {
      throw new DomainError('MEMBER_NOT_FOUND')
    }

    if (target.userId === actorUserId) {
      throw new DomainError('VALIDATION_CANNOT_REMOVE_SELF')
    }

    if (target.role === 'owner' && owners.length <= 1) {
      throw new DomainError('VALIDATION_LAST_OWNER')
    }

    const removed = await this.repository.remove(memberId)
    await this.repository.invalidateSessionsForOrganization(removed.userId)

    logger.info('member.removed', {
      organizationId: this.organizationId,
      actorUserId,
      targetUserId: removed.userId
    })
  }

  async invite(input: {
    email: string
    role: MemberRole
    inviterId: string
  }) {
    await this.ensureOwnerActor(input.inviterId)

    const email = input.email.trim().toLowerCase()
    if (!email) {
      throw new DomainError('VALIDATION_EMAIL_REQUIRED')
    }

    if (await this.repository.existsMemberByEmail(email)) {
      throw new DomainError('MEMBER_CONFLICT')
    }

    if (await this.repository.existsPendingInvitationByEmail(email)) {
      throw new DomainError('INVITATION_CONFLICT')
    }

    const invitation = await this.repository.createInvitation({
      email,
      role: input.role,
      inviterId: input.inviterId,
      expiresAt: addDays(new Date(), 7)
    })

    logger.info('member.invited', {
      organizationId: this.organizationId,
      inviterId: input.inviterId,
      inviteeEmail: email,
      role: input.role,
      invitationId: invitation.id
    })

    return invitation
  }
}
