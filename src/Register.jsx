import { useState } from 'react'
import { supabase } from './supabase'

const SECTORES = [
  { id: "bar", label: "Bar", icon: "🍺" },
  { id: "restaurante", label: "Restaurante", icon: "🍽️" },
  { id: "peluqueria", label: "Peluquería", icon: "✂️" },
  { id: "clinica_dental", label: "Clínica dental", icon: "🦷" },
  { id: "gimnasio", label: "Gimnasio", icon: "💪" },
  { id: "tienda_ropa", label: "Tienda de ropa", icon: "👕" },
  { id: "taller", label: "Taller", icon: "🔧" },
  { id: "academia", label: "Academia", icon: "📚" },
  { id: "farmacia", label: "Farmacia", icon: "💊" },
  { id: "estetica", label: "Estética", icon: "💅" },
  { id: "supermercado", label: "Supermercado", icon: "🛒" },
  { id: "otro", label: "Otro", icon: "🏪" },
]

const inp = (valid) => ({
  width: '100%', padding: '11px 14px',
  background: '#1E1E28',
  border: `1px solid ${valid === true ? 'rgba(0,184,148,0.5)' : valid === false ? 'rgba(225,112,85,0.5)' : 'rgba(255,255,255,0.1)'}`,
  color: '#F0EEF8', borderRadius: 10, fontSize: 14, outline: 'none',
  fontFamily: 'sans-serif', WebkitAppearance: 'none',
})

const btnActive = (active) => ({
  width: '100%', padding: '12px',
  background: active ? '#6C5CE7' : 'rgba(255,255,255,0.05)',
  color: active ? 'white' : '#4A4760',
  border: 'none', borderRadius: 10, cursor: active ? 'pointer' : 'not-allowed',
  fontSize: 14, fontWeight: 500, fontFamily: 'sans-serif', transition: 'all 0.2s',
})

const btnBack = {
  width: '100%', padding: '11px', background: 'transparent',
  color: '#8884A0', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, cursor: 'pointer', fontSize: 14,
  fontFamily: 'sans-serif', marginTop: 8,
}

function ProgressBar({ step, total }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#4A4760' }}>Paso {step} de {total}</span>
        <span style={{ fontSize: 12, color: '#A29BFE' }}>{Math.round((step / total) * 100)}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <div style={{ width: `${(step / total) * 100}%`, height: '100%', background: '#6C5CE7', borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function PwStrength({ pw }) {
  if (!pw) return null
  const checks = [pw.length >= 8, /[a-zA-Z]/.test(pw), /[0-9]/.test(pw)]
  const score = checks.filter(Boolean).length
  const color = score === 3 ? '#00B894' : score === 2 ? '#FDCB6E' : '#E17055'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? color : 'rgba(255,255,255,0.07)', transition: 'background 0.2s' }} />)}
      </div>
      {[
        { ok: checks[0], t: 'Mínimo 8 caracteres' },
        { ok: checks[1], t: 'Al menos una letra' },
        { ok: checks[2], t: 'Al menos un número' },
      ].map((r, i) => (
        <div key={i} style={{ fontSize: 11, color: r.ok ? '#00B894' : '#4A4760', display: 'flex', gap: 5, marginBottom: 2 }}>
          <span>{r.ok ? '✓' : '○'}</span>{r.t}
        </div>
      ))}
    </div>
  )
}

