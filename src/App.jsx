import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import Onboarding from './Onboarding'
import LocaMetricsDashboard from './Dashboard/LocaMetricsDashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [hasProfile, setHasProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_e, session) => setSession(session))
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => setHasProfile(!!data))
  }, [session])

  if (!session) return <Login />
  if (hasProfile === null) return null
  if (!hasProfile) return <Onboarding onDone={() => setHasProfile(true)} />
  return <LocaMetricsDashboard session={session} />
}
