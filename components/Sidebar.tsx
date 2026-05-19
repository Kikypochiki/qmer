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
    <aside className="w-[240px] h-screen bg-slate-50 border-r border-slate-200 fixed left-0 top-0 flex flex-col z-30 hidden md:flex">
      
      {/* Brand Header */}
      <div className="h-[60px] flex items-center px-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-slate-900" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            QMeR<span className="text-rose-600">+</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {item.name}
                
                {/* Simulated Notification Badge for Alerts */}
                {item.badge && (
                  <span className="ml-auto bg-rose-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
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
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 group relative">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold shrink-0">
              {profile.full_name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-slate-900 truncate leading-tight">{profile.full_name}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate">{profile.role.replace('_', ' ')}</span>
            </div>
            
            <button 
              onClick={async () => {
                await signOut()
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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