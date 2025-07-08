# PetMerch AI‑Generated Merch – MVP Technical Specification

*Version: 0.1 – July 2025*

---

## 1  Project Overview

Create a PWA‑style web app (installable on iOS/Android) that turns a customer‑supplied pet photo into viral T‑shirt (and later hoodie, mug, etc.) designs using generative AI. The user selects a favorite design, completes a one‑page checkout, and the order is fulfilled automatically through a Print‑on‑Demand (POD) partner. The entire funnel should load fast (sub‑1 s LCP), feel native, and be friction‑free enough to support social‑media impulse buys.

---

## 2  User Journey (Happy Path)

|  Step  |  Action                                                                                               |  Tech & Notes                                                          |
| ------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
|  1     |  **Landing:** user arrives via ad, sees big "Upload your pet" CTA.                                    | `index.tsx`                                                            |
|  2     |  **Upload:** selects 1 – 3 photos → images POST to `/api/upload` → S3 presigned.                      | Validate file type/size < 8 MB each.                                   |
|  3     |  **Style Picker:** immediate thumbnails of 4 style presets (Metal Band, Comic, Watercolor, Pop‑Art).  | Pre‑cached example images; click starts generation.                    |
|  4     |  **Generation:** async call to Replicate → SSE/WS shows progress bar (10‑20 s).                       | On success save record in `generations` table.                         |
|  5     |  **Select Design:** once 4 variants are back, user taps a favorite.                                   | Variant ID stored in session.                                          |
|  6     |  **Checkout:** single page collects email, shipping, credit‑card (Stripe Elements).                   | POST `/api/checkout` → Stripe PaymentIntent + Printful order creation. |
|  7     |  **Confirmation:** order # and tracking link; offer shareable Reel.                                   | `/order/[id]` page pulls order status via webhook updates.             |
|  8     |  **Recap (PWA home):** Installed users see all past pets/designs & order status.                      | `/recap` route, real‑time via Supabase.                                |

---

## 3  System Architecture

```
Browser (PWA) ─┬──>  AWS S3  (direct uploads)
               │
               ├──>  /api (Next.js Edge Functions) ──┐
               │       │                            │
               │       │                            ├──> Replicate (AI Gen)
               │       │                            │
               │       │                            ├──> Cloud Fn (Mock‑ups ▶ S3)
               │       │                            │
               │       │                            └──> Printful API (+ webhooks)
               │
               └──<── Supabase (Postgres + Auth + RT)
```

*Frontend hosting:* **Vercel**   *Image storage:* **S3**   *Auth & DB:* **Supabase**   *AI:* **Replicate**   *POD:* **Printful**   *Payments:* **Stripe**

---

## 4  Technology Stack

|  Layer             |  Library/Service                                   |  Reason                                       |
| ------------------ | -------------------------------------------------- | --------------------------------------------- |
|  UI                |  React 18 + Next.js 14 App Router                  | SSR, route‑level code splitting, Vercel edge. |
|  Styling           |  Tailwind CSS 3                                    | Rapid build, responsive defaults.             |
|  State/Queries     |  TanStack Query                                    | Cache AI & order fetches.                     |
|  PWA               |  next‑pwa plugin                                   | Generates service worker + offline shell.     |
|  AI                |  SDXL + LoRA style adapters on Replicate           | No self‑host GPU at start.                    |
|  Image Processing  |  Serverless AWS Lambda (Node) + Sharp/ImageMagick  | Composite design onto shirt mock‑ups.         |
|  Backend           |  Next.js API routes (Edge)                         | Zero‑config on Vercel.                        |
|  DB/Auth           |  Supabase (Postgres)                               | E‑mail magic link, row‑level security.        |
|  File Storage      |  Amazon S3 + CloudFront                            | CDN + cheap large files.                      |
|  Payments          |  Stripe Checkout + Webhook                         | PCI handled, Apple/Google Pay.                |
|  POD               |  Printful API                                      | Canada/US/EU print hubs, good docs.           |
|  Analytics         |  PostHog Cloud                                     | Funnel, session replays.                      |
|  Error Mon         |  Sentry                                            | Front‑ & back‑end exceptions.                 |

---

## 5  Database Schema (Postgres)

```sql
-- users handled by Supabase auth
CREATE TABLE uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  s3_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid REFERENCES uploads,
  style text NOT NULL,
  variant_urls jsonb NOT NULL,
  selected_index int,
  status text CHECK (status IN ('pending','ready','failed')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  generation_id uuid REFERENCES generations,
  printful_id text,
  stripe_pi text,
  status text,
  amount_cents int,
  created_at timestamptz DEFAULT now()
);
```

