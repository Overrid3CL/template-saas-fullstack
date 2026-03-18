import { createError, getRequestIP, type H3Event } from 'h3'
import { errorData } from './api-response'

type Entry = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Entry>()

type RateLimitOptions = {
  bucket: string
  max: number
  windowMs: number
}

export function enforceRateLimit(event: H3Event, options: RateLimitOptions) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${options.bucket}:${ip}`
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs
    })
    return
  }

  if (current.count >= options.max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: errorData('RATE_LIMIT_EXCEEDED')
    })
  }

  current.count += 1
}
