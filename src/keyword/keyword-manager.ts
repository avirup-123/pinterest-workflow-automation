import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from '../../config/settings';
import { logger } from '../utils/logger';

function readLines(filePath: string): string[] {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    return [];
  }
  return fs.readFileSync(resolved, 'utf-8').split('\n');
}

function parseKeywords(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) {
      logger.warn(`Duplicate keyword skipped: "${trimmed}"`);
      continue;
    }
    seen.add(lower);
    result.push(trimmed);
  }

  return result;
}

function getProcessedKeywords(): Set<string> {
  const lines = readLines(CONFIG.paths.processedKeywords);
  const set = new Set<string>();
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed !== '') {
      set.add(trimmed.toLowerCase());
    }
  }
  return set;
}

export function getNextKeyword(): string | null {
  const lines = readLines(CONFIG.paths.keywords);
  const keywords = parseKeywords(lines);
  const processed = getProcessedKeywords();

  if (keywords.length === 0) {
    logger.info('No keywords found in keywords.txt');
    return null;
  }

  for (const keyword of keywords) {
    if (!processed.has(keyword.toLowerCase())) {
      logger.info(`Next keyword selected: "${keyword}"`);
      return keyword;
    }
  }

  logger.info('All keywords have been processed. No keywords remaining.');
  return null;
}

export function markKeywordProcessed(keyword: string): void {
  const keywordsPath = path.resolve(process.cwd(), CONFIG.paths.keywords);
  const processedPath = path.resolve(process.cwd(), CONFIG.paths.processedKeywords);

  // Remove from keywords.txt
  const lines = readLines(CONFIG.paths.keywords);
  const remaining = lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.toLowerCase() !== keyword.toLowerCase();
  });
  fs.writeFileSync(keywordsPath, remaining.join('\n'), 'utf-8');
  logger.success(`Removed "${keyword}" from keywords.txt`);

  // Append to processed_keywords.txt
  const separator = fs.existsSync(processedPath) && fs.readFileSync(processedPath, 'utf-8').length > 0 ? '\n' : '';
  fs.appendFileSync(processedPath, separator + keyword, 'utf-8');
  logger.success(`Appended "${keyword}" to processed_keywords.txt`);
}
