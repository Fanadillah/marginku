import 'dotenv/config';
import { chromium, type Page } from 'playwright';
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMO_ROOT = path.resolve(__dirname, '..');
const APP_ROOT = path.resolve(PROMO_ROOT, '..');
const CAPTURES_DIR = path.join(PROMO_ROOT, 'public', 'captures');
const TMP_VIDEO_DIR = path.join(PROMO_ROOT, 'tmp-recordings');
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

async function isServerUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureDevServer(): Promise<ChildProcess | null> {
  if (await isServerUp(APP_URL)) {
    console.log(`[capture] MarginKu dev server already running at ${APP_URL}`);
    return null;
  }

  console.log(`[capture] Starting MarginKu dev server in ${APP_ROOT}...`);
  const isWin = process.platform === 'win32';
  const child = spawn(
    isWin ? 'cmd.exe' : 'npm',
    isWin ? ['/c', 'npm run dev -- --port 5173 --strictPort'] : ['run', 'dev', '--', '--port', '5173', '--strictPort'],
    {
      cwd: APP_ROOT,
      stdio: 'pipe',
      shell: false,
    }
  );

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isServerUp(APP_URL)) {
      console.log(`[capture] MarginKu dev server is ready at ${APP_URL}`);
      return child;
    }
  }

  child.kill();
  throw new Error(`Timed out waiting for MarginKu dev server at ${APP_URL}`);
}

async function waitForUiSettled(page: Page, ms = 500) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

async function fillInput(page: Page, selector: string, value: string, delay = 0) {
  const loc = page.locator(selector);
  await loc.click();
  await loc.fill('');
  if (delay > 0) {
    await loc.pressSequentially(value, { delay });
  } else {
    await loc.fill(value);
  }
}

async function enableDarkMode(page: Page) {
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (!isDark) {
    await page.locator('button[aria-label="Aktifkan mode gelap"]').click();
    await page.waitForTimeout(250);
  }
}

