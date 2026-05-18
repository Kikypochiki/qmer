import React from 'react'
import { Patient } from '@/types'
import { cn } from '@/lib/utils'
import { usePatients } from '@/hooks/usePatients'

interface PatientSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onPatientSelect?: (patient: Patient | null) => void;
  selectedId?: string;
  error?: string;
}

export function PatientSelect({ onPatientSelect, selectedId, error, className, ...props }: PatientSelectProps) {
  const { patients, loading } = usePatients();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const patient = patients.find(p => p.id === id) || null;
    if (onPatientSelect) onPatientSelect(patient);
    if (props.onChange) props.onChange(e);
  };

  return (
    <div className="space-y-1">
      <select
        value={selectedId || ''}
        onChange={handleChange}
        disabled={loading || props.disabled}
        className={cn(
          "w-full h-10 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-(--pink-500)",
          error ? "border-(--critical) focus:ring-(--critical)" : "border-(--border) focus:border-(--pink-300)",
          className
        )}
        {...props}
      >
        <option value="" disabled>Select a patient...</option>
        {patients.filter(p => !p.is_transferred).map(p => (
          <option key={p.id} value={p.id}>
            {p.name} - {p.alert_level}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-(--critical)">{error}</p>}
    </div>
  )
}