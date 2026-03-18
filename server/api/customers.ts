import { CustomerService } from '../services/customer.service'
import { requireTenantContext } from '../utils/tenant-context'
import { ok } from '../utils/api-response'

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const service = new CustomerService(tenant.organizationId)

  return ok(await service.list())
})
