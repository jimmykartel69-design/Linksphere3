/**
 * LinkSphere - Login Page
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Globe, Loader2, Mail, Lock, ArrowLeft, Check } from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useTranslation } from '@/i18n/provider'

export default function LoginPage() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')
    
    try {
      const supabase = getSupabaseBrowserClient()
      const redirectUrl = `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) {
        throw error
      }
      // The user will be redirected to Google, so we don't need to set loading to false
    } catch (err) {
      setError(err instanceof Error ? err.message : t('toast.error'))
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('toast.failed'))
      }

      // Show success message
      setSuccess(true)
      
      // Simple redirect after a short delay
      setTimeout(() => {
        // Use replace to avoid adding to history
        window.location.replace('/')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.500.message'))
      setIsLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('toast.success')}</h1>
          <p className="text-white/60 mb-4">{t('dashboard.welcome').replace('{name}', SITE_NAME)}</p>
          <div className="flex items-center justify-center gap-2 text-white/40">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('loading.please')}</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Globe className="w-7 h-7 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('auth.login.title')}</h1>
          <p className="text-white/60 mt-1">{t('auth.login.subtitle')}</p>
        </div>

        <Card className="bg-white/5 border-white/10">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {t('auth.google.continue')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-white/40">{t('auth.or')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">{t('auth.login.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.placeholder.email')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">{t('auth.login.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  t('auth.login.submit')
                )}
              </Button>
            </CardContent>
          </form>
          
          <CardFooter className="flex flex-col gap-4 pt-0">
            <Separator className="bg-white/10" />
            <p className="text-white/60 text-sm text-center">
              {t('auth.login.noAccount')}{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                {t('auth.login.signUp')}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t('error.backHome')}
          </Link>
        </div>
      </div>
    </main>
  )
}
