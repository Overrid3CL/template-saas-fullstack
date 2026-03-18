import { toWebRequest } from 'h3'
import { auth } from '~~/lib/auth'
import { enforceRateLimit } from '../../utils/rate-limit'

export default defineEventHandler((event) => {
  enforceRateLimit(event, {
    bucket: 'auth',
    max: 60,
    windowMs: 60_000
  })

  return auth.handler(toWebRequest(event))
})
