import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { CONFIG } from '../../config/settings';
import { logger } from '../utils/logger';
import { PinSummary, PinDetails } from './types';

const NOT_VISIBLE = 'Not publicly visible';

async function dismissLoginModal(page: Page): Promise<void> {
  try {
    const closeButton = page.locator('[aria-label="close"], [data-test-id="full-page-signup-close-button"], button:has-text("Not now")');
    const visible = await closeButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await closeButton.first().click();
      logger.info('Dismissed Pinterest login modal');
      await page.waitForTimeout(1000);
    }
  } catch {
    // No modal present — continue
  }
}

async function createBrowser(): Promise<{ browser: Browser; context: BrowserContext }> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  return { browser, context };
}

export async function searchPins(keyword: string): Promise<PinSummary[]> {
  logger.info(`Searching Pinterest for: "${keyword}"`);
  const { browser, context } = await createBrowser();
  const page = await context.newPage();
  const results: PinSummary[] = [];

  try {
    const searchUrl = `${CONFIG.pinterest.searchUrl}${encodeURIComponent(keyword)}`;
    logger.info(`Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, {
      timeout: CONFIG.pinterest.navigationTimeout,
      waitUntil: 'domcontentloaded',
    });

    await page.waitForTimeout(3000);
    await dismissLoginModal(page);

    // Scroll to load more pins
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(1500);
      await dismissLoginModal(page);
    }

    // Collect pin links from search results
    const pinLinks = await page.locator('a[href*="/pin/"]').all();
    logger.info(`Found ${pinLinks.length} pin links on search page`);

    const seenUrls = new Set<string>();

    for (const link of pinLinks) {
      if (results.length >= CONFIG.pinterest.postsToCollect) break;

      try {
        const href = await link.getAttribute('href');
        if (!href || !href.includes('/pin/')) continue;

        const fullUrl = href.startsWith('http') ? href : `https://www.pinterest.com${href}`;

        // Deduplicate by pin ID
        const pinIdMatch = fullUrl.match(/\/pin\/(\d+)/);
        if (!pinIdMatch) continue;
        const pinId = pinIdMatch[1];
        if (seenUrls.has(pinId)) continue;
        seenUrls.add(pinId);

        // Try to get title from aria-label or nearby text
        let title = await link.getAttribute('aria-label') || '';
        if (!title) {
          const img = link.locator('img').first();
          title = await img.getAttribute('alt').catch(() => '') || '';
        }
        if (!title) {
          title = NOT_VISIBLE;
        }

        results.push({ title, url: fullUrl });
        logger.info(`Collected pin #${results.length}: ${fullUrl}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn(`Failed to extract a pin link: ${msg}`);
      }
    }

    if (results.length === 0) {
      logger.warn('No pins collected from search results. Pinterest may have blocked the request.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Search failed: ${message}`);
  } finally {
    await browser.close();
    logger.info('Search browser closed.');
  }

  return results;
}

export async function extractPinDetails(pins: PinSummary[]): Promise<PinDetails[]> {
  logger.info(`Extracting details for ${pins.length} pins`);
  const { browser, context } = await createBrowser();
  const results: PinDetails[] = [];

  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    const page = await context.newPage();

    try {
      logger.info(`Opening pin #${i + 1}: ${pin.url}`);
      await page.goto(pin.url, {
        timeout: CONFIG.pinterest.navigationTimeout,
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(3000);
      await dismissLoginModal(page);

      const details = await extractFieldsFromPage(page, pin);
      results.push(details);
      logger.success(`Extracted details for pin #${i + 1}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to extract pin #${i + 1}: ${message}`);
      results.push({
        title: pin.title || NOT_VISIBLE,
        url: pin.url,
        creator: NOT_VISIBLE,
        board: NOT_VISIBLE,
        likes: NOT_VISIBLE,
        comments: NOT_VISIBLE,
        saves: NOT_VISIBLE,
        shares: NOT_VISIBLE,
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  logger.info('Detail extraction browser closed.');
  return results;
}

async function extractFieldsFromPage(page: Page, pin: PinSummary): Promise<PinDetails> {
  const safeText = async (selectors: string[]): Promise<string> => {
    for (const selector of selectors) {
      try {
        const el = page.locator(selector).first();
        const visible = await el.isVisible({ timeout: 2000 }).catch(() => false);
        if (visible) {
          const text = await el.innerText({ timeout: 3000 });
          if (text && text.trim()) return text.trim();
        }
      } catch {
        // Try next selector
      }
    }
    return NOT_VISIBLE;
  };

  const title = await safeText([
    'h1',
    '[data-test-id="pin-title"]',
    '[data-test-id="truncated-description"]',
    'div[data-test-id="desc"]',
  ]) || pin.title || NOT_VISIBLE;

  const creator = await safeText([
    '[data-test-id="pin-creator-profile-name"]',
    '[data-test-id="creator-profile-name"]',
    'a[href*="/"] span[style]',
    '[data-test-id="pinner-name"]',
  ]);

  const board = await safeText([
    '[data-test-id="board-name"]',
    'a[href*="/board/"]',
    '[data-test-id="board-link"]',
  ]);

  const likes = await safeText([
    '[data-test-id="pin-reaction-count"]',
    'button[aria-label*="like"] span',
    'button[aria-label*="react"] span',
  ]);

  const comments = await safeText([
    '[data-test-id="pin-comment-count"]',
    'button[aria-label*="comment"] span',
  ]);

  const saves = await safeText([
    '[data-test-id="pin-save-count"]',
  ]);

  const shares = await safeText([
    '[data-test-id="pin-share-count"]',
    'button[aria-label*="share"] span',
  ]);

  return {
    title,
    url: pin.url,
    creator,
    board,
    likes,
    comments,
    saves,
    shares,
  };
}
