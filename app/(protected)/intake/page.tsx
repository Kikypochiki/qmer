'use client'
// Cache bust v3

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Tag } from '@/components/ui/Tag'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, UserPlus, AlertCircle, Save, Activity, Stethoscope } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Patient } from '@/types'

const COMMON_FLAGS = [
  'Pre-eclampsia', 'Eclampsia', 'Cord prolapse', 'Fetal distress', 'PPH',
  'GDM', 'PROM', 'Meconium', 'Prolonged Labor', 'Term', 'Preterm'
]

export default function IntakePage() {
  const router = useRouter()
  const { session, profile } = useAuth()
  
// Triage Mode
  const [triageMode, setTriageMode] = useState<'Standard' | 'Emergency'>('Standard')

  // Live Validation Handlers
  const handleInt = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value.replace(/\D/g, ''))
  const handleFloat = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '')
    if (val.split('.').length > 2) val = val.substring(0, val.lastIndexOf('.'))
    setter(val)
  }

  // Demographics
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('Female')
  const [civilStatus, setCivilStatus] = useState('Single')
  const [address, setAddress] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  // Obstetric History (GTPAL)
  const [g, setG] = useState('')
  const [t, setT] = useState('')
  const [p, setP] = useState('')
  const [a, setA] = useState('')
  const [l, setL] = useState('')

  // Initial Assessment
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [fht, setFht] = useState('')
  const [cervixDilation, setCervixDilation] = useState('')
  const [contractionFreq, setContractionFreq] = useState('')
  const [contractionDuration, setContractionDuration] = useState('')
  const [contractionInterval, setContractionInterval] = useState('')
  const [contractionIntensity, setContractionIntensity] = useState('Mild')
  const [ieFindings, setIeFindings] = useState('')

  // Classification & Flags
  const [modeOfDelivery, setModeOfDelivery] = useState('NSVD')
  const [clinicalFlags, setClinicalFlags] = useState<string[]>([])
  const [currentWard, setCurrentWard] = useState('')
  const [notes, setNotes] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getAlertLevel = () => {
    if (clinicalFlags.some(f => ['Pre-eclampsia', 'Eclampsia', 'Cord prolapse', 'Fetal distress', 'PPH'].includes(f))) return 'Critical'
    if (clinicalFlags.some(f => ['GDM', 'PROM', 'Meconium', 'Prolonged Labor'].includes(f))) return 'Moderate'
    return 'Stable'
  }

  const calculateBMI = () => {
    if (height && weight) {
      const hM = parseFloat(height) / 100
      const wKg = parseFloat(weight)
      if (hM > 0) return parseFloat((wKg / (hM * hM)).toFixed(1))
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !profile) return
    setIsSubmitting(true)

    try {
      const payload: Partial<Patient> = {
          name, 
          age: age ? parseInt(age) : null,
          sex,
          civil_status: civilStatus || null,
          address: address || null,
          height_cm: height ? parseFloat(height) : null,
          weight_kg: weight ? parseFloat(weight) : null,
          gravida: g ? parseInt(g) : null,
          term: t ? parseInt(t) : null,
          preterm: p ? parseInt(p) : null,
          abortion: a ? parseInt(a) : null,
          living: l ? parseInt(l) : null,
          gravida_para: `G${g || 0}P${t || 0}`,
          chief_complaint: chiefComplaint ? [chiefComplaint] : null, 
          fht: fht || null,
          cervix_dilation: cervixDilation || null,
          contraction_freq: contractionFreq || null,
          contraction_duration: contractionDuration || null,
          contraction_interval: contractionInterval || null,
          contraction_intensity: contractionIntensity as Patient['contraction_intensity'],
          ie_findings: ieFindings || null,
          mode_of_delivery: modeOfDelivery as Patient['mode_of_delivery'],
          clinical_flags: clinicalFlags, 
          notes: notes || null, 
          alert_level: getAlertLevel(),
          admitted_by: session.user.id,
          current_ward: currentWard || 'ODH',
          is_critical_admit: triageMode === 'Emergency',
          is_transferred: false,
          registration_complete: true
        }

      const { data, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      router.push(`/patients/${data.id}`)
    } catch (err: any) {
      console.error('Submission failed', err.message || err)
      alert(`Submission failed: ${err.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFlag = (flag: string) => {
    setClinicalFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag])
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <Card>
        <CardHeader className="bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 m-0">Patient Intake</h2>
              <p className="text-sm text-slate-500 m-0">Register a new patient into the active tracking system</p>
            </div>
          </div>
        </CardHeader>
        
        <CardBody>
          {/* Triage Mode Selector */}
          <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl">
            <button 
              type="button"
              onClick={() => setTriageMode('Standard')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                triageMode === 'Standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Standard Intake
            </button>
            <button 
              type="button"
              onClick={() => setTriageMode('Emergency')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                triageMode === 'Emergency' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Emergency Triage
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Demographics */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Demographics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label>Full Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maria Clara" />
                </div>
                
                {triageMode === 'Standard' && (
                  <div>
                    <label>Age</label>
                    <input required type="text" inputMode="numeric" maxLength={3} value={age} onChange={handleInt(setAge)} placeholder="e.g. 28" />
                  </div>
                )}
                
                <div className={triageMode === 'Standard' ? "" : "md:col-span-2"}>
                  <label>Sex</label>
                  <select required value={sex} onChange={e => setSex(e.target.value)}>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {triageMode === 'Standard' && (
                  <div className="md:col-span-2">
                    <label>Address</label>
                    <input required type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Main St, City" />
                  </div>
                )}
                
                {triageMode === 'Standard' && (
                  <div>
                    <label>Civil Status</label>
                    <select required value={civilStatus} onChange={e => setCivilStatus(e.target.value)}>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                )}
                
                {triageMode === 'Standard' && (
                  <div className="grid grid-cols-2 gap-2 md:col-span-1">
                    <div>
                      <label>Ht (cm)</label>
                      <input type="text" inputMode="decimal" maxLength={5} value={height} onChange={handleFloat(setHeight)} placeholder="160" />
                    </div>
                    <div>
                      <label>Wt (kg)</label>
                      <input type="text" inputMode="decimal" maxLength={5} value={weight} onChange={handleFloat(setWeight)} placeholder="65" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Obstetric History */}
            {triageMode === 'Standard' && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Obstetric History (GTPAL)
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label>Gravida</label>
                    <input required type="text" inputMode="numeric" maxLength={2} value={g} onChange={handleInt(setG)} placeholder="G" />
                  </div>
                  <div>
                    <label>Term</label>
                    <input required type="text" inputMode="numeric" maxLength={2} value={t} onChange={handleInt(setT)} placeholder="T" />
                  </div>
                  <div>
                    <label>Preterm</label>
                    <input required type="text" inputMode="numeric" maxLength={2} value={p} onChange={handleInt(setP)} placeholder="P" />
                  </div>
                  <div>
                    <label>Abortion</label>
                    <input required type="text" inputMode="numeric" maxLength={2} value={a} onChange={handleInt(setA)} placeholder="A" />
                  </div>
                  <div>
                    <label>Living</label>
                    <input required type="text" inputMode="numeric" maxLength={2} value={l} onChange={handleInt(setL)} placeholder="L" />
                  </div>
                </div>
              </section>
            )}

            {/* Assessment */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Initial Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label>Chief Complaint</label>
                  <input required type="text" value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="e.g. Leaking bag of water since 4 AM" />
                </div>
                
                <div>
                  <label>FHT (bpm)</label>
                  <input type="text" value={fht} onChange={e => setFht(e.target.value)} placeholder="e.g. 140" />
                </div>
                <div>
                  <label>Cervix Dilation (cm)</label>
                  <input type="text" value={cervixDilation} onChange={e => setCervixDilation(e.target.value)} placeholder="e.g. 5cm" />
                </div>
                <div>
                  <label>IE Findings</label>
                  <input type="text" value={ieFindings} onChange={e => setIeFindings(e.target.value)} placeholder="e.g. 80% effaced, Station 0" />
                </div>

                <div>
                  <label>Contraction Freq</label>
                  <input type="text" value={contractionFreq} onChange={e => setContractionFreq(e.target.value)} placeholder="e.g. q3min" />
                </div>
                <div>
                  <label>Contraction Duration</label>
                  <input type="text" value={contractionDuration} onChange={e => setContractionDuration(e.target.value)} placeholder="e.g. 45s" />
                </div>
                <div>
                  <label>Intensity</label>
                  <select value={contractionIntensity} onChange={e => setContractionIntensity(e.target.value)}>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Strong">Strong</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Classification & Flags */}
            <section className="space-y-4 bg-slate-50 -mx-5 px-5 py-4 border-y border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 m-0 pb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Classification & Flags
              </h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label>Target Delivery Mode</label>
                    <div className="flex gap-2">
                      {['NSVD', 'CS', 'Forceps', 'Vacuum'].map(mode => (
                        <button 
                          key={mode} type="button" 
                          onClick={() => setModeOfDelivery(mode)}
                          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex-1 ${
                            modeOfDelivery === mode 
                              ? 'bg-slate-900 text-white shadow-sm' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label>Assigned Ward</label>
                    <input type="text" required value={currentWard} onChange={e => setCurrentWard(e.target.value)} placeholder="e.g. ODH, LR, DR" />
                  </div>
                </div>

                <div>
                  <label>Clinical Flags (Multi-select)</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMMON_FLAGS.map(flag => (
                      <button key={flag} type="button" onClick={() => toggleFlag(flag)} className="focus:outline-none">
                        <Tag flagName={flag} className={clinicalFlags.includes(flag) ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-50 hover:opacity-100'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label>Additional Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any other relevant details or past medical history..." />
            </section>

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" loading={isSubmitting} className="w-full sm:w-auto min-w-[200px]">
                <Save className="w-4 h-4" /> Register Patient Complete
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}