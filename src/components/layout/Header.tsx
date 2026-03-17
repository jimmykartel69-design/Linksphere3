/**
 * LinkSphere - Header Component
 * Main navigation header
 */

'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Globe, 
  Menu, 
  X, 
  LogOut, 
  Shield,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'

interface HeaderProps {
  transparent?: boolean
  user?: {
    id: string
    email: string
    name: string | null
    avatarUrl?: string | null
    role: string
    badge?: string
    slotCount?: number
    badgeInfo?: {
      name: string
      icon: string
      color: string
    }
  } | null
}

// For useSyncExternalStore
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function Header({ 
  transparent = false, 
  user: propUser 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(propUser)
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    // Only fetch user if not passed as prop
    if (propUser === undefined && mounted) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user)
          }
        })
        .catch(() => {
          // Not logged in, that's fine
        })
    }
  }, [propUser, mounted])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-black/80 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/#categories"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Categories
            </Link>
            <Link
              href="/#about"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/#faq"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              FAQ
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {mounted && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-white/10"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/90 border-white/10 min-w-[200px]">
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                      {user.badgeInfo && user.badge !== 'NONE' && (
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${user.badgeInfo.color}20`,
                            color: user.badgeInfo.color 
                          }}
                        >
                          {user.badgeInfo.icon} {user.badgeInfo.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{user.email}</p>
                    {user.slotCount !== undefined && user.slotCount > 0 && (
                      <p className="text-xs text-white/40 mt-1">
                        {user.slotCount} slot{user.slotCount > 1 ? 's' : ''} owned
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : mounted ? (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            ) : null}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              <Link
                href="/explore"
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                href="/#categories"
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/#about"
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/#faq"
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              {mounted && !user && (
                <>
                  <hr className="my-2 border-white/10" />
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
              {mounted && user && (
                <>
                  <hr className="my-2 border-white/10" />
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="px-4 py-2 text-red-400 hover:bg-white/10 rounded-lg text-left"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
