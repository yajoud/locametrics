import { useState } from 'react'
import { supabase } from './supabase'

const inp = {
  width: '100%', padding: '13px 16px',
  background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEF8', borderRadius: 12, fontSize: 15, outline: 'none',
  fontFamily: 'sans-serif', WebkitAppearance: 'none', marginBottom: 0,
}

export default function Login({ onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('password')
  const [magicSent, setMagicSent] = useState(false)

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleLogin = async () => {
    setError('')
    if (!isValidEmail(email)) { setError('Introduce un email válido'); return }

    setLoading(true)

    if (mode === 'magic') {
      // Login sin contraseña — envía link al email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      })
      if (error) setError('Error al enviar el enlace. Comprueba el email.')
      else setMagicSent(true)

    } else {
      // Login con contraseña
      if (!password) { setError('Introduce tu contraseña'); setLoading(false); return }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Invalid login')) setError('Email o contraseña incorrectos')
        else setError(error.message)
      }
      // Si no hay error, onAuthStateChange en App.jsx detecta la sesión automáticamente
    }

    setLoading(false)
  }

  if (magicSent) return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', color: '#F0EEF8' }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Revisa tu email</h2>
        <p style={{ color: '#8884A0', lineHeight: 1.7 }}>Hemos enviado un enlace a <strong style={{ color: '#F0EEF8' }}>{email}</strong>.<br />Pulsa el enlace para entrar directamente.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'sans-serif', color: '#F0EEF8' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>◎</div>
          <span style={{ fontWeight: 500, fontSize: 16 }}>LocaMetrics</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 6 }}>Bienvenido</h1>
        <p style={{ color: '#8884A0', fontSize: 14, marginBottom: 28 }}>Entra en tu panel de control.</p>

        {/* Tabs modo */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
          {[{ id: 'password', label: 'Con contraseña' }, { id: 'magic', label: 'Link por email' }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError('') }}
              style={{ flex: 1, padding: '9px', borderRadius: 7, cursor: 'pointer', border: 'none', fontSize: 13, fontFamily: 'sans-serif', background: mode === m.id ? '#6C5CE7' : 'transparent', color: mode === m.id ? 'white' : '#8884A0', transition: 'all 0.15s' }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inp} type="email" placeholder="tu@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />

          {mode === 'password' && (
            <input style={inp} type="password" placeholder="Contraseña" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          )}
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#E17055', marginTop: 10, padding: '8px 12px', background: 'rgba(225,112,85,0.1)', borderRadius: 8 }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#333' : '#6C5CE7', color: 'white', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 500, fontFamily: 'sans-serif', marginTop: 16, transition: 'background 0.15s' }}>
          {loading ? 'Entrando...' : mode === 'magic' ? 'Enviar enlace' : 'Entrar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8884A0' }}>
          ¿No tienes cuenta?{' '}
          <span onClick={onShowRegister} style={{ color: '#A29BFE', cursor: 'pointer', fontWeight: 500 }}>
            Crear cuenta gratis
          </span>
        </div>
      </div>
    </div>
  )
}