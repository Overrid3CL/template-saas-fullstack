import { createError } from 'h3'
import { MemberService } from '../../services/member.service'
import { requireTenantContext } from '../../utils/tenant-context'
import { DomainError } from '../../utils/domain-error'
import { errorData, ok } from '../../utils/api-response'

export default eventHandler(async (event) => {
  try {
    const tenant = await requireTenantContext(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: errorData('VALIDATION_MEMBER_ID_REQUIRED')
      })
    }

    const service = new MemberService(tenant.organizationId)
    await service.remove(id, tenant.userId)
    return ok({ removed: true })
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'MEMBER_NOT_FOUND') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          data: errorData('MEMBER_NOT_FOUND')
        })
      }

      if (error.code === 'VALIDATION_CANNOT_REMOVE_SELF' || error.code === 'VALIDATION_LAST_OWNER') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          data: errorData(error.code)
        })
      }
    }

    throw error
  }
})
