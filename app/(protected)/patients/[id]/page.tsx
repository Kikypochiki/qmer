'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Patient } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tag } from '@/components/ui/Tag'
import { PredictionPanel } from '@/components/features/PredictionPanel'
import { LaborMonitoringForm } from '@/components/features/LaborMonitoringForm'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Clock, Activity, FileText } from 'lucide-react'
import Link from 'next/link'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCDSS, setShowCDSS] = useState(false)

  useEffect(() => {
    supabase.from('patients').select('*').eq('id', id).single()
      .then(({ data }) => {
        setPatient(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  )
  if (!patient) return <div className="text-slate-500 text-center py-10 bg-slate-50 rounded-xl border border-slate-200">Patient not found</div>

  return (
    <div className="space-y-6 pb-20">
      
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${
          patient.alert_level === 'Critical' ? 'bg-rose-500' : patient.alert_level === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 m-0">{patient.name}</h1>
            <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${
              patient.alert_level === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
              patient.alert_level === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {patient.alert_level}
            </span>
          </div>
          
          <Button variant="primary" size="sm" onClick={() => setShowCDSS(true)} className="mb-3">
            View CDSS
          </Button>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span>{patient.age}y</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{patient.gravida_para}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Admitted {new Date(patient.created_at).toLocaleDateString()}</span>
          </div>

          {patient.clinical_flags && patient.clinical_flags.length > 0 && (
            <div className="flex gap-2 mt-4">
              {patient.clinical_flags.map(f => <Tag key={f} flagName={f} />)}
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex-1 md:max-w-xs">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Chief Complaint
          </h4>
          <p className="text-sm text-slate-700 italic m-0">"{patient.chief_complaint}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <LaborMonitoringForm patient={patient} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" /> Baseline Vitals
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Cervix Dilation</span>
                <span className="text-sm font-semibold text-slate-900">{patient.cervix_dilation || '--'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Contractions</span>
                <span className="text-sm font-semibold text-slate-900">{patient.contraction_freq || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Target Delivery</span>
                <span className="text-sm font-semibold text-slate-900">{patient.mode_of_delivery || 'NSVD'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showCDSS && <PredictionPanel patient={patient} onClose={() => setShowCDSS(false)} />}
    </div>
  )
}