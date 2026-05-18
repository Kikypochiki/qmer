'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Activity, Database, Server, Brain, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function StatusPage() {
  const [status, setStatus] = useState<{
    supabase: 'ok' | 'error' | 'loading',
    fastapi: 'ok' | 'error' | 'loading',
    gemini: 'ok' | 'error' | 'loading'
  }>({
    supabase: 'loading',
    fastapi: 'loading',
    gemini: 'loading'
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status')
        const data = await res.json()
        setStatus(data)
      } catch (err) {
        setStatus({ supabase: 'error', fastapi: 'error', gemini: 'error' })
      }
    }
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 m-0">System Health</h4>
            <p className="text-xs text-slate-500 m-0 mt-0.5">Real-time connection status</p>
          </div>
          <Activity className="w-5 h-5 text-slate-400" />
        </CardHeader>
        <CardBody className="space-y-4">
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700">Supabase DB</span>
            </div>
            {status.supabase === 'loading' ? <span className="text-sm text-slate-400">Checking...</span> : status.supabase === 'ok' ? <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> <span className="font-bold text-sm">OK</span></div> : <div className="flex items-center gap-1.5 text-rose-600"><XCircle className="w-4 h-4" /> <span className="font-bold text-sm">Error</span></div>}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700">FastAPI</span>
            </div>
            {status.fastapi === 'loading' ? <span className="text-sm text-slate-400">Checking...</span> : status.fastapi === 'ok' ? <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> <span className="font-bold text-sm">OK</span></div> : <div className="flex items-center gap-1.5 text-rose-600"><XCircle className="w-4 h-4" /> <span className="font-bold text-sm">Offline</span></div>}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700">Gemini AI</span>
            </div>
            {status.gemini === 'loading' ? <span className="text-sm text-slate-400">Checking...</span> : status.gemini === 'ok' ? <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> <span className="font-bold text-sm">Ready</span></div> : <div className="flex items-center gap-1.5 text-rose-600"><XCircle className="w-4 h-4" /> <span className="font-bold text-sm">Error</span></div>}
          </div>

          <div className="pt-6 pb-2 text-center">
            <Link href="/auth" className="text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors">
              Proceed to Login →
            </Link>
          </div>

        </CardBody>
      </Card>
    </div>
  )
}
