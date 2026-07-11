const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '../public/assets/raw');
const OUTPUT_DIR = path.join(__dirname, '../public/assets/webp');
const TARGET_SIZE = 512;
const QUALITY = 82;

async function optimizeImages() {
  console.log('[Image Optimization] Starting image optimization pipeline...');

  // Создаем папки, если их нет
  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`[Folder] Input directory created: ${INPUT_DIR}. Put raw AI images there.`);
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR).filter(file => {
    return /\.(png|jpe?g|webp)$/i.test(file);
  });

  if (files.length === 0) {
    console.log('[Info] No raw images found in public/assets/raw. Skipping optimization.');
    return;
  }

  console.log(`[Info] Found ${files.length} images to process...`);
  let errorsCount = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const filenameNoExt = path.parse(file).name;
    const outputPath = path.join(OUTPUT_DIR, `${filenameNoExt}.webp`);

    try {
      // 1. Чтение метаданных для валидации разрешения
      const metadata = await sharp(inputPath).metadata();
      
      if (metadata.width !== TARGET_SIZE || metadata.height !== TARGET_SIZE) {
        console.error(`[Error] Validation Error: File ${file} has size ${metadata.width}x${metadata.height}. Strictly ${TARGET_SIZE}x${TARGET_SIZE} is required!`);
        errorsCount++;
        continue;
      }

      // 2. Сжатие в WebP с качеством 82, удаление EXIF метаданных
      await sharp(inputPath)
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      console.log(`[Success] Optimized: ${file} -> ${filenameNoExt}.webp (${TARGET_SIZE}x${TARGET_SIZE}, quality=${QUALITY})`);
    } catch (err) {
      console.error(`[Error] Error processing file ${file}:`, err);
      errorsCount++;
    }
  }

  if (errorsCount > 0) {
    console.error(`[Failure] Build Failed: ${errorsCount} image validation/processing errors occurred!`);
    process.exit(1);
  } else {
    console.log('[Success] All images optimized successfully.');
  }
}

optimizeImages();
