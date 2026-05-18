import React from 'react'
import { AlertCircle, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Activity, Info } from 'lucide-react'

interface TagProps {
  flagName: string
  className?: string
  size?: 'sm' | 'md'
  onRemove?: () => void
}

const FLAG_STYLES: Record<string, { bg: string, text: string, border: string, dot: string, icon: any, type: string }> = {
  // Critical
  'Pre-eclampsia': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', icon: AlertCircle, type: 'critical' },
  'Eclampsia': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', icon: AlertCircle, type: 'critical' },
  'Cord prolapse': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', icon: AlertCircle, type: 'critical' },
  'Fetal distress': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', icon: AlertCircle, type: 'critical' },
  'PPH': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', icon: AlertCircle, type: 'critical' },
  
  // Moderate
  'GDM': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: AlertTriangle, type: 'moderate' },
  'PROM': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: AlertTriangle, type: 'moderate' },
  'Meconium': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: AlertTriangle, type: 'moderate' },
  'Prolonged Labor': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: Clock, type: 'moderate' },
  
  // Stable
  'Term': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2, type: 'stable' },
  'Preterm': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', icon: Info, type: 'info' }
}

export function Tag({ flagName, className = '', size = 'md', onRemove }: TagProps) {
  const style = FLAG_STYLES[flagName] || { 
    bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400', icon: Activity, type: 'default' 
  }
  const Icon = style.icon

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5"
  }

  return (
    <span className={`inline-flex items-center ${style.bg} ${style.text} border ${style.border} ${sizeClasses[size]} rounded-md font-medium tracking-wide ${className}`}>
      <Icon className={size === 'sm' ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {flagName}
      {onRemove && (
        <button type="button" onClick={onRemove} className={`hover:bg-black/10 rounded-full p-0.5 ml-1 transition-colors`}>
          <span className="sr-only">Remove</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}