import * as nodemailer from 'nodemailer';
import { CONFIG } from '../../config/settings';
import { logger } from '../utils/logger';

export async function sendReport(reportBody: string): Promise<boolean> {
  const { host, port, secure, user, pass, recipient, subject } = CONFIG.email;

  if (!user || !pass) {
    logger.error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const mailOptions = {
    from: user,
    to: recipient,
    subject,
    text: reportBody,
  };

  for (let attempt = 0; attempt <= CONFIG.retries.emailMaxRetries; attempt++) {
    try {
      logger.info(`Sending email (attempt ${attempt + 1})...`);
      await transporter.sendMail(mailOptions);
      logger.success(`Email sent to ${recipient}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Email attempt ${attempt + 1} failed: ${message}`);
      if (attempt < CONFIG.retries.emailMaxRetries) {
        logger.info('Retrying...');
      }
    }
  }

  logger.error('All email send attempts failed.');
  return false;
}
