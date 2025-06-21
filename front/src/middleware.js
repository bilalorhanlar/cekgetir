import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  // CORS Headers - cekgetir.com için düzenlendi
  response.headers.set('Access-Control-Allow-Origin', 'https://cekgetir.com, https://www.cekgetir.com, https://api.cekgetir.com, https://admin.cekgetir.com, https://localhost:3000, http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=*, camera=*, microphone=*')

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/ https://*.googleapis.com https://maps.googleapis.com https://maps.gstatic.com https://api.openrouteservice.org https://www.googletagmanager.com https://cekgetir.com https://*.cekgetir.com",
    "style-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://*.googleapis.com https://fonts.googleapis.com https://cdnjs.cloudflare.com https://api.openrouteservice.org https://cekgetir.com https://*.cekgetir.com",
    "img-src 'self' data: blob: https://www.google.com/recaptcha/ https://*.googleapis.com https://*.gstatic.com https://maps.gstatic.com https://maps.googleapis.com https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com https://api.openrouteservice.org https://cekgetir.com https://*.cekgetir.com",
    "font-src 'self' https://*.gstatic.com https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cekgetir.com https://*.cekgetir.com",
    "connect-src 'self' https://cekgetir.com https://*.cekgetir.com https://api.cekgetir.com https://cekgetir.up.railway.app https://*.googleapis.com https://maps.googleapis.com https://maps.gstatic.com https://nominatim.openstreetmap.org https://api.openrouteservice.org https://api.opencagedata.com https://*.opencagedata.com https://photon.komoot.io https://location.services.mozilla.com https://www.googleapis.com https://securetoken.googleapis.com",
    "frame-src 'self' https://*.googleapis.com https://www.google.com/maps/ https://maps.google.com/ https://www.google.com/ https://*.gstatic.com https://cekgetir.com https://*.cekgetir.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
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