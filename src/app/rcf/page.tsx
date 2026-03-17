import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'LinkSphere terms and conditions of use.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 pt-16">
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/60 mb-10">Last updated: March 17, 2026</p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Scope</h2>
              <p>
                These terms govern access to and use of LinkSphere, including account creation, slot purchases,
                and platform interactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Accounts</h2>
              <p>
                You are responsible for account credentials and activity performed through your account.
                You must provide accurate registration information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. Purchases and Ownership</h2>
              <p>
                Slot purchases are processed securely through Stripe. Unless stated otherwise by applicable law,
                purchases are final once confirmed. Ownership rights are subject to platform rules and legal limits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Prohibited Content</h2>
              <p>
                Illegal, deceptive, abusive, or rights-infringing content is forbidden. We may moderate or remove
                content and suspend accounts for policy violations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Service Availability</h2>
              <p>
                We aim for high availability but cannot guarantee uninterrupted service at all times, including
                maintenance windows and third-party outages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">6. Contact</h2>
              <p>
                For legal or support requests, contact: <a className="text-primary hover:underline" href="mailto:contact@entrepixel.fr">contact@entrepixel.fr</a>
              </p>
            </section>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

