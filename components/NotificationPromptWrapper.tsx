'use client'

import { useState, useEffect } from 'react'
// Import removed forcefully to bust cache
import { Bell, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationPromptWrapper() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [status, setStatus] = useState<NotificationPermission>('default')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setStatus(Notification.permission)
      if (Notification.permission === 'default' && !localStorage.getItem('push_dismissed')) {
        setTimeout(() => setShowPrompt(true), 2000)
      }
    }
  }, [])

  const handleEnable = async () => {
    try {
      // await registerPushNotifications()
      setStatus('granted')
      setShowPrompt(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('push_dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showPrompt && !dismissed && status === 'default' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between md:justify-center gap-4 z-50 w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-bold m-0">Enable Clinical Alerts</p>
              <p className="text-xs text-slate-400 m-0 hidden md:block">Receive critical push notifications for abnormal FHT and urgent handoffs.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <button 
              onClick={handleEnable}
              className="bg-white text-slate-900 hover:bg-slate-100 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
            >
              Allow
            </button>
            <button 
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}