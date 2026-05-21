const fs = require('fs');
const path = require('path');

const publicPages = [
  'about/page.tsx',
  'associations/page.tsx',
  'contact/page.tsx',
  'privacy-policy/page.tsx',
  'corporate-chronicles/page.tsx',
  'blog/page.tsx',
  'case-studies/page.tsx',
  'careers/page.tsx',
  'terms-and-conditions/page.tsx',
  'milestones/page.tsx',
  'services/page.tsx',
  'return-refund-policy/page.tsx'
];

for (const p of publicPages) {
  const filePath = path.join(__dirname, 'src/app/(public)', p);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add notFound import if missing
  if (!content.includes('next/navigation')) {
    content = content.replace('import { safeFetch } from "@/lib/safe-fetch";', 'import { safeFetch } from "@/lib/safe-fetch";\nimport { notFound } from "next/navigation";');
  }

  // Update metadata check
  if (content.includes('if (!page) return {};')) {
    content = content.replace('if (!page) return {};', 'if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};');
  }

  // Update component check
  const componentCheck1 = `if (!page) {\n    return <div>Page not found. Please run seed.</div>;\n  }`;
  const componentCheck2 = `if (!page) return <div>Page not found. Please run seed.</div>;`;
  
  const newCheck = `if (!page || !page.isVisible || page.status !== "PUBLISHED") {
    notFound();
  }`;

  if (content.includes(componentCheck1)) {
    content = content.replace(componentCheck1, newCheck);
  } else if (content.includes(componentCheck2)) {
    content = content.replace(componentCheck2, newCheck);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${p}`);
}
