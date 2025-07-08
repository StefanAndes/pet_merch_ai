// Quick Supabase Connection Test
// Run: node test-supabase.js

const https = require('https');

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps', 'web', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing Supabase credentials in .env.local');
  console.log('Please add:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_ANON_KEY=eyJ...');
  process.exit(1);
}

console.log('🧪 Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);

// Test query to designs table
const postData = JSON.stringify({
  query: 'SELECT COUNT(*) as count FROM designs'
});

const options = {
  hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: '/rest/v1/rpc/execute_sql',
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Simple table check
const simpleOptions = {
  hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
  port: 443,
  path: '/rest/v1/designs?select=count',
  method: 'GET',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(simpleOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Database connection successful!');
      console.log('📊 Status:', res.statusCode);
      console.log('🗃️ Data:', data ? 'Tables accessible' : 'No data yet');
      console.log('\n🎉 Supabase is ready for Pet AI!');
      console.log('\n🚀 Next steps:');
      console.log('1. Your database is set up correctly');
      console.log('2. App will use Supabase for real data storage');
      console.log('3. Still in Demo Mode (no RunPod/S3 yet)');
      console.log('4. Upload images to test database integration!');
    } else {
      console.log('❌ Connection failed');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection error:', e.message);
  console.log('\n🔧 Check:');
  console.log('1. SUPABASE_URL is correct');
  console.log('2. SUPABASE_ANON_KEY is valid');
  console.log('3. Database tables were created');
});

req.end(); 