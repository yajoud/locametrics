import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import Register from './Register'
import LocaMetricsDashboard from './Dashboard/LocaMetricsDashboard'

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>◎</div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)   // undefined = cargando, null = no hay sesión
  const [hasProfile, setHasProfile] = useState(null)  // null = comprobando, true/false = resultado
  const [screen, setScreen] = useState('login')       // 'login' | 'register'

  // 1. Escuchar cambios de sesión — esto es lo único que gestiona la sesión
  useEffect(() => {
    // Carga inicial — recupera sesión guardada en localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
    })

    // Escucha cambios (login, logout, refresh token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      if (!session) setHasProfile(null) // reset al cerrar sesión
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Cuando hay sesión, comprobar si el usuario ya completó el onboarding
  useEffect(() => {
    if (!session) return

    supabase
      .from('businesses')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle() // no da error si no encuentra nada
      .then(({ data, error }) => {
        if (error) { console.error(error); return }
        setHasProfile(!!data)
      })
  }, [session])

  // Estados de carga
  if (session === undefined) return <Loading />

  // Sin sesión — mostrar login o registro
  if (!session) {
    if (screen === 'register') return <Register onLogin={() => setScreen('login')} />
    return <Login onShowRegister={() => setScreen('register')} />
  }

  // Con sesión pero comprobando si tiene perfil
  if (hasProfile === null) return <Loading />

  // Con sesión y sin perfil — onboarding (solo usuarios nuevos)
  if (!hasProfile) return <Onboarding onDone={() => setHasProfile(true)} session={session} />

  // Con sesión y con perfil — dashboard
  return <LocaMetricsDashboard session={session} />
}