'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { broadcastNotification } from '@/lib/broadcast'
import { Button } from '@/components/ui/Button'
import { Patient } from '@/types'
import { Plus } from 'lucide-react'

export function LaborMonitoringForm({ patient }: { patient: Patient }) {
  const { session, profile } = useAuth()
  
  const [fht, setFht] = useState('')
  const [cervixDilation, setCervixDilation] = useState('')
  const [contractionFreq, setContractionFreq] = useState('')
  const [contractionDuration, setContractionDuration] = useState('')
  const [contractionInterval, setContractionInterval] = useState('')
  const [contractionIntensity, setContractionIntensity] = useState('Mild')
  const [ieFindings, setIeFindings] = useState('')
  const [remarks, setRemarks] = useState('')
  
  const [isDelayed, setIsDelayed] = useState(false)
  const [actualTime, setActualTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !profile) return

    setIsSubmitting(true)
    try {
      const { data: newLog, error } = await supabase
        .from('labor_monitoring_logs')
        .insert({
          patient_id: patient.id,
          patient_name: patient.name,
          fht: fht || null,
          cervix_dilation: cervixDilation || null,
          contraction_freq: contractionFreq || null,
          contraction_duration: contractionDuration || null,
          contraction_interval: contractionInterval || null,
          contraction_intensity: contractionIntensity || null,
          ie_findings: ieFindings || null,
          remarks: remarks || null,
          is_delayed_entry: isDelayed,
          actual_time: isDelayed ? new Date(actualTime).toISOString() : new Date().toISOString(),
          logged_by: session.user.id,
          logged_by_name: profile.full_name,
        })
        .select('id')
        .single()

      if (error) throw error

      if (fht) {
        const fhtValue = parseInt(fht.replace(/[^0-9]/g, ''))
        if (!isNaN(fhtValue) && (fhtValue < 110 || fhtValue > 160)) {
          await broadcastNotification({
            title: '⚠️ Abnormal FHT',
            body: `${patient.name}: ${fhtValue} bpm — Immediate assessment needed`,
            url: `/patients/${patient.id}`,
            urgency: 'high',
            tag: `fht-${newLog.id}`
          })
          alert(`⚠️ Abnormal FHT — ${fhtValue} bpm`)
        }
      }

      setFht('')
      setCervixDilation('')
      setContractionFreq('')
      setContractionDuration('')
      setContractionInterval('')
      setContractionIntensity('Mild')
      setIeFindings('')
      setRemarks('')
      setIsDelayed(false)
      setActualTime('')
      
    } catch (err) {
      console.error('Failed to log assessment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 p-4">
        <h3 className="font-bold text-slate-900 m-0 flex items-center gap-2">
          <Plus className="w-4 h-4 text-slate-500" /> New Labor Assessment
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="delayed-toggle"
            checked={isDelayed}
            onChange={(e) => setIsDelayed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <label htmlFor="delayed-toggle" className={`text-sm font-semibold ${isDelayed ? 'text-amber-600' : 'text-slate-600'}`}>
            Delayed entry?
          </label>
          
          {isDelayed && (
            <input
              type="datetime-local"
              required={isDelayed}
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              className="ml-2 w-48 text-sm"
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">FHT</label>
            <input type="text" value={fht} onChange={e => setFht(e.target.value)} placeholder="e.g. 135 bpm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Dilation</label>
            <input type="text" value={cervixDilation} onChange={e => setCervixDilation(e.target.value)} placeholder="e.g. 5cm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Frequency</label>
            <input type="text" value={contractionFreq} onChange={e => setContractionFreq(e.target.value)} placeholder="e.g. q3min" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Duration</label>
            <input type="text" value={contractionDuration} onChange={e => setContractionDuration(e.target.value)} placeholder="e.g. 45s" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Interval</label>
            <input type="text" value={contractionInterval} onChange={e => setContractionInterval(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Intensity</label>
            <select value={contractionIntensity} onChange={e => setContractionIntensity(e.target.value)}>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Strong">Strong</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">IE Findings</label>
          <textarea value={ieFindings} onChange={e => setIeFindings(e.target.value)} rows={2} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Remarks</label>
          <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} />
        </div>

        <Button type="submit" loading={isSubmitting} variant="primary" className="w-full">
          Save Assessment
        </Button>
      </form>
    </div>
  )
}
