'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type OnboardingData = {
  targetRole: string
  experienceLevel: string
  yearsOfExperience: string
  currentGoal: string
}

const steps = [
  { id: 'role', title: 'Target Role', description: 'What role are you preparing for?' },
  { id: 'experience', title: 'Experience', description: 'What is your current experience level?' },
  { id: 'goal', title: 'Current Goal', description: 'What are you hoping to achieve?' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    targetRole: '',
    experienceLevel: '',
    yearsOfExperience: '',
    currentGoal: '',
  })
  const router = useRouter()

  const handleNext = () => {
    if (step === 0 && !data.targetRole) return toast.error('Please enter a target role')
    if (step === 1 && (!data.experienceLevel || !data.yearsOfExperience)) return toast.error('Please complete all fields')
    
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      submitProfile()
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const submitProfile = async () => {
    if (!data.currentGoal) return toast.error('Please enter your current goal')
    
    setLoading(true)
    try {
      const res = await fetch('/api/v1/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: data.targetRole,
          experienceLevel: data.experienceLevel,
          yearsOfExperience: parseInt(data.yearsOfExperience) || 0,
          currentGoal: data.currentGoal,
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save profile')
      }

      toast.success('Profile created successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error('Could not save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg mb-8">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        <Card className="glass-card overflow-hidden relative border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">{steps[step].title}</CardTitle>
            <CardDescription>{steps[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <Label>Target Role</Label>
                    <Input 
                      placeholder="e.g. Full Stack Engineer" 
                      value={data.targetRole}
                      onChange={(e) => setData({ ...data, targetRole: e.target.value })}
                      className="bg-black/20 border-white/10 text-lg py-6"
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Experience Level</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Fresher', 'Junior', 'Mid Level', 'Senior'].map((level) => (
                          <Button
                            key={level}
                            type="button"
                            variant={data.experienceLevel === level ? 'default' : 'outline'}
                            onClick={() => setData({ ...data, experienceLevel: level })}
                            className={data.experienceLevel !== level ? 'bg-black/20 border-white/10 hover:bg-white/10' : ''}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>Years of Experience</Label>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="e.g. 2" 
                        value={data.yearsOfExperience}
                        onChange={(e) => setData({ ...data, yearsOfExperience: e.target.value })}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <Label>Primary Goal</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Job Switch', 'FAANG Preparation', 'Promotion', 'General Practice'].map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant={data.currentGoal === goal ? 'default' : 'outline'}
                          onClick={() => setData({ ...data, currentGoal: goal })}
                          className={`justify-start ${data.currentGoal !== goal ? 'bg-black/20 border-white/10 hover:bg-white/10' : ''}`}
                        >
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-white/5 pt-6 bg-black/20">
            <Button variant="ghost" onClick={handleBack} disabled={step === 0 || loading}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
              {loading ? 'Saving...' : step === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
