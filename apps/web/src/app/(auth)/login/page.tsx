'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Sync to Postgres via application level sync
    try {
      const res = await fetch('/api/v1/auth/sync', { method: 'POST' })
      const data = await res.json()
      toast.success('Successfully logged in')
      if (data.needsOnboarding) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch {
      router.push('/dashboard')
    }
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:ring-primary/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
