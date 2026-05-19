'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UserPlus, Users, AlertTriangle, LineChart, FileText, Settings, Stethoscope, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Admit Patient', href: '/intake', icon: UserPlus },
  { name: 'Alerts & Handoff', href: '/alerts', icon: AlertTriangle, badge: true },
  { name: 'Active Logs', href: '/log', icon: FileText },
  { name: 'Trends & Stats', href: '/trends', icon: LineChart },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <aside 
      className="w-60 h-screen fixed left-0 top-0 flex flex-col z-30 hidden md:flex"
      style={{
        backgroundColor: '#f9f9f7'
      }}
    >
      
      {/* Brand Header */}
      <div 
        className="h-15 flex items-center px-6"
        style={{ 
          backgroundColor: '#ffffff'
        }}
      >
        <div className="flex items-center gap-2">
          <Stethoscope 
            className="w-6 h-6" 
            style={{ color: 'var(--color-primary)' }}
          />
          <h1 
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--color-on-surface)' }}
          >
            CO5MO
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-4 mb-2">
          <p 
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            Menu
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200`}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary-fixed)' : 'transparent',
                  color: isActive ? 'var(--color-on-primary-fixed)' : 'var(--color-on-surface-variant)',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent'
                }}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.name}
                
                {/* Notification Badge */}
                {item.badge && (
                  <span 
                    className="ml-auto text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: 'var(--color-error)' }}
                  >
                    !
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Profile */}
      {profile && (
        <div 
          className="p-4"
          style={{ 
            backgroundColor: '#ffffff'
          }}
        >
          <div 
            className="flex items-center gap-3 p-2.5 rounded-lg"
            style={{ 
              backgroundColor: '#f4f4f2'
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)'
              }}
            >
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span 
                className="text-sm font-bold truncate leading-tight"
                style={{ color: 'var(--color-on-surface)' }}
              >
                {profile.full_name}
              </span>
              <span 
                className="text-xs uppercase tracking-wider font-semibold truncate"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                {profile.role.replace('_', ' ')}
              </span>
            </div>
            
            <button 
              onClick={async () => {
                await signOut()
              }}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--color-on-surface-variant)' }}
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}