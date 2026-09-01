const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const cycleLogs = await prisma.cycleLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('Recent Cycle Logs:', cycleLogs.map(l => ({ id: l.id, date: l.date, createdAt: l.createdAt })));
        
        const vitalLogs = await prisma.vitalLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('Recent Vital Logs:', vitalLogs.map(l => ({ id: l.id, date: l.date, vitalType: l.vitalType, createdAt: l.createdAt })));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
