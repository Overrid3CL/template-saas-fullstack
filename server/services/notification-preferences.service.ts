import { NotificationPreferencesRepository } from '../repositories/notification-preferences.repository'

type NotificationPreferences = {
  email: boolean
  desktop: boolean
  product_updates: boolean
  weekly_digest: boolean
  important_updates: boolean
}

function toDto(row: {
  email: boolean
  desktop: boolean
  productUpdates: boolean
  weeklyDigest: boolean
  importantUpdates: boolean
}): NotificationPreferences {
  return {
    email: row.email,
    desktop: row.desktop,
    product_updates: row.productUpdates,
    weekly_digest: row.weeklyDigest,
    important_updates: row.importantUpdates
  }
}

export class NotificationPreferencesService {
  private readonly repository: NotificationPreferencesRepository

  constructor(
    private readonly organizationId: string,
    private readonly userId: string
  ) {
    this.repository = new NotificationPreferencesRepository(organizationId, userId)
  }

  async get() {
    const row = await this.repository.getOrCreateDefaults()
    return toDto(row)
  }

  async update(input: NotificationPreferences) {
    const row = await this.repository.update({
      email: input.email,
      desktop: input.desktop,
      productUpdates: input.product_updates,
      weeklyDigest: input.weekly_digest,
      importantUpdates: input.important_updates
    })

    return toDto(row)
  }
}
