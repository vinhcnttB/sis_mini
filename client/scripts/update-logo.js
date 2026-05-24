const fs = require('fs');
const path = require('path');

const publicAssets = path.join(__dirname, '..', 'public', 'assets');
const buildAssets = path.join(__dirname, '..', 'build', 'assets');
const srcName = 'new-logo.png';
const targetName = 'logo-khtn.png';

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {}
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

async function main() {
  const srcPath = path.join(publicAssets, srcName);
  if (!fs.existsSync(srcPath)) {
    console.error(`Source image not found: ${srcPath}`);
    console.error('Please place your new logo at client/public/assets/new-logo.png then re-run `npm run update-logo`.');
    process.exit(1);
  }

  ensureDir(publicAssets);
  ensureDir(buildAssets);

  // copy to public assets target
  const publicTarget = path.join(publicAssets, targetName);
  copyFile(srcPath, publicTarget);

  // copy to build assets target (if build exists)
  const buildTarget = path.join(buildAssets, targetName);
  try {
    copyFile(srcPath, buildTarget);
  } catch (e) {
    console.warn('Build assets folder not present or write failed — skipping build copy.');
  }

  // attempt to resize to 192/512 if sharp is available
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Package `sharp` not found. Skipping resize generation. To enable, run `npm install sharp --save-dev` and re-run the script.');
  }

  if (sharp) {
    const sizes = [192, 512];
    for (const s of sizes) {
      const outPublic = path.join(publicAssets, `logo${s}.png`);
      const outBuild = path.join(buildAssets, `logo${s}.png`);
      await sharp(srcPath).resize(s, s).toFile(outPublic);
      console.log(`Generated ${outPublic}`);
      try {
        await sharp(srcPath).resize(s, s).toFile(outBuild);
        console.log(`Generated ${outBuild}`);
      } catch (e) {
        console.warn(`Could not write ${outBuild} — build folder may not exist.`);
      }
    }
  }

  console.log('Logo update complete.');
}

main();