export default function Register({ onLogin }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    businessName: '', ownerName: '', email: '', phone: '', password: '',
    sector: '', sectorLabel: '',
    street: '', cp: '', city: '', province: '', googleUrl: '',
    keywords: ['', '', ''],
  })
  const [search, setSearch] = useState('')
  const [addrMode, setAddrMode] = useState('manual')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const next = () => { setError(''); setStep(s => s + 1) }
  const back = () => { setError(''); setStep(s => s - 1) }
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const isPhone = (p) => !p || /^[0-9\s\+\-]{7,15}$/.test(p)
  const isPwValid = (p) => p.length >= 8 && /[a-zA-Z]/.test(p) && /[0-9]/.test(p)

  // VALIDACIONES POR PASO
  const step1Valid = data.businessName.trim() && data.ownerName.trim() && isEmail(data.email) && isPwValid(data.password) && isPhone(data.phone)
  const step2Valid = !!data.sector
  const step3Valid = addrMode === 'google' ? !!data.googleUrl.trim() : (!!data.street.trim() && !!data.city.trim())
  const step5Valid = data.keywords.some(k => k.trim())

  const handleFinish = async () => {
  setSubmitting(true)
  setError('')
  try {
    // Paso 1 — Crear cuenta
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.ownerName,
          phone: data.phone,
          // Guardamos los datos del negocio en metadata
          // para insertarlos después del login
          pending_business: JSON.stringify({
            name: data.businessName,
            owner: data.ownerName,
            phone: data.phone,
            sector: data.sector,
            sector_label: data.sectorLabel,
            city: data.city,
            street: data.street,
            cp: data.cp,
            province: data.province,
            google_url: data.googleUrl,
            keywords: data.keywords.filter(k => k.trim()),
          })
        },
        emailRedirectTo: window.location.origin,
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Este email ya tiene cuenta. Inicia sesión.')
        setSubmitting(false)
        return
      }
      throw signUpError
    }

    // Paso 2 — Login inmediato
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (loginError) throw loginError

  } catch (e) {
    setError(e.message || 'Error al crear la cuenta. Inténtalo de nuevo.')
  }
  setSubmitting(false)
}
  

  const filtered = SECTORES.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'sans-serif', color: '#F0EEF8' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white' }}>◎</div>
          <span style={{ fontWeight: 500, fontSize: 15 }}>LocaMetrics</span>
        </div>

        <ProgressBar step={step} total={6} />

        {error && (
          <div style={{ fontSize: 13, color: '#E17055', marginBottom: 16, padding: '10px 14px', background: 'rgba(225,112,85,0.1)', borderRadius: 8 }}>
            ⚠ {error}
          </div>
        )}

        {/* PASO 1 — Datos de cuenta */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Crea tu cuenta</h2>
            <p style={{ color: '#8884A0', fontSize: 14, marginBottom: 24 }}>Empieza a controlar cómo aparece tu negocio en Google.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#4A4760', display: 'block', marginBottom: 5 }}>Nombre del negocio *</label>
                <input style={inp(data.businessName ? true : null)} placeholder="Ej: Bar El Rincón" value={data.businessName} onChange={e => set('businessName', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4A4760', display: 'block', marginBottom: 5 }}>Tu nombre *</label>
                <input style={inp(data.ownerName ? true : null)} placeholder="Nombre y apellido" value={data.ownerName} onChange={e => set('ownerName', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4A4760', display: 'block', marginBottom: 5 }}>Email *</label>
                <input style={inp(data.email ? isEmail(data.email) : null)} placeholder="tu@email.com" type="email" value={data.email} onChange={e => set('email', e.target.value)} />
                {data.email && !isEmail(data.email) && <div style={{ fontSize: 11, color: '#E17055', marginTop: 4 }}>Formato de email incorrecto</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4A4760', display: 'block', marginBottom: 5 }}>Teléfono</label>
                <input style={inp(data.phone ? isPhone(data.phone) : null)} placeholder="600 000 000" type="tel" value={data.phone} onChange={e => set('phone', e.target.value)} />
                {data.phone && !isPhone(data.phone) && <div style={{ fontSize: 11, color: '#E17055', marginTop: 4 }}>Teléfono no válido</div>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4A4760', display: 'block', marginBottom: 5 }}>Contraseña *</label>
                <input style={inp(data.password ? isPwValid(data.password) : null)} placeholder="Mínimo 8 caracteres con letras y números" type="password" value={data.password} onChange={e => set('password', e.target.value)} />
                <PwStrength pw={data.password} />
              </div>
            </div>
            <button style={{ ...btnActive(step1Valid), marginTop: 24 }} onClick={() => step1Valid && next()}>
              Continuar →
            </button>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#8884A0' }}>
              ¿Ya tienes cuenta?{' '}
              <span onClick={onLogin} style={{ color: '#A29BFE', cursor: 'pointer', fontWeight: 500 }}>Iniciar sesión</span>
            </div>
          </div>
        )}

        {/* PASO 2 — Sector */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>¿Qué tipo de negocio tenéis?</h2>
            <p style={{ color: '#8884A0', fontSize: 14, marginBottom: 20 }}>Seleccionad vuestro sector principal.</p>
            <input style={{ ...inp(null), marginBottom: 14 }} placeholder="Buscar sector..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
              {filtered.map(s => (
                <div key={s.id} onClick={() => { set('sector', s.id); set('sectorLabel', s.label) }}
                  style={{ padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', background: data.sector === s.id ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${data.sector === s.id ? 'rgba(108,92,231,0.5)' : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 12, color: data.sector === s.id ? '#A29BFE' : '#8884A0' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button style={btnActive(step2Valid)} onClick={() => step2Valid && next()}>Continuar →</button>
            <button style={btnBack} onClick={back}>← Atrás</button>
          </div>
        )}

        {/* PASO 3 — Dirección */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>¿Dónde está vuestro negocio?</h2>
            <p style={{ color: '#8884A0', fontSize: 14, marginBottom: 20 }}>La dirección es obligatoria para el análisis local.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {['manual', 'google'].map(m => (
                <button key={m} onClick={() => setAddrMode(m)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', border: 'none', fontSize: 13, fontFamily: 'sans-serif', background: addrMode === m ? '#6C5CE7' : 'rgba(255,255,255,0.06)', color: addrMode === m ? 'white' : '#8884A0' }}>
                  {m === 'manual' ? '📍 Dirección manual' : '🔗 Ficha de Google'}
                </button>
              ))}
            </div>
            {addrMode === 'manual' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input style={inp(data.street ? true : false)} placeholder="Calle y número *" value={data.street} onChange={e => set('street', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <input style={inp(null)} placeholder="Código postal" value={data.cp} onChange={e => set('cp', e.target.value)} />
                  <input style={inp(data.city ? true : false)} placeholder="Ciudad *" value={data.city} onChange={e => set('city', e.target.value)} />
                </div>
                <input style={inp(null)} placeholder="Provincia" value={data.province} onChange={e => set('province', e.target.value)} />
                {(!data.street || !data.city) && <div style={{ fontSize: 11, color: '#E17055' }}>Calle y ciudad son obligatorias</div>}
              </div>
            ) : (
              <div>
                <input style={inp(data.googleUrl ? true : false)} placeholder="https://maps.google.com/..." value={data.googleUrl} onChange={e => set('googleUrl', e.target.value)} />
                <p style={{ fontSize: 12, color: '#4A4760', marginTop: 8 }}>Google Maps → buscad vuestro negocio → copiad la URL.</p>
              </div>
            )}
            <button style={{ ...btnActive(step3Valid), marginTop: 18 }} onClick={() => step3Valid && next()}>Continuar →</button>
            <button style={btnBack} onClick={back}>← Atrás</button>
          </div>
        )}

        {/* PASO 4 — Confirmación */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Confirmad vuestros datos</h2>
            <p style={{ color: '#8884A0', fontSize: 14, marginBottom: 20 }}>Así hemos entendido vuestro negocio.</p>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
              {[
                { label: 'Negocio', value: data.businessName },
                { label: 'Responsable', value: data.ownerName },
                { label: 'Email', value: data.email },
                { label: 'Sector', value: data.sectorLabel },
                { label: 'Ciudad', value: data.city || '—' },
                { label: 'Dirección', value: data.street ? `${data.street}, ${data.cp}` : data.googleUrl || '—' },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#4A4760' }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: '#F0EEF8', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <button style={btnActive(true)} onClick={next}>Continuar →</button>
            <button style={btnBack} onClick={back}>← Editar datos</button>
          </div>
        )}

        {/* PASO 5 — Keywords */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>¿Por qué búsquedas queréis aparecer?</h2>
            <p style={{ color: '#8884A0', fontSize: 14, marginBottom: 20 }}>Añadid al menos 1 palabra clave.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[0,1,2].map(i => (
                <input key={i} style={inp(data.keywords[i] ? true : null)} placeholder={`Palabra clave ${i+1}${i === 0 ? ' *' : ''}`}
                  value={data.keywords[i]}
                  onChange={e => { const k = [...data.keywords]; k[i] = e.target.value; set('keywords', k) }} />
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: '#4A4760', marginBottom: 8 }}>💡 Sugerencias — pulsa para añadir:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  `${data.sectorLabel} en ${data.city || 'mi ciudad'}`,
                  `${data.sectorLabel} cerca de mí`,
                  `mejor ${data.sectorLabel} ${data.city || ''}`,
                ].map((s, i) => (
                  <div key={i} onClick={() => { const empty = data.keywords.findIndex(k => !k); if (empty !== -1) { const k = [...data.keywords]; k[empty] = s; set('keywords', k) } }}
                    style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#A29BFE', cursor: 'pointer' }}>
                    + {s}
                  </div>
                ))}
              </div>
            </div>
            <button style={btnActive(step5Valid)} onClick={() => step5Valid && next()}>Continuar →</button>
            <button style={btnBack} onClick={back}>← Atrás</button>
          </div>
        )}

        {/* PASO 6 — Crear cuenta */}
        {step === 6 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>¡Todo listo!</h2>
              <p style={{ color: '#8884A0', fontSize: 14 }}>Pulsa el botón para crear tu cuenta y entrar al panel.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              {[
                { icon: '⭐', text: 'Reseñas en tiempo real' },
                { icon: '🔔', text: 'Alertas automáticas' },
                { icon: '📊', text: 'Análisis de competidores' },
                { icon: '🤖', text: 'Respuestas con IA' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: '#8884A0' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <button onClick={handleFinish} disabled={submitting}
              style={{ ...btnActive(!submitting), background: submitting ? '#333' : '#6C5CE7' }}>
              {submitting ? 'Creando cuenta...' : 'Crear mi cuenta y entrar →'}
            </button>
            <button style={btnBack} onClick={back}>← Atrás</button>
          </div>
        )}

      </div>
    </div>
  )
}