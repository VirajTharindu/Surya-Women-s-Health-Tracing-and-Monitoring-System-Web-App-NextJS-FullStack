import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { greedyAllocate } from '@/lib/algorithms/community';

// POST /api/community/allocate — Run greedy resource allocation across clinics
export async function POST(request: Request) {
    try {
        const session = await auth();

        const body = await request.json();
        const availableStock = typeof body.stock === 'number' ? body.stock : 1000;

        const dbClinics = await prisma.clinic.findMany();

        if (dbClinics.length === 0) {
            // Fallback for demo if DB is empty
            const DEMANDS = [
                { id: 'Colombo Central', demand: 500, priority: 8 },
                { id: 'Kandy Rural', demand: 300, priority: 9 },
                { id: 'Galle Coastal', demand: 400, priority: 7 },
                { id: 'Jaffna North', demand: 600, priority: 10 },
                { id: 'Matara South', demand: 250, priority: 6 },
            ];
            
            const allocation = greedyAllocate(availableStock, DEMANDS);
            return NextResponse.json({ source: 'static', allocation });
        }

        const demands = dbClinics.map((c: any) => ({
            id: c.name,
            demand: c.demand,
            priority: c.priority
        }));

        // Execute Greedy Algorithm on the server
        const allocation = greedyAllocate(availableStock, demands);

        return NextResponse.json({ source: 'database', allocation });
    } catch (error) {
        console.error('POST /api/community/allocate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
