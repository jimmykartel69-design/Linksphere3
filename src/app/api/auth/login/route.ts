/**
 * API Route - Authentication
 * User login endpoint using Supabase Auth
 */

import { NextRequest, NextResponse } from 'next/server'
import { signInUser } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validators'

/**
 * POST /api/auth/login
 * Login an existing user with Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Sign in with Supabase Auth
    const { user, session, error } = await signInUser(
      email.toLowerCase(),
      password
    )

    if (error) {
      console.error('Supabase signin error:', error)
      
      // Handle specific errors
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please confirm your email address before signing in' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to sign in' },
        { status: 401 }
      )
    }

    if (!user || !session) {
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 401 }
      )
    }

    // Return success with user info
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
      },
    })

    // Session is handled by Supabase via cookies (httpOnly)
    // The SSR client automatically sets the session cookies

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
