'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Stethoscope, LockKeyhole } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          
          <div className="flex flex-col items-center justify-center mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-elevation-sm"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <Stethoscope className="w-8 h-8" />
            </div>
            <h1 
              className="text-2xl font-bold tracking-tight m-0"
              style={{ color: 'var(--color-on-surface)' }}
            >
              CO5MO
            </h1>
            <p 
              className="text-sm font-medium m-0 mt-1"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Clinical Decision Support System
            </p>
          </div>

          {error && (
            <div 
              className="text-sm font-semibold p-4 rounded-lg mb-6"
              style={{
                backgroundColor: 'var(--color-error-container)',
                color: 'var(--color-on-error-container)'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label>Staff Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nurse@hospital.com"
              />
            </div>
            <div>
              <label>Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              className="w-full h-12 text-base mt-4"
            >
              Sign in securely
            </Button>
          </form>

          <div 
            className="mt-8 pt-6 border-t flex items-center justify-center gap-2 text-xs font-semibold"
            style={{
              color: 'var(--color-on-surface-variant)'
            }}
          >
            <LockKeyhole className="w-4 h-4" /> Authorized Personnel Only
          </div>

        </CardBody>
      </Card>
    </div>
  )
}