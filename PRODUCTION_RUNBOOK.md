# LinkSphere Production Runbook

## 1. Environment Variables (Vercel)
Set these in Vercel for `preview` and `production`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_SITE_VERIFICATION` (optional)
- `SENTRY_DSN` (optional)

## 2. Supabase Setup
1. Run `supabase/schema.sql` in Supabase SQL editor.
2. Ensure Auth providers are configured:
   - Email/password with email confirmation enabled.
   - Google OAuth enabled with callback: `<SITE_URL>/auth/callback`.
3. Ensure RLS policies are enabled and validated for `profiles`, `slots`, `purchases`, `global_stats`, `categories`.

## 3. Stripe Setup
1. Configure live API keys in Vercel env.
2. Create webhook endpoint: `https://<your-domain>/api/webhooks/stripe`.
3. Subscribe to `checkout.session.completed`.
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`.

## 4. Deployment Flow
1. Push to branch (preview deploy).
2. Validate preview smoke tests:
   - Auth register/login/logout.
   - Google sign-in.
   - Checkout session creation.
   - Webhook delivery.
   - Dashboard purchases/slots.
3. Promote to production.

## 5. Smoke Tests Post-Deploy
- Home page, Explore, Pricing, Checkout, Dashboard, Auth pages.
- `GET /api/stats`, `GET /api/categories`, `GET /api/slots?page=1&limit=20`.
- Complete one real Stripe payment and verify:
  - purchase status moves to `COMPLETED`,
  - slots assigned,
  - badge updated in `profiles`,
  - global stats updated.

## 6. Rollback
1. Revert the release in Vercel to previous deployment.
2. Disable Stripe webhook endpoint if needed.
3. Inspect logs for root cause and replay Stripe events when fixed.
