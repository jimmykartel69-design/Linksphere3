/**
 * useAuth Hook
 * Authentication state management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Fetch current user on mount
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const data = await response.json()
        setState({ user: data.user, loading: false, error: null })
      } else {
        setState({ user: null, loading: false, error: null })
      }
    } catch {
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }))
        return false
      }

      setState({ user: data.user, loading: false, error: null })
      return true
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Login failed' }))
      return false
    }
  }, [])

  const register = useCallback(async (
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }))
        return false
      }

      setState({ user: data.user, loading: false, error: null })
      return true
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Registration failed' }))
      return false
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  const updateProfile = useCallback(async (
    data: { name?: string; avatarUrl?: string }
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) return false

      const updated = await response.json()
      setState(prev => ({ ...prev, user: updated.user }))
      return true
    } catch {
      return false
    }
  }, [])

  return {
    ...state,
    login,
    register,
    logout,
    refresh: fetchUser,
    updateProfile,
  }
}
