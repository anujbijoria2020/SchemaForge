const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/generated');
const dest = path.join(__dirname, '../dist/generated');

try {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log('✓ Successfully copied generated Prisma client to dist');
  } else {
    console.warn('⚠ Source generated directory not found:', src);
  }
} catch (err) {
  console.error('✗ Failed to copy generated directory:', err);
  process.exit(1);
}
