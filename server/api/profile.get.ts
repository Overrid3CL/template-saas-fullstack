import { createError } from 'h3'
import { ProfileService } from '../services/profile.service'
import { requireTenantContext } from '../utils/tenant-context'
import { DomainError } from '../utils/domain-error'
import { ok, errorData } from '../utils/api-response'

export default eventHandler(async (event) => {
  try {
    const tenant = await requireTenantContext(event)
    const service = new ProfileService()
    const data = await service.getProfile(tenant.userId)
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
