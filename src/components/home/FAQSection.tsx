/**
 * LinkSphere - FAQ Section
 * Frequently asked questions
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from '@/i18n/provider'

export function FAQSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const faqs = [
    { question: t('faq.whatIsSlot.q'), answer: t('faq.whatIsSlot.a') },
    { question: t('faq.howLong.q'), answer: t('faq.howLong.a') },
    { question: t('faq.canEdit.q'), answer: t('faq.canEdit.a') },
    { question: t('faq.refund.q'), answer: t('faq.refund.a') },
    { question: t('faq.payment.q'), answer: t('faq.payment.a') },
  ]

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-white/60">
            {t('site.name')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-white/60 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
