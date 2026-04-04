const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a verified professor
  const passwordHash = await bcrypt.hash('password123', 10);

  const prof1 = await prisma.professor.upsert({
    where: { email: 'smith@university.edu' },
    update: {},
    create: {
      name: 'Dr. Jane Smith',
      email: 'smith@university.edu',
      passwordHash,
      department: 'Computer Science',
      isVerified: true,
    },
  });

  const prof2 = await prisma.professor.upsert({
    where: { email: 'chen@university.edu' },
    update: {},
    create: {
      name: 'Dr. Wei Chen',
      email: 'chen@university.edu',
      passwordHash,
      department: 'Computer Science',
      isVerified: true,
    },
  });

  // Create sample positions
  const pos1 = await prisma.position.create({
    data: {
      professorId: prof1.id,
      title: 'TA for ITCS 6160 - Database Systems',
      type: 'TA',
      courseNumber: 'ITCS 6160',
      description: 'Assist with grading assignments, leading lab sessions, and holding office hours for the Database Systems graduate course.',
      requirements: 'Completed ITCS 6160 with B+ or higher. Strong knowledge of SQL and relational database design.',
      hoursPerWeek: 10,
      compensation: '$15/hr',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const pos2 = await prisma.position.create({
    data: {
      professorId: prof2.id,
      title: 'RA - Natural Language Processing Lab',
      type: 'RA',
      researchArea: 'Natural Language Processing',
      description: 'Work on transformer-based text classification models for sentiment analysis. Involves dataset preparation, model training, and result analysis.',
      requirements: 'Experience with Python, PyTorch or TensorFlow. Background in ML/NLP preferred.',
      hoursPerWeek: 15,
      compensation: 'Tuition waiver + $1,500/month stipend',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
  });

  const pos3 = await prisma.position.create({
    data: {
      professorId: prof1.id,
      title: 'TA for ITCS 3166 - Computer Networks',
      type: 'TA',
      courseNumber: 'ITCS 3166',
      description: 'Lead lab sessions on socket programming, assist with grading, and help students with networking assignments.',
      requirements: 'Completed ITCS 3166 with B or higher. Familiarity with TCP/IP, socket programming in Python or Java.',
      hoursPerWeek: 10,
      compensation: '$14/hr',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Created professors: ${prof1.name}, ${prof2.name}`);
  console.log(`Created positions: ${pos1.title}, ${pos2.title}, ${pos3.title}`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
