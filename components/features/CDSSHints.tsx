'use client'

import { useState } from 'react'
import { getProtocolsForFlags } from '@/lib/protocols'
import { Tag } from '@/components/ui/Tag'
import { ChevronDown, AlertCircle } from 'lucide-react'

export function CDSSHints({ flags }: { flags: string[] }) {
  const protocols = getProtocolsForFlags(flags)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (protocols.length === 0) return null

  const toggleExpand = (flagName: string) => {
    setExpanded(prev => ({ ...prev, [flagName]: !prev[flagName] }))
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm my-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> Standard Care Protocols
      </h4>
      
      <div className="space-y-2">
        {protocols.map((protocol) => {
          const isCritical = protocol.priority === 1
          const isExpanded = expanded[protocol.flag_name] ?? isCritical

          return (
            <div key={protocol.flag_name} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <button 
                type="button"
                onClick={() => toggleExpand(protocol.flag_name)}
                className="w-full flex items-center justify-between p-3 focus:outline-none hover:bg-slate-50 transition-colors"
              >
                <Tag flagName={protocol.flag_name} size="sm" />
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              {isExpanded && (
                <div className="px-3 pb-3">
                  <ul className="space-y-1.5 m-0 p-0 list-none">
                    {protocol.interventions.map((action, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                        <span className="text-slate-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}