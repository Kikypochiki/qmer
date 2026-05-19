export interface NurseProfile {
  id: string
  full_name: string
  role: 'er_nurse' | 'dr_nurse' | 'head_nurse'
  station: string | null
  shift: string | null
  is_active: boolean
}

export interface Patient {
  id: string
  name: string
  surname: string | null
  first_name: string | null
  middle_name: string | null
  age: number | null
  sex: string
  address: string | null
  civil_status: string | null
  gravida: number | null
  term: number | null
  preterm: number | null
  abortion: number | null
  living: number | null
  gravida_para: string | null
  height_cm: number | null
  weight_kg: number | null
  bmi: number | null
  temperature_c: number | null
  pulse_rate: number | null
  respiratory_rate: number | null
  blood_pressure: string | null
  o2_sat: number | null
  chief_complaint: string[] | null
  clinical_flags: string[]
  alert_level: 'Critical' | 'Moderate' | 'Stable'
  mode_of_delivery: 'NSVD' | 'CS' | 'Forceps' | 'Vacuum' | null
  cervix_dilation: string | null
  contraction_freq: string | null
  contraction_duration: string | null
  contraction_interval: string | null
  contraction_intensity: 'Mild' | 'Moderate' | 'Strong' | null
  fht: string | null
  ie_findings: string | null
  current_ward: string
  is_transferred: boolean
  destination: string | null
  is_critical_admit: boolean
  registration_complete: boolean
  admitted_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LaborMonitoringLog {
  id: string
  patient_id: string
  patient_name: string
  fht: string | null
  cervix_dilation: string | null
  contraction_freq: string | null
  contraction_duration: string | null
  contraction_interval: string | null
  contraction_intensity: 'Mild' | 'Moderate' | 'Strong' | null
  ie_findings: string | null
  remarks: string | null
  actual_time: string
  documented_at: string
  is_delayed_entry: boolean
  logged_by_name: string | null
  created_at: string
}

export interface HandoffAlert {
  id: string
  patient_id: string | null
  patient_name: string
  destination: string
  notes: string | null
  acknowledged: boolean
  acknowledged_at: string | null
  acknowledged_by_name: string | null
  sent_at: string
  sent_by_name: string | null
  patient?: Pick<Patient, 'name' | 'age' | 'gravida_para' | 'clinical_flags' | 'chief_complaint' | 'cervix_dilation'> | null
}

export interface Intervention {
  id: string
  patient_id: string | null
  patient_name: string
  action: string
  category: 'medication' | 'monitoring' | 'procedure' | 'transfer' | 'notification' | 'other' | null
  notes: string | null
  documented_at: string
  actual_time: string | null
  is_delayed: boolean
  logged_by_name: string | null
  shift_date: string
}

export interface CDSSProtocol {
  id: string
  flag_name: string
  color_hex: string
  interventions: string[]
  priority: number
}

export interface PredictedIntervention {
  action: string
  confidence: number
  category: string
  rationale: string
  requires_physician_order: boolean
}

export interface Predictions {
  id: string
  patient_id: string | null
  input_flags: string[]
  input_cervix: string | null
  input_mode: string | null
  predicted_interventions: PredictedIntervention[]
  risk_level: 'critical' | 'high' | 'moderate' | 'low' | null
  priority_note: string | null
  model_version: string
  predicted_at: string
}

export interface NotificationPayload {
  title: string
  body: string
  url: string
  urgency: 'high' | 'normal'
  tag: string
}