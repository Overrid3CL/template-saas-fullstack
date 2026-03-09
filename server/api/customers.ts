import { CustomerRepository } from '../repositories/customer.repository'
import { requireTenantContext } from '../utils/tenant-context'

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const customerRepository = new CustomerRepository(tenant.organizationId)

  return customerRepository.list()
})
