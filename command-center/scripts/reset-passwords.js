const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Resetting passwords for Ted and Greg...');

    const password = 'Pioneer2024!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        'greg@gowebautomations.com',
        'ted@pioneerconcretecoatings.com'
    ];

    for (const email of users) {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log(`Updated password for: ${user.email}`);
    }

    console.log('Password reset complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
