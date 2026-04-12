import { useState, useEffect } from 'react'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
}

const keywords = [
  { kw: "bar de tapas Valencia", pos: 4, prev: 6, vol: "Alto", trend: "up" },
  { kw: "restaurante paella Valencia", pos: 9, prev: 9, vol: "Muy alto", trend: "equal" },
  { kw: "menú del día Ruzafa", pos: 12, prev: 15, vol: "Medio", trend: "up" },
  { kw: "bar económico Valencia centro", pos: 21, prev: 18, vol: "Alto", trend: "down" },
  { kw: "tapas baratas Valencia", pos: 7, prev: 10, vol: "Alto", trend: "up" },
  { kw: "bar con terraza Ruzafa", pos: 3, prev: 5, vol: "Medio", trend: "up" },
  { kw: "donde comer en Ruzafa", pos: 14, prev: 14, vol: "Muy alto", trend: "equal" },
  { kw: "bar abierto domingos Valencia", pos: 28, prev: 22, vol: "Bajo", trend: "down" },
]

const posColor = (p) => p <= 5 ? COLORS.green : p <= 15 ? COLORS.amber : COLORS.coral
const posBar = (p) => Math.max(4, 100 - (p - 1) * 3.5)

const openSearch = (kw) => {
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(kw)}`, '_blank')
}

export default function Seo() {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState("todas")

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const filtered = keywords.filter(k => {
    if (filter === "top5") return k.pos <= 5
    if (filter === "subiendo") return k.trend === "up"
    if (filter === "bajando") return k.trend === "down"
    return true
  })

  const avg = Math.round(keywords.reduce((a, k) => a + k.pos, 0) / keywords.length)
  const top5 = keywords.filter(k => k.pos <= 5).length
  const subiendo = keywords.filter(k => k.trend === "up").length

  const filters = [
    { id: "todas", label: "Todas" },
    { id: "top5", label: "Top 5" },
    { id: "subiendo", label: "Subiendo" },
    { id: "bajando", label: "Bajando" },
  ]

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", fontFamily: "sans-serif" }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Posición media", value: `#${avg}`, color: posColor(avg) },
          { label: "En top 5", value: top5, color: COLORS.green },
          { label: "Subiendo", value: subiendo, color: COLORS.purpleLight },
        ].map((s, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 300, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 60px 80px 80px", padding: "10px 18px", borderBottom: `1px solid ${COLORS.border}` }}>
          {["Palabra clave", "Posición", "Cambio", "Volumen", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 10, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>
        {filtered.map((k, i) => {
          const diff = k.prev - k.pos
          const trendColor = diff > 0 ? COLORS.green : diff < 0 ? COLORS.coral : COLORS.faint
          const trendIcon = diff > 0 ? "▲" : diff < 0 ? "▼" : "—"

          return (
            <div key={i}
              onClick={() => openSearch(k.kw)}
              style={{
                display: "grid", gridTemplateColumns: "1fr 100px 60px 80px 80px",
                padding: "13px 18px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : "none",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: COLORS.text }}>{k.kw}</span>
                <span style={{ fontSize: 10, color: COLORS.faint }}>↗</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: mounted ? `${posBar(k.pos)}%` : "0%", height: "100%", background: posColor(k.pos), borderRadius: 2, transition: "width 1.2s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: posColor(k.pos), minWidth: 24 }}>#{k.pos}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: trendColor }}>
                {trendIcon} {diff !== 0 ? Math.abs(diff) : ""}
              </span>
              <span style={{ fontSize: 11, color: COLORS.muted }}>{k.vol}</span>
              <span style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20, textAlign: "center",
                background: k.pos <= 5 ? "rgba(0,184,148,0.12)" : k.pos <= 15 ? "rgba(253,203,110,0.12)" : "rgba(225,112,85,0.12)",
                color: posColor(k.pos),
              }}>
                {k.pos <= 5 ? "Top 5" : k.pos <= 15 ? "Página 1" : "Página 2+"}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 12, padding: "14px 18px", marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.purpleLight, marginBottom: 4 }}>💡 Consejo de esta semana</div>
        <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
          Estáis en la posición #28 para "bar abierto domingos Valencia" y bajando. Añadid vuestro horario del domingo en la ficha de Google y responded a reseñas que mencionen el horario. Podríais subir al top 10 en 2-3 semanas.
        </p>
      </div>
    </div>
  )
}
