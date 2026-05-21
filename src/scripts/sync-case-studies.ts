import { prisma } from "../lib/db";
import fs from "fs";
import path from "path";

const ARCHIVE_PATH = path.join(process.cwd(), "..", "Archive", "html- Version", "Case-Studies");

async function syncCaseStudies() {
  const files = fs.readdirSync(ARCHIVE_PATH).filter(f => f.endsWith(".html"));
  console.log(`Found ${files.length} case study files.`);

  for (const file of files) {
    const filePath = path.join(ARCHIVE_PATH, file);
    const html = fs.readFileSync(filePath, "utf-8");

    // Simple Regex Parsers
    const titleMatch = html.match(/<h2[^>]*>(.*?)<\/h2>/);
    const industryMatch = html.match(/<strong>Industry:<\/strong>\s*(.*?)<\/span>/);
    const challengeMatch = html.match(/The Challenge<\/h3>\s*<\/div>\s*<p[^>]*>(.*?)<\/p>/s);
    const solutionMatch = html.match(/Our Solution<\/h3>\s*<\/div>\s*<p[^>]*>(.*?)<\/p>/s);
    const resultMatch = html.match(/The Result<\/h3>\s*<\/div>\s*<p[^>]*>(.*?)<\/p>/s);

    const title = titleMatch ? titleMatch[1].trim() : file.replace(".html", "").replace(/-/g, " ");
    const industry = industryMatch ? industryMatch[1].trim() : "Logistics";
    const challenge = challengeMatch ? challengeMatch[1].trim() : "";
    const solution = solutionMatch ? solutionMatch[1].trim() : "";
    const result = resultMatch ? resultMatch[1].trim() : "";
    const slug = file.replace(".html", "");

    console.log(`Syncing: ${title} (${slug})`);

    await prisma.caseStudy.upsert({
      where: { slug },
      update: {
        title,
        industry,
        challenge,
        solution,
        result,
        status: "PUBLISHED"
      },
      create: {
        title,
        slug,
        industry,
        challenge,
        solution,
        result,
        status: "PUBLISHED"
      }
    });
  }

  console.log("Case studies sync completed.");
}

syncCaseStudies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
