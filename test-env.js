// Simple Environment File Test
const fs = require('fs');
const path = require('path');

console.log('🔍 Looking for .env.local file...');

// Check current directory
const currentPath = path.join(process.cwd(), '.env.local');
const webAppPath = path.join(process.cwd(), 'apps', 'web', '.env.local');

console.log('Current dir:', process.cwd());
console.log('Looking in:', currentPath);
console.log('Also checking:', webAppPath);

if (fs.existsSync(currentPath)) {
    console.log('✅ Found .env.local in current directory');
    const content = fs.readFileSync(currentPath, 'utf8');
    console.log('Content preview:', content.substring(0, 100) + '...');
} else if (fs.existsSync(webAppPath)) {
    console.log('✅ Found .env.local in apps/web/');
    const content = fs.readFileSync(webAppPath, 'utf8');
    console.log('Content preview:', content.substring(0, 100) + '...');
} else {
    console.log('❌ .env.local not found in either location');
    console.log('📁 Please create the file at: apps/web/.env.local');
    
    // List what's in the web directory
    const webDir = path.join(process.cwd(), 'apps', 'web');
    if (fs.existsSync(webDir)) {
        console.log('\n📂 Contents of apps/web/:');
        const files = fs.readdirSync(webDir);
        files.forEach(file => {
            if (file.startsWith('.env')) {
                console.log(`  ${file} ✅`);
            } else if (file.startsWith('.')) {
                console.log(`  ${file}`);
            }
        });
    }
} 