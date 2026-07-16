# ROLE

You are a senior software engineer with extensive experience building production-grade browser automation systems using TypeScript, Node.js, Playwright and GitHub Actions.

Your responsibility is to build this project from scratch as if it will be maintained for years.

Prioritize:

* Reliability
* Maintainability
* Readability
* Modular architecture
* Fault tolerance

Always choose production-quality engineering practices over shortcuts.

---

# PROJECT

Build a **Pinterest Intelligence Automation** system.

The purpose of this project is to automatically collect the top Pinterest posts for a keyword every day and email me a report.

This is **Phase 1 only**.

Do NOT implement AI analysis.

Do NOT use any LLM APIs.

Do NOT integrate Claude API.

Do NOT integrate OpenAI API.

Do NOT integrate Gemini API.

Everything must work using browser automation only.

---

# OBJECTIVE

Every day the workflow should automatically:

1. Open Pinterest.
2. Read the next keyword from `keywords.txt`.
3. Search Pinterest using that keyword.
4. Collect the top 5 Pinterest posts.
5. Open each post.
6. Extract every publicly visible field.
7. Generate a plain text report.
8. Email the report.
9. Mark the processed keyword as completed.
10. Run automatically using GitHub Actions.

The workflow must run without requiring my laptop.

---

# TECH STACK

Use only:

* TypeScript
* Node.js
* Playwright
* GitHub Actions
* Nodemailer (or another reliable SMTP library)

Do not use Python.

---

# PROJECT STRUCTURE

Create the following structure:

```text
pinterest-intelligence/
│
├── config/
│
├── data/
│
├── logs/
│
├── reports/
│
├── src/
│   ├── scraper/
│   ├── report/
│   ├── email/
│   ├── keyword/
│   └── utils/
│
├── .github/
│   └── workflows/
│
├── keywords.txt
├── processed_keywords.txt
├── package.json
└── README.md
```

---

# KEYWORD MANAGEMENT

The project must use:

`keywords.txt`

One keyword per line.

Example:

```text
Japan packing list
Europe packing list
Beach packing list
Cruise packing list
Carry on packing list
```

Requirements:

* Blank lines should be ignored.
* Lines beginning with `#` should be treated as comments.
* Leading and trailing whitespace should be removed automatically.
* Duplicate keywords should be ignored gracefully.

The workflow should always process **only the first unprocessed keyword**.

After a successful run:

* Remove the processed keyword from `keywords.txt`.
* Append it to `processed_keywords.txt`.
* Commit and push these changes back to the GitHub repository automatically so that the queue is updated for the next scheduled run.

This allows me to add new keywords at any time by simply editing `keywords.txt`.

I should never have to modify source code when adding keywords.

---

# DATA TO COLLECT

For every Pinterest post, attempt to collect:

* Title
* Pinterest URL
* Creator
* Board
* Likes
* Comments
* Saves
* Shares

If any metric is not publicly visible:

Do NOT fail.

Instead store:

"Not publicly visible"

Continue processing the remaining posts.

---

# REPORT FORMAT

Generate a plain text report.

The email body should look similar to:

====================================================

PINTEREST DAILY REPORT

====================================================

Date:

Keyword:

Total Posts Analyzed: 5

====================================================

POST #1

====================================================

Title:

Pinterest URL:

Creator:

Board:

Likes:

Comments:

Saves:

Shares:

---

POST #2

...

---

POST #3

...

---

POST #4

...

---

POST #5

...

====================================================

END OF REPORT

====================================================

Do not generate HTML.

Do not generate PDFs.

Do not create attachments.

The report should be included directly inside the email body.

---

# EMAIL

Automatically send the report.

Recipient:

[avirupsarker1999@gmail.com](mailto:avirupsarker1999@gmail.com)

Subject:

Pinterest Infographic Pins

The email body must contain the plain text report.

Do not attach any files.

If sending fails:

* Retry once.
* Log the error.
* Exit gracefully.

Never hardcode passwords or credentials.

Use GitHub Secrets for all sensitive values.

---

# GITHUB ACTIONS

Create a GitHub Actions workflow.

