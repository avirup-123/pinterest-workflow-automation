# Pinterest Intelligence Automation

Automatically collects the top Pinterest posts for a keyword every day and emails a plain-text report.

## Status

**All milestones complete** — fully functional with GitHub Actions.

## Tech Stack

- TypeScript
- Node.js
- Playwright (Chromium)
- Nodemailer
- GitHub Actions

## Project Structure

```
pinterest-workflow-automation/
├── config/
│   └── settings.ts          # App configuration
├── data/                    # Scraped data (JSON, gitignored)
├── logs/                    # Run logs (gitignored)
├── reports/                 # Generated reports (gitignored)
├── src/
│   ├── scraper/
│   │   ├── types.ts         # PinSummary & PinDetails interfaces
│   │   └── pinterest-scraper.ts  # Search + detail extraction
│   ├── report/
│   │   └── report-generator.ts   # Plain text report builder
│   ├── email/
│   │   └── email-sender.ts       # Nodemailer with retry
│   ├── keyword/
│   │   └── keyword-manager.ts    # Keyword queue read/write
│   ├── utils/
│   │   └── logger.ts             # Timestamped file + console logger
│   ├── index.ts                  # Main entry point
│   └── smoke-test.ts             # Playwright verification
├── .github/workflows/
│   └── pinterest-daily.yml       # Daily cron workflow
├── keywords.txt                  # Keyword queue (edit this!)
├── processed_keywords.txt        # Completed keywords
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install
npx playwright install chromium
```

## Running Locally

### Smoke Test

```bash
npm run smoke-test
```

### Full Run

```bash
EMAIL_USER=you@gmail.com EMAIL_PASS=your-app-password npm start
```

On Windows PowerShell:

```powershell
$env:EMAIL_USER="you@gmail.com"
$env:EMAIL_PASS="your-app-password"
npm start
```

## Running with GitHub Actions

The workflow runs daily at 8:00 AM UTC via `.github/workflows/pinterest-daily.yml`.

It can also be triggered manually from the Actions tab ("Run workflow").

After each successful run, the workflow commits the updated `keywords.txt` and `processed_keywords.txt` back to the repo.

## GitHub Secrets Setup

Go to your repo > Settings > Secrets and variables > Actions > New repository secret.

| Secret       | Description                              | Required |
|-------------|------------------------------------------|----------|
| `EMAIL_USER` | SMTP username (e.g. your Gmail address) | Yes      |
| `EMAIL_PASS` | SMTP app password                       | Yes      |
| `EMAIL_HOST` | SMTP host (default: `smtp.gmail.com`)   | No       |
| `EMAIL_PORT` | SMTP port (default: `587`)              | No       |

### Getting a Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS`

## How to Add Keywords

Edit `keywords.txt` — one keyword per line:

```
Japan packing list
Europe packing list
Beach packing list
```

- Blank lines are ignored
- Lines starting with `#` are comments
- Duplicates are skipped automatically
- Leading/trailing whitespace is trimmed

Push the file to GitHub and the next scheduled run will pick up the first unprocessed keyword.

## How the Keyword Queue Works

1. Each run reads the first keyword from `keywords.txt`
2. Searches Pinterest, extracts top 5 pins, emails the report
3. On success: removes the keyword from `keywords.txt`, appends it to `processed_keywords.txt`
4. Commits and pushes the queue update
5. Next run picks the next keyword

If `keywords.txt` is empty, the workflow exits successfully without sending email.

If email fails, the keyword stays in the queue so it retries on the next run.

## Troubleshooting

- **Playwright fails to launch**: Run `npx playwright install --with-deps chromium`
- **Pinterest blocks access**: The scraper uses realistic browser settings but Pinterest may block headless browsers on some networks/IPs
- **Email not sending**: Verify `EMAIL_USER` and `EMAIL_PASS` are set. For Gmail, use an App Password (not your regular password)
- **No keywords remaining**: Add new keywords to `keywords.txt` and push to GitHub
- **Metrics show "Not publicly visible"**: This is expected — Pinterest does not expose likes, saves, shares, or comment counts to logged-out users
