const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_FILE = '/Users/verakoroleva/Desktop/идеи/Мое Призвание/фоны, логотип/фон3.png';
const OUTPUT_FILE = path.join(__dirname, '../public/assets/backgrounds/light-bg3.webp');

async function optimizeBackground() {
  console.log('🖼️ Starting background 3 image optimization...');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Background file not found: ${INPUT_FILE}`);
    return;
  }

  try {
    const startSize = fs.statSync(INPUT_FILE).size / (1024 * 1024);
    console.log(`🔍 Original size: ${startSize.toFixed(2)} MB`);

    await sharp(INPUT_FILE)
      .webp({ quality: 85, effort: 6 })
      .toFile(OUTPUT_FILE);

    const endSize = fs.statSync(OUTPUT_FILE).size / (1024 * 1024);
    console.log(`✅ Background 3 optimized successfully!`);
    console.log(`📉 Output size: ${endSize.toFixed(2)} MB`);
  } catch (err) {
    console.error('❌ Error optimizing background:', err);
  }
}

optimizeBackground();
