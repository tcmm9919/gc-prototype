// scripts/shot.mjs — ночной прогон: скриншоты для визуального сравнения с эталоном /cases.
// Usage: node scripts/shot.mjs "<path>" <name>
// Тема: dev по умолчанию тёмный (Revolut Dark). Эталон и цель снимать в ОДНОЙ теме.
import { chromium } from "playwright";

const [, , path, name] = process.argv;
if (!path || !name) {
  console.error('Usage: node scripts/shot.mjs "<path>" <name>');
  process.exit(1);
}
const PORT = process.env.PORT || 3000;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(600); // дать framer-motion доиграть
await page.screenshot({ path: `.night-shots/${name}.png`, fullPage: true });
await browser.close();
console.log(`✓ .night-shots/${name}.png  ←  ${path}`);
