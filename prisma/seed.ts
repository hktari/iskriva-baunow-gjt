import { PrismaClient, UserRole, UserStatus, ProjectStatus, FieldCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.project.deleteMany();
  await prisma.configurableField.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Create demo users
  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      name: 'Demo Viewer',
      password: hashedPassword,
      role: UserRole.VIEWER,
      organization: 'Nordic Green Alliance',
      status: UserStatus.ACTIVE,
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      name: 'Demo Editor',
      password: hashedPassword,
      role: UserRole.EDITOR,
      organization: 'Central EU Energy Partners',
      status: UserStatus.ACTIVE,
    },
  });

  const superUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: UserRole.SUPER_USER,
      organization: 'EcoUrban Consortium',
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Created demo users');

  // Seed configurable fields
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

  const organizations = [
    'Nordic Green Alliance',
    'Central EU Energy Partners',
    'Mediterranean Climate Action',
    'EcoUrban Consortium',
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
    await prisma.configurableField.create({
      data: { category: FieldCategory.PROJECT_TYPE, value },
    });
  }

  for (const value of investmentTypes) {
    await prisma.configurableField.create({
      data: { category: FieldCategory.INVESTMENT_TYPE, value },
    });
  }

  for (const value of organizations) {
    await prisma.configurableField.create({
      data: { category: FieldCategory.ORGANIZATION, value },
    });
  }

  for (const value of kpiUnits) {
    await prisma.configurableField.create({
      data: { category: FieldCategory.KPI_UNIT, value },
    });
  }

  console.log('✅ Seeded configurable fields');

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Solar Energy Initiative Bavaria',
      country: 'Germany',
      projectType: 'Renewable Energy',
      investmentType: 'EU Structural Funds',
      projectValue: 2500000,
      investmentCosts: 1800000,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2026-12-31'),
      description: 'Large-scale solar panel installation across rural Bavaria to increase renewable energy production and reduce carbon emissions.',
      organization: 'Central EU Energy Partners',
      program: 'Horizon',
      targetGroup: ['Municipalities', 'Citizens'],
      impact: ['Decarbonisation', 'Energy transition'],
      projectManager: 'Dr. Anna Schmidt',
      contact: 'a.schmidt@example.com',
      projectWebsite: 'https://solar-bavaria.eu',
      note: 'Priority project for Q2 2025 review',
      createdById: editor.id,
      kpis: {
        create: [
          {
            indicatorName: 'Renewable energy produced per year',
            targetValue: 5000,
            valueAchieved: 3200,
            unit: 'MWh/year',
            updated: 'Q1/2025',
            decimals: false,
            thousandSeparators: true,
            isPrimary: true,
          },
          {
            indicatorName: 'CO2eq reduction per year',
            targetValue: 2500,
            valueAchieved: 1600,
            unit: 'tonnes CO2/year',
            updated: 'Q1/2025',
            decimals: false,
            thousandSeparators: true,
            isPrimary: false,
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Nordic Energy Efficiency Program',
      country: 'Sweden',
      projectType: 'Energy Efficiency',
      investmentType: 'Public Grant',
      projectValue: 1200000,
      investmentCosts: 950000,
      status: ProjectStatus.COMPLETED,
      startDate: new Date('2023-03-01'),
      endDate: new Date('2024-11-30'),
      description: 'Comprehensive energy efficiency upgrades for public buildings in Stockholm region.',
      organization: 'Nordic Green Alliance',
      program: 'Interreg',
      targetGroup: ['Public authorities', 'Municipalities'],
      impact: ['Energy transition', 'Smart Energy (Energy systems)'],
      projectManager: 'Lars Eriksson',
      contact: 'l.eriksson@example.com',
      createdById: editor.id,
      kpis: {
        create: [
          {
            indicatorName: 'Energy saved per year',
            targetValue: 3000,
            valueAchieved: 3450,
            unit: 'MWh/year',
            updated: '12/2024',
            decimals: false,
            thousandSeparators: true,
            isPrimary: true,
          },
          {
            indicatorName: 'Financial savings per year',
            targetValue: 450000,
            valueAchieved: 520000,
            unit: 'EUR',
            updated: '12/2024',
            decimals: false,
            thousandSeparators: true,
            isPrimary: false,
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: 'Mediterranean Water Conservation',
      country: 'Spain',
      projectType: 'Water Management',
      investmentType: 'LIFE Programme',
      projectValue: 800000,
      investmentCosts: 650000,
      status: ProjectStatus.PLANNING,
      startDate: new Date('2025-06-01'),
      description: 'Water conservation and management system for agricultural areas in Andalusia.',
      organization: 'Mediterranean Climate Action',
      program: 'LIFE',
      targetGroup: ['Industry', 'Citizens'],
      impact: ['Climate adaptation'],
      projectManager: 'Maria Garcia',
      contact: 'm.garcia@example.com',
      createdById: editor.id,
      kpis: {
        create: [
          {
            indicatorName: 'Water saved per year',
            targetValue: 500000,
            valueAchieved: 0,
            unit: 'm3/year',
            updated: 'Baseline',
            decimals: false,
            thousandSeparators: true,
            isPrimary: true,
          },
        ],
      },
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Urban Green Transport Initiative',
      country: 'Netherlands',
      projectType: 'Sustainable Transport',
      investmentType: 'Public-Private Partnership',
      projectValue: 3500000,
      investmentCosts: 2800000,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2027-08-31'),
      description: 'Expansion of electric public transport and cycling infrastructure in Amsterdam metropolitan area.',
      organization: 'EcoUrban Consortium',
      program: 'Nacionalni',
      targetGroup: ['Municipalities', 'Citizens'],
      impact: ['Decarbonisation', 'Just transition'],
      projectManager: 'Jan de Vries',
      contact: 'j.devries@example.com',
      projectWebsite: 'https://greentransport-ams.nl',
      createdById: superUser.id,
      kpis: {
        create: [
          {
            indicatorName: 'Infrastructure length (km)',
            targetValue: 120,
            valueAchieved: 45,
            unit: 'km',
            updated: 'Q4/2024',
            decimals: true,
            thousandSeparators: false,
            isPrimary: true,
          },
          {
            indicatorName: 'CO2eq reduction per year',
            targetValue: 8000,
            valueAchieved: 2400,
            unit: 'tonnes CO2/year',
            updated: 'Q4/2024',
            decimals: false,
            thousandSeparators: true,
            isPrimary: false,
          },
          {
            indicatorName: 'Number of beneficiaries',
            targetValue: 250000,
            valueAchieved: 85000,
            unit: 'persons',
            updated: 'Q4/2024',
            decimals: false,
            thousandSeparators: true,
            isPrimary: false,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample projects with KPIs');

  // Create some favorites
  await prisma.favorite.create({
    data: {
      userId: viewer.id,
      projectId: project1.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: editor.id,
      projectId: project2.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: editor.id,
      projectId: project4.id,
    },
  });

  console.log('✅ Created favorites');

  // Create audit log entries
  await prisma.auditLog.create({
    data: {
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: project1.id,
      userId: editor.id,
      userEmail: editor.email,
      metadata: { projectName: project1.name },
    },
  });

  console.log('✅ Created audit logs');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo accounts:');
  console.log('   Viewer:     viewer@example.com / demo123');
  console.log('   Editor:     editor@example.com / demo123');
  console.log('   Super User: admin@example.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
