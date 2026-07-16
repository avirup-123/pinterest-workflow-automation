import { getNextKeyword, markKeywordProcessed } from './keyword/keyword-manager';
import { searchPins, extractPinDetails } from './scraper/pinterest-scraper';
import { generateReport, saveReport } from './report/report-generator';
import { sendReport } from './email/email-sender';
import { logger } from './utils/logger';
import * as fs from 'fs';
import * as path from 'path';

async function main(): Promise<void> {
  logger.info('========== Pinterest Intelligence Automation — Start ==========');

  const keyword = getNextKeyword();
  if (!keyword) {
    logger.info('No keywords remaining. Exiting successfully.');
    return;
  }

  logger.info(`Processing keyword: "${keyword}"`);

  // Step 1: Search Pinterest
  const pins = await searchPins(keyword);
  if (pins.length === 0) {
    logger.error('No pins found. Exiting without sending report.');
    process.exitCode = 1;
    return;
  }

  // Step 2: Extract details
  const details = await extractPinDetails(pins);

  // Step 3: Save raw data
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  fs.writeFileSync(
    path.join(dataDir, `${date}-${slug}.json`),
    JSON.stringify(details, null, 2),
    'utf-8',
  );

  // Step 4: Generate report
  const report = generateReport(keyword, details);
  saveReport(keyword, report);
  logger.info('Report generated.');

  // Step 5: Email report
  const emailSent = await sendReport(report);

  // Step 6: Update keyword queue only on successful email
  if (emailSent) {
    markKeywordProcessed(keyword);
    logger.success('Keyword queue updated.');
  } else {
    logger.warn('Email failed — keyword NOT marked as processed so it will retry next run.');
    process.exitCode = 1;
  }

  logger.info('========== Pinterest Intelligence Automation — Finish ==========');
}

main();
