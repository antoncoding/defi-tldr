# Crypto TLDR

A Next.js application that provides concise summaries of DeFi (Decentralized Finance) news and developments. The app aggregates news from various sources, groups them by topics, and provides clear, digestible summaries.

## Features

- Aggregated DeFi news summaries
- Topic-based categorization
- Markdown support for rich content
- Source linking with favicons
- Clean, minimal interface
- Built with Next.js 14 and TypeScript
- Powered by Supabase

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep this secret!)
5. Run the development server:
   ```bash
   pnpm dev
   ```

## Tech Stack

- Next.js 14 with App Router
- TypeScript for type safety
- Supabase for database
- Tailwind CSS for styling
- React Markdown for content rendering

## Database Schema

The application uses the following main tables in Supabase:

### Tag Summaries
Stores aggregated news summaries by topic:
- `id` (uuid, primary key)
- `tag_name` (text)
- `title` (text)
- `summary` (text)
- `detail` (text)
- `news_ids` (uuid[])
- `created_at` (timestamp)

### News Items
Stores individual news articles:
- `id` (uuid, primary key)
- `title` (text)
- `url` (text)
- `content` (text)
- `summary` (text)
- `published_at` (timestamp)
- `source` (text)
- `topics` (jsonb)

## Development

This project uses:
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Supabase](https://supabase.com) - Database
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering

## License

MIT

## Security

This application uses a secure approach by:
- Keeping Supabase service role key server-side only
- Using API routes to handle database operations
- Implementing proper error handling
- Using TypeScript for type safety

## Database Setup

Create a table named `entries` in your Supabase database with the following columns:
- `id` (uuid, primary key)
- `created_at` (timestamp with timezone)
- `title` (text)
- `content` (text)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
