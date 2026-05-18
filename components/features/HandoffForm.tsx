'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { broadcastNotification } from '@/lib/broadcast'
import { Patient } from '@/types'
import { Button } from '@/components/ui/Button'
import { Send, CheckCircle2, Search, User } from 'lucide-react'

const ROOMS = ['Delivery Room 1','Delivery Room 2','Labor Room A','Labor Room B','OR Suite 1']

export function HandoffForm({ onSuccess }: { onSuccess?: () => void }) {
  const { session, profile } = useAuth()
  
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [destination, setDestination] = useState('')
  const [handoffNotes, setHandoffNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('patients').select('*').eq('is_transferred', false).then(({ data }) => {
      if (data) setPatients(data)
    })
  }, [])

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !profile || !selectedPatient || !destination) return

    setIsSubmitting(true)
    try {
      const { data: alertData, error: alertErr } = await supabase
        .from('handoff_alerts')
        .insert({
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.name,
          destination,
          notes: handoffNotes,
          acknowledged: false,
          sent_by_name: profile.full_name
        })
        .select()
        .single()
      if (alertErr) throw alertErr

      await supabase.from('patients').update({ is_transferred: true, destination }).eq('id', selectedPatient.id)

      await broadcastNotification({
        title: '📋 Handoff Alert',
        body: `${selectedPatient.name} → ${destination} — Acknowledgment needed`,
        url: `/alerts`,
        urgency: 'high',
        tag: `handoff-${alertData.id}`
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setSelectedPatient(null)
        setSearch('')
        setDestination('')
        setHandoffNotes('')
        if (onSuccess) onSuccess()
      }, 3000)
    } catch (err) {
      console.error('Failed to initiate handoff:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-emerald-900 font-bold m-0">✓ Alert Sent</h4>
        <p className="text-emerald-700 text-sm mt-1">Alert sent for {selectedPatient?.name} → {destination}</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 m-0">Initiate Handoff</h3>
        <p className="text-xs text-slate-500 mt-1">Transfer patient responsibility via system alert.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Searchable Patient Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">Select Patient</label>
          {!selectedPatient ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search patient name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
              {search && (
                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg shadow-sm">
                  {filteredPatients.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 text-center">No patients found.</div>
                  ) : (
                    filteredPatients.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPatient(p)}
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
                  <div className="font-bold text-sm text-pink-900">{selectedPatient.name}</div>
                  <div className="text-xs text-pink-600">{selectedPatient.gravida_para} • {selectedPatient.alert_level}</div>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedPatient(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Change</button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">Destination Room</label>
          <select 
            required 
            value={destination} 
            onChange={e => setDestination(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">-- Select Destination --</option>
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">Handoff Notes (Optional)</label>
          <textarea 
            rows={3}
            value={handoffNotes} 
            onChange={e => setHandoffNotes(e.target.value)}
            placeholder="e.g., Last IE 4cm, intact BOW."
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!selectedPatient || !destination} className="w-full">
          <Send className="w-4 h-4" /> Send Handoff Alert
        </Button>
      </form>
    </div>
  )
}
