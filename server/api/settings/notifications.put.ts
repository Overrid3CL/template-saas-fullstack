import { createError } from 'h3'
import * as z from 'zod'
import { NotificationPreferencesService } from '../../services/notification-preferences.service'
import { requireTenantContext } from '../../utils/tenant-context'
import { ok, errorData } from '../../utils/api-response'

const bodySchema = z.object({
  email: z.boolean(),
  desktop: z.boolean(),
  product_updates: z.boolean(),
  weekly_digest: z.boolean(),
  important_updates: z.boolean()
})

export default eventHandler(async (event) => {
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

  const service = new NotificationPreferencesService(tenant.organizationId, tenant.userId)
  const data = await service.update(parsed.data)
  return ok(data)
})
