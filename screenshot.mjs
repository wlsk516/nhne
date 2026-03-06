import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Find next available screenshot number
const existing = fs.readdirSync(screenshotsDir)
  .filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
  .map(f => {
    const match = f.match(/^screenshot-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });

const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
const filename = label
  ? `screenshot-${nextNum}-${label}.png`
  : `screenshot-${nextNum}.png`;
const outputPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2' });
await page.screenshot({ path: outputPath, fullPage: true });

await browser.close();

console.log(`Screenshot saved: temporary screenshots/${filename}`);
