const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No user found");
            return;
        }
        
        const log = await prisma.cycleLog.create({
            data: {
                userId: user.id,
                date: new Date('2024-08-28'),
                flowIntensity: 'medium',
                cramps: 3,
                mood: 'neutral',
                symptoms: [],
                note: ''
            }
        });
        console.log('Created log:', log);
    } catch (e) {
        console.error('Error creating log:', e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
