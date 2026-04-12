import { useState } from 'react'
import { supabase } from './supabase'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
}

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

const inp = {
  width: '100%', padding: '11px 14px',
  background: '#1E1E28', border: '1px solid rgba(255,255,255,0.1)',
  color: '#F0EEF8', borderRadius: 10, fontSize: 14, outline: 'none',
  fontFamily: 'sans-serif',
}

const btnGhost = {
  width: '100%', padding: '11px', background: 'transparent',
  color: '#8884A0', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, cursor: 'pointer', fontSize: 14,
  fontFamily: 'sans-serif', marginTop: 8,
}

function getBtn(active) {
  return {
    width: '100%', padding: '12px',
    background: active ? '#6C5CE7' : 'rgba(255,255,255,0.06)',
    color: active ? 'white' : '#4A4760',
    border: 'none', borderRadius: 10,
    cursor: active ? 'pointer' : 'not-allowed',
    fontSize: 14, fontWeight: 500,
    fontFamily: 'sans-serif',
    transition: 'all 0.2s',
  }
}

function ProgressBar({ step, total }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: COLORS.faint }}>Paso {step} de {total}</span>
        <span style={{ fontSize: 12, color: COLORS.purpleLight }}>{Math.round((step / total) * 100)}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${(step / total) * 100}%`, height: '100%', background: COLORS.purple, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function PasswordStrength({ password }) {
  const hasLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const score = [hasLength, hasLetter, hasNumber].filter(Boolean).length

  if (!password) return null

  const color = score === 3 ? COLORS.green : score === 2 ? COLORS.amber : COLORS.coral
  const label = score === 3 ? 'Contraseña segura ✓' : score === 2 ? 'Casi lista...' : 'Contraseña débil'

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? color : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
          { ok: hasLength, text: 'Mínimo 8 caracteres' },
          { ok: hasLetter, text: 'Al menos una letra' },
          { ok: hasNumber, text: 'Al menos un número' },
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 11, color: r.ok ? COLORS.green : COLORS.faint, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>{r.ok ? '✓' : '○'}</span> {r.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function Step1({ data, setData, onNext }) {
  const pwValid = data.password.length >= 8 && /[a-zA-Z]/.test(data.password) && /[0-9]/.test(data.password)
  const allFilled = data.businessName && data.ownerName && data.email && data.password && pwValid
  const [showPw, setShowPw] = useState(false)

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Empieza a controlar cómo aparece tu negocio en Google</h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 28 }}>Configúralo en menos de 5 minutos.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Nombre del negocio *</label>
          <input style={{ ...inp, borderColor: data.businessName ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }}
            placeholder="Ej: Bar El Rincón"
            value={data.businessName} onChange={e => setData({ ...data, businessName: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Tu nombre *</label>
          <input style={{ ...inp, borderColor: data.ownerName ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }}
            placeholder="Nombre y apellido"
            value={data.ownerName} onChange={e => setData({ ...data, ownerName: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Email *</label>
          <input style={{ ...inp, borderColor: data.email ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }}
            placeholder="tu@email.com" type="email"
            value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Teléfono</label>
          <input style={inp} placeholder="600 000 000" type="tel"
            value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: COLORS.faint, display: 'block', marginBottom: 5 }}>Contraseña *</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inp, borderColor: pwValid ? 'rgba(0,184,148,0.4)' : data.password ? 'rgba(225,112,85,0.4)' : 'rgba(255,255,255,0.1)', paddingRight: 44 }}
              placeholder="Mínimo 8 caracteres con letras y números"
              type={showPw ? 'text' : 'password'}
              value={data.password} onChange={e => setData({ ...data, password: e.target.value })} />
            <button onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faint, fontSize: 13 }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          <PasswordStrength password={data.password} />
        </div>
      </div>
      <button style={{ ...getBtn(allFilled), marginTop: 24 }} onClick={() => allFilled && onNext()}>
        {allFilled ? 'Crear mi panel →' : 'Rellena todos los campos'}
      </button>
    </div>
  )
}

function Step2({ data, setData, onNext, onBack }) {
  const [search, setSearch] = useState('')
  const filtered = SECTORES.filter(s => s.label.toLowerCase().includes(search.toLowerCase()))
  const active = !!data.sector
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>¿Qué tipo de negocio tenéis?</h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>Seleccionad vuestro sector principal.</p>
      <input style={{ ...inp, marginBottom: 16 }} placeholder="Buscar sector..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        {filtered.map(s => (
          <div key={s.id} onClick={() => setData({ ...data, sector: s.id, sectorLabel: s.label })}
            style={{ padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', background: data.sector === s.id ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${data.sector === s.id ? 'rgba(108,92,231,0.5)' : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.15s' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 12, color: data.sector === s.id ? COLORS.purpleLight : COLORS.muted }}>{s.label}</div>
          </div>
        ))}
      </div>
      <button style={getBtn(active)} onClick={() => active && onNext()}>
        {active ? 'Continuar →' : 'Elige un sector'}
      </button>
      <button style={btnGhost} onClick={onBack}>← Atrás</button>
    </div>
  )
}

function Step3({ data, setData, onNext, onBack }) {
  const [mode, setMode] = useState('manual')
  const active = mode === 'manual' ? !!data.city : !!data.googleUrl
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>¿Dónde está vuestro negocio?</h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>Añadid la dirección o pegad vuestra ficha de Google.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['manual', 'google'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', border: 'none', fontSize: 13, background: mode === m ? COLORS.purple : 'rgba(255,255,255,0.06)', color: mode === m ? 'white' : COLORS.muted }}>
            {m === 'manual' ? '📍 Dirección manual' : '🔗 Pegar ficha de Google'}
          </button>
        ))}
      </div>
      {mode === 'manual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={{ ...inp, borderColor: data.street ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }} placeholder="Calle y número" value={data.street || ''} onChange={e => setData({ ...data, street: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <input style={inp} placeholder="Código postal" value={data.cp || ''} onChange={e => setData({ ...data, cp: e.target.value })} />
            <input style={{ ...inp, borderColor: data.city ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }} placeholder="Ciudad *" value={data.city || ''} onChange={e => setData({ ...data, city: e.target.value })} />
          </div>
          <input style={inp} placeholder="Provincia" value={data.province || ''} onChange={e => setData({ ...data, province: e.target.value })} />
        </div>
      ) : (
        <div>
          <input style={{ ...inp, borderColor: data.googleUrl ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }} placeholder="https://maps.google.com/..." value={data.googleUrl || ''} onChange={e => setData({ ...data, googleUrl: e.target.value })} />
          <p style={{ fontSize: 12, color: COLORS.faint, marginTop: 8 }}>Entrad en Google Maps → buscad vuestro negocio → copiad la URL.</p>
        </div>
      )}
      <button style={{ ...getBtn(active), marginTop: 20 }} onClick={() => active && onNext()}>
        {active ? 'Continuar →' : 'Rellena la dirección'}
      </button>
      <button style={btnGhost} onClick={onBack}>← Atrás</button>
    </div>
  )
}

function Step4({ data, onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Confirmad vuestros datos</h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>Así hemos entendido vuestro negocio.</p>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
        {[
          { label: 'Negocio', value: data.businessName },
          { label: 'Responsable', value: data.ownerName },
          { label: 'Sector', value: data.sectorLabel },
          { label: 'Ciudad', value: data.city || '—' },
          { label: 'Dirección', value: data.street ? `${data.street}, ${data.cp}` : data.googleUrl || '—' },
          { label: 'Estado ficha', value: data.googleUrl ? 'URL aportada' : 'Pendiente de conectar' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <span style={{ fontSize: 13, color: COLORS.faint }}>{r.label}</span>
            <span style={{ fontSize: 13, color: COLORS.text, textAlign: 'right', maxWidth: '60%' }}>{r.value}</span>
          </div>
        ))}
      </div>
      <button style={getBtn(true)} onClick={onNext}>Continuar y elegir palabras clave →</button>
      <button style={btnGhost} onClick={onBack}>← Editar datos</button>
    </div>
  )
}

function Step5({ data, setData, onNext, onBack }) {
  const suggestions = [
    `${data.sectorLabel} en ${data.city || 'mi ciudad'}`,
    `${data.sectorLabel} cerca de mí`,
    `mejor ${data.sectorLabel} ${data.city || ''}`,
    `${data.sectorLabel} barato ${data.city || ''}`,
    `${data.sectorLabel} recomendado`,
  ]
  const kws = data.keywords || ['', '', '']
  const setKw = (i, val) => { const k = [...kws]; k[i] = val; setData({ ...data, keywords: k }) }
  const active = kws.some(k => k.trim())
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>¿Por qué búsquedas queréis aparecer?</h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>Añadid 3 palabras clave que usen vuestros clientes.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {[0, 1, 2].map(i => (
          <input key={i} style={{ ...inp, borderColor: kws[i] ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.1)' }}
            placeholder={`Palabra clave ${i + 1}`} value={kws[i]} onChange={e => setKw(i, e.target.value)} />
        ))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: COLORS.faint, marginBottom: 8 }}>💡 Sugerencias para vosotros — pulsa para añadir:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => { const empty = kws.findIndex(k => !k); if (empty !== -1) setKw(empty, s) }}
              style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: COLORS.purpleLight, cursor: 'pointer' }}>
              + {s}
            </div>
          ))}
        </div>
      </div>
      <button style={getBtn(active)} onClick={() => active && onNext()}>
        {active ? 'Continuar →' : 'Añade al menos una palabra clave'}
      </button>
      <button style={btnGhost} onClick={onBack}>← Atrás</button>
    </div>
  )
}

function Step6({ onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Conectad vuestro perfil de Google</h2>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>Para activar reseñas, alertas y datos reales.</p>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
        {[
          { icon: '⭐', text: 'Reseñas en tiempo real' },
          { icon: '🔔', text: 'Alertas automáticas' },
          { icon: '📊', text: 'Datos reales de posición' },
          { icon: '🤖', text: 'Respuestas con IA' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ fontSize: 16 }}>{f.icon}</span>
            <span style={{ fontSize: 13, color: COLORS.muted }}>{f.text}</span>
          </div>
        ))}
      </div>
      <button style={{ ...getBtn(true), background: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={onNext}>
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Conectar Google Business Profile
      </button>
      <button style={btnGhost} onClick={onNext}>Omitir por ahora, entrar al panel</button>
      <button style={{ ...btnGhost, marginTop: 4 }} onClick={onBack}>← Atrás</button>
    </div>
  )
}

function Step7({ data, onFinish }) {
  const tasks = [
    'Responde a las primeras reseñas que lleguen',
    'Añade una categoría secundaria en Google',
    'Consigue 5 reseñas este mes',
    'Comprueba que tu dirección es correcta en Google Maps',
  ]
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>¡Ya estáis dentro!</h2>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>Vuestro panel está listo.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Negocio', value: data.businessName },
          { label: 'Sector', value: data.sectorLabel },
          { label: 'Keywords', value: (data.keywords || []).filter(k => k).length + ' añadidas' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: COLORS.faint, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Primeras tareas recomendadas</div>
        {tasks.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: i < tasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid rgba(108,92,231,0.4)', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: COLORS.muted }}>{t}</span>
          </div>
        ))}
      </div>
      <button style={getBtn(true)} onClick={onFinish}>Entrar al panel →</button>
    </div>
  )
}

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    businessName: '', ownerName: '', email: '', phone: '', password: '',
    sector: '', sectorLabel: '', street: '', cp: '', city: '', province: '',
    googleUrl: '', keywords: ['', '', ''],
  })

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const handleFinish = async () => {
    try {
      await supabase.auth.signUp({ email: data.email, password: data.password })
      await supabase.from('businesses').insert({
        name: data.businessName,
        owner: data.ownerName,
        phone: data.phone,
        sector: data.sector,
        city: data.city,
        street: data.street,
        google_url: data.googleUrl,
        keywords: data.keywords.filter(k => k),
      })
    } catch (e) { console.log(e) }
    onDone()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif', color: '#F0EEF8' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>◎</div>
          <span style={{ fontWeight: 500, fontSize: 15 }}>LocaMetrics</span>
        </div>
        <ProgressBar step={step} total={7} />
        {step === 1 && <Step1 data={data} setData={setData} onNext={next} />}
        {step === 2 && <Step2 data={data} setData={setData} onNext={next} onBack={back} />}
        {step === 3 && <Step3 data={data} setData={setData} onNext={next} onBack={back} />}
        {step === 4 && <Step4 data={data} onNext={next} onBack={back} />}
        {step === 5 && <Step5 data={data} setData={setData} onNext={next} onBack={back} />}
        {step === 6 && <Step6 onNext={next} onBack={back} />}
        {step === 7 && <Step7 data={data} onFinish={handleFinish} />}
      </div>
    </div>
  )
}