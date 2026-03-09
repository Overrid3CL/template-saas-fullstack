import { prisma } from '../utils/prisma'

type NotificationPreferenceData = {
  email: boolean
  desktop: boolean
  productUpdates: boolean
  weeklyDigest: boolean
  importantUpdates: boolean
}

export class NotificationPreferencesRepository {
  constructor(
    private readonly organizationId: string,
    private readonly userId: string
  ) {}

  async getOrCreateDefaults() {
    return prisma.notificationPreference.upsert({
      where: {
        userId_organizationId: {
          userId: this.userId,
          organizationId: this.organizationId
        }
      },
      update: {},
      create: {
        userId: this.userId,
        organizationId: this.organizationId
      }
    })
  }

  async update(data: NotificationPreferenceData) {
    return prisma.notificationPreference.upsert({
      where: {
        userId_organizationId: {
          userId: this.userId,
          organizationId: this.organizationId
        }
      },
      update: data,
      create: {
        userId: this.userId,
        organizationId: this.organizationId,
        ...data
      }
    })
  }
}
