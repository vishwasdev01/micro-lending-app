import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per window

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    
    const userLimit = rateLimitStore.get(ip)
    
    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    } else if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
      return new NextResponse('Too Many Requests', { status: 429 })
    } else {
      userLimit.count++
    }
  }

  // CSRF protection for state-changing operations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Allow same-origin requests
    if (origin && host && !origin.includes(host)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
