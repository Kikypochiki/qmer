'use client'

import { useEffect } from 'react'

function playAlertTone() {
  if (typeof window === 'undefined') return

  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return

  try {
    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.5)

    oscillator.onended = () => {
      audioContext.close().catch(() => {})
    }
  } catch (error) {
    console.error('Failed to play alert tone:', error)
  }
}

export function AlertSignalListener() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'co5mo-push-alert') return

      const urgency = event.data?.payload?.urgency
      if (urgency === 'high') {
        playAlertTone()
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [])

  return null
}