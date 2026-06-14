import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.agentRun.deleteMany();
  await prisma.attendee.deleteMany();
  await prisma.registrationForm.deleteMany();
  await prisma.landingPage.deleteMany();
  await prisma.eventBrief.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const owner = await prisma.user.create({
    data: {
      email: "founder@orchestraiq.local",
      name: "OpsPilot Founder"
    }
  });

  const organization = await prisma.organization.create({
    data: {
      name: "Northstar Learning Collective",
      slug: "northstar-learning",
      description: "A demo organization running workshops, bootcamps, and community learning programs.",
      members: {
        create: {
          userId: owner.id,
          role: "OWNER"
        }
      }
    }
  });

  await prisma.event.createMany({
    data: [
      {
        organizationId: organization.id,
        createdById: owner.id,
        title: "AI Career Launch Bootcamp",
        slug: "ai-career-launch-bootcamp",
        description: "A hands-on bootcamp helping students build practical AI projects and portfolio artifacts.",
        type: "BOOTCAMP",
        status: "PLANNING",
        timezone: "Asia/Kolkata",
        startAt: new Date("2026-07-20T04:30:00.000Z"),
        endAt: new Date("2026-07-24T08:30:00.000Z"),
        venue: "Innovation Lab, Bengaluru",
        audience: "Final-year students and early-career professionals",
        objective: "Launch a portfolio-ready AI project and understand modern AI product workflows.",
        capacity: 80,
        priceCents: 499900,
        currency: "INR"
      },
      {
        organizationId: organization.id,
        createdById: owner.id,
        title: "Faculty Enablement Webinar",
        slug: "faculty-enablement-webinar",
        description: "A live webinar for educators planning AI-assisted classroom operations.",
        type: "WEBINAR",
        status: "DRAFT",
        timezone: "Asia/Kolkata",
        startAt: new Date("2026-08-05T10:30:00.000Z"),
        endAt: new Date("2026-08-05T12:00:00.000Z"),
        onlineUrl: "https://meet.example.com/faculty-enablement",
        audience: "College faculty and department coordinators",
        objective: "Introduce AI workflows for planning, registration, communication, and reporting.",
        capacity: 250,
        priceCents: 0,
        currency: "INR"
      }
    ]
  });

  console.log(`Seeded ${organization.name} with demo events.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
