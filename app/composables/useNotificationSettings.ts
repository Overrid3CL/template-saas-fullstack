import type { ApiSuccess, NotificationPreferencesDto } from '~/types/settings'

async function unwrap<T>(promise: Promise<ApiSuccess<T>>) {
  const response = await promise
  return response.data
}

export function useNotificationSettings() {
  const preferences = useState<NotificationPreferencesDto>('settings:notification-preferences', () => ({
    email: true,
    desktop: false,
    product_updates: true,
    weekly_digest: false,
    important_updates: true
  }))
  const loading = useState<boolean>('settings:notification-preferences:loading', () => false)
  const saving = useState<boolean>('settings:notification-preferences:saving', () => false)

  async function refreshPreferences() {
    loading.value = true
    try {
      preferences.value = await unwrap($fetch<ApiSuccess<NotificationPreferencesDto>>('/api/settings/notifications'))
      return preferences.value
    } finally {
      loading.value = false
    }
  }

  async function savePreferences(nextState: NotificationPreferencesDto) {
    saving.value = true
    try {
      preferences.value = await unwrap($fetch<ApiSuccess<NotificationPreferencesDto>>('/api/settings/notifications', {
        method: 'PUT',
        body: nextState
      }))
      return preferences.value
    } finally {
      saving.value = false
    }
  }

  return {
    preferences,
    loading,
    saving,
    refreshPreferences,
    savePreferences
  }
}
