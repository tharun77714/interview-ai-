'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type ProfileData = {
  profileCompletionScore: number
  targetRole: string
  experienceLevel: string
  yearsOfExperience: number
  currentGoal: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/v1/profile')
        const data = await res.json()
        if (data.profile) {
          setProfile(data.profile)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: profile?.targetRole,
          experienceLevel: profile?.experienceLevel,
          yearsOfExperience: parseInt(String(profile?.yearsOfExperience)) || 0,
          currentGoal: profile?.currentGoal,
        })
      })

      if (!res.ok) throw new Error('Failed to save profile')
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your account and interview goals.</p>
      </div>

      <Card className="glass-card border-white/5">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Career Goals</CardTitle>
            <CardDescription>This information helps the AI tailor your interviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Target Role</Label>
              <Input 
                value={profile?.targetRole || ''} 
                onChange={(e) => setProfile({...profile, targetRole: e.target.value} as ProfileData)}
                className="bg-black/20 border-white/10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Input 
                  value={profile?.experienceLevel || ''} 
                  onChange={(e) => setProfile({...profile, experienceLevel: e.target.value} as ProfileData)}
                  className="bg-black/20 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input 
                  type="number"
                  value={profile?.yearsOfExperience || 0} 
                  onChange={(e) => setProfile({...profile, yearsOfExperience: parseInt(e.target.value)} as ProfileData)}
                  className="bg-black/20 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Goal</Label>
              <Input 
                value={profile?.currentGoal || ''} 
                onChange={(e) => setProfile({...profile, currentGoal: e.target.value} as ProfileData)}
                className="bg-black/20 border-white/10"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-black/20 border-t border-white/5 pt-6 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
