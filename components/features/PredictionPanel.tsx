'use client'

import React, { useState, useEffect } from 'react'
import { Patient } from '@/types'
import { getPrediction, Prediction } from '@/lib/ai/predict'
import { getProtocolsForFlags } from '@/lib/protocols'
import { supabase, SUPABASE_PREDICTIONS_TABLE } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertTriangle, ShieldCheck, Activity, Check, X, ServerOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { formatTimeAgo } from '@/lib/utils'

export function PredictionPanel({ patient, onClose }: { patient: Patient, onClose: () => void }) {
  const { session, profile } = useAuth()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [loggedActions, setLoggedActions] = useState<Record<string, boolean>>({})

  const fetchPrediction = async (bustCache = false) => {
    setLoading(true)
    setOffline(false)
    try {
      const result = await getPrediction(patient, bustCache)
      if (result) {
        setPrediction(result)
        // Log to predictions table (configurable)
        await supabase.from(SUPABASE_PREDICTIONS_TABLE).insert({
          patient_id: patient.id,
          risk_level: result.risk_level,
          priority_note: result.priority_note,
          recommended_protocols: result.predicted_interventions.map(i => i.action)
        })
      } else {
        setOffline(true)
      }
    } catch (err) {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrediction()
  }, [])

  const handleLogIntervention = async (actionStr: string, category: string) => {
    if (!profile) return
    await supabase.from('interventions').insert({
      patient_id: patient.id,
      patient_name: patient.name,
      action: actionStr,
      category: ['medication','monitoring','procedure','transfer','notification','other'].includes(category.toLowerCase()) ? category.toLowerCase() : 'other',
      is_delayed: false,
      logged_by_name: profile.full_name,
      shift_date: new Date().toISOString().split('T')[0]
    })
    setLoggedActions(prev => ({ ...prev, [actionStr]: true }))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-pink-900/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[400px] h-full bg-slate-50 shadow-2xl flex flex-col border-l border-slate-200"
        >
          {/* Header */}
          <div className="bg-white p-5 border-b border-slate-200 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900 m-0">{patient.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{patient.gravida_para}</span>
              </div>
              <p className="text-xs text-slate-500 italic mb-2">"{patient.chief_complaint}"</p>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full border border-pink-100">
                <Sparkles className="w-3 h-3" /> AI-Powered CDSS
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-pink-500 font-bold text-sm py-4">
                  <Sparkles className="w-5 h-5 animate-pulse" /> Analyzing patient data...
                </div>
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl bg-pink-100/50" />)}
              </div>
            ) : offline ? (
              <div className="space-y-5 animate-in fade-in">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-rose-800 text-sm font-medium">
                  <ServerOff className="w-5 h-5 shrink-0" />
                  FastAPI unavailable — showing rule-based protocols.
                </div>
                
                {getProtocolsForFlags(patient.clinical_flags || []).map((protocol) => (
                  <div key={protocol.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400" style={{ backgroundColor: protocol.color_hex }} />
                    <div className="p-4 pl-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">(DOH Protocol)</span>
                        <span className="text-sm font-bold text-slate-800">{protocol.flag_name}</span>
                      </div>
                      <div className="space-y-3">
                        {protocol.interventions.map((action, i) => {
                          const isLogged = loggedActions[action]
                          return (
                            <div key={i} className={`flex items-start justify-between gap-3 ${isLogged ? 'opacity-50' : ''}`}>
                              <span className="text-sm font-medium text-slate-700">{action}</span>
                              <Button variant={isLogged ? 'secondary' : 'primary'} size="sm" onClick={() => handleLogIntervention(action, 'other')} disabled={isLogged}>
                                {isLogged ? 'Logged' : 'Log'}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : prediction && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                
                <div className={`p-4 rounded-xl border flex gap-4 ${
                  prediction.risk_level === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                  prediction.risk_level === 'high' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{prediction.risk_level} Risk</h3>
                    <p className="text-sm m-0 leading-snug">{prediction.priority_note}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {prediction.predicted_interventions.map((item, idx) => {
                    const isLogged = loggedActions[item.action]
                    return (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        
                        {/* Confidence Bar */}
                        <div className="h-1.5 w-full bg-slate-100 relative">
                          <div className="absolute top-0 left-0 bottom-0 bg-pink-500 transition-all duration-1000" style={{ width: `${item.confidence}%` }} />
                        </div>
                        
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className={`text-sm font-bold m-0 leading-snug ${isLogged ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.action}</h4>
                            <span className="text-xs font-mono font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">{item.confidence}%</span>
                          </div>
                          
                          <p className="text-xs text-slate-500 italic m-0">"{item.rationale}"</p>
                          
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-50">
                            <div className="flex gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.category}</span>
                              {item.requires_physician_order && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">MD Order Required</span>
                              )}
                            </div>
                            
                            <Button 
                              variant={isLogged ? 'secondary' : 'primary'} 
                              size="sm" 
                              onClick={() => handleLogIntervention(item.action, item.category)}
                              disabled={isLogged}
                              className={!isLogged ? 'bg-pink-500 hover:bg-pink-600' : ''}
                            >
                              {isLogged ? <><Check className="w-3.5 h-3.5" /> Logged</> : 'Log this intervention'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white p-4 border-t border-slate-200 text-center">
            {prediction && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">Last updated: {formatTimeAgo(prediction.predicted_at)}</span>
                <button onClick={() => fetchPrediction(true)} className="text-xs font-bold text-pink-600 hover:text-pink-700">Refresh</button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">AI suggestions supplement — never replace — clinical judgment.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}