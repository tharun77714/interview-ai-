'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, User, LogOut, Settings, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'History', href: '#', icon: BarChart2 },
    { name: 'Settings', href: '#', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs">AI</span>
            </div>
            InterviewAI
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        
        <header className="h-16 flex items-center px-8 border-b border-white/5 backdrop-blur-sm">
          <h1 className="text-sm font-medium text-muted-foreground">
            {navItems.find((i) => i.href === pathname)?.name || 'Overview'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
