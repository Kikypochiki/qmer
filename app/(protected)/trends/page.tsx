'use client'

import React, { useState, useEffect } from 'react'
import { getTrends } from '@/lib/ai/predict'
import { getProtocolsForFlags, PROTOCOLS } from '@/lib/protocols'
import { supabase } from '@/lib/supabase/client'
import { Patient, Predictions as PredictionType, Intervention } from '@/types'
import { InlinePredictionPanel } from '@/components/features/InlinePredictionPanel'
import { Button } from '@/components/ui/Button'
import { Sparkles, BarChart3, Activity, Clock, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrendsPage() {
  const [trends, setTrends] = useState<{ interventions: { action: string, count: number, category: string }[], avgDelay: number, totalInterventions?: number, alertFatigue?: number, timestampAccuracy?: number } | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [predictions, setPredictions] = useState<PredictionType[]>([])
  const [showPredictionsList, setShowPredictionsList] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [showCDSS, setShowCDSS] = useState(false)
  const [query, setQuery] = useState('')
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)
  
  // Local state for checkboxes in protocols
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getTrends().then(data => {
      if (data) setTrends(data)
    })
    // Also fetch recent interventions directly from the interventions table and aggregate
    ;(async () => {
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const iso = thirtyDaysAgo.toISOString()
        const { data: iData, error: iError } = await supabase
          .from('interventions')
          .select('*')
          .gte('documented_at', iso)
          .order('documented_at', { ascending: false })

        if (iError) throw iError

        const rows = (iData || []) as Intervention[]
        const counts = new Map<string, { count: number; category: string }>()
        for (const r of rows) {
          const key = r.action || 'Unknown'
          const existing = counts.get(key) || { count: 0, category: r.category || 'other' }
          existing.count += 1
          if (!existing.category && r.category) existing.category = r.category
          counts.set(key, existing)
        }

        const aggregated = Array.from(counts.entries()).map(([action, { count, category }]) => ({ action, count, category }))
          .sort((a, b) => b.count - a.count)

        // Only overwrite the server-provided trends when we actually have aggregated rows
        if (aggregated.length > 0) {
          setTrends(prev => ({
            ...(prev ?? { avgDelay: 0, interventions: [] }),
            interventions: aggregated,
            totalInterventions: rows.length
          }))
        } else {
          // keep existing trends (from getTrends) — helpful when local supabase returns no recent rows
          console.debug('[Trends] Supabase aggregation returned no rows; keeping server trends')
        }
      } catch (err) {
        // ignore - keep server trends fallback
        console.error('Failed to load interventions for trends:', err)
      }
    })()
    supabase.from('patients').select('*').eq('is_transferred', false).then(({ data }) => {
      if (data) setPatients(data)
    })
    // Fetch recent predictions stored in Supabase
    supabase.from(process.env.NEXT_PUBLIC_SUPABASE_PREDICTIONS_TABLE || 'predictions')
      .select('*')
      .order('predicted_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPredictions(data as PredictionType[])
      })
  }, [])

  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const maxInterventionCount = trends?.interventions?.[0]?.count || 1

  // Derived metrics from trends API
  const casesAnalyzed = predictions.length || (trends?.totalInterventions ?? trends?.interventions?.reduce((s, it) => s + (it.count || 0), 0) ?? 0)
  const avgHandoffTime = trends?.avgDelay != null ? `${trends.avgDelay} min` : '—'
  const timestampAccuracy = trends?.timestampAccuracy != null ? `${trends.timestampAccuracy}%` : '—'
  const alertFatigueDisplay = (() => {
    if (trends?.alertFatigue == null) return '—'
    const v = trends.alertFatigue
    return `${v < 0 ? '↓ ' + Math.abs(v) + '%' : v > 0 ? '↑ ' + v + '%' : '0%'} `
  })()

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cases Analyzed', value: String(casesAnalyzed), icon: Sparkles, onClick: () => setShowPredictionsList(v => !v) },
          { label: 'Timestamp Accuracy', value: String(timestampAccuracy), icon: Clock },
          { label: 'Alert Fatigue', value: String(alertFatigueDisplay), icon: Activity },
          { label: 'Avg Handoff Time', value: String(avgHandoffTime), icon: BarChart3 }
        ].map((metric, i) => (
          <div key={i} className="bg-pink-50 border border-pink-100 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <metric.icon className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <button onClick={metric.onClick} className="text-left">
                <div className="text-xl font-black text-pink-900">{metric.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-pink-600">{metric.label}</div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions list when Cases Analyzed clicked */}
      {showPredictionsList && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
          <h4 className="font-bold text-sm mb-3">Predictions (most recent first)</h4>
          {predictions.length === 0 ? (
            <p className="text-sm text-slate-500">No predictions found.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {predictions.map((pred) => {
                const patient = patients.find(p => p.id === pred.patient_id)
                return (
                  <div key={pred.id} className="p-3 border rounded-md bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold">{patient ? `${patient.name}` : pred.patient_id}</div>
                      <div className="text-xs text-slate-500">{new Date(pred.predicted_at).toLocaleString()}</div>
                    </div>
                    <div className="text-[11px] text-slate-700 mt-1">Risk: <span className="font-semibold">{pred.risk_level || '—'}</span></div>
                    <div className="text-[11px] text-slate-600 mt-2">
                      {pred.predicted_interventions?.slice(0,3).map((it, i) => (
                        <div key={i} className="text-[11px]">• {it.action} <span className="text-[10px] text-slate-400">({it.confidence}%)</span></div>
                      ))}
                    </div>
                    {pred.priority_note && <div className="text-[11px] italic text-slate-500 mt-2">"{pred.priority_note}"</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* AI CDSS Launcher */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col max-h-[70vh]">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> AI Prediction Panel
            </h3>
            <p className="text-sm text-slate-500 mb-4">Run the CDSS model to generate real-time predictive interventions based on recent assessments.</p>
            
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="relative">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search patients..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20"
                />
                {query && (
                  <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md max-h-48 overflow-y-auto">
                    {patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) && !p.is_transferred).map(p => (
                      <li key={p.id}>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-slate-50"
                          onClick={() => { setSelectedPatientId(p.id); setQuery('') }}
                        >
                          {p.name} {p.current_ward ? `(${p.current_ward})` : ''}
                        </button>
                      </li>
                    ))}
                    {patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) && !p.is_transferred).length === 0 && (
                      <li className="px-3 py-2 text-sm text-slate-500">No patients found.</li>
                    )}
                  </ul>
                )}
              </div>

              {selectedPatient && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                    <span className="font-medium text-sm">{selectedPatient.name}</span>
                    <span className="text-xs text-slate-500">{selectedPatient.current_ward}</span>
                  </div>
                  <button className="text-sm text-slate-500 underline" onClick={() => setSelectedPatientId('')}>Change</button>
                </div>
              )}

              <Button 
                variant="primary" 
                disabled={!selectedPatientId} 
                onClick={() => setShowCDSS(true)}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                <Sparkles className="w-4 h-4" /> Generate Prediction
              </Button>

              {showCDSS && selectedPatient && (
                <InlinePredictionPanel patient={selectedPatient} onClose={() => setShowCDSS(false)} />
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Disclaimer: AI predictions supplement but do not replace clinical judgment.</p>
            </div>
            
          </div>

          {/* Intervention Frequency Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-6">Most Frequent Interventions</h3>
            
            {!trends || !trends.interventions ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-slate-100 rounded-md animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {trends.interventions.map((item, idx) => {
                  const width = `${(item.count / maxInterventionCount) * 100}%`
                  return (
                    <div key={idx} className="relative">
                      <div className="flex items-end justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700 truncate pr-4">{item.action}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                          <span className="text-sm font-black text-slate-900">{item.count}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, #FBCFE8 0%, #EC4899 100%)`,
                            opacity: Math.max(0.4, 1 - (idx * 0.1)) // Fades out the lower ranked ones slightly
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                {trends.interventions.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No intervention data found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Protocol Library */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Evidence-Based Protocol Library
            </h3>
            <p className="text-sm text-slate-500 mt-1">These protocols are available offline and match the clinical flags in patient intake.</p>
          </div>

          <div className="space-y-3">
            {PROTOCOLS.map((protocol) => {
              const isExpanded = expandedProtocol === protocol.id
              
              return (
                <div 
                  key={protocol.id} 
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isExpanded ? 'border-pink-300 shadow-md ring-1 ring-pink-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button 
                    onClick={() => setExpandedProtocol(isExpanded ? null : protocol.id)}
                    className="w-full p-4 flex items-center justify-between bg-white text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: protocol.color_hex }} />
                      <span className="font-bold text-slate-900">{protocol.flag_name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {protocol.interventions.length} Interventions
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500" />
                      <div className="mb-4 inline-block text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                        Evidence-based · DOH Protocol
                      </div>
                      
                      <div className="space-y-2 pl-2">
                        {protocol.interventions.map((action, i) => {
                          const key = `${protocol.id}-${i}`
                          const isChecked = checkedItems[key]
                          
                          return (
                            <label key={i} className="flex items-start gap-3 cursor-pointer group">
                              <div className="relative flex items-center pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked || false}
                                  onChange={(e) => setCheckedItems(prev => ({ ...prev, [key]: e.target.checked }))}
                                  className="w-4 h-4 rounded transition-colors cursor-pointer accent-pink-500"
                                />
                              </div>
                              <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                {i + 1}. {action}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      
    </div>
  )
}