import { prisma } from './src/lib/prisma';

async function run() {
    try {
        const deleted = await prisma.cycleLog.deleteMany({
            where: {
                date: {
                    gt: new Date('2026-08-28T23:59:59.000Z')
                }
            }
        });
        console.log('Deleted future cycle logs:', deleted.count);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
