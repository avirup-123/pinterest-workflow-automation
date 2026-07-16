import * as fs from 'fs';
import * as path from 'path';
import { PinDetails } from '../scraper/types';
import { logger } from '../utils/logger';

const SEPARATOR = '====================================================';
const DIVIDER = '---';

export function generateReport(keyword: string, pins: PinDetails[]): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];

  lines.push(SEPARATOR);
  lines.push('');
  lines.push('PINTEREST DAILY REPORT');
  lines.push('');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`Date: ${date}`);
  lines.push('');
  lines.push(`Keyword: ${keyword}`);
  lines.push('');
  lines.push(`Total Posts Analyzed: ${pins.length}`);
  lines.push('');

  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    lines.push(SEPARATOR);
    lines.push('');
    lines.push(`POST #${i + 1}`);
    lines.push('');
    lines.push(SEPARATOR);
    lines.push('');
    lines.push(`Title: ${pin.title}`);
    lines.push('');
    lines.push(`Pinterest URL: ${pin.url}`);
    lines.push('');
    lines.push(`Creator: ${pin.creator}`);
    lines.push('');
    lines.push(`Board: ${pin.board}`);
    lines.push('');
    lines.push(`Likes: ${pin.likes}`);
    lines.push('');
    lines.push(`Comments: ${pin.comments}`);
    lines.push('');
    lines.push(`Saves: ${pin.saves}`);
    lines.push('');
    lines.push(`Shares: ${pin.shares}`);
    lines.push('');

    if (i < pins.length - 1) {
      lines.push(DIVIDER);
      lines.push('');
    }
  }

  lines.push(SEPARATOR);
  lines.push('');
  lines.push('END OF REPORT');
  lines.push('');
  lines.push(SEPARATOR);

  return lines.join('\n');
}

export function saveReport(keyword: string, report: string): string {
  const reportsDir = path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const slug = keyword.toLowerCase().replace(/\s+/g, '-');
  const filename = `${date}-${slug}.txt`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, report, 'utf-8');
  logger.success(`Report saved to ${filepath}`);
  return filepath;
}
