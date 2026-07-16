import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.resolve(process.cwd(), 'logs');

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: string, message: string): string {
  return `[${timestamp()}] [${level}] ${message}`;
}

function writeToFile(entry: string): void {
  ensureLogDir();
  const logFile = path.join(LOG_DIR, `run-${new Date().toISOString().slice(0, 10)}.log`);
  fs.appendFileSync(logFile, entry + '\n', 'utf-8');
}

export const logger = {
  info(message: string): void {
    const entry = formatMessage('INFO', message);
    console.log(entry);
    writeToFile(entry);
  },

  warn(message: string): void {
    const entry = formatMessage('WARN', message);
    console.warn(entry);
    writeToFile(entry);
  },

  error(message: string): void {
    const entry = formatMessage('ERROR', message);
    console.error(entry);
    writeToFile(entry);
  },

  success(message: string): void {
    const entry = formatMessage('SUCCESS', message);
    console.log(entry);
    writeToFile(entry);
  },
};
