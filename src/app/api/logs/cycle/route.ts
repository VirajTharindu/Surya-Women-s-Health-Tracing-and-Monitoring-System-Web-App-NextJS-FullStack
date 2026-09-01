import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cycleLogSchema } from '@/lib/validations';

// GET /api/logs/cycle — Fetch all cycle logs for the authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = { userId: session.user.id };
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const logs = await prisma.cycleLog.findMany({
            where,
            orderBy: { date: 'asc' },
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('GET /api/logs/cycle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/logs/cycle — Create a new cycle log
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = cycleLogSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;
        const log = await prisma.cycleLog.create({
            data: {
                userId: session.user.id,
                date: new Date(data.date),
                flowIntensity: data.flowIntensity,
                cramps: data.cramps,
                mood: data.mood,
                symptoms: data.symptoms,
                note: data.note,
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'CREATE_CYCLE_LOG',
                tableName: 'CycleLog',
                recordId: log.id,
            }
        });

        return NextResponse.json(log, { status: 201 });
    } catch (error) {
        console.error('POST /api/logs/cycle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/logs/cycle?id=<<logId>> — Update an existing cycle log
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'CycleLog ID required' }, { status: 400 });
        }
        const body = await request.json();
        const validation = cycleLogSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const data = validation.data;
        const updated = await prisma.cycleLog.update({
            where: { id, userId: session.user.id },
            data: {
                date: new Date(data.date),
                flowIntensity: data.flowIntensity,
                cramps: data.cramps,
                mood: data.mood,
                symptoms: data.symptoms,
                note: data.note,
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'UPDATE_CYCLE_LOG',
                tableName: 'CycleLog',
                recordId: updated.id,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/logs/cycle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'CycleLog ID required' }, { status: 400 });
        }
        const deleted = await prisma.cycleLog.delete({
            where: { id, userId: session.user.id },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'DELETE_CYCLE_LOG',
                tableName: 'CycleLog',
                recordId: id,
            }
        });

        return NextResponse.json({ message: 'CycleLog deleted' });
    } catch (error) {
        console.error('DELETE /api/logs/cycle error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


