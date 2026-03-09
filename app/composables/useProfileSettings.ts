import type {
  ApiSuccess,
  ProfileDto,
  UpdateProfileInput,
  AvatarUploadUrlDto,
  AvatarUploadUrlInput
} from '~/types/settings'

async function unwrap<T>(promise: Promise<ApiSuccess<T>>) {
  const response = await promise
  return response.data
}

export function useProfileSettings() {
  const profile = useState<ProfileDto | null>('settings:profile', () => null)
  const loading = useState<boolean>('settings:profile:loading', () => false)

  async function refreshProfile() {
    loading.value = true
    try {
      profile.value = await unwrap($fetch<ApiSuccess<ProfileDto>>('/api/profile'))
      return profile.value
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(input: UpdateProfileInput) {
    const updated = await unwrap($fetch<ApiSuccess<ProfileDto>>('/api/profile', {
      method: 'PATCH',
      body: input
    }))
    profile.value = updated
    return updated
  }

  async function createAvatarUploadUrl(input: AvatarUploadUrlInput) {
    return unwrap($fetch<ApiSuccess<AvatarUploadUrlDto>>('/api/profile/avatar/upload-url', {
      method: 'POST',
      body: input
    }))
  }

  async function deleteAccount(confirmation: string) {
    return unwrap($fetch<ApiSuccess<{ deleted: boolean }>>('/api/profile', {
      method: 'DELETE',
      body: {
        confirmation
      }
    }))
  }

  return {
    profile,
    loading,
    refreshProfile,
    updateProfile,
    createAvatarUploadUrl,
    deleteAccount
  }
}
