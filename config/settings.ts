export const CONFIG = {
  pinterest: {
    baseUrl: 'https://www.pinterest.com',
    searchUrl: 'https://www.pinterest.com/search/pins/?q=',
    postsToCollect: 5,
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    recipient: 'avirupsarker1999@gmail.com',
    subject: 'Pinterest Infographic Pins',
  },
  paths: {
    keywords: 'keywords.txt',
    processedKeywords: 'processed_keywords.txt',
    dataDir: 'data',
    logsDir: 'logs',
    reportsDir: 'reports',
  },
  retries: {
    emailMaxRetries: 1,
    scrapeMaxRetries: 2,
  },
} as const;
