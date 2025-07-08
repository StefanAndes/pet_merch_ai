-- Rollback migration for 001_initial_schema.sql

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_designs_updated_at ON public.designs;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at();

-- Drop policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can create designs" ON public.designs;
DROP POLICY IF EXISTS "Users can update own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can delete own designs" ON public.designs;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Drop indexes
DROP INDEX IF EXISTS idx_designs_user_id;
DROP INDEX IF EXISTS idx_designs_status;
DROP INDEX IF EXISTS idx_designs_created_at;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_design_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_stripe_session_id;
DROP INDEX IF EXISTS idx_orders_created_at;

-- Drop tables
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.designs;
DROP TABLE IF EXISTS public.users;

-- Drop custom types
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS design_style;
DROP TYPE IF EXISTS design_status; 