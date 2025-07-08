# Environment Variables Setup

This document describes the environment variables needed for the Pet Merch AI MVP.

## Local Development

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # For server-side operations

# Stripe Configuration
STRIPE_SECRET=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# RunPod Configuration
RUNPOD_API_KEY=your-runpod-api-key
RUNPOD_ENDPOINT_ID=your-endpoint-id

# Printful Configuration
PRINTFUL_TOKEN=your-printful-api-token
PRINTFUL_STORE_ID=your-store-id

# AWS Configuration (for S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=pet-merch-uploads

# Next.js Public Variables (accessible in browser)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Development Variables
NEXT_PUBLIC_DEBUG=true
```

## Vercel Production

In your Vercel project settings, add the following environment variables:

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add each variable with its production value
4. Make sure to set the appropriate environment (Production/Preview/Development)

### Required Production Variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- `RUNPOD_API_KEY`
- `RUNPOD_ENDPOINT_ID`
- `PRINTFUL_TOKEN`
- `PRINTFUL_STORE_ID`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your production domain)

## Getting the Values

### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy the URL and anon/service keys

### Stripe
1. Create an account at [stripe.com](https://stripe.com)
2. Go to Developers → API keys
3. Copy the secret and publishable keys
4. For webhook secret, create a webhook endpoint pointing to `/api/webhooks/stripe`

### RunPod
1. Sign up at [runpod.io](https://runpod.io)
2. Create an API key in settings
3. Deploy the SDXL endpoint and copy the endpoint ID

### Printful
1. Create a store at [printful.com](https://printful.com)
2. Go to Settings → API
3. Generate an API token

### AWS S3
1. Create an S3 bucket for image uploads
2. Create an IAM user with S3 access
3. Copy the access credentials

## Security Notes

- Never commit the `.env` file to version control
- Use different values for development and production
- Rotate keys regularly
- Use environment-specific prefixes in Vercel (e.g., `PROD_`, `DEV_`) 