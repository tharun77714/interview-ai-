'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target, Clock, Trophy, Play } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type ProfileData = {
  profileCompletionScore: number
  targetRole: string
  experienceLevel: string
  yearsOfExperience: number
  currentGoal: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl bg-white/5" />
          <Skeleton className="h-32 rounded-xl bg-white/5" />
          <Skeleton className="h-32 rounded-xl bg-white/5" />
        </div>
        <Skeleton className="h-[400px] rounded-xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome back. Here is your preparation status.</p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.profileCompletionScore || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Target: {profile?.targetRole}</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">No interviews completed yet</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Goal</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{profile?.currentGoal || 'Not set'}</div>
            <p className="text-xs text-muted-foreground mt-1">{profile?.experienceLevel} ({profile?.yearsOfExperience}y exp)</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State / CTA */}
      <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Start your preparation journey</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Upload your first resume and a job description to generate a personalized AI interview session.
          </p>
          <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
