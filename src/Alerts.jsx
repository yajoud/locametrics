import { useState } from 'react'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
}

const allAlerts = [
  { type: "danger", msg: "Reseña negativa de Ana M. (1 estrella)", sub: "Google · hace 2 horas", seen: false },
  { type: "danger", msg: "Competidor bajó precios del menú del día", sub: "La Pepica · hace 5h", seen: false },
  { type: "warning", msg: "Mención en Instagram sin etiqueta", sub: "@foodvalencia · hace 8h", seen: false },
  { type: "success", msg: "Subiste al #4 en 'bar de tapas Valencia'", sub: "Google Maps · hace 2h", seen: true },
  { type: "success", msg: "5 reseñas nuevas esta semana", sub: "Google · hace 1 día", seen: true },
  { type: "warning", msg: "Tu puntuación bajó 0.1 puntos", sub: "Google · hace 2 días", seen: true },
  { type: "danger", msg: "Reseña negativa de Javier M. (2 estrellas)", sub: "Google · hace 3 días", seen: true },
  { type: "success", msg: "Nuevo récord de visitas a tu ficha: 843", sub: "Google · hace 4 días", seen: true },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState(allAlerts)
  const [filter, setFilter] = useState("todas")

  const markSeen = (i) => {
    setAlerts(a => a.map((al, idx) => idx === i ? { ...al, seen: true } : al))
  }

  const markAllSeen = () => {
    setAlerts(a => a.map(al => ({ ...al, seen: true })))
  }

  const filtered = alerts.filter(a => {
    if (filter === "nuevas") return !a.seen
    if (filter === "danger") return a.type === "danger"
    if (filter === "success") return a.type === "success"
    return true
  })

  const unseen = alerts.filter(a => !a.seen).length

  const dotColor = (type) => type === "danger" ? COLORS.red : type === "warning" ? COLORS.amber : COLORS.green
  const bgColor = (type) => type === "danger" ? "rgba(214,48,49,0.08)" : type === "warning" ? "rgba(253,203,110,0.08)" : "rgba(0,184,148,0.08)"
  const borderColor = (type) => type === "danger" ? "rgba(214,48,49,0.2)" : type === "warning" ? "rgba(253,203,110,0.2)" : "rgba(0,184,148,0.2)"

  const filters = [
    { id: "todas", label: "Todas" },
    { id: "nuevas", label: `Nuevas (${unseen})` },
    { id: "danger", label: "Urgentes" },
    { id: "success", label: "Buenas noticias" },
  ]

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", fontFamily: "sans-serif" }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Sin leer", value: unseen, color: unseen > 0 ? COLORS.coral : COLORS.green },
          { label: "Urgentes", value: alerts.filter(a => a.type === "danger").length, color: COLORS.coral },
          { label: "Esta semana", value: alerts.length, color: COLORS.text },
        ].map((s, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 300, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + mark all */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "none",
                background: filter === f.id ? COLORS.purple : "rgba(255,255,255,0.06)",
                color: filter === f.id ? "white" : COLORS.muted,
                transition: "all 0.15s",
              }}>
              {f.label}
            </button>
          ))}
        </div>
        {unseen > 0 && (
          <button onClick={markAllSeen}
            style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Alerts list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((a, i) => (
          <div key={i} onClick={() => markSeen(i)}
            style={{
              background: a.seen ? COLORS.surface : bgColor(a.type),
              border: `1px solid ${a.seen ? COLORS.border : borderColor(a.type)}`,
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14,
              cursor: a.seen ? "default" : "pointer",
              transition: "all 0.15s",
              opacity: a.seen ? 0.7 : 1,
            }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.seen ? COLORS.faint : dotColor(a.type), display: "inline-block" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: a.seen ? COLORS.muted : COLORS.text, fontWeight: a.seen ? 400 : 500, marginBottom: 3 }}>{a.msg}</div>
              <div style={{ fontSize: 11, color: COLORS.faint }}>{a.sub}</div>
            </div>
            {!a.seen && (
              <span style={{ fontSize: 10, background: dotColor(a.type), color: "white", padding: "2px 8px", borderRadius: 20, flexShrink: 0, opacity: 0.9 }}>
                Nueva
              </span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: COLORS.faint, fontSize: 13 }}>
            No hay alertas en esta categoría
          </div>
        )}
      </div>
    </div>
  )
}
