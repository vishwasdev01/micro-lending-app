#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Micro Lending App...\n');

// Create .env.local file if it doesn't exist
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# Database
MONGODB_URI="mongodb://localhost:27017/micro-lending-app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateSecret()}"

# Payment Gateway (for future integration)
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('⚠️  .env.local already exists, skipping...');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Check MongoDB connection
console.log('\n🗄️  Checking MongoDB connection...');
console.log('⚠️  Make sure MongoDB is running on your system');
console.log('   - Local: mongodb://localhost:27017');
console.log('   - Atlas: Update MONGODB_URI in .env.local');

// Note: We'll seed the database after starting the server
console.log('\n📝 Next steps:');
console.log('1. Start MongoDB (if not already running)');
console.log('2. Run: npm run dev');
console.log('3. In another terminal, run: npm run seed');

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('\n👤 Test accounts:');
console.log('Finance Manager: finance@company.com / password123');
console.log('Customer: john@example.com / password123');
console.log('Customer: jane@example.com / password123');
console.log('Customer: bob@example.com / password123');

function generateSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}
