'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { HandoffAlert } from '@/types'

export function useAlerts() {
  const [alerts, setAlerts] = useState<HandoffAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unackedCount = useMemo(() => alerts.filter(a => !a.acknowledged).length, [alerts]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('handoff_alerts')
      .select('*, patient:patients(name, age, gravida_para, clinical_flags, chief_complaint, cervix_dilation)')
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('Error fetching alerts:', error)
      setError(error.message)
      setAlerts([])
    } else {
      setAlerts(data as HandoffAlert[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAlerts();

    const channelId = `handoff-alerts-${Math.random().toString(36).substring(7)}`
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'handoff_alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the specific alert to get the joined patient data
            supabase
              .from('handoff_alerts')
              .select('*, patient:patients(name, age, gravida_para, clinical_flags, chief_complaint, cervix_dilation)')
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setAlerts(prev => [data as HandoffAlert, ...prev])
                }
              })
          }
          if (payload.eventType === 'UPDATE') {
            setAlerts(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAlerts])

  const acknowledgeAlert = async (id: string, nurseName: string) => {
    // Optimistic update
    setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
            alert.id === id 
            ? { ...alert, acknowledged: true, acknowledged_by_name: nurseName, acknowledged_at: new Date().toISOString() } 
            : alert
        )
    );

    const { error } = await supabase
      .from('handoff_alerts')
      .update({ 
        acknowledged: true, 
        acknowledged_at: new Date().toISOString(),
        acknowledged_by_name: nurseName,
      })
      .eq('id', id)

    if (error) {
        console.error('Error acknowledging alert:', error)
        // Revert optimistic update on error
        fetchAlerts();
    }
  }

  return { alerts, unackedCount, loading, error, acknowledgeAlert }
}
