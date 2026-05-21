const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

console.log("Initializing database client...");
const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function main() {
  console.log("=== DIAGNOSING DASHBOARD QUERIES ===");
  
  const tasks = [
    {
      name: "prisma.page.count()",
      fn: () => prisma.page.count()
    },
    {
      name: "prisma.service.count()",
      fn: () => prisma.service.count()
    },
    {
      name: "prisma.blogPost.count()",
      fn: () => prisma.blogPost.count()
    },
    {
      name: "prisma.caseStudy.count()",
      fn: () => prisma.caseStudy.count()
    },
    {
      name: "prisma.contactSubmission.count() (Leads Today)",
      fn: () => prisma.contactSubmission.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      })
    },
    {
      name: "prisma.contactSubmission.findMany() (Recent)",
      fn: () => prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      })
    },
    {
      name: "prisma.brochureDownload.findMany() (Recent)",
      fn: () => prisma.brochureDownload.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      })
    }
  ];

  let anyFailed = false;

  for (const task of tasks) {
    try {
      console.log(`Running ${task.name}...`);
      const start = Date.now();
      const result = await task.fn();
      console.log(`✅ Success in ${Date.now() - start}ms. Result:`, Array.isArray(result) ? `[Array of ${result.length} items]` : result);
    } catch (err) {
      anyFailed = true;
      console.error(`\n❌ FAILED: ${task.name}`);
      console.error("Error Code:", err.code);
      console.error("Error Message:", err.message);
      console.error("Stack Trace:", err.stack);
      console.error("--------------------------------------------------\n");
    }
  }

  if (anyFailed) {
    console.log("=== DIAGNOSIS COMPLETE: GAPS DETECTED ===");
    console.log("One or more queries failed. Please check if you need to run Prisma migrations or if the database is synchronized.");
  } else {
    console.log("=== DIAGNOSIS COMPLETE: ALL QUERIES PASSED ===");
    console.log("All database queries executed successfully without errors.");
  }
}

main()
  .catch(err => {
    console.error("Fatal Error running diagnostics:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
