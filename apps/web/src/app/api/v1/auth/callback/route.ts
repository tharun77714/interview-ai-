import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { db, users, candidateProfiles } from 'database'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Sync user to Drizzle database (Idempotent)
      try {
        const existingUser = await db.select().from(users).where(eq(users.authProviderId, session.user.id)).limit(1)
        
        if (existingUser.length === 0) {
          // Create user
          await db.insert(users).values({
            authProviderId: session.user.id,
            email: session.user.email!,
          })
          
          // Redirect to onboarding if newly created
          return NextResponse.redirect(`${origin}/onboarding`)
        } else {
          // Check if profile exists
          const existingProfile = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, existingUser[0].id)).limit(1)
          if (existingProfile.length === 0) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }
      } catch (dbError) {
        console.error('Database Sync Error:', dbError)
        // Even if DB fails, allow them to proceed (they will be caught by onboarding or dashboard checks)
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
