/**
 * Mock NextRequest and NextResponse for middleware testing
 */
import { middleware } from '../../src/middleware';
import { NextRequest } from 'next/server';

describe('Middleware', () => {
    it('should set security headers on response', () => {
        const req = new NextRequest('http://localhost/api/test', {
            headers: new Headers({
                'x-forwarded-for': '127.0.0.1'
            })
        });

        const res = middleware(req);

        expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');
        expect(res.headers.get('X-Frame-Options')).toBe('DENY');
        expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
        expect(res.headers.get('Feature-Policy')).toContain("geolocation 'none'");
    });
});
