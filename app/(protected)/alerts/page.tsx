'use client'

import { useState } from 'react'
import { useAlerts } from '@/hooks/useAlerts'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatTimeAgo } from '@/lib/utils'
import { HandoffForm } from '@/components/features/HandoffForm'
import { Tag } from '@/components/ui/Tag'

export default function AlertsPage() {
  const { alerts, loading } = useAlerts()
  const { profile } = useAuth()
  
  // DR view is default for receiving
  const [activeTab, setActiveTab] = useState<'ER' | 'DR'>('DR')

  const handleAcknowledge = async (id: string) => {
    if (!profile) return
    await supabase.from('handoff_alerts').update({ 
      acknowledged: true, 
      acknowledged_at: new Date().toISOString(),
      acknowledged_by_name: profile.full_name
    }).eq('id', id)
  }

  const pendingAlerts = alerts.filter(a => !a.acknowledged)
  const ackedAlerts = alerts.filter(a => a.acknowledged)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('ER')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'ER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ER View — Send Alert
        </button>
        <button
          onClick={() => setActiveTab('DR')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'DR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          DR View — Receive Alerts
          {pendingAlerts.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {pendingAlerts.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ER' ? (
        <div className="max-w-xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4">
          <HandoffForm />
        </div>
      ) : (
        <div className="pt-4 space-y-8 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              Action Required
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Connection
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}
            </div>
          ) : pendingAlerts.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-slate-500 font-medium">All caught up</h3>
              <p className="text-sm text-slate-400">No pending handoff alerts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {pendingAlerts.map((alert) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={alert.id}
                    className="bg-white rounded-xl shadow-md border-l-4 border-l-rose-500 p-5 border-y border-r border-slate-200"
                  >
                    <div className="flex flex-col md:flex-row gap-5 justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-slate-900 m-0">
                            {alert.patient_name} <span className="text-sm text-slate-500 font-medium">{alert.patient?.age}y</span>
                          </h4>
                          <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                            {alert.patient?.gravida_para}
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                          {alert.patient?.clinical_flags?.map((f: string) => <Tag key={f} flagName={f} />)}
                        </div>

                        <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {alert.notes || alert.patient?.chief_complaint}
                        </p>
                        
                        <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-4">
                          <span className="font-bold text-slate-700">From: {alert.sent_by_name}</span>
                          <span className="font-bold text-rose-600">To: {alert.destination}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(alert.sent_at)}</span>
                        </div>
                      </div>

                      <div className="flex md:flex-col justify-end md:justify-center shrink-0">
                        <Button variant="primary" onClick={() => handleAcknowledge(alert.id)} className="w-full md:w-auto shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> Acknowledge
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {ackedAlerts.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <h3 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-wider">History</h3>
              <div className="space-y-3 opacity-60">
                {ackedAlerts.map(alert => (
                  <div key={alert.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-slate-700">{alert.patient_name}</div>
                      <div className="text-xs text-slate-500 mt-1">✓ Acknowledged {formatTimeAgo(alert.acknowledged_at!)} by {alert.acknowledged_by_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  )
}