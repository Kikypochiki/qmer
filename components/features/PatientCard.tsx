'use client'

import React from 'react'
import Link from 'next/link'
import { Patient } from '@/types'
import { Tag } from '@/components/ui/Tag'
import { Clock, Activity, ArrowRight, User } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'

export function PatientCard({ patient }: { patient: Patient }) {
  const isCritical = patient.alert_level === 'Critical'
  const isModerate = patient.alert_level === 'Moderate'
  
  const statusColor = isCritical ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col h-full overflow-hidden">
      
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusColor}`} />

      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-white pt-5">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-slate-200 bg-slate-50`}>
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0 leading-tight">
              {patient.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
              {patient.age}y · {patient.gravida_para}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Time</span>
          <span className="text-xs font-mono font-medium text-slate-900">
            {new Date(patient.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 bg-slate-50/50 space-y-3">
        {/* Clinical Flags */}
        {patient.clinical_flags && patient.clinical_flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {patient.mode_of_delivery && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-md">
                {patient.mode_of_delivery}
              </span>
            )}
            {patient.clinical_flags.map(flag => (
              <Tag key={flag} flagName={flag} size="sm" />
            ))}
          </div>
        )}
        
        {/* Chief Complaint Quote */}
        {patient.chief_complaint && (
          <div className="bg-white border border-slate-200 rounded-lg p-3 relative">
            <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Complaint</span>
            <p className="text-sm text-slate-700 italic m-0 pt-1">"{patient.chief_complaint}"</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">
            {patient.updated_at ? formatTimeAgo(patient.updated_at) : 'No assessments'}
          </span>
        </div>
        
        <Link href={`/patients/${patient.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700">
          View Profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  )
}