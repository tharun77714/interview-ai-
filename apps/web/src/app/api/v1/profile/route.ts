import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db, candidateProfiles } from 'database'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const profileSchema = z.object({
  targetRole: z.string().min(2),
  experienceLevel: z.string(),
  yearsOfExperience: z.number().int().min(0),
  currentGoal: z.string(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // In our current auth/sync logic, user.id from Supabase matches the authProviderId in Postgres.
    // However, candidate_profiles uses `userId` which is the internal Postgres UUID.
    // So we first need to get the internal user ID.
    const { users } = await import('database')
    const userRecords = await db.select().from(users).where(eq(users.authProviderId, session.user.id)).limit(1)
    
    if (userRecords.length === 0) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 })
    }

    const profiles = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, userRecords[0].id)).limit(1)
    
    if (profiles.length === 0) {
      return NextResponse.json({ profile: null }, { status: 404 })
    }

    return NextResponse.json({ profile: profiles[0] })
  } catch (error) {
    console.error('Profile Fetch Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json = await request.json()
    const parsed = profileSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { users } = await import('database')
    const userRecords = await db.select().from(users).where(eq(users.authProviderId, session.user.id)).limit(1)
    
    if (userRecords.length === 0) {
      return NextResponse.json({ error: 'User not synced' }, { status: 400 })
    }

    const internalUserId = userRecords[0].id

    // Check if profile exists
    const existing = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, internalUserId)).limit(1)

    if (existing.length > 0) {
      // Update
      const [updated] = await db.update(candidateProfiles)
        .set({
          targetRole: parsed.data.targetRole,
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.userId, internalUserId))
        .returning()
      
      return NextResponse.json({ profile: updated })
    } else {
      // Create
      const [created] = await db.insert(candidateProfiles).values({
        userId: internalUserId,
        targetRole: parsed.data.targetRole,
      }).returning()

      return NextResponse.json({ profile: created }, { status: 201 })
    }

  } catch (error) {
    console.error('Profile Save Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
