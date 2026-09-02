import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { kruskal } from '@/lib/algorithms/community';

// Cache for MST to avoid running Kruskal's algorithm on every request
let mstCache: { data: any, timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// GET /api/community/network-mst — Calculate the optimized clinic network
export async function GET(_request: Request) {
    try {
        await auth();
        
        // Midwife/Admin check can be added here if RBAC is strictly enforced
        // if (session?.user?.role !== 'MIDWIFE' && session?.user?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        if (mstCache && Date.now() - mstCache.timestamp < CACHE_TTL_MS) {
            return NextResponse.json({ source: 'cache', mst: mstCache.data });
        }

        // Fetch all clinics and potential connections from the database
        // For now, we will simulate the DB fetch using the mock data logic 
        // to return the exact structure the UI expects, since we haven't seeded 
        // the DB with the clinic nodes yet.
        
        const dbClinics = await prisma.clinic.findMany();
        const dbEdges = await prisma.clinicEdge.findMany({
            include: { from: true, to: true }
        });

        if (dbClinics.length === 0 || dbEdges.length === 0) {
             // Fallback to static data if DB is empty for demo purposes
             const CLINICS = ['Clinic A (Rural)', 'Clinic B (Urban)', 'Clinic C (Hill Country)', 'Clinic D (Coastal)', 'Clinic E (Main Hospital)'];
             const POTENTIAL_CONNECTIONS = [
                 { u: 'Clinic A (Rural)', v: 'Clinic B (Urban)', weight: 50 },
                 { u: 'Clinic A (Rural)', v: 'Clinic C (Hill Country)', weight: 30 },
                 { u: 'Clinic B (Urban)', v: 'Clinic D (Coastal)', weight: 40 },
                 { u: 'Clinic C (Hill Country)', v: 'Clinic E (Main Hospital)', weight: 20 },
                 { u: 'Clinic D (Coastal)', v: 'Clinic E (Main Hospital)', weight: 45 },
                 { u: 'Clinic B (Urban)', v: 'Clinic E (Main Hospital)', weight: 15 },
             ];
             const mst = kruskal(CLINICS, POTENTIAL_CONNECTIONS);
             mstCache = { data: mst, timestamp: Date.now() };
             return NextResponse.json({ source: 'static', mst });
        }

        const clinicNames = dbClinics.map((c: any) => c.name);
        const mappedEdges = dbEdges.map((e: any) => ({
            u: e.from.name,
            v: e.to.name,
            weight: e.weight
        }));

        // Execute Kruskal's algorithm on the server
        const mst = kruskal(clinicNames, mappedEdges);
        
        mstCache = { data: mst, timestamp: Date.now() };

        return NextResponse.json({ source: 'database', mst });
    } catch (error) {
        console.error('GET /api/community/network-mst error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
