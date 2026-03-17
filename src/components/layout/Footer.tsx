/**
 * LinkSphere - Footer Component
 * Site footer with links and info
 */

'use client'

import Link from 'next/link'
import { Globe, Twitter, Github, Linkedin } from 'lucide-react'
import { SITE_NAME, SITE_TAGLINE, SUPPORTED_LOCALES, LOCALE_NAMES } from '@/lib/constants'

interface FooterProps {
  locale?: string
  onLocaleChange?: (locale: string) => void
}

export function Footer({ locale = 'en', onLocaleChange }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">{SITE_NAME}</span>
            </Link>
            <p className="text-white/50 text-sm mb-4">
              {SITE_TAGLINE}
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/linksphere"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/linksphere"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/linksphere"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#explore"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  3D Explorer
                </Link>
              </li>
              <li>
                <Link
                  href="#categories"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="#search"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Search Slots
                </Link>
              </li>
              <li>
                <Link
                  href="#featured"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#about"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#terms"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#privacy"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#cookies"
                  className="text-white/50 hover:text-white transition-colors text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          
          {/* Language selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white/30" />
            <select
              value={locale}
              onChange={(e) => onLocaleChange?.(e.target.value)}
              className="bg-transparent text-white/50 text-sm border-none outline-none cursor-pointer"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc} value={loc} className="bg-black">
                  {LOCALE_NAMES[loc]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
