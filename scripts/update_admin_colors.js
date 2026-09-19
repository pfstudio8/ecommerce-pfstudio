const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'src', 'app', 'admin');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(adminDir);

const replacements = [
    { regex: /bg-\[#0a0a0a\]/g, replace: 'bg-background' },
    { regex: /bg-\[#12130f\]\/60/g, replace: 'bg-surface-container/60' },
    { regex: /bg-\[#12130f\]/g, replace: 'bg-surface-container' },
    { regex: /bg-\[#1c1d18\]\/60/g, replace: 'bg-surface-container-low/60' },
    { regex: /bg-\[#1c1d18\]/g, replace: 'bg-surface-container-low' },
    { regex: /bg-\[#252620\]\/50/g, replace: 'bg-surface-container-high/50' },
    { regex: /bg-\[#252620\]/g, replace: 'bg-surface-container-high' },
    { regex: /border-\[#2d2e26\]/g, replace: 'border-outline-variant' },
    { regex: /border-\[#242520\]/g, replace: 'border-surface-container-highest' },
    { regex: /text-white/g, replace: 'text-on-surface' },
    { regex: /text-gray-200/g, replace: 'text-on-surface' },
    { regex: /text-gray-300/g, replace: 'text-on-surface-variant' },
    { regex: /text-gray-400/g, replace: 'text-outline' },
    { regex: /text-gray-500/g, replace: 'text-outline-variant' },
    { regex: /bg-zinc-900/g, replace: 'bg-surface-container' },
    { regex: /border-zinc-800/g, replace: 'border-outline-variant' },
    { regex: /bg-main text-black/g, replace: 'bg-tertiary-container text-on-tertiary-container' },
    { regex: /bg-main text-white/g, replace: 'bg-tertiary-container text-on-tertiary-container' },
    { regex: /bg-main/g, replace: 'bg-tertiary-container' },
    { regex: /text-main/g, replace: 'text-tertiary-container' },
    { regex: /hover:bg-emerald-400/g, replace: 'hover:scale-[1.02]' },
    { regex: /hover:bg-orange-400/g, replace: 'hover:scale-[1.02]' },
    { regex: /shadow-\[0_0_15px_rgba\(0,168,122,0\.2\)\]/g, replace: 'shadow-md shadow-tertiary-container/20' },
    { regex: /shadow-main\/20/g, replace: 'shadow-tertiary-container/20' },
    { regex: /shadow-main\/30/g, replace: 'shadow-tertiary-container/30' },
    { regex: /focus:border-main/g, replace: 'focus:border-tertiary-container' },
    { regex: /focus:ring-main/g, replace: 'focus:ring-tertiary-container' },
    { regex: /accent-main/g, replace: 'accent-tertiary-container' },
    { regex: /text-\(--foreground\)/g, replace: 'text-on-surface' } // Fix typo in [id]/page.tsx
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Don't modify layout.tsx or actions.ts aggressively if not needed, but they should be fine
    if (file.includes('layout.tsx')) return;
    
    replacements.forEach(r => {
        content = content.replace(r.regex, r.replace);
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
