# Pet Merch AI MVP

A Progressive Web App (PWA) that lets users upload pet photos, pick a style, see AI-generated merchandise mockups, and purchase custom pet-themed products.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run development server
pnpm dev
```

## 📁 Project Structure

```
/
├── apps/web/               # Next.js 14 app with App Router
├── packages/ui/            # Shared Tailwind + shadcn components
├── infra/terraform/        # Infrastructure as code
├── workers/gen_worker/     # AI generation worker (RunPod)
└── workers/mockup_worker/  # ImageMagick mockup compositor
```

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, PWA
- **Database**: Supabase (PostgreSQL 16)
- **Payments**: Stripe
- **POD**: Printful
- **AI**: SDXL + LoRA on RunPod T4

## 📋 Development Commands

```bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm test        # Run unit tests (Vitest)
pnpm e2e         # Run E2E tests (Playwright)
pnpm lint        # Run ESLint
```

## 🔑 Environment Variables

Create a `.env` file with:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
STRIPE_SECRET=
RUNPOD_API_KEY=
PRINTFUL_TOKEN=
```

## 📝 Definition of Done

- ✅ Unit tests cover happy + error paths (≥80% for utils, ≥50% overall)
- ✅ Types pass `tsc --noEmit`
- ✅ ESLint clean
- ✅ Preview deploy on Vercel
- ✅ Acceptance tests for user-visible flows
- ✅ PR description + CHANGELOG.md updated

## 🚢 Deployment

The app is automatically deployed to Vercel on push to `main` branch.

## 📄 License

Private - All rights reserved 