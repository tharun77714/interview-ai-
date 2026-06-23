import { db, users, candidateProfiles } from 'database'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { LayoutClient } from './LayoutClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabaseServer = await createServerClient()
  const { data: { session } } = await supabaseServer.auth.getSession()
  
  if (session?.user) {
    const userRecords = await db.select().from(users).where(eq(users.authProviderId, session.user.id)).limit(1)
    if (userRecords.length === 0) {
      redirect('/onboarding')
    } else {
      const profiles = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, userRecords[0].id)).limit(1)
      if (profiles.length === 0) {
        redirect('/onboarding')
      }
    }
  }

  return <LayoutClient>{children}</LayoutClient>
}
