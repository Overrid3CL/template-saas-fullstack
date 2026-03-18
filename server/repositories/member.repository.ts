import { prisma } from '../utils/prisma'
import { DomainError } from '../utils/domain-error'
import { randomUUID } from 'node:crypto'

type MemberRole = 'member' | 'owner'

export class MemberRepository {
  constructor(private readonly organizationId: string) {}

  async list() {
    return prisma.member.findMany({
      where: {
        organizationId: this.organizationId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
  }

  async updateRole(memberId: string, role: MemberRole) {
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: this.organizationId
      }
    })

    if (!member) {
      throw new DomainError('MEMBER_NOT_FOUND')
    }

    return prisma.member.update({
      where: {
        id: member.id
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
  }

  async getById(memberId: string) {
    return prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: this.organizationId
      }
    })
  }

  async getByUserId(userId: string) {
    return prisma.member.findFirst({
      where: {
        userId,
        organizationId: this.organizationId
      }
    })
  }

  async countOwners() {
    return prisma.member.count({
      where: {
        organizationId: this.organizationId,
        role: 'owner'
      }
    })
  }

  async remove(memberId: string) {
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: this.organizationId
      }
    })

    if (!member) {
      throw new DomainError('MEMBER_NOT_FOUND')
    }

    await prisma.member.delete({
      where: { id: member.id }
    })

    return member
  }

  async invalidateSessionsForOrganization(userId: string) {
    await prisma.session.deleteMany({
      where: {
        userId,
        activeOrganizationId: this.organizationId
      }
    })
  }

  async createInvitation(input: {
    email: string
    role: MemberRole
    inviterId: string
    expiresAt: Date
  }) {
    return prisma.invitation.create({
      data: {
        id: randomUUID(),
        email: input.email,
        role: input.role,
        inviterId: input.inviterId,
        status: 'pending',
        expiresAt: input.expiresAt,
        createdAt: new Date(),
        organizationId: this.organizationId
      }
    })
  }

  async existsMemberByEmail(email: string) {
    const member = await prisma.member.findFirst({
      where: {
        organizationId: this.organizationId,
        user: {
          email
        }
      }
    })

    return Boolean(member)
  }

  async existsPendingInvitationByEmail(email: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        organizationId: this.organizationId,
        email,
        status: 'pending'
      }
    })

    return Boolean(invitation)
  }
}
