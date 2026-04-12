import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    await supabase.auth.signInWithOtp({ email })
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', fontFamily: 'sans-serif', color: 'white' }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>📬</div>
      <h2 style={{ marginBottom: 8 }}>Revisa tu email</h2>
      <p style={{ color: '#888' }}>Te hemos enviado un enlace a <strong>{email}</strong></p>
      <p style={{ color: '#888', marginTop: 8 }}>Pulsa el enlace y entrarás directamente.</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 360, margin: '8rem auto', padding: '2rem', fontFamily: 'sans-serif', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>◎</div>
        <span style={{ fontWeight: 500, fontSize: 15 }}>LocaMetrics</span>
      </div>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>Bienvenido</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Entra con tu email — sin contraseña</p>
      <input
        type="email" placeholder="tu@email.com" value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        style={{ width: '100%', padding: '11px 14px', marginBottom: 12, background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 10, fontSize: 14, outline: 'none' }}
      />
      <button onClick={handleLogin} disabled={loading}
        style={{ width: '100%', padding: '11px', background: loading ? '#444' : '#6C5CE7', color: 'white', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}>
        {loading ? 'Enviando...' : 'Entrar con email'}
      </button>
    </div>
  )
}
