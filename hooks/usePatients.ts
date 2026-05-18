'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Patient } from '@/types'
import { broadcastNotification } from '@/lib/notify'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getInitialPatients = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching initial patients:', error);
        setError(error.message);
        setPatients([]);
      } else {
        setPatients(data as Patient[]);
      }
      setLoading(false);
    }

    getInitialPatients();

    const channel = supabase
      .channel('patients-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPatients(currentPatients => [payload.new as Patient, ...currentPatients])
          }
          if (payload.eventType === 'UPDATE') {
            setPatients(currentPatients => currentPatients.map(p => p.id === payload.new.id ? payload.new as Patient : p))
            const oldRecord = payload.old as Patient
            const newRecord = payload.new as Patient
            
            if (newRecord.alert_level === 'Critical' && oldRecord.alert_level !== 'Critical') {
                broadcastNotification({
                    title: '🔴 Patient Critical',
                    body: `${newRecord.name} status changed to CRITICAL`,
                    url: `/patients/${newRecord.id}`,
                    tag: `status-${newRecord.id}`,
                    urgency: 'high'
                })
            }
          }
          if (payload.eventType === 'DELETE') {
            setPatients(currentPatients => currentPatients.filter(p => p.id !== (payload.old as Patient).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      setError(error.message);
    } else {
      setPatients(data as Patient[]);
      setError(null);
    }
    setLoading(false);
  }

  return { patients, loading, error, refetch }
}
