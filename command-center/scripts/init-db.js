
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const business = await prisma.business.upsert({
        where: { id: 'clun12345' },
        update: {},
        create: {
            id: 'clun12345',
            name: 'Pioneer Concrete',
            brandKit: {
                colors: { primary: '#2563eb', secondary: '#1e293b' },
                voice: 'Professional, Reliable, High-Quality, Local'
            }
        }
    })
    console.log('Business record initialized:', business)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
