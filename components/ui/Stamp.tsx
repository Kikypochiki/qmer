'use client'

import React, { useState, useEffect } from 'react'
import { Clock, ShieldCheck } from 'lucide-react'

export function Stamp() {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <ShieldCheck className="w-4 h-4 text-emerald-500" />
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-1">
          System Time
        </span>
        <span className="text-sm font-mono font-semibold text-slate-900 leading-none">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
    </div>
  )
}