It should run automatically every day.

The workflow must work without my laptop.

Store all credentials securely using GitHub Secrets.

If `keywords.txt` is empty, the workflow should:

* Exit successfully.
* Log that there are no keywords remaining.
* Do not send an email.

---

# RELIABILITY

Use robust Playwright locators.

Avoid brittle CSS selectors.

Use retries where appropriate.

Use proper waits.

Implement logging.

Implement timeout handling.

Handle Pinterest layout changes gracefully wherever possible.

Never allow one failed Pinterest post to stop the remaining posts from being processed.

---

# LOGGING

Create logs for:

* Workflow start
* Workflow finish
* Keyword selected
* Every Pinterest URL opened
* Every successful extraction
* Every extraction failure
* Email success
* Email failure
* Queue update success
* Queue update failure

Include timestamps for every log entry.

---

# CODE QUALITY

Use:

* TypeScript interfaces
* async/await
* Modular architecture
* Reusable utility functions
* Strong typing

Avoid duplicated logic.

Keep functions small and easy to understand.

---

# README

Maintain README.md throughout development.

Include:

* Installation
* Configuration
* Running locally
* Running with GitHub Actions
* GitHub Secrets setup
* Project structure
* Troubleshooting
* How to add new keywords
* How the keyword queue works

---

# GIT

After every completed milestone:

* Verify everything works.
* Commit using a meaningful commit message.

Do not continue until I approve the milestone.

---

# DEVELOPMENT PROCESS

Do NOT build everything at once.

Complete the project milestone by milestone.

After every milestone:

* Stop.
* Wait for my approval.
* Never continue automatically.

---

# MILESTONE 1

* Initialize the project.
* Install dependencies.
* Configure TypeScript.
* Configure Playwright.
* Verify Playwright launches Pinterest.
* Update README.
* Commit.
* Stop.

---

# MILESTONE 2

* Implement keyword queue management.
* Read the first keyword from `keywords.txt`.
* Ignore comments and blank lines.
* Verify the correct keyword is selected.
* Update README.
* Commit.
* Stop.

---

# MILESTONE 3

* Search Pinterest using the selected keyword.
* Collect the top 5 Pinterest posts.
* Extract:

  * Title
  * URL
* Save the results as JSON.
* Update README.
* Commit.
* Stop.

---

# MILESTONE 4

Open every Pinterest post.

Extract:

* Title
* Creator
* Board
* Likes
* Comments
* Saves
* Shares

If any field is unavailable, store:

"Not publicly visible"

Update README.

Commit.

Stop.

---

# MILESTONE 5

Generate the plain text report.

Verify the formatting.

Update README.

Commit.

Stop.

---

# MILESTONE 6

Implement email delivery.

Recipient:

[avirupsarker1999@gmail.com](mailto:avirupsarker1999@gmail.com)

Subject:

Pinterest Infographic Pins

Verify successful delivery.

Update README.

Commit.

Stop.

---

# MILESTONE 7

After a successful email:

* Remove the processed keyword from `keywords.txt`.
* Append it to `processed_keywords.txt`.
* Commit the updated files.
* Push the changes back to GitHub.

Verify that the queue updates correctly.

Update README.

Commit.

Stop.

---

# MILESTONE 8

Implement GitHub Actions.

Configure GitHub Secrets.

Verify scheduled execution.

Verify automatic queue updates.

Update README.

Commit.

Stop.

---

# FINAL REQUIREMENT

When the project is complete:

The only thing I should ever need to do is edit:

`keywords.txt`

For example:

```text
Japan packing list
Europe packing list
Thailand packing list
Safari packing list
```

The automation should automatically process one keyword per run, update the queue after a successful run, and continue until no keywords remain.

Throughout development, if Pinterest does not expose a metric such as likes, saves, or shares publicly, record it as **"Not publicly visible"** rather than treating it as an error.

Before writing any code, review this specification and identify any technical assumptions or risks, especially around Pinterest's publicly visible data and GitHub Actions' ability to commit queue updates back to the repository. Present those findings first, then begin with Milestone 1 only after I approve them.
