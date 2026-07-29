# Swapea - The Trade-Only Marketplace

A modern, mobile-first marketplace built exclusively for trading items without cash. Built with Next.js, Prisma, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4, shadcn/ui, framer-motion (via tw-animate-css)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials & OAuth ready)
- **Real-time**: Pusher for real-time messaging
- **Forms**: React Hook Form + Zod
- **Data Fetching**: React Query

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL database

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/swapea?schema=public"
   NEXTAUTH_SECRET="your_super_secret_key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Pusher Credentials (for Trade Chat)
   PUSHER_APP_ID="your_app_id"
   NEXT_PUBLIC_PUSHER_KEY="your_key"
   PUSHER_SECRET="your_secret"
   NEXT_PUBLIC_PUSHER_CLUSTER="us2"
   ```

3. **Database Setup**
   Push the schema to your database and run the seed script to populate sample users, listings, and a trade:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   *Note: Seed data includes credentials `alice@example.com` and `bob@example.com` with password `password123`.*

4. **Run Development Server**
   ```bash
   pnpm dev
   ```

## Key Features

- **Mobile-first Listings**: Beautiful, image-centric cards with dynamic gradients.
- **Offer System**: Propose trades using your own items instead of cash.
- **Trade Rooms**: Private, encrypted, real-time chat powered by Pusher.
- **Trust & Moderation**: Admin dashboard to soft-delete items and suspend bad actors.
- **Monetization**: Skeleton for "Swapea Pro" subscriptions.

## Deployment

Deploying to Vercel is recommended:
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from your `.env` file.
4. Add a build step `npx prisma generate` if not auto-detected.
5. Deploy!

## Testing

Run tests using Vitest (to be installed):
```bash
pnpm test
```
