import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pinkBookUpdateSchema } from '@/lib/validations';

// GET /api/pinkbook — Fetch Pink Book data for the authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pinkBook = await prisma.pinkBook.findUnique({
            where: { userId: session.user.id },
        });

        if (!pinkBook) {
            return NextResponse.json({ error: 'Pink Book record not found' }, { status: 404 });
        }

        return NextResponse.json(pinkBook);
    } catch (error) {
        console.error('GET /api/pinkbook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/pinkbook — Update Pink Book data
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = pinkBookUpdateSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;
        const updateData: any = {};
        
        // Only update fields that were provided
        Object.keys(data).forEach((key) => {
            const typedKey = key as keyof typeof data;
            if (data[typedKey] !== undefined) {
                updateData[typedKey] = data[typedKey];
            }
        });

        const updatedPinkBook = await prisma.pinkBook.update({
            where: { userId: session.user.id },
            data: updateData,
        });

        return NextResponse.json(updatedPinkBook);
    } catch (error) {
        console.error('PUT /api/pinkbook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
