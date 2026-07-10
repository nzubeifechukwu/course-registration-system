const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function main() {
  // Clear existing data to prevent collisions during re-seeding
  await prisma.registration.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@school.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: "Nzube Ifechukwu",
        email: "nzube@school.com",
        password: hashedPassword,
        level: 100,
      },
      {
        name: "Olisa Onyia",
        email: "olisa@school.com",
        password: hashedPassword,
        level: 200,
      },
    ],
  });

  await prisma.course.createMany({
    data: [
      { title: "PHY 101", level: 100 },
      { title: "MTH 111", level: 100 },
      { title: "CHM 212", level: 200 },
      { title: "GSP 201", level: 200 },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
