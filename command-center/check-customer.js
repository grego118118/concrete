
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCustomer() {
    try {
        const customer = await prisma.customer.findFirst({
            where: {
                name: {
                    contains: 'Noah',
                    mode: 'insensitive'
                }
            }
        });
        console.log('Customer found:', customer);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCustomer();
