'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface DelayedEntryFormProps {
  patientId: string
  patientName: string
  onSave: () => void
}

const QUICK_CHIPS = [
  "IV Mag Sulfate", "BP monitoring q15", "Fetal monitoring", "O2 via face mask",
  "OB-Gyne notification", "Neonatology alert", "Oxytocin admin", "CS prep",
  "IV line insertion", "Urinary catheter insertion", "Blood glucose monitoring", "Position change"
]

export function DelayedEntryForm({ patientId, patientName, onSave }: DelayedEntryFormProps) {
  const { profile, session } = useAuth()
  
  const [isDelayed, setIsDelayed] = useState(false)
  const [action, setAction] = useState('')
  const [category, setCategory] = useState<'medication' | 'monitoring' | 'procedure' | 'transfer' | 'notification' | 'other'>('monitoring')
  const [notes, setNotes] = useState('')
  const [actualTime, setActualTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !session) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('interventions').insert({
        patient_id: patientId,
        patient_name: patientName,
        action,
        category,
        notes: notes || null,
        actual_time: isDelayed ? new Date(actualTime).toISOString() : null,
        is_delayed: isDelayed,
        logged_by_name: profile.full_name,
        shift_date: new Date().toISOString().split('T')[0]
      })

      if (error) throw error
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setAction('')
        setNotes('')
        setActualTime('')
        setIsDelayed(false)
        onSave()
      }, 1500)
    } catch (err: any) {
      alert(`Error saving intervention: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h4 className="font-bold text-emerald-900">Intervention Logged</h4>
        <p className="text-sm text-emerald-700">The record has been securely saved.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-xl shadow-sm border transition-colors duration-300 ${isDelayed ? 'border-amber-400' : 'border-slate-200'}`}>
      
      {/* Header & Toggle */}
      <div className={`p-4 border-b rounded-t-xl transition-colors duration-300 ${isDelayed ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center pt-0.5">
            <input
              type="checkbox"
              checked={isDelayed}
              onChange={(e) => setIsDelayed(e.target.checked)}
              className={`w-5 h-5 rounded transition-colors cursor-pointer ${isDelayed ? 'accent-amber-500' : 'accent-pink-500'}`}
            />
          </div>
          <div>
            <h4 className={`text-sm font-bold m-0 flex items-center gap-2 ${isDelayed ? 'text-amber-900' : 'text-slate-700'}`}>
              {isDelayed ? <><AlertTriangle className="w-4 h-4 text-amber-500" /> ⚠ Delayed / Late Entry</> : <><Clock className="w-4 h-4 text-slate-400" /> Real-time entry</>}
            </h4>
            {isDelayed && (
              <p className="text-xs text-amber-700 mt-1 mb-0 font-medium">
                Delayed documentation — actual time will differ from documentation time. Both timestamps will be recorded.
              </p>
            )}
          </div>
        </label>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Actual Time (only if delayed) */}
        {isDelayed && (
          <div className="animate-in slide-in-from-top-2 fade-in bg-amber-50/50 p-4 rounded-lg border border-amber-100">
            <label className="block text-xs font-bold text-amber-900 mb-1">Actual time of intervention</label>
            <input
              type="datetime-local"
              required={isDelayed}
              value={actualTime}
              onChange={e => setActualTime(e.target.value)}
              className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Intervention Performed</label>
          <input
            type="text"
            required
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder="e.g. Administered IV Meds..."
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => setAction(chip)}
                className="text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              required
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            >
              <option value="medication">Medication</option>
              <option value="monitoring">Monitoring</option>
              <option value="procedure">Procedure</option>
              <option value="transfer">Transfer</option>
              <option value="notification">Notification</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            placeholder="Additional context or patient response..."
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" loading={isSubmitting} className={isDelayed ? 'bg-amber-500 hover:bg-amber-600' : ''}>
            Save Intervention
          </Button>
        </div>
      </div>
    </form>
  )
}
