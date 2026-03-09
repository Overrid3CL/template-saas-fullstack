import { createError } from 'h3'
import * as z from 'zod'
import { MemberService } from '../../../services/member.service'
import { requireTenantContext } from '../../../utils/tenant-context'
import { DomainError } from '../../../utils/domain-error'
import { errorData, ok } from '../../../utils/api-response'

const bodySchema = z.object({
  role: z.enum(['member', 'owner'])
})

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
    const data = await service.updateRole(id, parsed.data.role)
    return ok(data)
  } catch (error) {
    if (error instanceof DomainError && error.code === 'MEMBER_NOT_FOUND') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: errorData('MEMBER_NOT_FOUND')
      })
    }

    throw error
  }
})
