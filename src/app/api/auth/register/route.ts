/**
 * API Route - Authentication
 * User registration endpoint using Supabase Auth
 */

import { NextRequest, NextResponse } from 'next/server'
import { signUpUser } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validators'

/**
 * POST /api/auth/register
 * Register a new user with Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, password, name } = result.data

    // Sign up with Supabase Auth
    const { user, session, error } = await signUpUser(
      email.toLowerCase(),
      password,
      { name }
    )

    if (error) {
      console.error('Supabase signup error:', error)
      
      // Handle specific errors
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Return success with user info
    // Note: For email confirmation, session might be null
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || name,
      },
      message: session 
        ? 'Account created successfully' 
        : 'Account created! Please check your email to confirm your account.',
      requiresEmailConfirmation: !session,
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
