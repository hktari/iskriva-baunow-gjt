/* eslint-disable no-console */

/**
 * Production seed script.
 *
 * Seeds ONLY:
 *   - Configurable fields (project types, investment types, organizations, KPI units)
 *   - A single SUPER_USER account
 *
 * Does NOT create test projects, demo users, or fake data.
 *
 * Usage:
 *   SUPER_USER_EMAIL=admin@yourdomain.com \
 *   SUPER_USER_NAME="Admin Name" \
 *   SUPER_USER_PASSWORD=<strong-password> \
 *   SUPER_USER_ORGANIZATION="Your Organization" \
 *   pnpm tsx prisma/seed.prod.ts
 */

import { FieldCategory, PrismaClient, UserRole, UserStatus } from '@/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  console.log('🌱 Starting production database seed...');

  const email = requireEnv('SUPER_USER_EMAIL');
  const name = requireEnv('SUPER_USER_NAME');
  const password = requireEnv('SUPER_USER_PASSWORD');

  // Configurable fields
  const projectTypes = [
    'Energy Efficiency',
    'Renewable Energy',
    'Buildings',
    'Energy systems / Smart energy',
    'Sustainable Transport',
    'Environmental Protection',
    'Water Management',
    'Waste Management',
    'Circular economy',
    'Climate adaptation',
    'Education',
    'Emission reduction (CO2)',
    'Research',
  ];

  const investmentTypes = [
    'Public Grant',
    'Private Investment',
    'Public-Private Partnership',
    'EU Structural Funds',
    'ERDF',
    'Cohesion Fund',
    'LIFE Programme',
  ];

  const kpiUnits = [
    'EUR',
    'MWh/year',
    '%',
    'tonnes/year',
    'tonnes CO2/year',
    '% CO2/year',
    'persons',
    'people',
    'km2',
    'km',
    'm3/year',
    'kW',
    'MW',
  ];

  for (const value of projectTypes) {
    await prisma.configurableField.upsert({
      where: { category_value: { category: FieldCategory.PROJECT_TYPE, value } },
      update: {},
      create: { category: FieldCategory.PROJECT_TYPE, value },
    });
  }

  for (const value of investmentTypes) {
    await prisma.configurableField.upsert({
      where: { category_value: { category: FieldCategory.INVESTMENT_TYPE, value } },
      update: {},
      create: { category: FieldCategory.INVESTMENT_TYPE, value },
    });
  }

  for (const value of kpiUnits) {
    await prisma.configurableField.upsert({
      where: { category_value: { category: FieldCategory.KPI_UNIT, value } },
      update: {},
      create: { category: FieldCategory.KPI_UNIT, value },
    });
  }

  console.log('✅ Seeded configurable fields');

  // Create super user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Super user ${email} already exists — skipping creation`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.SUPER_USER,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`✅ Created super user: ${email}`);
  }

  console.log('\n🎉 Production database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
