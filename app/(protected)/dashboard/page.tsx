'use client'

import React from 'react'
import { usePatients } from '@/hooks/usePatients'
import { useAlerts } from '@/hooks/useAlerts'
import { PatientCard } from '@/components/features/PatientCard'
import { Users, AlertTriangle, ArrowRightLeft, CheckCircle2, Stethoscope, SearchX } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { motion } from 'framer-motion'

export default function DashboardPage({ searchParams }: { searchParams?: Promise<{ search?: string }> }) {
  // Safe unwrapping for Next.js 15
  const unwrappedParams = searchParams ? React.use(searchParams) : {}
  const searchQuery = unwrappedParams.search?.toLowerCase() || ''

  const { patients, loading } = usePatients()
  const { unackedCount } = useAlerts()

  // Filter if searchQuery is present
  const filteredPatients = patients.filter(p => 
    searchQuery ? p.name.toLowerCase().includes(searchQuery) : true
  )

  const criticalCount = patients.filter(p => p.alert_level === 'Critical').length
  const transferredCount = patients.filter(p => p.is_transferred).length
  const activeCount = patients.length - transferredCount

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: activeCount, icon: Users, bg: 'bg-slate-100', iconColor: 'text-slate-600' },
          { label: 'Critical', value: criticalCount, icon: AlertTriangle, bg: 'bg-rose-50', iconColor: 'text-rose-600' },
          { label: 'Pending Handoffs', value: unackedCount, icon: ArrowRightLeft, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
          { label: 'Transferred', value: transferredCount, icon: CheckCircle2, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.iconColor} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold m-0">{stat.label}</p>
            </div>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900 mt-3 m-0">
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
          {[1,2,3].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
        </div>
      ) : searchQuery && filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-slate-200 border-dashed rounded-xl bg-slate-50 mt-8">
          <SearchX className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-slate-700 font-bold m-0">No results found for "{unwrappedParams.search}"</h4>
          <p className="text-slate-500 text-sm mt-1">Try checking for typos or searching a different name.</p>
        </div>
      ) : (
        <div className="space-y-10 mt-8">
          {searchQuery && (
            <p className="text-sm font-semibold text-slate-600 mb-2">Showing search results for: <span className="text-slate-900 font-bold">"{unwrappedParams.search}"</span></p>
          )}
          {['Critical', 'Moderate', 'Stable'].map(level => {
            const group = filteredPatients.filter(p => p.alert_level === level && !p.is_transferred)
            
            // If we are searching and there are no patients in this group, hide the group entirely
            if (searchQuery && group.length === 0) return null

            return (
              <div key={level} className="space-y-4">
                <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-3">
                  <div className={`w-2 h-2 rounded-full ${
                    level === 'Critical' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : level === 'Moderate' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  }`} />
                  <h4 className="m-0 text-lg font-bold text-slate-900">{level}</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {group.length}
                  </span>
                </div>

                {group.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border border-slate-200 border-dashed rounded-xl bg-slate-50">
                    <Stethoscope className="w-10 h-10 text-slate-300 mb-2" />
                    <h4 className="text-slate-500 font-medium m-0">No {level} patients</h4>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.map(patient => (
                      <PatientCard key={patient.id} patient={patient} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filteredPatients.filter(p => p.is_transferred).length > 0 && (
            <div className="space-y-4 pt-8 opacity-60">
              <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-3">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <h4 className="m-0 text-lg font-bold text-slate-500">Transferred</h4>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPatients.filter(p => p.is_transferred).map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}