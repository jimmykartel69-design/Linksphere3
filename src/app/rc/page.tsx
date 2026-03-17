import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'LinkSphere privacy policy and data protection rules.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 pt-16">
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/60 mb-10">Last updated: March 17, 2026</p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Data We Collect</h2>
              <p>
                We collect account data (email, profile name, locale), authentication data, payment references,
                and usage analytics required to operate LinkSphere.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Why We Use Your Data</h2>
              <p>
                Your data is used to provide access to your account, process purchases, secure the platform,
                and improve product quality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Payment and Third Parties</h2>
              <p>
                Payments are processed by Stripe. Authentication and database services are provided by Supabase.
                These services process data under their own privacy commitments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Data Retention</h2>
              <p>
                We keep account and transaction records as long as required for service continuity, legal
                obligations, fraud prevention, and financial reporting.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Your Rights</h2>
              <p>
                You may request access, correction, or deletion of your personal data where legally applicable.
                Contact: <a className="text-primary hover:underline" href="mailto:contact@entrepixel.fr">contact@entrepixel.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Security</h2>
              <p>
                We apply technical and organizational safeguards to protect user data and monitor security events.
              </p>
            </section>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

