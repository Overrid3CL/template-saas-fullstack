import { createError } from 'h3'
import * as z from 'zod'
import { auth } from '~~/lib/auth'
import { ProfileService } from '../services/profile.service'
import { requireTenantContext } from '../utils/tenant-context'
import { errorData, ok } from '../utils/api-response'

const bodySchema = z.object({
  confirmation: z.literal('ELIMINAR')
})

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: errorData('VALIDATION_CONFIRMATION_REQUIRED', 'Debes escribir ELIMINAR para continuar')
    })
  }

  const service = new ProfileService()
  await service.deleteAccount(tenant.userId)

  try {
    await auth.api.signOut({
      headers: event.headers
    })
  } catch {
    // La cuenta ya fue eliminada; continuar sin bloquear respuesta.
  }

  return ok({ deleted: true })
})
