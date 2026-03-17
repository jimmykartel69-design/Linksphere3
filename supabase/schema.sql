-- LinkSphere - Supabase Database Schema
-- Compatible with Supabase Auth (auth.users table)
-- Execute this in Supabase SQL Editor

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- User badges based on purchase history
CREATE TYPE user_badge AS ENUM ('NONE', 'OWNER', 'MULTI_OWNER', 'INVESTOR', 'ENTERPRISE');

-- Slot status
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'DISABLED');

-- Moderation status
CREATE TYPE moderation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- Payment status
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================

-- This table stores additional user data linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'USER',
  badge user_badge DEFAULT 'NONE',
  locale TEXT DEFAULT 'en',
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, locale)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_badge ON public.profiles(badge);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role has full access on categories" ON public.categories
  FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- ============================================================================
-- SLOTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number INTEGER UNIQUE NOT NULL,
  status slot_status DEFAULT 'AVAILABLE',
  
  -- 3D positioning (spherical coordinates)
  theta FLOAT NOT NULL,
  phi FLOAT NOT NULL,
  
  -- Slot content
  title TEXT,
  description TEXT,
  target_url TEXT,
  logo_url TEXT,
  banner_url TEXT,
  
  -- Classification
  category_id UUID REFERENCES public.categories(id),
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  purchased_at TIMESTAMPTZ,
  purchase_price FLOAT,
  
  -- Moderation
  moderation_status moderation_status DEFAULT 'PENDING',
  moderation_notes TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- Slots policies
CREATE POLICY "Slots are viewable by everyone" ON public.slots
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access on slots" ON public.slots
  FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_slots_slot_number ON public.slots(slot_number);
CREATE INDEX IF NOT EXISTS idx_slots_status ON public.slots(status);
CREATE INDEX IF NOT EXISTS idx_slots_owner_id ON public.slots(owner_id);
CREATE INDEX IF NOT EXISTS idx_slots_category_id ON public.slots(category_id);

-- ============================================================================
-- PURCHASES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES public.slots(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Pack information
  pack_size INTEGER DEFAULT 1,
  pack_name TEXT,
  
  -- Pricing
  amount FLOAT NOT NULL,
  original_amount FLOAT,
  discount_percent INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Stripe integration
  stripe_session_id TEXT UNIQUE,
  stripe_payment_id TEXT,
  
  -- Status
  status payment_status DEFAULT 'PENDING',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access on purchases" ON public.purchases
  FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_slot_id ON public.purchases(slot_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON public.purchases(stripe_session_id);

-- ============================================================================
-- GLOBAL STATS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.global_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_slots INTEGER DEFAULT 1000000,
  available_slots INTEGER DEFAULT 1000000,
  sold_slots INTEGER DEFAULT 0,
  reserved_slots INTEGER DEFAULT 0,
  total_revenue FLOAT DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

-- Global stats: Public read
CREATE POLICY "Global stats are viewable by everyone" ON public.global_stats
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access on global_stats" ON public.global_stats
  FOR ALL USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_slots_updated_at ON public.slots;
CREATE TRIGGER update_slots_updated_at
  BEFORE UPDATE ON public.slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON public.purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_global_stats_updated_at ON public.global_stats;
CREATE TRIGGER update_global_stats_updated_at
  BEFORE UPDATE ON public.global_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO public.categories (slug, name, icon, color, sort_order) VALUES
  ('technology', 'Technology', '💻', '#3b82f6', 1),
  ('business', 'Business', '💼', '#6366f1', 2),
  ('creative', 'Creative', '🎨', '#ec4899', 3),
  ('gaming', 'Gaming', '🎮', '#8b5cf6', 4),
  ('education', 'Education', '📚', '#14b8a6', 5),
  ('health', 'Health & Wellness', '🏃', '#22c55e', 6),
  ('finance', 'Finance', '💰', '#f59e0b', 7),
  ('travel', 'Travel', '✈️', '#0ea5e9', 8),
  ('other', 'Other', '📦', '#6b7280', 9)
ON CONFLICT (slug) DO NOTHING;

-- Insert initial global stats
INSERT INTO public.global_stats (total_slots, available_slots, sold_slots, reserved_slots)
VALUES (1000000, 1000000, 0, 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DISABLE EMAIL CONFIRMATION (OPTIONAL - FOR DEVELOPMENT)
-- ============================================================================

-- To disable email confirmation for development, go to:
-- Supabase Dashboard > Authentication > Providers > Email
-- And turn off "Confirm email"

-- Or run this to auto-confirm emails (development only):
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
