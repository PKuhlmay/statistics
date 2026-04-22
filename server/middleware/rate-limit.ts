const requestCounts = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/')) return

  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0].trim() ??
    event.node.req.socket.remoteAddress ??
    'unknown'

  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  entry.count++

  if (entry.count > MAX_REQUESTS) {
    setResponseStatus(event, 429)
    return { statusCode: 429, message: 'Too many requests' }
  }
})
