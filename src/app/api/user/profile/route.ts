import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { userProfileUpdateSchema } from '@/lib/validations';

// GET /api/user/profile — Fetch current user profile
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                dob: true,
                heightCm: true,
                location: true,
                languagePref: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        console.error('GET /api/user/profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/user/profile — Update user profile
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = userProfileUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.dob !== undefined) updateData.dob = new Date(data.dob);
        if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;
        if (data.location !== undefined) updateData.location = data.location;
        if (data.languagePref !== undefined) updateData.languagePref = data.languagePref;

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                dob: true,
                heightCm: true,
                location: true,
                languagePref: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('PUT /api/user/profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
