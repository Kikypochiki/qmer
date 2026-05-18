'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { NurseProfile } from '@/types'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: NurseProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<NurseProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async (currentSession: Session | null) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        try {
          const { data: nurseProfile, error } = await supabase
            .from('nurse_profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()
            
          if (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
          } else {
            setProfile(nurseProfile)
          }
        } catch (err) {
          console.error(err)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    // On mount: getSession()
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
