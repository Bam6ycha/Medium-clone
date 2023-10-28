import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();
const userPassword = 'defaultPassword';

async function main() {
  const passwordHash = await hash(userPassword);
  await prisma.user.upsert({
    where: { id: 1 },
    create: {
      email: 'email@gmail.com',
      name: 'User',
      role: 'admin',
      passwordHash: passwordHash,
      createdAt: new Date(),
    },
    update: { email: 'email@gmail.com', name: 'User', role: 'admin' },
  });
}

main().then(
  () => {
    prisma.$disconnect();
  },
  (error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  },
);
