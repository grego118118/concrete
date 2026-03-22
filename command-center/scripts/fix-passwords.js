const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing NextAuth users and passwords...');
    const emails = ['greg@gowebautomations.com', 'ted@pioneerconcretecoatings.com'];
    const password = 'Pioneer2024!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const business = await prisma.business.findFirst();
    const businessId = business ? business.id : 'clun12345'; // fallback

    if (!businessId) {
        console.log('No business found. Cannot assign users to a business.');
    }

    for (const email of emails) {
        try {
            const user = await prisma.user.upsert({
                where: { email },
                update: { password: hashedPassword },
                create: { 
                    email: email, 
                    name: email.split('@')[0], 
                    password: hashedPassword,
                    role: 'ADMIN',
                    businessId: businessId
                },
            });
            console.log(`Success! Password set for user: ${user.email}`);
        } catch (error) {
            console.error(`Error updating password for ${email}:`, error);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
