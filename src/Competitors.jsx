import { useState, useEffect } from 'react'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
}

const competitors = [
  { name: "Bar El Rincón", rating: 4.3, reviews: 127, pos: 4, you: true, trend: "up", priceLevel: "€€" },
  { name: "La Pepica", rating: 4.5, reviews: 203, pos: 2, you: false, trend: "up", priceLevel: "€€€" },
  { name: "Bar Mercado", rating: 4.1, reviews: 89, pos: 6, you: false, trend: "down", priceLevel: "€€" },
  { name: "El Tastet", rating: 3.8, reviews: 54, pos: 9, you: false, trend: "down", priceLevel: "€" },
  { name: "Casa Montaña", rating: 4.6, reviews: 312, pos: 1, you: false, trend: "up", priceLevel: "€€€" },
  { name: "Bar Pilar", rating: 4.0, reviews: 176, pos: 5, you: false, trend: "equal", priceLevel: "€€" },
]

const openInMaps = (name) => {
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(name + ' Valencia')}`, '_blank')
}

const ratingColor = (r) => r >= 4.4 ? COLORS.green : r >= 4.0 ? COLORS.amber : COLORS.coral

function Stars({ n }) {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="9" height="9" viewBox="0 0 11 11">
          <polygon points="5.5,0.5 7,4 11,4.3 8,7 9,11 5.5,8.8 2,11 3,7 0,4.3 4,4"
            fill={i <= Math.round(n) ? COLORS.amber : COLORS.faint} />
        </svg>
      ))}
    </span>
  )
}

export default function Competitors() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const sorted = [...competitors].sort((a, b) => a.pos - b.pos)
  const you = competitors.find(c => c.you)
  const ahead = competitors.filter(c => !c.you && c.pos < you.pos).length
  const behind = competitors.filter(c => !c.you && c.pos > you.pos).length

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", fontFamily: "sans-serif" }}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Tu posición media", value: `#${you.pos}`, color: ratingColor(you.rating) },
          { label: "Por delante", value: ahead, color: COLORS.coral },
          { label: "Por detrás", value: behind, color: COLORS.green },
        ].map((s, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 300, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Ranking de competidores</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((c, i) => (
            <div key={i}
              onClick={() => !c.you && openInMaps(c.name)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 10,
                cursor: c.you ? "default" : "pointer",
                background: c.you ? "rgba(108,92,231,0.1)" : "transparent",
                border: c.you ? "1px solid rgba(108,92,231,0.25)" : "1px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!c.you) e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}
              onMouseLeave={e => { if (!c.you) e.currentTarget.style.background = "transparent" }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.you ? COLORS.purple : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: c.you ? "white" : COLORS.muted, flexShrink: 0 }}>
                {c.pos}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: c.you ? 500 : 400, color: c.you ? COLORS.text : COLORS.muted }}>{c.name}</span>
                  {c.you && <span style={{ fontSize: 9, background: "rgba(108,92,231,0.2)", color: COLORS.purpleLight, padding: "1px 6px", borderRadius: 20 }}>tú</span>}
                  <span style={{ fontSize: 10, color: COLORS.faint }}>{c.priceLevel}</span>
                  {!c.you && <span style={{ fontSize: 10, color: COLORS.faint, marginLeft: "auto" }}>↗ ver en Google</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Stars n={c.rating} />
                  <span style={{ fontSize: 11, color: COLORS.faint }}>{c.reviews} reseñas</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: mounted ? `${(c.rating / 5) * 100}%` : "0%", height: "100%", background: c.you ? COLORS.purple : ratingColor(c.rating), borderRadius: 2, transition: "width 1.2s" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: ratingColor(c.rating), minWidth: 28 }}>{c.rating}</span>
              </div>
              <span style={{ fontSize: 12, color: c.trend === "up" ? COLORS.green : c.trend === "down" ? COLORS.coral : COLORS.faint, flexShrink: 0 }}>
                {c.trend === "up" ? "▲" : c.trend === "down" ? "▼" : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 12, padding: "14px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: COLORS.purpleLight, marginBottom: 8 }}>📊 Análisis de la competencia</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}><span style={{ color: COLORS.coral }}>La Pepica</span> está 2 posiciones por delante con 203 reseñas vs vuestras 127. Conseguir 76 reseñas más os pondría al mismo nivel.</p>
          <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}><span style={{ color: COLORS.green }}>Ventaja:</span> El Tastet y Bar Mercado están bajando — es el momento de adelantarles respondiendo activamente a reseñas esta semana.</p>
          <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}><span style={{ color: COLORS.amber }}>Precio:</span> Sois más económicos que La Pepica — destacad esto en vuestra descripción de Google para atraer más clientes.</p>
        </div>
      </div>
    </div>
  )
}
