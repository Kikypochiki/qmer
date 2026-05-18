import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const status = {
    supabase: 'error',
    fastapi: 'error',
    gemini: 'error'
  }

  // 1. Check Supabase
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('patients').select('id').limit(1)
    if (!error) {
      status.supabase = 'ok'
    }
  } catch (err) {
    console.error('Supabase health check failed:', err)
  }

  // 2. Check FastAPI
  try {
    const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
    if (fastApiUrl) {
      const res = await fetch(`${fastApiUrl}/api/health`, { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        status.fastapi = 'ok'
      }
    }
  } catch (err) {
    console.error('FastAPI health check failed:', err)
  }

  // 3. Check Gemini
  if (process.env.GEMINI_API_KEY) {
    status.gemini = 'ok'
  }

  return NextResponse.json(status)
}
