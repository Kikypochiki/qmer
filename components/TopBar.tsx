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
    return { title: 'CO5MO', subtitle: 'Clinical System' }
  }

  const { title, subtitle } = getPageTitle()
  const [showMenu, setShowMenu] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Admit Patient', href: '/intake' },
    { name: 'Alerts & Handoff', href: '/alerts' },
    { name: 'Active Logs', href: '/log' },
    { name: 'Trends & Stats', href: '/trends' },
  ]

  return (
    <header 
      className="relative h-15 shrink-0 px-6 flex items-center justify-between sticky top-0 z-20 w-full ml-0 md:ml-60 md:w-[calc(100%-15rem)]"
      style={{
        backgroundColor: '#ffffff'
      }}
    >
      
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-2 -ml-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onClick={() => setShowMenu(prev => !prev)}
          aria-expanded={showMenu}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile menu panel */}
        {showMenu && (
          <div className="absolute left-4 top-full mt-2 w-64 bg-white rounded-lg p-2 shadow-elevation-lg md:hidden z-40"
            style={{ border: 'none' }}
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setShowMenu(false)
                  router.push(item.href)
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                style={{ color: 'var(--color-on-surface-variant)', background: 'transparent' }}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-col">
          <h2 
            className="text-lg font-bold m-0 leading-tight"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {title}
          </h2>
          <p 
            className="text-xs font-medium m-0 flex items-center gap-2"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {subtitle}
            <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: 'var(--color-outline-variant)' }}></span>
            ODH Unit
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Clock */}
        <div 
          className="hidden lg:flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            backgroundColor: '#f4f4f2',
            color: 'var(--color-on-surface-variant)'
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="text-sm font-mono font-medium min-w-[100px] text-center">
            {mounted ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:-- --'}
          </span>
        </div>

        {/* Search form */}
        <form onSubmit={(e) => e.preventDefault()} className="relative hidden sm:block">
          <Search 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--color-on-surface-variant)' }}
          />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="!pl-10 pr-4 py-2 rounded-full text-sm outline-none transition-all w-[240px] focus:w-[280px]"
            style={{
              backgroundColor: '#f4f4f2',
              color: 'var(--color-on-surface)'
            }}
          />
        </form>

        {/* Alerts */}
        <Link 
          href="/alerts" 
          className="relative p-2 rounded-full transition-colors"
          style={{
            backgroundColor: unackedCount > 0 ? 'var(--color-error-container)' : '#f4f4f2',
            color: unackedCount > 0 ? 'var(--color-error)' : 'var(--color-on-surface-variant)'
          }}
        >
          <BellRing className="w-4 h-4" />
          {unackedCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-error)' }}
            >
              {unackedCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}