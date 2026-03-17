import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/constants'
import { env } from '@/lib/env'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'LinkSphere is a digital visibility platform where you can own your place in the digital universe. Purchase sponsored slots on our interactive 3D sphere for permanent global visibility.',
  keywords: ['LinkSphere', 'digital visibility', 'sponsored slots', '3D platform', 'digital presence', 'brand visibility', 'permanent placement'],
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: `${SITE_NAME} - Digital Universe Platform`,
    description: 'Own your permanent place in the digital universe. Join thousands of brands on our 3D platform.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Own Your Place in the Digital Universe`,
    description: 'Own your permanent place in the digital universe. Join thousands of brands on our 3D platform.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: env.GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
