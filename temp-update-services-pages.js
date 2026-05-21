const fs = require('fs');
const path = require('path');

const servicePages = [
  'services/transportation/page.tsx',
  'services/transportation/[mode]/page.tsx',
  'services/project-management/page.tsx',
  'services/project-management/[vertical]/page.tsx'
];

for (const p of servicePages) {
  const filePath = path.join(__dirname, 'src/app/(public)', p);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add notFound import if missing
  if (!content.includes('next/navigation')) {
    content = content.replace('import { safeFetch } from "@/lib/safe-fetch";', 'import { safeFetch } from "@/lib/safe-fetch";\nimport { notFound } from "next/navigation";');
  }

  // Update metadata check
  if (content.includes('if (!service) return {};')) {
    content = content.replace('if (!service) return {};', 'if (!service || !service.isVisible || service.status !== "PUBLISHED") return {};');
  }

  // Update component check
  const componentCheck1 = `if (!service) return <div>Service not found.</div>;`;
  const componentCheck2 = `if (!service) { return <div>Service not found.</div>; }`;
  const componentCheck3 = `if (!service) {\n    return <div>Service not found.</div>;\n  }`;
  
  const newCheck = `if (!service || !service.isVisible || service.status !== "PUBLISHED") {
    notFound();
  }`;

  if (content.includes(componentCheck1)) {
    content = content.replace(componentCheck1, newCheck);
  } else if (content.includes(componentCheck2)) {
    content = content.replace(componentCheck2, newCheck);
  } else if (content.includes(componentCheck3)) {
    content = content.replace(componentCheck3, newCheck);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${p}`);
}
