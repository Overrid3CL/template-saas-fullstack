import { createError } from 'h3'
import * as z from 'zod'
import { MemberService } from '../../../services/member.service'
import { requireTenantContext } from '../../../utils/tenant-context'
import { DomainError } from '../../../utils/domain-error'
import { errorData, ok } from '../../../utils/api-response'
import { enforceRateLimit } from '../../../utils/rate-limit'

const bodySchema = z.object({
  role: z.enum(['member', 'owner'])
})

export default eventHandler(async (event) => {
  try {
    enforceRateLimit(event, {
      bucket: 'members-role-update',
      max: 20,
      windowMs: 60_000
    })

    const tenant = await requireTenantContext(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: errorData('VALIDATION_MEMBER_ID_REQUIRED')
      })
    }

    const body = await readBody(event)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: errorData('VALIDATION_ERROR', parsed.error.issues[0]?.message)
      })
    }

    const service = new MemberService(tenant.organizationId)
    const data = await service.updateRole(id, parsed.data.role, tenant.userId)
    return ok(data)
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'MEMBER_NOT_FOUND') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          data: errorData('MEMBER_NOT_FOUND')
        })
      }

      if (error.code === 'AUTHZ_OWNER_REQUIRED') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          data: errorData('AUTHZ_OWNER_REQUIRED')
        })
      }

      if (error.code === 'VALIDATION_LAST_OWNER') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          data: errorData('VALIDATION_LAST_OWNER')
        })
      }
    }

    throw error
  }
})
