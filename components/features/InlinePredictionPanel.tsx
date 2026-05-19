'use client'

import React, { useState, useEffect } from 'react'
import { Patient } from '@/types'
import { getPrediction, Prediction } from '@/lib/ai/predict'
import { getProtocolsForFlags } from '@/lib/protocols'
import { supabase, SUPABASE_PREDICTIONS_TABLE } from '@/lib/supabase/client'
import { Sparkles, AlertTriangle, Activity, Check, X, ServerOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/hooks/useAuth'
import { formatTimeAgo } from '@/lib/utils'

export function InlinePredictionPanel({ patient, onClose }: { patient: Patient, onClose?: () => void }) {
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
        const basePayload: any = {
          patient_id: patient.id,
          input_flags: patient.clinical_flags || [],
          input_cervix: patient.cervix_dilation || null,
          input_mode: patient.mode_of_delivery || null,
          predicted_interventions: result.predicted_interventions || [],
          risk_level: result.risk_level,
          priority_note: result.priority_note,
          model_version: result.model_version || 'unknown',
          predicted_at: result.predicted_at || new Date().toISOString()
        }

        try {
          const { error } = await supabase.from(SUPABASE_PREDICTIONS_TABLE).insert(basePayload)
          if (error) throw error
        } catch (err) {
          console.error('Prediction insert failed on', SUPABASE_PREDICTIONS_TABLE, err)
          try {
            const { error: e2 } = await supabase.from('ai_predictions').insert(basePayload)
            if (e2) throw e2
          } catch (err2) {
            console.error('Fallback insert to ai_predictions failed', err2)
            const minimal = { patient_id: basePayload.patient_id, risk_level: basePayload.risk_level, priority_note: basePayload.priority_note, predicted_at: basePayload.predicted_at }
            try {
              const { error: e3 } = await supabase.from(SUPABASE_PREDICTIONS_TABLE).insert(minimal)
              if (e3) throw e3
            } catch (err3) {
              console.error('Final fallback insert failed', err3)
            }
          }
        }
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
  }, [patient?.id])

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
    <div className="space-y-5 mt-4">
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

          {prediction && (
            <div className="text-[10px] text-slate-400">
              <div className="flex items-center justify-between mb-3">
                <span>Last updated: {formatTimeAgo(prediction.predicted_at)}</span>
                <button onClick={() => fetchPrediction(true)} className="text-xs font-bold text-pink-600 hover:text-pink-700">Refresh</button>
              </div>
              <p>AI suggestions supplement — never replace — clinical judgment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
