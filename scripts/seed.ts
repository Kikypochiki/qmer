const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const demoPatients = [
  {
    name: "Luz Maria dela Cruz",
    age: 28,
    sex: "F",
    gravida: 1,
    term: 0,
    preterm: 0,
    abortion: 0,
    living: 0,
    gravida_para: "G1P0",
    clinical_flags: ["Pre-eclampsia", "Fetal distress"],
    chief_complaint: ["Severe headache", "Blurred vision"],
    alert_level: "Critical",
    mode_of_delivery: "CS",
    cervix_dilation: "4cm",
    contraction_freq: "Every 5 mins",
    current_ward: "ER",
    is_transferred: false,
    is_critical_admit: true,
    registration_complete: false
  },
  {
    name: "Ana Santos",
    age: 32,
    sex: "F",
    gravida: 3,
    term: 2,
    preterm: 0,
    abortion: 0,
    living: 2,
    gravida_para: "G3P2",
    clinical_flags: ["GDM"],
    chief_complaint: ["Labor pains"],
    alert_level: "Moderate",
    mode_of_delivery: "NSVD",
    cervix_dilation: "6cm",
    contraction_freq: "Every 3 mins",
    current_ward: "ER",
    is_transferred: false,
    is_critical_admit: false,
    registration_complete: true
  },
  {
    name: "Maria Reyes",
    age: 24,
    sex: "F",
    gravida: 2,
    term: 1,
    preterm: 0,
    abortion: 0,
    living: 1,
    gravida_para: "G2P1",
    clinical_flags: [],
    chief_complaint: ["Water broke"],
    alert_level: "Stable",
    mode_of_delivery: "NSVD",
    cervix_dilation: "2cm",
    contraction_freq: "Irregular",
    current_ward: "ER",
    is_transferred: false,
    is_critical_admit: false,
    registration_complete: true
  }
]

async function seed() {
  console.log("Seeding Demo Patients...")
  const { data: patients, error: pError } = await supabase.from('patients').insert(demoPatients).select()
  
  if (pError) {
    console.error("Error inserting patients:", pError)
    return
  }
  
  console.log(`Inserted ${patients.length} patients.`)
  
  // Seed some interventions for the Trends dashboard
  const sampleInterventions = []
  const categories = ['monitoring', 'medication', 'procedure']
  const actions = ['Fetal heart rate check', 'IV fluid adjustment', 'Position change', 'BP monitoring']
  
  for (let i = 0; i < 30; i++) {
    const isDelayed = Math.random() > 0.7
    const docTime = new Date()
    docTime.setMinutes(docTime.getMinutes() - Math.floor(Math.random() * 60 * 24 * 5)) // last 5 days
    
    let actTime = new Date(docTime)
    if (isDelayed) {
      actTime.setMinutes(actTime.getMinutes() - Math.floor(Math.random() * 60)) // delayed by up to 60 mins
    }
    
    sampleInterventions.push({
      patient_id: patients[0].id,
      patient_name: patients[0].name,
      action: actions[Math.floor(Math.random() * actions.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      is_delayed: isDelayed,
      actual_time: isDelayed ? actTime.toISOString() : null,
      documented_at: docTime.toISOString(),
      logged_by_name: "Demo Nurse",
      shift_date: docTime.toISOString().split('T')[0]
    })
  }

  const { error: iError } = await supabase.from('interventions').insert(sampleInterventions)
  if (iError) {
    console.error("Error inserting interventions:", iError)
  } else {
    console.log(`Inserted ${sampleInterventions.length} sample interventions for dashboard trends.`)
  }

  console.log("Seed complete!")
}

seed()
