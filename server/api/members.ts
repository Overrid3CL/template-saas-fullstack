import { MemberService } from '../services/member.service'
import { requireTenantContext } from '../utils/tenant-context'
import { ok } from '../utils/api-response'

export default eventHandler(async (event) => {
  const tenant = await requireTenantContext(event)
  const service = new MemberService(tenant.organizationId)
  const members = await service.list()
  return ok(members)
})
