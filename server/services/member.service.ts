import { addDays } from 'date-fns'
import { DomainError } from '../utils/domain-error'
import { MemberRepository } from '../repositories/member.repository'

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
    return members.map((member) => ({
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

  async updateRole(memberId: string, role: MemberRole) {
    const updated = await this.repository.updateRole(memberId, role)
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

    await this.repository.remove(memberId)
  }

  async invite(input: {
    email: string
    role: MemberRole
    inviterId: string
  }) {
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

    return this.repository.createInvitation({
      email,
      role: input.role,
      inviterId: input.inviterId,
      expiresAt: addDays(new Date(), 7)
    })
  }
}
