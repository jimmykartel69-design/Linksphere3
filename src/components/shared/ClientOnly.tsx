/**
 * LinkSphere - Client Only Wrapper
 * Prevents hydration mismatches for components that use browser APIs
 */

'use client'

import { useSyncExternalStore, type ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

// Empty subscribe function for useSyncExternalStore
const subscribe = () => () => {}

// Snapshot functions
const getSnapshot = () => true
const getServerSnapshot = () => false

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
