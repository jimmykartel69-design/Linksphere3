/**
 * LinkSphere - Auth Error Page
 * Displayed when email confirmation fails
 */

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Mail } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        <Card className="max-w-md w-full bg-white/5 border-white/10">
          <CardContent className="pt-8 text-center">
            {/* Error icon */}
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Erreur de confirmation
            </h1>
            <p className="text-white/60 mb-6">
              Le lien de confirmation est invalide ou a expiré.
            </p>

            {/* Info */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6 text-left">
              <p className="text-white/70 text-sm mb-3">
                Causes possibles:
              </p>
              <ul className="text-white/50 text-sm space-y-2">
                <li>• Le lien a déjà été utilisé</li>
                <li>• Le lien a expiré (plus de 24h)</li>
                <li>• Le lien a été corrompu</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button className="w-full" asChild>
                <Link href="/auth/register">
                  <Mail className="w-4 h-4 mr-2" />
                  Demander un nouveau lien
                </Link>
              </Button>
              <Button variant="outline" className="w-full border-white/10 text-white" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
