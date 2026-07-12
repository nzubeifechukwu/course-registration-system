const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Seed the Admin account safely (Creates if missing, skips if already exists)
  await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@school.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Check and seed base courses if they aren't there yet
  const courseCount = await prisma.course.count();
  if (courseCount === 0) {
    await prisma.course.createMany({
      data: [
        { title: "PHY 101", level: 100 },
        { title: "MTH 111", level: 100 },
        { title: "CHM 212", level: 200 },
        { title: "GSP 201", level: 200 },
      ],
    });
  }

  console.log("Database seed checked/updated safely!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
