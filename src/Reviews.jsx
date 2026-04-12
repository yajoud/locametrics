import { useState } from 'react'

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
}

const allReviews = [
  { author: "María G.", stars: 5, text: "El ambiente es genial y la comida casera muy rica. Volveremos sin duda.", time: "hace 1 día", platform: "Google" },
  { author: "Javier M.", stars: 2, text: "Tardaron mucho en atendernos, aunque la paella estaba bien.", time: "hace 3 días", platform: "Google" },
  { author: "Lucía P.", stars: 5, text: "Sitio increíble, el menú del día es una pasada por ese precio.", time: "hace 5 días", platform: "Google" },
  { author: "Carlos R.", stars: 4, text: "Muy buen sitio, la terraza es genial en verano.", time: "hace 1 semana", platform: "Google" },
  { author: "Ana M.", stars: 1, text: "Pésima atención, no volvería. Estuvimos esperando 40 minutos.", time: "hace 2 semanas", platform: "Google" },
  { author: "Pedro S.", stars: 5, text: "El mejor bar de tapas de Ruzafa sin duda. Los calamares increíbles.", time: "hace 3 semanas", platform: "Google" },
]

function Stars({ n }) {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 11 11">
          <polygon points="5.5,0.5 7,4 11,4.3 8,7 9,11 5.5,8.8 2,11 3,7 0,4.3 4,4"
            fill={i <= n ? COLORS.amber : COLORS.faint} />
        </svg>
      ))}
    </span>
  )
}

export default function Reviews() {
  const [filter, setFilter] = useState("todas")
  const [replies, setReplies] = useState({})
  const [replying, setReplying] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [aiLoad, setAiLoad] = useState(false)

  const filtered = allReviews.filter(r => {
    if (filter === "positivas") return r.stars >= 4
    if (filter === "negativas") return r.stars <= 2
    if (filter === "sinresponder") return !replies[allReviews.indexOf(r)]
    return true
  })

  const callAI = async (review, idx) => {
    setAiLoad(idx)
    try {
      const res = await fetch("https://corsproxy.io/?" + encodeURIComponent("https://api.anthropic.com/v1/messages"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "Eres el dueño de un bar en Valencia. Responde reseñas de Google de forma profesional y cercana. Máximo 3 frases. En español.",
          messages: [{ role: "user", content: `Reseña de ${review.author} (${review.stars} estrellas): "${review.text}". Escribe una respuesta.` }],
        }),
      })
      const data = await res.json()
      setReplyText(data.content[0].text)
      setReplying(idx)
    } catch {
      setReplyText("Error al conectar. Inténtalo de nuevo.")
      setReplying(idx)
    } finally {
      setAiLoad(false)
    }
  }

  const sendReply = (idx) => {
    setReplies(r => ({ ...r, [idx]: replyText }))
    setReplying(null)
    setReplyText("")
  }

  const filters = [
    { id: "todas", label: "Todas" },
    { id: "positivas", label: "Positivas" },
    { id: "negativas", label: "Negativas" },
    { id: "sinresponder", label: "Sin responder" },
  ]

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px", fontFamily: "sans-serif" }}>

      {/* Header stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total reseñas", value: allReviews.length },
          { label: "Puntuación media", value: (allReviews.reduce((a,r) => a + r.stars, 0) / allReviews.length).toFixed(1) + "★" },
          { label: "Sin responder", value: allReviews.length - Object.keys(replies).length },
        ].map((s, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 300, color: COLORS.text }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
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

      {/* Reviews list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((r, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(108,92,231,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: COLORS.purpleLight }}>
                  {r.author[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, marginBottom: 3 }}>{r.author}</div>
                  <Stars n={r.stars} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: COLORS.faint }}>{r.time}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{r.platform}</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, marginBottom: 12 }}>{r.text}</p>

            {replies[i]
              ? <div style={{ background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: COLORS.purpleLight, marginBottom: 4, fontWeight: 500 }}>Tu respuesta publicada</div>
                  <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{replies[i]}</p>
                </div>
              : replying === i
                ? <div>
                    <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontFamily: "sans-serif", fontSize: 13, padding: "10px 12px", resize: "vertical", outline: "none" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button onClick={() => sendReply(i)} style={{ background: COLORS.purple, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}>Publicar respuesta</button>
                      <button onClick={() => setReplying(null)} style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                : <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setReplying(i); setReplyText("") }} style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>Responder</button>
                    <button onClick={() => callAI(r, i)} style={{ background: COLORS.purple, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
                      {aiLoad === i ? "Generando…" : "✦ Responder con IA"}
                    </button>
                  </div>
            }
          </div>
        ))}
      </div>
    </div>
  )
}
