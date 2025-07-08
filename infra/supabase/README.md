# Supabase Database Schema

## Overview

This directory contains the database migrations for the Pet Merch AI application. The schema is designed to support user authentication, design generation, and order processing.

## Tables

### users
Extends Supabase's auth.users table with additional profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| email | TEXT | User's email address |
| full_name | TEXT | User's full name |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### designs
Stores pet design generation requests and results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| status | design_status | Current status (PENDING, PROCESSING, COMPLETED, FAILED) |
| style | design_style | Design style (METAL, POP_ART, WATERCOLOR) |
| uploaded_images | JSONB | Array of uploaded image URLs |
| generated_images | JSONB | Array of AI-generated image URLs |
| mockups | JSONB | Array of product mockup URLs |
| error_message | TEXT | Error details if failed |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### orders
Stores customer orders and fulfillment details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| design_id | UUID | Foreign key to designs |
| status | order_status | Order status |
| stripe_session_id | TEXT | Stripe checkout session ID |
| stripe_payment_intent_id | TEXT | Stripe payment intent ID |
| printful_order_id | TEXT | Printful order ID |
| printful_order_status | TEXT | Printful order status |
| amount_cents | INTEGER | Order amount in cents |
| currency | TEXT | Currency code (default: CAD) |
| shipping_address | JSONB | Shipping address details |
| billing_address | JSONB | Billing address details |
| items | JSONB | Array of order items |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Order creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## Custom Types

### design_status
- `PENDING` - Design request received
- `PROCESSING` - AI generation in progress
- `COMPLETED` - Design ready
- `FAILED` - Generation failed

### design_style
- `METAL` - Metal band t-shirt style
- `POP_ART` - Pop art style
- `WATERCOLOR` - Watercolor style

### order_status
- `PENDING` - Order created, awaiting payment
- `PAID` - Payment completed
- `SUBMITTED` - Submitted to Printful
- `PRINTING` - Being printed
- `SHIPPED` - Shipped to customer
- `DELIVERED` - Delivered to customer
- `CANCELLED` - Order cancelled
- `REFUNDED` - Order refunded

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### users
- Users can view and update their own profile

### designs
- Users can view, create, update, and delete their own designs

### orders
- Users can view and create their own orders
- Users can update their own orders (for cancellation)

## Triggers

### updated_at
All tables have a trigger that automatically updates the `updated_at` column on row update.

### handle_new_user
Automatically creates a user record in the public.users table when a new auth user is created.

## Running Migrations

To apply migrations to your Supabase project:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

## Rollback

To rollback the initial schema:
```bash
supabase db push < migrations/001_initial_schema_rollback.sql
```

## Development Tips

1. **Testing Locally**: Use Supabase local development:
   ```bash
   supabase start
   supabase db reset
   ```

2. **Viewing Data**: Access Supabase Studio at `http://localhost:54323`

3. **Type Safety**: Generate TypeScript types from your schema:
   ```bash
   supabase gen types typescript --linked > types/supabase.ts
   ```

## Security Considerations

1. All tables use Row Level Security (RLS)
2. Users can only access their own data
3. Service role key should only be used server-side
4. Never expose service role key to client-side code 