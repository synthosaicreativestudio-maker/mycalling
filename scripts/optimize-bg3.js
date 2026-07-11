const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_FILE = '/Users/verakoroleva/Desktop/идеи/Мое Призвание/фоны, логотип/фон3.png';
const OUTPUT_FILE = path.join(__dirname, '../public/assets/backgrounds/light-bg3.webp');

async function optimizeBackground() {
  console.log('[BG Optimization] Starting background image optimization...');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`[Error] Background file not found: ${INPUT_FILE}`);
    return;
  }

  try {
    const startSize = fs.statSync(INPUT_FILE).size / (1024 * 1024);
    console.log(`[Info] Original size: ${startSize.toFixed(2)} MB`);

    await sharp(INPUT_FILE)
      .webp({ quality: 80, effort: 6 })
      .toFile(OUTPUT_FILE);

    const endSize = fs.statSync(OUTPUT_FILE).size / (1024 * 1024);
    console.log(`[Success] Background optimized successfully!`);
    console.log(`[Info] Output size: ${endSize.toFixed(2)} MB`);
  } catch (err) {
    console.error('[Error] Error optimizing background:', err);
  }
}

optimizeBackground();
