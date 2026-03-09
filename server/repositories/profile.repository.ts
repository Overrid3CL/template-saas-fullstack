import { prisma } from '../utils/prisma'

export class ProfileRepository {
  async findByUserId(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    })
  }

  async updateByUserId(
    userId: string,
    data: {
      name: string
      image?: string | null
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    })
  }

  async deleteByUserId(userId: string) {
    return prisma.user.delete({
      where: { id: userId }
    })
  }
}
