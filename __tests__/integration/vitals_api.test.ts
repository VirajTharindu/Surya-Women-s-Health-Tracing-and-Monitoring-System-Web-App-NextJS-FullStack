/**
 * Integration Test for Vitals API
 */
import { NextRequest } from 'next/server';
import { GET } from '../../src/app/api/logs/vitals/route';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
    prisma: {
        vitalLog: {
            findMany: jest.fn().mockResolvedValue([
                { id: 1, type: 'vitals', value: '123' },
                { id: 2, type: 'vitals', value: '456' }
            ]),
            count: jest.fn().mockResolvedValue(2)
        }
    }
}));

// Mock Auth to avoid NextAuth ESM parse errors in Jest
jest.mock('../../src/lib/auth', () => ({
    auth: jest.fn().mockResolvedValue({ user: { id: 'test-user' } })
}));

describe('Vitals API Integration', () => {
    it('should return vitals data successfully', async () => {
        // We can create a mock NextRequest
        const req = new NextRequest('http://localhost:3000/api/logs/vitals');
        
        const response = await GET(req);
        
        expect(response.status).toBe(200);
        
        const responseBody = await response.json();
        expect(Array.isArray(responseBody.data)).toBe(true);
        expect(responseBody.data.length).toBe(2);
        expect(responseBody.data[0].id).toBe(1);
    });
});
