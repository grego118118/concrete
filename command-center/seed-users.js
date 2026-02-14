
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding users...');

    // 1. Find the default business
    const business = await prisma.business.findFirst();

    if (!business) {
        console.error('No business found. specific business seeding might be required first.');
        return;
    }

    console.log(`Found business: ${business.name} (${business.id})`);

    // 2. Define users to add
    const users = [
        { email: 'greg@gowebautomations.com', name: 'Greg' },
        { email: 'ted@pioneerconcretecoatings.com', name: 'Ted' }
    ];

    for (const user of users) {
        const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                role: 'ADMIN', // Ensure they are admins
                businessId: business.id
            },
            create: {
                email: user.email,
                name: user.name,
                role: 'ADMIN',
                businessId: business.id
            }
        });
        console.log(`Upserted user: ${upsertedUser.email}`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
