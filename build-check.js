const { exec } = require('child_process');

console.log('🚀 Starting build process...');

const buildProcess = exec('npx next build', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Build failed:', error.message);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Build warnings:', stderr);
  }
  
  console.log('✅ Build successful!');
  console.log(stdout);
});

buildProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

buildProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Timeout after 2 minutes
setTimeout(() => {
  console.log('⏰ Build timeout - this is normal for large projects');
  buildProcess.kill();
}, 120000);
