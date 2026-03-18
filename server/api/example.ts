import { auth } from '~~/lib/auth'
import { assertDemoEndpointEnabled } from '../utils/demo-endpoint'
import { ok } from '../utils/api-response'
import { requireTenantContext } from '../utils/tenant-context'

export default defineEventHandler(async (event) => {
  assertDemoEndpointEnabled()
  await requireTenantContext(event)

  const session = await auth.api.getSession({
    headers: event.headers
  })

  return ok({
    session
  })
})
