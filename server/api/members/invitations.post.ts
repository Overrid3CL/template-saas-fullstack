import { createError } from 'h3'
import * as z from 'zod'
import { MemberService } from '../../services/member.service'
import { requireTenantContext } from '../../utils/tenant-context'
import { DomainError } from '../../utils/domain-error'
import { errorData, ok } from '../../utils/api-response'

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'owner']).default('member')
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

    const service = new MemberService(tenant.organizationId)
    const invitation = await service.invite({
      ...parsed.data,
      inviterId: tenant.userId
    })

    return ok({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt
    })
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code.startsWith('VALIDATION_')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: errorData(error.code)
        })
      }

      if (error.code === 'MEMBER_CONFLICT' || error.code === 'INVITATION_CONFLICT') {
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
