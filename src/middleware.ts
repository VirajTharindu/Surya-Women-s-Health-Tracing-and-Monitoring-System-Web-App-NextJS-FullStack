import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting map.
// Note: In serverless environments (like Vercel), this map is instantiated per cold start / isolate.
// It will not share state globally across all instances, but provides a basic level of throttling.
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP for general API
const MAX_AUTH_REQUESTS = 10; // 10 requests per minute for auth

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const path = request.nextUrl.pathname;
    
    // Only apply rate limiting to API routes
    if (path.startsWith('/api/')) {
        const now = Date.now();
        const limit = path.startsWith('/api/auth/') ? MAX_AUTH_REQUESTS : MAX_REQUESTS;
        
        const currentData = rateLimitMap.get(ip);
        
        if (currentData) {
            if (now > currentData.resetTime) {
                // Reset window
                rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
            } else {
                if (currentData.count >= limit) {
                    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
                }
                currentData.count += 1;
            }
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        }
    }
    
    // Add Security Headers
    const response = NextResponse.next();
    
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Feature-Policy header to restrict browser APIs
    response.headers.set('Feature-Policy', "geolocation 'none'; vibrate 'none'; camera 'none'" );
    
    // Content-Security-Policy (basic setup, needs tweaking based on external scripts/fonts if used)
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com;"
    );

    return response;
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
};
