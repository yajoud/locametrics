import { useState, useEffect } from "react";
import Reviews from "../Reviews";
import Alerts from "../Alerts";
import Seo from "../Seo";
import Competitors from "../Competitors";
import Profile from "../Profile";

const COLORS = {
  purple: "#6C5CE7", purpleLight: "#A29BFE", amber: "#FDCB6E",
  green: "#00B894", red: "#D63031", coral: "#E17055",
  bg: "#0F0F13", surface: "#16161D",
  border: "rgba(255,255,255,0.07)", text: "#F0EEF8",
  muted: "#8884A0", faint: "#4A4760",
};

const mockData = {
  business: { name: "Mi Negocio", location: "Valencia" },
  metrics: [
    { label: "Posición media", value: "#4", delta: "+2", up: true, sub: "Google Maps", link: "https://www.google.com/maps" },
    { label: "Reseñas totales", value: "127", delta: "+5", up: true, sub: "este mes", link: "https://www.google.com/maps" },
    { label: "Puntuación", value: "4.3★", delta: "-0.1", up: false, sub: "vs mes anterior", link: "https://www.google.com/maps" },
    { label: "Visitas ficha", value: "843", delta: "+12%", up: true, sub: "este mes", link: "https://business.google.com" },
  ],
  reviews: [
    { author: "María G.", stars: 5, text: "El ambiente es genial y la comida casera muy rica. Volveremos sin duda.", time: "hace 1 día" },
    { author: "Javier M.", stars: 2, text: "Tardaron mucho en atendernos, aunque la paella estaba bien.", time: "hace 3 días" },
    { author: "Lucía P.", stars: 5, text: "Sitio increíble, el menú del día es una pasada por ese precio.", time: "hace 5 días" },
  ],
  keywords: [
    { kw: "bar de tapas Valencia", pos: 4 },
    { kw: "restaurante paella Valencia", pos: 9 },
    { kw: "menú del día Ruzafa", pos: 12 },
    { kw: "bar económico Valencia", pos: 21 },
  ],
  competitors: [
    { name: "Mi Negocio", rating: 4.3, reviews: 127, you: true },
    { name: "La Pepica", rating: 4.5, reviews: 203, you: false },
    { name: "Bar Mercado", rating: 4.1, reviews: 89, you: false },
    { name: "El Tastet", rating: 3.8, reviews: 54, you: false },
  ],
  alerts: [
    { type: "danger", msg: "Competidor bajó precios del menú del día", sub: "hace 5h", link: "https://www.google.com/maps" },
    { type: "warning", msg: "Mención en Instagram sin etiqueta", sub: "hace 8h", link: "https://www.instagram.com" },
    { type: "success", msg: "Subiste al #4 en tu keyword principal", sub: "hace 2h", link: "https://www.google.com/maps" },
  ],
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", emoji: "▦" },
  { id: "reviews", label: "Reseñas", emoji: "★" },
  { id: "alerts", label: "Alertas", emoji: "◎" },
  { id: "seo", label: "SEO", emoji: "↑" },
  { id: "competitors", label: "Competidores", emoji: "◉" },
  { id: "profile", label: "Perfil", emoji: "👤" },
];

const posColor = (p) => p <= 5 ? COLORS.green : p <= 15 ? COLORS.amber : COLORS.coral;
const posBar = (p) => Math.max(5, 100 - (p - 1) * 4.5);

function Stars({ n }) {
  return (
    <span style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 11 11">
          <polygon points="5.5,0.5 7,4 11,4.3 8,7 9,11 5.5,8.8 2,11 3,7 0,4.3 4,4"
            fill={i <= n ? COLORS.amber : COLORS.faint} />
        </svg>
      ))}
    </span>
  );
}

