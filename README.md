# API Test Case Generator

A rule-based QA web app that generates structured API test cases from endpoint details, request data, authentication setup, expected responses, and business rules.

## Features

- Clean two-panel interface for endpoint input and generated test case output
- Supports GET, POST, PUT, PATCH, and DELETE methods
- Supports None, Bearer Token, API Key, and Basic Auth authentication types
- Generates grouped test cases for positive, negative, field validation, auth, headers, response, security, and performance coverage
- Detects string, number, email-like, and required-looking fields from request body JSON
- Friendly validation for invalid JSON and malformed header input
- Copy generated cases as Markdown
- Export generated cases as CSV
- Fully client-side with no backend and no paid APIs

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons

## How It Works

The user enters API details such as feature name, HTTP method, endpoint path, authentication type, headers, request body JSON, expected status code, expected response, and business rules. The app validates optional JSON fields, parses the request payload, identifies field names and data types, and then applies deterministic QA rules to generate test cases.

The generated output includes:

- Test case ID
- Category
- Title
- Preconditions
- Steps
- Expected result
- Priority

## Rule-Based Logic

The rules are intentionally deterministic and transparent:

- POST endpoints generate create-resource scenarios.
- PUT and PATCH endpoints generate update-resource scenarios.
- DELETE endpoints generate delete-resource scenarios.
- Bearer Token authentication generates missing, invalid, expired, and insufficient-permission cases.
- API Key and Basic Auth generate credential-specific negative cases.
- String fields generate empty string, long string, special character, and wrong-type cases.
- Email-like fields generate invalid email format cases.
- Number fields generate negative, decimal, large number, null, and string-instead-of-number cases.
- Required-looking fields generate missing field and null value cases.
- Expected responses generate schema and data accuracy validation.
- All generated suites include status code, response time, security, and basic repeated-request checks.

The core logic lives in `src/logic/generator.ts`, while JSON and field parsing live in `src/logic/parser.ts`.

## Project Structure

```text
src/
  components/
    FormField.tsx
    InputPanel.tsx
    OutputPanel.tsx
    TestCaseCard.tsx
  data/
    example.ts
  logic/
    exporters.ts
    generator.ts
    parser.ts
  types/
    api.ts
  App.tsx
  main.tsx
  styles.css
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The app is deployed on Vercel from the GitHub repository:

```text
https://api-tc-generator-app.vercel.app/
```

