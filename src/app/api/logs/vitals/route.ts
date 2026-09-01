import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { vitalLogSchema, vitalLogUpdateSchema } from '@/lib/validations';
import { encryptData, decryptData } from '@/lib/encryption';

// GET /api/logs/vitals — Fetch vital logs for the authenticated user
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const vitalType = searchParams.get('vitalType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const where: any = { userId: session.user.id };
        if (vitalType) where.vitalType = vitalType;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const logs = await prisma.vitalLog.findMany({
            where,
            orderBy: { date: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const total = await prisma.vitalLog.count({ where });

        // Decrypt values before sending to client
        const decryptedLogs = logs.map(log => {
            let decryptedValue = log.value;
            // Check if it's our encrypted wrapper format
            if (typeof log.value === 'object' && log.value !== null && '_encryptedData' in (log.value as any)) {
                try {
                    const decryptedString = decryptData((log.value as any)._encryptedData);
                    decryptedValue = JSON.parse(decryptedString);
                } catch (e) {
                    console.error('Failed to parse decrypted vital log value', e);
                }
            }
            return {
                ...log,
                value: decryptedValue
            };
        });

        return NextResponse.json({
            data: decryptedLogs,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('GET /api/logs/vitals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/logs/vitals — Create a new vital log
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = vitalLogSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = validation.data;
        
        // Encrypt the value field
        const stringifiedValue = JSON.stringify(data.value);
        const encryptedValue = { _encryptedData: encryptData(stringifiedValue) };

        const log = await prisma.vitalLog.create({
            data: {
                userId: session.user.id,
                date: new Date(),
                vitalType: data.vitalType,
                value: encryptedValue,
                classification: data.classification,
                classificationColor: data.classificationColor,
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'CREATE_VITAL_LOG',
                tableName: 'VitalLog',
                recordId: log.id,
            }
        });

        // Return the decrypted format for immediate client use
        return NextResponse.json({ ...log, value: data.value }, { status: 201 });
    } catch (error) {
        console.error('POST /api/logs/vitals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/logs/vitals?id=<<logId>> — Update an existing vital log
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'VitalLog ID required' }, { status: 400 });
        }
        const body = await request.json();
        const validation = vitalLogUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const data = validation.data;
        const updateData: any = {};
        if (data.vitalType !== undefined) updateData.vitalType = data.vitalType;
        if (data.value !== undefined) {
            const stringifiedValue = JSON.stringify(data.value);
            updateData.value = { _encryptedData: encryptData(stringifiedValue) };
        }
        if (data.classification !== undefined) updateData.classification = data.classification;
        if (data.classificationColor !== undefined) updateData.classificationColor = data.classificationColor;
        if (body.date) updateData.date = new Date(body.date);

        const updated = await prisma.vitalLog.update({
            where: { id, userId: session.user.id },
            data: updateData,
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'UPDATE_VITAL_LOG',
                tableName: 'VitalLog',
                recordId: updated.id,
            }
        });

        let decryptedValue = data.value;
        if (data.value === undefined && typeof updated.value === 'object' && updated.value !== null && '_encryptedData' in (updated.value as any)) {
             try {
                 const decryptedString = decryptData((updated.value as any)._encryptedData);
                 decryptedValue = JSON.parse(decryptedString);
             } catch (e) {}
        } else if (data.value === undefined) {
             decryptedValue = updated.value as any;
        }

        return NextResponse.json({ ...updated, value: decryptedValue });
    } catch (error) {
        console.error('PUT /api/logs/vitals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/logs/vitals?id=<<logId>> — Delete a vital log
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'VitalLog ID required' }, { status: 400 });
        }
        await prisma.vitalLog.delete({
            where: { id, userId: session.user.id },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'DELETE_VITAL_LOG',
                tableName: 'VitalLog',
                recordId: id,
            }
        });

        return NextResponse.json({ message: 'VitalLog deleted' });
    } catch (error) {
        console.error('DELETE /api/logs/vitals error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
