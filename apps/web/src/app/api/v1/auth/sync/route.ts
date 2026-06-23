import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, users, candidateProfiles } from 'database'
import { eq } from 'drizzle-orm'

export async function POST() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.authProviderId, session.user.id)).limit(1)
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        authProviderId: session.user.id,
        email: session.user.email!,
      })
      return NextResponse.json({ synced: true, needsOnboarding: true })
    } else {
      const existingProfile = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, existingUser[0].id)).limit(1)
      if (existingProfile.length === 0) {
        return NextResponse.json({ synced: true, needsOnboarding: true })
      }
    }

    return NextResponse.json({ synced: true, needsOnboarding: false })
  } catch (error) {
    console.error('User Sync Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
