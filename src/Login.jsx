import { useState } from 'react'
import { supabase } from './supabase'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
  green: "#00B894", coral: "#E17055",
}

const inp = {
  width: '100%', padding: '13px 16px',
  background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEF8', borderRadius: 12, fontSize: 15, outline: 'none',
  fontFamily: 'sans-serif', WebkitAppearance: 'none',
}

export default function Login({ onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('password') // 'password' | 'magic'

  const handleLogin = async () => {
    if (!email) return
    setError('')
    setLoading(true)

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) setError(error.message)
      else setSent(true)
    } else {
      if (!password) { setError('Introduce tu contraseña'); setLoading(false); return }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos')
    }
    setLoading(false)
  }

  if (sent) return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', color: COLORS.text }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Revisa tu email</h2>
        <p style={{ color: COLORS.muted, lineHeight: 1.6 }}>Te hemos enviado un enlace a <strong style={{ color: COLORS.text }}>{email}</strong>. Pulsa el enlace para entrar.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'sans-serif', color: COLORS.text }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: COLORS.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>◎</div>
          <span style={{ fontWeight: 500, fontSize: 16 }}>LocaMetrics</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 6 }}>Bienvenido</h1>
        <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 28 }}>Entra en tu panel de control.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[{ id: 'password', label: 'Con contraseña' }, { id: 'magic', label: 'Link por email' }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError('') }}
              style={{ flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer', border: 'none', fontSize: 13, fontFamily: 'sans-serif', background: mode === m.id ? COLORS.purple : 'rgba(255,255,255,0.06)', color: mode === m.id ? 'white' : COLORS.muted, transition: 'all 0.15s' }}>
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

        {error && <div style={{ fontSize: 13, color: COLORS.coral, marginTop: 10 }}>⚠ {error}</div>}

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#444' : COLORS.purple, color: 'white', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 500, fontFamily: 'sans-serif', marginTop: 16, transition: 'background 0.15s' }}>
          {loading ? 'Entrando...' : mode === 'magic' ? 'Enviar enlace' : 'Entrar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: COLORS.muted }}>
          ¿No tienes cuenta?{' '}
          <span onClick={onShowRegister} style={{ color: COLORS.purpleLight, cursor: 'pointer', fontWeight: 500 }}>
            Crear cuenta gratis
          </span>
        </div>
      </div>
    </div>
  )
}