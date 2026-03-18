import { createError } from 'h3'
import * as z from 'zod'
import { ProfileService } from '../../../services/profile.service'
import { requireTenantContext } from '../../../utils/tenant-context'
import { DomainError } from '../../../utils/domain-error'
import { ok, errorData } from '../../../utils/api-response'
import { enforceRateLimit } from '../../../utils/rate-limit'

const bodySchema = z.object({
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1)
})

export default eventHandler(async (event) => {
  try {
    enforceRateLimit(event, {
      bucket: 'profile-avatar-upload-url',
      max: 30,
      windowMs: 60_000
    })

    const tenant = await requireTenantContext(event)
    const body = await readBody(event)
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: errorData('VALIDATION_ERROR', parsed.error.issues[0]?.message)
      })
    }

    const service = new ProfileService()
    const data = await service.createAvatarUploadUrl({
      ...parsed.data,
      userId: tenant.userId,
      organizationId: tenant.organizationId
    })

    return ok(data)
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'VALIDATION_INVALID_CONTENT_TYPE') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: errorData(error.code, error.message)
        })
      }

      if (error.code === 'AVATAR_STORAGE_NOT_CONFIGURED') {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          data: errorData(error.code, 'Avatar storage is not configured')
        })
      }
    }

    throw error
  }
})
