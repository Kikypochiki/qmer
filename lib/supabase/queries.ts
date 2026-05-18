import { createClient } from './server'
import type {
  CDSSProtocol,
  HandoffAlert,
  Intervention,
  LaborMonitoringLog,
  Patient,
} from '@/types'

export async function getPatients(): Promise<Patient[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function getAlerts(): Promise<HandoffAlert[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('handoff_alerts')
    .select('*, patient:patients(name, age, gravida_para, clinical_flags, chief_complaint, cervix_dilation)')
    .order('sent_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as HandoffAlert[]
}

export async function getLogs(patientId: string): Promise<LaborMonitoringLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('labor_monitoring_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('actual_time', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getInterventions(date: string): Promise<Intervention[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('interventions')
    .select('*')
    .eq('shift_date', date)
    .order('documented_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProtocols(): Promise<CDSSProtocol[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cdss_protocols')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true })

  if (error) throw error
  return data ?? []
}
