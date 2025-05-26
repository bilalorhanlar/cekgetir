import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  // CORS Headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/ https://*.googleapis.com https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://*.googleapis.com https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://www.google.com/recaptcha/ https://*.googleapis.com https://*.gstatic.com https://maps.gstatic.com https://maps.googleapis.com",
    "font-src 'self' https://*.gstatic.com https://fonts.googleapis.com",
    "connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 ws://localhost:4000 ws://127.0.0.1:4000 https://www.google.com/recaptcha/ https://*.googleapis.com https://maps.googleapis.com https://maps.gstatic.com http://localhost:3000 http://127.0.0.1:3000 http://172.20.10.2:3000",
    "frame-src 'self' https://www.google.com/recaptcha/ https://*.googleapis.com https://www.google.com/maps/ https://maps.google.com/ https://www.google.com/",
    "worker-src 'self' blob:"
  ]

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))
  response.headers.set('X-XSS-Protection', '1; mode=block')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}