import { DomainError } from '../utils/domain-error'
import { ProfileRepository } from '../repositories/profile.repository'
import { AvatarStorageService } from './avatar-storage.service'

function usernameFromEmail(email: string) {
  const localPart = email.split('@')[0] || ''
  return localPart || email
}

export class ProfileService {
  private readonly repository = new ProfileRepository()

  async getProfile(userId: string) {
    const profile = await this.repository.findByUserId(userId)
    if (!profile) {
      throw new DomainError('USER_NOT_FOUND')
    }

    return {
      ...profile,
      username: usernameFromEmail(profile.email)
    }
  }

  async updateProfile(
    userId: string,
    input: {
      name: string
      image?: string
    }
  ) {
    const profile = await this.repository.updateByUserId(userId, {
      name: input.name.trim(),
      image: input.image || null
    })

    return {
      ...profile,
      username: usernameFromEmail(profile.email)
    }
  }

  async createAvatarUploadUrl(input: {
    fileName: string
    contentType: string
    userId: string
    organizationId: string
  }) {
    const avatarStorageService = new AvatarStorageService()
    return avatarStorageService.createUploadUrl(input)
  }

  async deleteAccount(userId: string) {
    await this.repository.deleteByUserId(userId)
  }
}
