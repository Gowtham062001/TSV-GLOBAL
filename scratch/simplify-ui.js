const fs = require('fs');
const path = require('path');
const glob = require('glob');

const adminDir = path.join(__dirname, '../src/app/(admin)/admin');

const filesToProcess = [
  'process/page.tsx',
  'leads/page.tsx',
  'brochure/page.tsx',
  'settings/page.tsx',
  'services/page.tsx',
  'case-studies/page.tsx',
  'blog/page.tsx',
  'gallery/page.tsx',
  'pages/page.tsx',
];

const replacements = [
  // Fonts
  { regex: /font-\['Outfit'\]/g, replacement: '' },
  { regex: /font-\['Inter'\]/g, replacement: '' },
  { regex: /font-outfit/g, replacement: '' }, // handled by layout CSS
  
  // Font sizes
  { regex: /text-\[9px\]/g, replacement: 'text-xs' },
  { regex: /text-\[10px\]/g, replacement: 'text-xs' },
  { regex: /text-\[11px\]/g, replacement: 'text-sm' },
  
  // Tracking
  { regex: /tracking-\[0\.15em\]/g, replacement: 'tracking-wider' },
  { regex: /tracking-\[0\.2em\]/g, replacement: 'tracking-wider' },
  { regex: /tracking-\[0\.25em\]/g, replacement: 'tracking-widest' },
  { regex: /tracking-\[0\.3em\]/g, replacement: 'tracking-widest' },
  
  // Padding & Border Radius
  { regex: /p-10/g, replacement: 'p-6' },
  { regex: /rounded-\[2\.5rem\]/g, replacement: 'rounded-xl' },
  { regex: /rounded-\[3rem\]/g, replacement: 'rounded-2xl' },
  { regex: /rounded-\[1\.5rem\]/g, replacement: 'rounded-lg' },
  { regex: /rounded-\[2rem\]/g, replacement: 'rounded-xl' },
  
  // Shadows
  { regex: /shadow-\[0_8px_30px_rgb\(0,0,0,0\.02\)\]/g, replacement: 'shadow-sm' },
  
  // Extraneous decorative elements and durations
  { regex: /duration-1000/g, replacement: 'duration-300' },
  { regex: /duration-700/g, replacement: 'duration-300' },
  { regex: /group-hover:scale-110/g, replacement: '' },
  { regex: /group-hover:scale-150/g, replacement: '' },
];

filesToProcess.forEach(file => {
  const filePath = path.join(adminDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply all replacements
    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    // Cleanup extra spaces in classNames
    content = content.replace(/className="([^"]+)"/g, (match, p1) => {
      return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${file}`);
  } else {
    console.log(`Not found: ${file}`);
  }
});
