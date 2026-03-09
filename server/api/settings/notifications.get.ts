import { NotificationPreferencesService } from '../../services/notification-preferences.service'
import { requireTenantContext } from '../../utils/tenant-context'
import { ok } from '../../utils/api-response'

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const service = new NotificationPreferencesService(tenant.organizationId, tenant.userId)
  const data = await service.get()
  return ok(data)
})
