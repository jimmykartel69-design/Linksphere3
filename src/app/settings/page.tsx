'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/provider'
import { LOCALE_NAMES, SUPPORTED_LOCALES } from '@/lib/constants'

interface SettingsUser {
  id: string
  email: string
  name: string | null
  locale: string
  role: string
  badge: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, setLocale: setAppLocale } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<SettingsUser | null>(null)
  const [name, setName] = useState('')
  const [locale, setLocale] = useState('en')
  const [timezone, setTimezone] = useState('Europe/Paris')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.replace('/auth/login?redirectedFrom=/settings')
          return
        }
        const data = await res.json()
        if (!data.user) {
          router.replace('/auth/login?redirectedFrom=/settings')
          return
        }
        setUser(data.user)
        setName(data.user.name || '')
        setLocale(data.user.locale || 'en')
      } catch {
        router.replace('/auth/login?redirectedFrom=/settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          locale,
          timezone,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast({
          title: t('toast.error'),
          description: data.error || t('settings.save.error'),
          variant: 'destructive',
        })
        return
      }

      setUser(data.user)
      if (data.user.locale) {
        await setAppLocale(data.user.locale)
      }
      toast({
        title: t('toast.success'),
        description: t('toast.saved'),
      })
    } catch {
      toast({
        title: t('toast.error'),
        description: t('settings.save.retry'),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            {t('button.back')} {t('nav.dashboard')}
          </Link>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">{t('dashboard.settings.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input value={user?.email || ''} disabled className="bg-white/5 border-white/10 text-white/60" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">{t('dashboard.settings.name')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder={t('auth.placeholder.name')}
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locale" className="text-white">{t('dashboard.settings.language')}</Label>
                  <select
                    id="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                  >
                    {SUPPORTED_LOCALES.map((loc) => (
                      <option key={loc} value={loc} style={{ color: '#111', backgroundColor: '#fff' }}>
                        {LOCALE_NAMES[loc]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-white">{t('dashboard.settings.timezone')}</Label>
                  <Input
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Europe/Paris"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loading.please')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t('button.save')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}
