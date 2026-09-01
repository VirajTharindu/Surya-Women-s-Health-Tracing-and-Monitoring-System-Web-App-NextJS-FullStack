import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reminderSchema, reminderUpdateSchema } from '@/lib/validations';

// PUT /api/reminders?id=... — Update a reminder (title, description, time, category, isCompleted)
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
        }
        const body = await request.json();
        const validation = reminderUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const data = validation.data;
        const updated = await prisma.reminder.update({
            where: { id, userId: session.user.id },
            data: {
                title: data.title,
                description: data.description,
                time: data.time ? new Date(data.time) : undefined,
                category: data.category,
                isCompleted: data.isCompleted,
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'UPDATE_REMINDER',
                tableName: 'Reminder',
                recordId: updated.id,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/reminders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// GET /api/reminders — Fetch reminders for the authenticated user, ordered by time
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const includeCompleted = searchParams.get('includeCompleted') === 'true';

        const where: any = { userId: session.user.id };
        if (!includeCompleted) {
            where.isCompleted = false;
        }

        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: { time: 'asc' }, // The database handles the priority queuing natively
        });

        return NextResponse.json(reminders);
    } catch (error) {
        console.error('GET /api/reminders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/reminders — Create a new reminder
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = reminderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;
        const reminder = await prisma.reminder.create({
            data: {
                userId: session.user.id,
                title: data.title,
                description: data.description,
                time: new Date(data.time),
                category: data.category,
                isCompleted: false,
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'CREATE_REMINDER',
                tableName: 'Reminder',
                recordId: reminder.id,
            }
        });

        return NextResponse.json(reminder, { status: 201 });
    } catch (error) {
        console.error('POST /api/reminders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/reminders?id=... — Delete a reminder
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
        }

        // Verify ownership
        const reminder = await prisma.reminder.findUnique({ where: { id } });
        if (!reminder || reminder.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        await prisma.reminder.delete({ where: { id, userId: session.user.id } });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'DELETE_REMINDER',
                tableName: 'Reminder',
                recordId: id,
            }
        });

        return NextResponse.json({ message: 'Reminder deleted' });
    } catch (error) {
        console.error('DELETE /api/reminders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
