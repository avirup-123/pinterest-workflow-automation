import { chromium } from 'playwright';
import { CONFIG } from '../config/settings';
import { logger } from './utils/logger';

async function smokeTest(): Promise<void> {
  logger.info('Smoke test: starting Playwright');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    logger.info(`Navigating to ${CONFIG.pinterest.baseUrl}`);
    await page.goto(CONFIG.pinterest.baseUrl, {
      timeout: CONFIG.pinterest.navigationTimeout,
      waitUntil: 'domcontentloaded',
    });

    const title = await page.title();
    logger.success(`Pinterest loaded. Page title: "${title}"`);
    logger.success('Smoke test passed — Playwright can launch and open Pinterest.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Smoke test failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
    logger.info('Browser closed.');
  }
}

smokeTest();