async function run() {
  fs.mkdirSync(CAPTURES_DIR, { recursive: true });
  fs.rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_VIDEO_DIR, { recursive: true });

  const devServer = await ensureDevServer();
  const browser = await chromium.launch({ headless: true });

  try {
    // =========================================================================
    // PART A: High-DPI 3x Retina Screenshots
    // =========================================================================
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await enableDarkMode(page);
    await waitForUiSettled(page, 400);

    // 1) 01_boncos.png — Mode Cek Profit, TikTok Shop, Modal 25000, Kemasan 2500, Harga Jual 32000
    console.log('[capture] 1/5 Capturing 01_boncos.png...');
    await page.getByRole('button', { name: /Cek Profit/i }).click();
    await fillInput(page, '#modal-produk', '25000');
    await fillInput(page, '#biaya-kemasan', '2500');
    await page.getByRole('button', { name: 'TikTok / Tokped' }).click();
    await fillInput(page, '#selling-price', '32000');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await waitForUiSettled(page, 500);
    await page.screenshot({ path: path.join(CAPTURES_DIR, '01_boncos.png') });

    // Switch to Cari Harga Jual for 03_compare_platforms.png
    await page.getByRole('button', { name: /Cari Harga Jual/i }).click();
    await fillInput(page, '#target-profit-rp', '15000');
    await page.getByRole('button', { name: /Akhiran 900/i }).click();
    await waitForUiSettled(page, 400);

    // 3) 03_compare_platforms.png — Modal Bandingkan Semua Platform
    console.log('[capture] 3/5 Capturing 03_compare_platforms.png...');
    await page.getByRole('button', { name: /Bandingkan/i }).click();
    await waitForUiSettled(page, 500);
    await page.screenshot({ path: path.join(CAPTURES_DIR, '03_compare_platforms.png') });

    // Close comparison modal
    const closeBtn = page.locator('button[aria-label="Tutup"], button[aria-label="Tutup modal"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await waitForUiSettled(page, 300);

    // Save 3 realistic products for 05_products_catalog.png
    console.log('[capture] Saving 3 sample products for catalog...');
    // Product 1 (already configured: TikTok / Tokped, Modal 25000, Kemasan 2500, Target 15000, Akhiran 900)
    await page.getByRole('button', { name: /^Simpan$/i }).click();
    await page.locator('input[placeholder*="Kaos Oversize"]').fill('Serum Niacinamide 30ml');
    await page.locator('input[placeholder*="Fashion, Kuliner"]').fill('Skincare');
    await page.getByRole('button', { name: /Simpan Produk/i }).click();
    await waitForUiSettled(page, 300);

    // Product 2: Shopee — Kaos Oversize Cotton 24s
    await page.getByRole('button', { name: /Buat Baru/i }).click();
    await page.getByRole('button', { name: 'Shopee' }).click();
    await fillInput(page, '#modal-produk', '42000');
    await fillInput(page, '#biaya-kemasan', '2500');
    await fillInput(page, '#target-profit-rp', '22000');
    await page.getByRole('button', { name: /Akhiran 900/i }).click();
    await page.getByRole('button', { name: /^Simpan$/i }).click();
    await page.locator('input[placeholder*="Kaos Oversize"]').fill('Kaos Oversize Cotton 24s');
    await page.locator('input[placeholder*="Fashion, Kuliner"]').fill('Fashion');
    await page.getByRole('button', { name: /Simpan Produk/i }).click();
    await waitForUiSettled(page, 300);

    // Product 3: GoFood / Grab — Es Kopi Susu Gula Aren
    await page.getByRole('button', { name: /Buat Baru/i }).click();
    await page.getByRole('button', { name: 'GoFood / Grab' }).click();
    await fillInput(page, '#modal-produk', '7200');
    await fillInput(page, '#biaya-kemasan', '1500');
    await fillInput(page, '#target-profit-rp', '9000');
    await page.getByRole('button', { name: /Akhiran 900/i }).click();
    await page.getByRole('button', { name: /^Simpan$/i }).click();
    await page.locator('input[placeholder*="Kaos Oversize"]').fill('Es Kopi Susu Gula Aren');
    await page.locator('input[placeholder*="Fashion, Kuliner"]').fill('Kuliner');
    await page.getByRole('button', { name: /Simpan Produk/i }).click();
    await waitForUiSettled(page, 300);

    // 4) 04_recipes_hpp.png — Tab Bahan / HPP with Es Kopi Susu 10 Cup (3 ingredients)
    console.log('[capture] 4/5 Capturing 04_recipes_hpp.png...');
    await page.locator('nav[aria-label="Navigasi Utama"]').getByRole('button', { name: /Bahan/i }).click();
    await waitForUiSettled(page, 300);
    await page.getByRole('button', { name: /Resep Baru|Buat Resep Pertama/i }).first().click();
    await waitForUiSettled(page, 300);

    await page.locator('input[placeholder*="Brownies Fudgy"]').fill('Es Kopi Susu 10 Cup');
    // Ingredient 1
    const ingCards = page.locator('form input[placeholder*="Nama bahan"]');
    await ingCards.nth(0).fill('Biji Kopi Espresso');
    const allNumInputs = page.locator('form .rounded-2xl');

    // Fill via helper inside page for clean React state
    const addRowBtn = page.getByRole('button', { name: /Tambah Baris Bahan/i });
    await addRowBtn.click();
    await addRowBtn.click();
    await page.waitForTimeout(200);

    const ingredientBlocks = page.locator('form > div.space-y-2\\.5 > div.rounded-2xl');
    const ingData = [
      { name: 'Biji Kopi Espresso', price: '180000', pkgQty: '1000', unit: 'gr', used: '180' },
      { name: 'Susu UHT Full Cream', price: '19000', pkgQty: '1000', unit: 'ml', used: '1200' },
      { name: 'Gula Aren Cair', price: '35000', pkgQty: '1000', unit: 'ml', used: '250' },
    ];

    for (let i = 0; i < ingData.length; i++) {
      const block = ingredientBlocks.nth(i);
      const d = ingData[i];
      await block.locator('input[placeholder*="Nama bahan"]').fill(d.name);
      // CurrencyInput inside block is first input[inputmode="numeric"]
      await block.locator('input[inputmode="numeric"]').first().fill(d.price);
      // Isi Kemasan & Takaran Dipakai are input[type="number"]
      await block.locator('input[type="number"]').nth(0).fill(d.pkgQty);
      await block.locator('select').selectOption(d.unit);
      await block.locator('input[type="number"]').nth(1).fill(d.used);
    }

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await waitForUiSettled(page, 500);
    await page.screenshot({ path: path.join(CAPTURES_DIR, '04_recipes_hpp.png') });

    // Save recipe so badge count shows nicely
    await page.getByRole('button', { name: /Simpan Resep/i }).click();
    await waitForUiSettled(page, 300);

    // 5) 05_products_catalog.png — Tab Produk with 3 healthy products + Export Excel button
    console.log('[capture] 5/5 Capturing 05_products_catalog.png...');
    await page.locator('nav[aria-label="Navigasi Utama"]').getByRole('button', { name: /Produk/i }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await waitForUiSettled(page, 600);
    await page.screenshot({ path: path.join(CAPTURES_DIR, '05_products_catalog.png') });

    await context.close();

    // =========================================================================
    // PART B: Smooth Screen Recording -> 02_reverse_demo.mp4
    // =========================================================================
    console.log('[capture] 2/5 Recording 02_reverse_demo.mp4...');
    const recContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
      recordVideo: {
        dir: TMP_VIDEO_DIR,
        size: { width: 390, height: 844 },
      },
    });
    const recPage = await recContext.newPage();

    // Pre-seed dark mode before first paint so recording starts sleek in Dark Mode
    await recPage.addInitScript(() => {
      const existing = localStorage.getItem('marginku_app_data_v1');
      if (!existing) {
        localStorage.setItem(
          'marginku_app_data_v1',
          JSON.stringify({
            version: 1,
            theme: 'dark',
            presets: [],
            products: [],
            recipes: [],
          })
        );
      }
    });

    await recPage.goto(APP_URL, { waitUntil: 'networkidle' });
    await enableDarkMode(recPage);
    // Pre-fill modal, kemasan, TikTok / Tokped & sellingPrice 32000 so transition from Boncos -> Sehat looks dramatic!
    await fillInput(recPage, '#modal-produk', '25000');
    await fillInput(recPage, '#biaya-kemasan', '2500');
    await recPage.getByRole('button', { name: 'TikTok / Tokped' }).click();
    await fillInput(recPage, '#selling-price', '32000');
    await recPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
    await waitForUiSettled(recPage, 600);

    // Click Cari Harga Jual
    await recPage.getByRole('button', { name: /Cari Harga Jual/i }).click();
    await recPage.waitForTimeout(450);

    // Smooth scroll down to Card 3 (Target Untung) while sticky ResultCard stays at top!
    await recPage.evaluate(() => {
      const el = document.getElementById('target-profit-rp');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await recPage.waitForTimeout(700);

    // Type 15000 slowly (human speed ~65ms/char)
    await fillInput(recPage, '#target-profit-rp', '15000', 70);
    await recPage.waitForTimeout(550);

    // Click Akhiran 900
    await recPage.getByRole('button', { name: /Akhiran 900/i }).click();
    await recPage.waitForTimeout(600);

    // Gentle scroll back up slightly so sticky result card + breakdown bar shine
    await recPage.evaluate(() => window.scrollTo({ top: 120, behavior: 'smooth' }));
    await recPage.waitForTimeout(1600);

    const videoObj = recPage.video();
    await recContext.close();

    if (!videoObj) {
      throw new Error('Playwright did not produce a recorded video.');
    }
    const rawWebmPath = await videoObj.path();
    const outMp4Path = path.join(CAPTURES_DIR, '02_reverse_demo.mp4');

    // Trim first 0.5s setup flash if needed? Actually setup took ~1s before Cari Harga Jual, let's check or trim cleanly:
    // Better: keep from t=0.6s so it starts right on the clean dark Boncos screen before clicking Cari Harga Jual!
    console.log(`[capture] Converting ${path.basename(rawWebmPath)} -> 02_reverse_demo.mp4 via ffmpeg...`);
    execSync(
      `ffmpeg -y -ss 0.6 -i "${rawWebmPath}" -vf "setpts=1.55*PTS,scale=780:1688:flags=lanczos" -c:v libx264 -g 1 -bf 0 -pix_fmt yuv420p -r 30 -crf 18 -movflags +faststart "${outMp4Path}"`,
      { stdio: 'inherit' }
    );

    // Verify all files exist and are non-empty
    const expected = [
      '01_boncos.png',
      '02_reverse_demo.mp4',
      '03_compare_platforms.png',
      '04_recipes_hpp.png',
      '05_products_catalog.png',
    ];
    for (const file of expected) {
      const p = path.join(CAPTURES_DIR, file);
      const stat = fs.statSync(p);
      if (stat.size < 1000) {
        throw new Error(`Captured file ${file} looks corrupted/too small (${stat.size} bytes)`);
      }
      console.log(`[capture] Verified ${file} (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  } finally {
    await browser.close();
    fs.rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
    if (devServer) {
      console.log('[capture] Stopping temporary MarginKu dev server...');
      if (process.platform === 'win32' && devServer.pid) {
        try {
          execSync(`taskkill /PID ${devServer.pid} /T /F`, { stdio: 'ignore' });
        } catch {
          devServer.kill();
        }
      } else {
        devServer.kill();
      }
    }
  }
}

run().catch((err) => {
  console.error('[capture] Error:', err);
  process.exit(1);
});
