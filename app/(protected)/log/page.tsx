'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { formatTimeAgo } from '@/lib/utils'
import { FileText, Clock, User, Plus, ShieldAlert, Search } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { DelayedEntryForm } from '@/components/features/DelayedEntryForm'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Patient, Intervention } from '@/types'

export default function LogPage() {
  const { session } = useAuth()
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [patientSearch, setPatientSearch] = useState('')

  const fetchInterventions = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch today's interventions
    const { data: iData } = await supabase
      .from('interventions')
      .select('*')
      .eq('shift_date', today)
      .order('documented_at', { ascending: false })
      
    if (iData) setInterventions(iData)
    
    // Fetch active patients for the selector
    const { data: pData } = await supabase
      .from('patients')
      .select('*')
      .eq('is_transferred', false)
      
    if (pData) setPatients(pData)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchInterventions()

    const channel = supabase.channel('interventions-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interventions' }, (payload) => {
        const newRecord = payload.new as Intervention
        setInterventions(prev => {
          if (prev.find(i => i.id === newRecord.id)) return prev
          return [newRecord, ...prev]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  // Metrics
  const todayCount = interventions.length
  const delayedCount = interventions.filter(i => i.is_delayed).length
  const lastLogged = interventions.length > 0 ? formatTimeAgo(interventions[0].documented_at) : '--'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header & Metrics */}
      <div className="bg-white p-6 rounded-xl border border-pink-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
              <FileText className="w-6 h-6 text-pink-500" /> Intervention Log
            </h2>
            <p className="text-sm text-slate-500 mt-1 m-0">Shift interventions and delayed documentation records.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="bg-pink-50 px-4 py-2 rounded-lg border border-pink-100">
              <div className="text-[10px] uppercase font-bold text-pink-500 tracking-wider">Today</div>
              <div className="text-lg font-black text-pink-900">{todayCount}</div>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
              <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Delayed</div>
              <div className="text-lg font-black text-amber-900">{delayedCount}</div>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Log</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{lastLogged}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT - Timeline */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
            </div>
          ) : interventions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-slate-500 font-medium">No interventions logged today.</h4>
            </div>
          ) : (
            <div className="relative border-l-2 border-pink-100 ml-4 md:ml-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {interventions.map((log) => {
                  const isDelayed = log.is_delayed
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={log.id} 
                      className="relative pl-6 md:pl-8"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[9px] top-5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        isDelayed ? 'bg-amber-500' : 'bg-pink-600'
                      }`} />

                      <div className={`bg-white border rounded-xl p-4 shadow-sm transition-shadow ${isDelayed ? 'border-amber-300' : 'border-slate-200'}`}>
                        {isDelayed && (
                          <div className="mb-3 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5 w-fit">
                            <ShieldAlert className="w-3.5 h-3.5" /> 
                            ⚠ Delayed entry — actual time: {new Date(log.actual_time!).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base m-0">{log.action}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                                {log.category}
                              </span>
                              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <User className="w-3 h-3" /> {log.patient_name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="block text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              {new Date(log.documented_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {log.notes && (
                          <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg italic border border-slate-100 m-0">
                            "{log.notes}"
                          </p>
                        )}

                        <div className="mt-3 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          Logged by {log.logged_by_name}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT - Form */}
        <div>
          {!showForm ? (
            <Button variant="primary" onClick={() => setShowForm(true)} className="w-full h-12 shadow-md">
              <Plus className="w-5 h-5 mr-1" /> Log Intervention
            </Button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">New Entry</h3>
                <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-600 mb-2">Select Patient</label>
                {!selectedPatientId ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search patient name..."
                        value={patientSearch}
                        onChange={e => setPatientSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20"
                      />
                    </div>
                    {patientSearch && (
                      <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg shadow-sm">
                        {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 ? (
                          <div className="p-3 text-sm text-slate-400 text-center">No patients found.</div>
                        ) : (
                          patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPatientId(p.id)}
                              className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-700 text-sm">{p.name}</span>
                              <span className="text-xs text-slate-400">{p.gravida_para}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-pink-50 border border-pink-100 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-pink-900">{selectedPatient?.name}</div>
                        <div className="text-xs text-pink-600">{selectedPatient?.current_ward} • {selectedPatient?.alert_level}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedPatientId(''); setPatientSearch(''); }} className="text-xs font-bold text-slate-400 hover:text-slate-600">Change</button>
                  </div>
                )}
              </div>

              {selectedPatientId && selectedPatient && (
                <DelayedEntryForm 
                  patientId={selectedPatient.id}
                  patientName={selectedPatient.name}
                  onSave={() => {
                    setShowForm(false)
                    setSelectedPatientId('')
                  }}
                />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}