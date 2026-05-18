'use client'

import { usePathname } from 'next/navigation'
import { BellRing, Search, Menu, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAlerts } from '@/hooks/useAlerts'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useAuth()
  const { unackedCount } = useAlerts()
  const [time, setTime] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim() === '') {
      if (pathname === '/dashboard') {
        router.replace('/dashboard')
      }
      return
    }

    if (pathname !== '/dashboard') {
      router.push(`/dashboard?search=${encodeURIComponent(query)}`)
    } else {
      router.replace(`/dashboard?search=${encodeURIComponent(query)}`)
    }
  }

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return { title: 'Dashboard', subtitle: 'Overview' }
    if (pathname.includes('/intake')) return { title: 'Admit Patient', subtitle: 'New Entry' }
    if (pathname.includes('/alerts')) return { title: 'Alerts & Handoff', subtitle: 'Action Required' }
    if (pathname.includes('/log')) return { title: 'Active Logs', subtitle: 'Interventions' }
    if (pathname.includes('/trends')) return { title: 'Trends & Stats', subtitle: 'Analytics' }
    if (pathname.includes('/patients/')) return { title: 'Patient Profile', subtitle: 'Details' }
    return { title: 'QMeR+', subtitle: 'Clinical System' }
  }

  const { title, subtitle } = getPageTitle()

  return (
    <header className="h-[60px] shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 w-full ml-0 md:ml-[240px] md:w-[calc(100%-240px)]">
      
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 m-0 leading-tight">{title}</h2>
          <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-2">
            {subtitle}
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
            ODH Unit
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-mono font-medium text-slate-700 min-w-[100px] text-center">
            {mounted ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:-- --'}
          </span>
        </div>

        {/* Search form */}
        <form onSubmit={(e) => e.preventDefault()} className="relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="!pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-slate-300 transition-all w-[240px] focus:w-[280px]"
          />
        </form>

        {/* Alerts */}
        <Link href="/alerts" className="relative p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors">
          <BellRing className={`w-4 h-4 ${unackedCount > 0 ? 'text-rose-600' : ''}`} />
          {unackedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unackedCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}