import type { Patient, Predictions } from '@/types'

export type Prediction = Predictions

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'

export async function getPrediction(patient: Patient, bustCache = false): Promise<Predictions | null> {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/predict${bustCache ? '?bust=' + Date.now() : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patient.id,
        clinical_flags: patient.clinical_flags || [],
        chief_complaint: patient.chief_complaint ? patient.chief_complaint.join(', ') : null,
        cervix_dilation: patient.cervix_dilation,
        contraction_freq: patient.contraction_freq,
        mode_of_delivery: patient.mode_of_delivery || 'NSVD',
        gravida_para: patient.gravida_para,
        age: patient.age ? String(patient.age) : null,
        historical_context: null
      })
    })
    
    if (!res.ok) throw new Error('Prediction API failed')
    return await res.json()
  } catch (error) {
    console.warn('Prediction API failed (falling back to offline protocols)')
    return null
  }
}

export async function getTrends(): Promise<{ interventions: any[], avgDelay: number, totalInterventions?: number, alertFatigue?: number, timestampAccuracy?: number } | null> {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/trends`)
    if (!res.ok) throw new Error('Trends API failed')
    return await res.json()
  } catch (error) {
    console.error('getTrends error:', error)
    return null
  }
}
