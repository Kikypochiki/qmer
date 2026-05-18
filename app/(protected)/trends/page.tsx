'use client'

import React, { useState, useEffect } from 'react'
import { getTrends } from '@/lib/ai/predict'
import { getProtocolsForFlags, PROTOCOLS } from '@/lib/protocols'
import { supabase } from '@/lib/supabase/client'
import { Patient } from '@/types'
import { PredictionPanel } from '@/components/features/PredictionPanel'
import { Button } from '@/components/ui/Button'
import { Sparkles, BarChart3, Activity, Clock, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrendsPage() {
  const [trends, setTrends] = useState<{ interventions: any[], avgDelay: number } | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [showCDSS, setShowCDSS] = useState(false)
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)
  
  // Local state for checkboxes in protocols
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getTrends().then(data => {
      if (data) setTrends(data)
    })
    supabase.from('patients').select('*').eq('is_transferred', false).then(({ data }) => {
      if (data) setPatients(data)
    })
  }, [])

  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const maxInterventionCount = trends?.interventions?.[0]?.count || 1

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cases Analyzed', value: '412', icon: Sparkles },
          { label: 'Timestamp Accuracy', value: '96%', icon: Clock },
          { label: 'Alert Fatigue', value: '↓ 34%', icon: Activity },
          { label: 'Avg Handoff Time', value: '18 min', icon: BarChart3 }
        ].map((metric, i) => (
          <div key={i} className="bg-pink-50 border border-pink-100 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <metric.icon className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <div className="text-xl font-black text-pink-900">{metric.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-pink-600">{metric.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* AI CDSS Launcher */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-500" /> AI Prediction Panel
            </h3>
            <p className="text-sm text-slate-500 mb-4">Run the CDSS model to generate real-time predictive interventions based on recent assessments.</p>
            
            <div className="space-y-4">
              <select 
                value={selectedPatientId} 
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20"
              >
                <option value="">-- Choose patient --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.current_ward})</option>)}
              </select>
              
              <Button 
                variant="primary" 
                disabled={!selectedPatientId} 
                onClick={() => setShowCDSS(true)}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                <Sparkles className="w-4 h-4" /> Generate Prediction
              </Button>
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

      {showCDSS && selectedPatient && (
        <PredictionPanel 
          patient={selectedPatient} 
          onClose={() => setShowCDSS(false)} 
        />
      )}
    </div>
  )
}