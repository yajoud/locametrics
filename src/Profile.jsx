import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
}

const inp = {
  width: '100%', padding: '11px 14px',
  background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEF8', borderRadius: 10, fontSize: 14, outline: 'none',
  fontFamily: 'sans-serif',
}

const card = {
  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
  borderRadius: 12, padding: 20, marginBottom: 16,
}

export default function Profile({ session }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const email = session?.user?.email || ''

  // Carga datos guardados al entrar
  useEffect(() => {
    if (!session) return
    const meta = session.user.user_metadata || {}
    setName(meta.name || '')
    setPhone(meta.phone || '')
    setAvatarUrl(meta.avatar_url || null)
  }, [session])

  const handleSaveProfile = async () => {
    setLoading(true)
    await supabase.auth.updateUser({
      data: { name, phone, avatar_url: avatarUrl }
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${session.user.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
      await supabase.auth.updateUser({ data: { name, phone, avatar_url: data.publicUrl } })
    } catch (e) { console.log(e) }
    setUploading(false)
  }

  const handleChangePassword = async () => {
    setPwError('')
    const hasLength = newPassword.length >= 8
    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    if (!hasLength || !hasLetter || !hasNumber) { setPwError('La contraseña debe tener mínimo 8 caracteres, letras y números'); return }
    if (newPassword !== confirmPassword) { setPwError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwError(error.message) } else {
      setPwSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSaved(false), 2000)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : email[0]?.toUpperCase()

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', fontFamily: 'sans-serif', color: COLORS.text }}>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(108,92,231,0.4)' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(108,92,231,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: COLORS.purpleLight, border: '2px solid rgba(108,92,231,0.3)' }}>
              {initials}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: '50%', background: COLORS.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
            {uploading ? '⏳' : '📷'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{name || 'Sin nombre'}</div>
          <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{email}</div>
          <div style={{ fontSize: 11, color: COLORS.faint, marginTop: 4, cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            {uploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadPhoto} />
      </div>

      {/* Datos personales */}
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Datos personales</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Nombre</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Email</label>
            <input style={{ ...inp, opacity: 0.5, cursor: 'not-allowed' }} value={email} disabled />
          </div>
          <div>
            <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Teléfono</label>
            <input style={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="600 000 000" />
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={loading}
          style={{ marginTop: 16, padding: '10px 20px', background: saved ? COLORS.green : COLORS.purple, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'sans-serif', transition: 'background 0.2s' }}>
          {saved ? '✓ Guardado' : loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* Cambiar contraseña */}
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Cambiar contraseña</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Nueva contraseña</label>
            <input style={inp} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres, letras y números" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Confirmar contraseña</label>
            <input style={inp} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
          </div>
          {pwError && <div style={{ fontSize: 12, color: COLORS.coral }}>{pwError}</div>}
        </div>
        <button onClick={handleChangePassword} disabled={loading}
          style={{ marginTop: 16, padding: '10px 20px', background: pwSaved ? COLORS.green : COLORS.purple, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'sans-serif', transition: 'background 0.2s' }}>
          {pwSaved ? '✓ Contraseña actualizada' : loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </div>

      {/* Plan */}
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Plan activo</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: COLORS.purpleLight }}>Plan Pro</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>29 €/mes · Renovación automática</div>
          </div>
          <div style={{ background: 'rgba(0,184,148,0.12)', color: COLORS.green, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>Activo</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          {['Reseñas ilimitadas', 'Alertas automáticas', 'Respuestas con IA', 'Análisis de competidores', 'SEO local'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: COLORS.green, fontSize: 12 }}>✓</span>
              <span style={{ fontSize: 13, color: COLORS.muted }}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={() => window.open('https://billing.stripe.com', '_blank')}
          style={{ padding: '8px 16px', background: 'transparent', color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'sans-serif' }}>
          Gestionar suscripción ↗
        </button>
      </div>

      {/* Cerrar sesión */}
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Cuenta</div>
        <button onClick={handleLogout}
          style={{ padding: '10px 20px', background: 'rgba(214,48,49,0.1)', color: COLORS.coral, border: '1px solid rgba(214,48,49,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'sans-serif' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}