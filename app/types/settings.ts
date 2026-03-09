export type ApiSuccess<T> = {
  ok: true
  data: T
}

export type ApiError = {
  ok: false
  error: string
  message?: string
}

export type ProfileDto = {
  id: string
  name: string
  email: string
  image?: string | null
  username: string
}

export type UpdateProfileInput = {
  name: string
  image?: string
}

export type AvatarUploadUrlInput = {
  fileName: string
  contentType: string
}

export type AvatarUploadUrlDto = {
  objectKey: string
  uploadUrl: string
  publicUrl: string
  expiresInSeconds: number
}

export type MemberDto = {
  id: string
  userId: string
  name: string
  email: string
  username: string
  role: 'member' | 'owner'
  avatar: {
    src?: string
    alt?: string
  }
}

export type ChangeMemberRoleInput = {
  role: 'member' | 'owner'
}

export type InviteMemberInput = {
  email: string
  role: 'member' | 'owner'
}

export type NotificationPreferencesDto = {
  email: boolean
  desktop: boolean
  product_updates: boolean
  weekly_digest: boolean
  important_updates: boolean
}
