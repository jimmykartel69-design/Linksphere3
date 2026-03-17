/**
 * LinkSphere - FAQ Section
 * Frequently asked questions
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is a slot?',
    answer: 'A slot is a permanent digital space on our 3D sphere. Each slot can be customized with your logo, title, description, and a link to your website or project. Once purchased, the slot is yours forever.',
  },
  {
    question: 'How long do I own a slot?',
    answer: 'Slots are owned permanently. Once you purchase a slot, it\'s yours forever with no renewal fees. This is a one-time purchase for lifetime visibility.',
  },
  {
    question: 'Can I edit my slot after purchase?',
    answer: 'Yes! You can update your slot\'s content anytime through your dashboard. Changes are subject to our content guidelines to ensure a quality experience for all users.',
  },
  {
    question: 'How much does a slot cost?',
    answer: 'The base price for slots starts from just €1. Premium positions or bulk purchases may have different pricing. Check the explore page for current availability.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Due to the permanent nature of slot ownership, refunds are not available after purchase. Please make sure you\'re certain about your purchase before completing it.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express. PayPal and cryptocurrency may be added in the future.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60">
            Everything you need to know about LinkSphere
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
