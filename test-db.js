const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const cycleLogs = await prisma.cycleLog.findMany();
        console.log('Cycle Logs:', cycleLogs);
        const vitalLogs = await prisma.vitalLog.findMany();
        console.log('Vital Logs:', vitalLogs);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
