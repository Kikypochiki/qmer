import { Patient } from '@/types'

export interface PredictedIntervention {
    action: string
    confidence: number
    category: string
    rationale: string
    requires_physician_order: boolean
}

export interface Prediction {
    patient_id: string
    predicted_interventions: PredictedIntervention[]
    risk_level: 'critical' | 'high' | 'moderate' | 'low' | string
    priority_note: string
    model_version: string
    predicted_at: string
}

export interface TrendsData {
    interventions: { action: string, category: string, count: number }[]
    avgDelay: number
}

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000'

export async function getPrediction(patient: Patient): Promise<Prediction | null> {
    try {
        const payload = {
            patient_id: patient.id,
            clinical_flags: patient.clinical_flags || [],
            chief_complaint: patient.chief_complaint,
            cervix_dilation: patient.cervix_dilation,
            contraction_freq: patient.contraction_freq,
            mode_of_delivery: patient.mode_of_delivery || 'NSVD',
            gravida_para: patient.gravida_para,
            age: patient.age,
            historical_context: patient.notes
        }

        const res = await fetch(`${FASTAPI_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            console.error('FastAPI returned error:', await res.text())
            return null
        }

        return await res.json()
    } catch (e) {
        console.warn('FastAPI unreachable:', e instanceof Error ? e.message : e)
        return null // Will trigger fallback to lib/protocols.ts in the UI
    }
}

export async function getTrends(): Promise<TrendsData | null> {
    try {
        const res = await fetch(`${FASTAPI_URL}/api/trends`)
        if (!res.ok) {
            console.error('FastAPI returned error:', await res.text())
            return null
        }
        return await res.json()
    } catch (e) {
        console.warn('FastAPI unreachable:', e instanceof Error ? e.message : e)
        return null
    }
}
