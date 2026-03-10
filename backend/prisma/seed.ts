import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const resume = await prisma.resume.create({
    data: {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      experiences: {
        create: [
          {
            company: "Tech Co",
            role: "Frontend Developer",
            startDate: new Date("2021-01-01"),
            endDate: new Date("2022-06-30"),
          },
          {
            company: "AI Solutions",
            role: "Fullstack Developer",
            startDate: new Date("2022-07-01"),
          },
        ],
      },
    },
  });

  console.log(`Created resume: ${resume.name} (${resume.id})`);

  const job1 = await prisma.jobDescription.create({
    data: {
      title: "Software Engineer",
      content: "Looking for a developer proficient in React and Node.js.",
    },
  });

  const job2 = await prisma.jobDescription.create({
    data: {
      title: "Frontend Developer",
      content: "Seeking someone experienced with TypeScript and TailwindCSS.",
    },
  });

  console.log(`Created job descriptions: ${job1.title}, ${job2.title}`);

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });