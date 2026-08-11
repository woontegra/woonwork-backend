import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, TenantRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL ve SEED_ADMIN_PASSWORD ortam değişkenleri gerekli');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'woontegra' },
    update: { name: 'Woontegra' },
    create: {
      name: 'Woontegra',
      slug: 'woontegra',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      firstName: 'Woontegra',
      lastName: 'Admin',
      isActive: true,
    },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      firstName: 'Woontegra',
      lastName: 'Admin',
      isActive: true,
    },
  });

  await prisma.tenantMember.upsert({
    where: {
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id,
      },
    },
    update: { role: TenantRole.OWNER },
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: TenantRole.OWNER,
    },
  });

  console.log('Seed tamamlandı');
  console.log(`  Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`  Admin:  ${user.email} [OWNER]`);
}

main()
  .catch((error) => {
    console.error('Seed hatası:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
