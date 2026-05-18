'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LaborMonitoringLog } from '@/types'

export function useLaborMonitoring(patientId: string) {
  const [logs, setLogs] = useState<LaborMonitoringLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!patientId) return;
    setLoading(true)
    const { data, error } = await supabase
      .from('labor_monitoring_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('actual_time', { ascending: false })

    if (error) {
      console.error('Error fetching labor monitoring logs:', error)
      setError(error.message)
      setLogs([])
    } else {
      setLogs(data as LaborMonitoringLog[])
      setError(null)
    }
    setLoading(false)
  }, [patientId])

  useEffect(() => {
    if (!patientId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()

    const channel = supabase
      .channel(`lml-${patientId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'labor_monitoring_logs',
          filter: `patient_id=eq.${patientId}` 
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLogs(prev => {
              const newLog = payload.new as LaborMonitoringLog
              // Deduplicate by id
              if (prev.some(log => log.id === newLog.id)) {
                return prev
              }
              // Since it's ordered by actual_time DESC, we just prepend it. 
              // A more robust way would be to sort, but prepending is what was requested.
              return [newLog, ...prev]
            })
          }
          if (payload.eventType === 'UPDATE') {
            setLogs(prev => prev.map(log => 
              log.id === payload.new.id ? { ...log, ...payload.new } : log
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [patientId, refetch])

  return { logs, loading, error, refetch }
}
