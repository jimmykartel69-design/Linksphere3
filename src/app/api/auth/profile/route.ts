import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { userProfileSchema } from '@/lib/validators'

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = userProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: parsed.data.name,
        locale: parsed.data.locale,
        timezone: parsed.data.timezone,
      })
      .eq('id', authUser.id)
      .select('id, name, avatar_url, role, badge, locale, timezone')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      user: {
        id: data.id,
        name: data.name,
        avatarUrl: data.avatar_url,
        role: data.role,
        badge: data.badge,
        locale: data.locale,
        timezone: data.timezone,
        email: authUser.email,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

