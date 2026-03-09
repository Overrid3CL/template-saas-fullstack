import { createError } from 'h3'
import * as z from 'zod'
import { ProfileService } from '../services/profile.service'
import { requireTenantContext } from '../utils/tenant-context'
import { DomainError } from '../utils/domain-error'
import { ok, errorData } from '../utils/api-response'

const bodySchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  image: z.string().url().optional()
})

export default eventHandler(async (event) => {
  try {
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
    const data = await service.updateProfile(tenant.userId, parsed.data)
    return ok(data)
  } catch (error) {
    if (error instanceof DomainError && error.code === 'USER_NOT_FOUND') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: errorData('USER_NOT_FOUND', 'User not found')
      })
    }
    throw error
  }
})