function DashboardHome() {
  const [replies, setReplies] = useState({});
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const callAI = async (review, idx) => {
    setAiLoad(idx);
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
          system: "Eres el dueño de un negocio local. Responde reseñas de Google de forma profesional y cercana. Máximo 3 frases. En español.",
          messages: [{ role: "user", content: `Reseña de ${review.author} (${review.stars} estrellas): "${review.text}". Escribe una respuesta.` }],
        }),
      });
      const data = await res.json();
      setReplyText(data.content[0].text);
      setReplying(idx);
    } catch {
      setReplyText("Error al conectar. Inténtalo de nuevo.");
      setReplying(idx);
    } finally {
      setAiLoad(false);
    }
  };

  const sendReply = (idx) => {
    setReplies(r => ({ ...r, [idx]: replyText }));
    setReplying(null);
    setReplyText("");
  };

  const card = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: isMobile ? 14 : 18,
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px" : "20px 24px", display: "flex", flexDirection: "column", gap: isMobile ? 10 : 16 }}>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))", gap: isMobile ? 8 : 10 }}>
        {mockData.metrics.map((m, i) => (
          <div key={i} onClick={() => window.open(m.link, '_blank')}
            style={{ ...card, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
          >
            <div style={{ fontSize: 9, color: COLORS.faint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>{m.label}</div>
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 300 }}>{m.value}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: m.up ? COLORS.green : COLORS.coral }}>{m.up ? "▲" : "▼"} {m.delta}</span>
              <span style={{ fontSize: 10, color: COLORS.faint }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews + Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.5fr) minmax(0,1fr)", gap: isMobile ? 10 : 14 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Últimas reseñas</span>
            <span style={{ background: "rgba(214,48,49,0.12)", color: COLORS.coral, fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500 }}>3 sin responder</span>
          </div>
          {mockData.reviews.map((r, i) => (
            <div key={i} style={{ paddingBottom: 12, marginBottom: i < mockData.reviews.length - 1 ? 12 : 0, borderBottom: i < mockData.reviews.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(108,92,231,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 500, color: COLORS.purpleLight, flexShrink: 0 }}>{r.author[0]}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{r.author}</div>
                    <Stars n={r.stars} />
                  </div>
                </div>
                <span style={{ fontSize: 10, color: COLORS.faint, flexShrink: 0 }}>{r.time}</span>
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.55, marginBottom: 8 }}>{r.text}</p>
              {replies[i]
                ? <div style={{ background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, color: COLORS.purpleLight, marginBottom: 3, fontWeight: 500 }}>Tu respuesta</div>
                    <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{replies[i]}</p>
                  </div>
                : replying === i
                  ? <div>
                      <textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontFamily: "sans-serif", fontSize: 12, padding: "9px 11px", resize: "vertical", outline: "none" }} />
                      <div style={{ display: "flex", gap: 7, marginTop: 7 }}>
                        <button onClick={() => sendReply(i)} style={{ background: COLORS.purple, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Publicar</button>
                        <button onClick={() => setReplying(null)} style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                      </div>
                    </div>
                  : <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      <button onClick={() => { setReplying(i); setReplyText(""); }} style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Responder</button>
                      <button onClick={() => callAI(r, i)} style={{ background: COLORS.purple, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                        {aiLoad === i ? "Generando…" : "✦ IA"}
                      </button>
                    </div>
              }
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Alertas recientes</div>
          {mockData.alerts.map((a, i) => {
            const dotC = a.type === "danger" ? COLORS.red : a.type === "warning" ? COLORS.amber : COLORS.green;
            return (
              <div key={i} onClick={() => window.open(a.link, '_blank')}
                style={{ display: "flex", gap: 9, paddingBottom: 12, marginBottom: i < mockData.alerts.length - 1 ? 12 : 0, borderBottom: i < mockData.alerts.length - 1 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotC, flexShrink: 0, marginTop: 4, display: "inline-block" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.5, marginBottom: 2 }}>{a.msg}</div>
                  <div style={{ fontSize: 11, color: COLORS.faint }}>{a.sub}</div>
                </div>
                <span style={{ fontSize: 10, color: COLORS.faint }}>↗</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keywords + Competitors */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))", gap: isMobile ? 10 : 14 }}>
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Palabras clave</div>
          {mockData.keywords.map((k, i) => (
            <div key={i} onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(k.kw)}`, '_blank')}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < mockData.keywords.length - 1 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                <span style={{ fontSize: 12, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.kw}</span>
                <span style={{ fontSize: 10, color: COLORS.faint, flexShrink: 0 }}>↗</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: mounted ? `${posBar(k.pos)}%` : "0%", height: "100%", background: posColor(k.pos), borderRadius: 2, transition: "width 1.2s" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: posColor(k.pos), minWidth: 24 }}>#{k.pos}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Competidores</div>
          {mockData.competitors.map((c, i) => (
            <div key={i} onClick={() => !c.you && window.open(`https://www.google.com/maps/search/${encodeURIComponent(c.name + ' Valencia')}`, '_blank')}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < mockData.competitors.length - 1 ? `1px solid ${COLORS.border}` : "none", cursor: c.you ? "default" : "pointer" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: c.you ? 500 : 400, color: c.you ? COLORS.text : COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  {c.you && <span style={{ fontSize: 9, background: "rgba(108,92,231,0.18)", color: COLORS.purpleLight, padding: "1px 5px", borderRadius: 20, flexShrink: 0 }}>tú</span>}
                  {!c.you && <span style={{ fontSize: 10, color: COLORS.faint, flexShrink: 0 }}>↗</span>}
                </div>
                <div style={{ fontSize: 10, color: COLORS.faint, marginTop: 2 }}>{c.reviews} reseñas</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(c.rating / 5) * 100}%`, height: "100%", background: c.you ? COLORS.purple : COLORS.faint, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: c.rating >= 4.4 ? COLORS.green : c.rating >= 4.0 ? COLORS.amber : COLORS.coral, minWidth: 24 }}>{c.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LocaMetricsDashboard({ session }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeNav) {
      case "reviews": return <Reviews />;
      case "alerts": return <Alerts />;
      case "seo": return <Seo />;
      case "competitors": return <Competitors />;
      case "profile": return <Profile session={session} />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100vh", fontFamily: "sans-serif", background: COLORS.bg, color: COLORS.text }}>

      {/* Sidebar desktop / Bottom nav mobile */}
      {isMobile ? (
        // MOBILE — barra de navegación abajo
        <div style={{ order: 2, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", padding: "8px 4px", gap: 2, overflowX: "auto" }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} onClick={() => setActiveNav(item.id)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 4px", borderRadius: 8, cursor: "pointer", minWidth: 50,
                background: activeNav === item.id ? "rgba(108,92,231,0.15)" : "transparent",
                color: activeNav === item.id ? COLORS.purpleLight : COLORS.faint,
                transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: activeNav === item.id ? 500 : 400, whiteSpace: "nowrap" }}>{item.label}</span>
            </div>
          ))}
        </div>
      ) : (
        // DESKTOP — sidebar izquierdo
        <aside style={{ width: 200, flexShrink: 0, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "18px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 6px 20px" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white" }}>◎</div>
            <span style={{ fontWeight: 500, fontSize: 14 }}>LocaMetrics</span>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} onClick={() => setActiveNav(item.id)}
                style={{ padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  background: activeNav === item.id ? "rgba(108,92,231,0.15)" : "transparent",
                  color: activeNav === item.id ? COLORS.purpleLight : COLORS.muted,
                  transition: "all 0.15s" }}>
                <span style={{ fontSize: 14 }}>{item.emoji}</span>
                {item.label}
              </div>
            ))}
          </nav>
          <div style={{ marginTop: "auto", padding: "14px 6px 2px", borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 10, color: COLORS.faint, marginBottom: 3 }}>PLAN ACTIVO</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: COLORS.purpleLight, fontWeight: 500 }}>Pro</span>
              <span style={{ fontSize: 12, color: COLORS.muted }}>29 €/mes</span>
            </div>
          </div>
        </aside>
      )}

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", order: isMobile ? 1 : 0 }}>
        <header style={{ padding: isMobile ? "10px 14px" : "14px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isMobile && (
              <div style={{ width: 22, height: 22, borderRadius: 5, background: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white" }}>◎</div>
            )}
            <div>
              <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 500 }}>{mockData.business.name}</div>
              {!isMobile && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 1 }}>{mockData.business.location} · Actualizado hace 2h</div>}
            </div>
          </div>
          <div onClick={() => setActiveNav("alerts")}
            style={{ background: "rgba(253,203,110,0.12)", color: COLORS.amber, fontSize: isMobile ? 10 : 11, fontWeight: 500, padding: isMobile ? "3px 8px" : "4px 10px", borderRadius: 20, border: "1px solid rgba(253,203,110,0.2)", cursor: "pointer", whiteSpace: "nowrap" }}>
            3 alertas ↗
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}