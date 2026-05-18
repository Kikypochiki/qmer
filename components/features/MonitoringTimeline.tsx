'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Patient } from '@/types'

export function MonitoringTimeline({ patient, logs }: { patient: Patient, logs: any[] }) {
  if (!logs || logs.length === 0) return null

  // Format data for Recharts
  const data = logs.slice().reverse().map(log => ({
    time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fht: parseInt(log.fht) || null,
    cervix: parseInt(log.cervix_dilation) || null
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
      <h3 className="font-bold text-slate-900 mb-6">Monitoring Timeline</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
            <YAxis yAxisId="left" domain={[100, 180]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            <Line yAxisId="left" type="monotone" dataKey="fht" stroke="#E11D48" strokeWidth={2} dot={{ r: 4 }} name="FHT (bpm)" />
            <Line yAxisId="right" type="monotone" dataKey="cervix" stroke="#0F172A" strokeWidth={2} dot={{ r: 4 }} name="Dilation (cm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
