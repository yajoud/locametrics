import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import Onboarding from './Onboarding'
import LocaMetricsDashboard from './Dashboard/LocaMetricsDashboard'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [hasProfile, setHasProfile] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => setHasProfile(!!data))
  }, [session])

  // Cargando sesión
  if (session === undefined) return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>◎</div>
    </div>
  )

  if (!session) {
    if (showRegister) return <Onboarding onDone={() => setShowRegister(false)} onLogin={() => setShowRegister(false)} />
    return <Login onShowRegister={() => setShowRegister(true)} />
  }

  if (hasProfile === null) return null
  if (!hasProfile) return <Onboarding onDone={() => setHasProfile(true)} />
  return <LocaMetricsDashboard session={session} />
}