Row‑level policy: user\_id = auth.uid().

---

## 6  API Endpoints (Edge Runtime)

|  Route                         |  Method                      |  Body / Params                    |  Returns              |
| ------------------------------ | ---------------------------- | --------------------------------- | --------------------- |
|  `POST /api/upload`            |  form‑data                   |  file=img                         |  `{uploadId, s3Url}`  |
|  `POST /api/generate`          |  `{uploadId, style}`         |  `{generationId}` + SSE progress  |                       |
|  `GET  /api/generate/:id`      |  –                           |  status / urls                    |                       |
|  `POST /api/checkout`          |  `{generationId, shipInfo}`  |  `{stripeSessionUrl}`             |                       |
|  `POST /api/stripe/webhook`    |  raw                         |  –                                |  200                  |
|  `POST /api/printful/webhook`  |  json                        |  –                                |  200                  |

All endpoints require Supabase JWT except webhooks.

---

## 7  Frontend Page Map

```
app/
  layout.tsx  – PWA shell, header btn ‑‑> recap
  page.tsx    – Landing & Upload
  styles/page.tsx   – Style picker & poster mock‑ups
  generate/[id]/page.tsx – Progress + results grid
  checkout/page.tsx       – address + card
  order/[id]/page.tsx     – confirmation + tracker
  recap/page.tsx          – user dashboard
```

Components: `<UploadDropzone/>`, `<StyleCard/>`, `<ProgressBar/>`, `<VariantGrid/>`, `<CheckoutForm/>`.

---

## 8  AI Generation Pipeline

1. Receive S3 URL + style ID.
2. Launch **Replicate** SDXL inference with LoRA weights.
3. Prompt template: `"A {breed} dog, {styleDesc}, t‑shirt graphic, centered, plain background"`.
4. Return 4 square PNGs (1024×1024).
5. Store in `generations.variant_urls`.
6. Trigger mock‑up Lambda with selected image → overlays on transparent tee PSD → 2048×2048 PNG pushed to S3 CDN.

---

## 9  Manifest & Service Worker Snippets

`/public/manifest.json` as discussed (name, icons, theme). `next‑pwa.config.js` cache strategy: *NetworkFirst* for HTML, *StaleWhileRevalidate* for images.

---

## 10  Environment Variables

```
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET
REPLICATE_API_TOKEN
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
PRINTFUL_API_KEY
NEXT_PUBLIC_SITE_URL (for callbacks)
```

---

## 11  Setup Steps

1. **Repo init**
   ```bash
   pnpm create next-app@latest petmerch --typescript --tailwind --eslint
   cd petmerch && pnpm i @supabase/supabase-js @tanstack/react-query next-pwa
   ```
2. **Configure Supabase project** → paste schema.
3. **Set Vercel project + env vars**.
4. **Create S3 bucket** (`petmerch-prod-images`) + CORS allow PUT,GET.
5. **Replicate models** – fork `stability-ai/sdxl` + load 4 LoRA checkpoints; save model ID.
6. **Printful store** – add blank “Pet Tee (DTG)” product template; set webhooks.
7. **Stripe** – enable Canada, US, EU; set success/cancel URLs.

---

## 12  Testing Plan

- Unit tests: React Testing Library for critical components.
- Integration: Vitest for `/api/*` routes using Supabase test DB.
- E2E: Playwright mobile‑viewport – upload → checkout sandbox.

---

## 13  Monitoring & Analytics

- **PostHog**: events `upload_started`, `generation_ready`, `checkout_start`, `purchase_complete`.
- **Sentry**: sample 100 % of production API route errors.

---

## 14  Milestone Timeline (6 Weeks)

|  Week  |  Deliverable                                                   |
| ------ | -------------------------------------------------------------- |
|  1     | Repo scaffold, PWA shell, Supabase tables.                     |
|  2     | Upload → S3, style picker UI, Replicate call.                  |
|  3     | Variant selection, mock‑up Lambda, `/generate/[id]`.           |
|  4     | Checkout page, Stripe & Printful integration.                  |
|  5     | Webhooks, order tracker, `/recap`, PWA install banner.         |
|  6     | Polish mobile UX, Lighthouse 95+, Playwright tests, soft beta. |

---

## 15  Future Extensions

- Add **multi‑pet layout** (segment‑anything + collage).
- Offer **stickers, phone cases** via same print API.
- Fine‑tune **dog breed detection** for prompt auto‑fill.

---

**End of Spec v0.1**

