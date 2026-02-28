import { useState, useRef } from "react";

// ─── FONTS ────────────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@400;500;600;700&display=swap";
document.head.appendChild(_fl);

// ─── PALETTE – guld + hvid + grøn/rød KUN til tilmeld/afmeld/fremmøde% ───────
const C = {
  bg:        "#08090b",
  surface:   "#0f1215",
  card:      "#13171c",
  border:    "#1f252d",
  borderHi:  "#2c3540",
  gold:      "#c8a84b",
  goldDim:   "#7a6428",
  white:     "#f0ece4",       // varm hvid – primær tekstfarve
  soft:      "#9aa4ae",       // sekundær tekst
  faint:     "#3a4550",       // deaktiv/dim
  // KUN til tilmeld / afmeld / fremmøde %
  green:     "#4ade80",
  yellow:    "#facc15",
  red:       "#f87171",
  r: 16,
  rs: 10,
};

// ─── % → FARVE (grøn/gul/rød) – bruges kun til fremmøde-ringe ────────────────
const pctColor = (pct) =>
  pct >= 70 ? C.green : pct >= 51 ? C.yellow : C.red;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TODAY = new Date("2026-02-28");
const isUpcoming = (d) => new Date(d) >= TODAY;
const isPast     = (d) => !isUpcoming(d);
const daysUntil  = (d) => Math.ceil((new Date(d) - TODAY) / 86400000);
const getMember  = (members, id) => members.find(m => m.id === id);

const fmtLong  = (d) => new Date(d).toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });
const fmtFull  = (d) => new Date(d).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (d) => new Date(d).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });

// Club year Aug 1 – Jul 31
const CY_START = (() => {
  const d = TODAY;
  return d.getMonth() >= 7
    ? new Date(d.getFullYear(), 7, 1)
    : new Date(d.getFullYear() - 1, 7, 1);
})();

const pastCYMeetings = (meetings) =>
  meetings.filter(m => isPast(m.date) && new Date(m.date) >= CY_START);

const memberAttPct = (memberId, meetings) => {
  const rel = pastCYMeetings(meetings);
  if (!rel.length) return null;
  return Math.round((rel.filter(m => m.attendees.includes(memberId)).length / rel.length) * 100);
};

const meetingAttPct = (meeting, total) =>
  total === 0 ? 0 : Math.round((meeting.attendees.length / total) * 100);

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const INIT_MEMBERS = [
  { id: 1, name: "Thomas Andersen",    email: "thomas@rt30x6.dk",    phone: "20 11 22 33", address: "Kongevejen 12, 2800 Lyngby",        role: "admin",  initials: "TA" },
  { id: 2, name: "Mikkel Bro",         email: "mikkel@rt30x6.dk",    phone: "21 33 44 55", address: "Skovvej 4, 3400 Hillerød",          role: "member", initials: "MB" },
  { id: 3, name: "Rasmus Dahl",        email: "rasmus@rt30x6.dk",    phone: "22 55 66 77", address: "Parkalle 8, 2100 Kbh Ø",           role: "member", initials: "RD" },
  { id: 4, name: "Jonas Holm",         email: "jonas@rt30x6.dk",     phone: "23 77 88 99", address: "Teglværksgade 3, 2200 Kbh N",      role: "member", initials: "JH" },
  { id: 5, name: "Frederik Møller",    email: "frederik@rt30x6.dk",  phone: "24 99 00 11", address: "Strandvejen 55, 2930 Klampenborg", role: "member", initials: "FM" },
  { id: 6, name: "Sebastian Nørgaard", email: "sebastian@rt30x6.dk", phone: "25 11 22 44", address: "Østergade 19, 1100 Kbh K",         role: "member", initials: "SN" },
];

const INIT_MEETINGS = [
  { id: 101, title: "Møde #44", subtitle: "Oktober 2025",  date: "2025-10-09", time: "19:00", location: "Hytten, Lyngby",
    description: "Efterårsmøde med fokus på klubbens økonomi og fremtidigt program.",
    agenda: "1. Velkomst\n2. Godkendelse af referat\n3. Økonomifremlæggelse\n4. 3 min v/ Jonas\n5. Bøder\n6. Eventuelt",
    responsible1: 2, responsible2: 3, boedemester: 4, treMinutter: 4,
    attendees: [1,2,3,5,6], absent: [4],
    fines: [{memberId:1,amount:50,note:"For sen ankomst"},{memberId:5,amount:100,note:"Glemte rundbord-hatten"}],
    documents: [] },
  { id: 102, title: "Møde #45", subtitle: "November 2025", date: "2025-11-13", time: "19:00", location: "Hytten, Lyngby",
    description: "Novembermøde med juleforberedelser og årsopgørelse.",
    agenda: "1. Velkomst\n2. Referat\n3. Julefest planlægning\n4. 3 min v/ Rasmus\n5. Bøder\n6. Eventuelt",
    responsible1: 5, responsible2: 6, boedemester: 1, treMinutter: 3,
    attendees: [1,2,3,4,6], absent: [5],
    fines: [{memberId:2,amount:75,note:"Mobiltelefon ringte"},{memberId:4,amount:50,note:"Forkert tøjkode"}],
    documents: [{name:"Referat_Nov2025.pdf",size:"84 KB",uploadedAt:"2025-11-14"}] },
  { id: 103, title: "Møde #46", subtitle: "Januar 2026",   date: "2026-01-08", time: "19:00", location: "Hytten, Lyngby",
    description: "Nytårsmøde med status og ønsker for det nye år.",
    agenda: "1. Velkomst og nytårshilsen\n2. Referat\n3. Planer for 2026\n4. 3 min v/ Mikkel\n5. Bøder\n6. Eventuelt",
    responsible1: 3, responsible2: 4, boedemester: 2, treMinutter: 2,
    attendees: [1,3,4,5,6], absent: [2],
    fines: [{memberId:3,amount:100,note:"Kedelig nytårssang"},{memberId:6,amount:50,note:"Glemte referat"}],
    documents: [{name:"Referat_Jan2026.pdf",size:"91 KB",uploadedAt:"2026-01-09"},{name:"Budget2026.xlsx",size:"42 KB",uploadedAt:"2026-01-09"}] },
  { id: 201, title: "Møde #47", subtitle: "Marts 2026",    date: "2026-03-12", time: "19:00", location: "Hytten, Lyngby",
    description: "Månedligt møde med fællesspisning og diskussion om sommerplaner.",
    agenda: "1. Velkomst\n2. Godkendelse af referat\n3. 3 min v/ Frederik\n4. Bøder v/ Jonas\n5. Eventuelt",
    responsible1: 2, responsible2: 3, boedemester: 4, treMinutter: 5,
    attendees: [1,2,3,5], absent: [4,6], fines: [], documents: [] },
  { id: 202, title: "Møde #48", subtitle: "April 2026",    date: "2026-04-09", time: "19:00", location: "Hytten, Lyngby",
    description: "Forårsmøde med særligt tema om Round Table historien.",
    agenda: "1. Velkomst\n2. Tema: RT historien\n3. 3 min v/ Mikkel\n4. Bøder v/ Thomas\n5. Eventuelt",
    responsible1: 5, responsible2: 6, boedemester: 1, treMinutter: 2,
    attendees: [1,3,4], absent: [], fines: [], documents: [] },
  { id: 203, title: "Møde #49", subtitle: "Maj 2026",      date: "2026-05-14", time: "19:00", location: "Hytten, Lyngby",
    description: "Forårets afsluttende møde inden sommerpause.",
    agenda: "",
    responsible1: null, responsible2: null, boedemester: null, treMinutter: null,
    attendees: [], absent: [], fines: [], documents: [] },
];

// ═══════════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════════

// Avatar – neutralt guld-scheme, ens for alle
const Avatar = ({ member, size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: C.goldDim + "55",
    border: `2px solid ${C.goldDim}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.gold, fontWeight: 700, fontFamily: "Outfit",
    fontSize: Math.round(size * 0.35), letterSpacing: "0.02em",
  }}>{member.initials}</div>
);

// Fremmøde-ring – identisk design overalt i appen
const PctRing = ({ pct, size = 64, stroke = 5 }) => {
  if (pct === null || pct === undefined)
    return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: C.faint, fontSize: 14 }}>–</div>;
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const arc  = (pct / 100) * circ;
  const col  = pctColor(pct);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: Math.round(size * 0.21), fontWeight: 700, color: col, fontFamily: "Outfit", lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
};

const Btn = ({ children, onClick, v = "gold", style, disabled }) => {
  const vs = {
    gold:   { bg: C.gold, color: "#08090b", border: "none" },
    ghost:  { bg: "transparent", color: C.soft, border: `1px solid ${C.border}` },
    danger: { bg: "transparent", color: C.red,  border: `1px solid ${C.red}50` },
    green:  { bg: "transparent", color: C.green, border: `1px solid ${C.green}50` },
    sub:    { bg: C.card, color: C.white, border: `1px solid ${C.border}` },
  };
  const vv = vs[v] || vs.gold;
  return (
    <button disabled={disabled} onClick={onClick} style={{
      background: vv.bg, color: vv.color, border: vv.border,
      borderRadius: C.rs, padding: "12px 20px",
      fontSize: 15, fontWeight: 600, fontFamily: "Outfit",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      display: "inline-flex", alignItems: "center", gap: 6,
      letterSpacing: "0.01em", transition: "opacity 0.15s",
      minHeight: 48, // touch target
      ...style,
    }}>{children}</button>
  );
};

const SmBtn = ({ children, onClick, v = "ghost", style, disabled }) => (
  <Btn onClick={onClick} v={v} disabled={disabled} style={{ padding: "8px 14px", fontSize: 13, minHeight: 38, ...style }}>{children}</Btn>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 11, color: C.soft, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, fontFamily: "Outfit" }}>{children}</div>
);

const Inp = ({ label, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <Label>{label}</Label>}
    <input {...p} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "13px 16px", color: C.white, fontSize: 15, fontFamily: "Outfit", outline: "none", boxSizing: "border-box", ...p.style }} />
  </div>
);

const Txa = ({ label, ...p }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <Label>{label}</Label>}
    <textarea {...p} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "13px 16px", color: C.white, fontSize: 15, fontFamily: "Outfit", outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 90, ...p.style }} />
  </div>
);

const Sel = ({ label, value, onChange, children }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <Label>{label}</Label>}
    <select value={value || ""} onChange={onChange} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "13px 16px", color: C.white, fontSize: 15, fontFamily: "Outfit", outline: "none" }}>
      {children}
    </select>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════
const Modal = ({ title, onClose, children, wide, tall }) => (
  <div onClick={e => e.target === e.currentTarget && onClose()} style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(6px)", zIndex: 600,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 12,
  }}>
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r,
      width: "100%", maxWidth: wide ? 720 : 500, maxHeight: tall ? "96vh" : "90vh",
      overflow: "auto", boxShadow: "0 40px 120px rgba(0,0,0,0.95)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 22px", borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, background: C.surface, zIndex: 2,
      }}>
        <span style={{ fontFamily: "Playfair Display", fontSize: 20, fontWeight: 700, color: C.white }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.soft, cursor: "pointer", fontSize: 22, padding: "4px 8px", lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: "22px 22px 28px" }}>{children}</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
const Login = ({ members, onLogin }) => {
  const [email, setEmail] = useState(""); 
  const [pw, setPw] = useState(""); 
  const [err, setErr] = useState("");
  const go = () => {
    const m = members.find(m => m.email === email.trim().toLowerCase());
    if (!m) return setErr("Email ikke fundet");
    if (pw !== "demo123") return setErr("Forkert adgangskode — demo: demo123");
    onLogin(m);
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Outfit", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "Playfair Display", fontSize: 52, fontWeight: 900, color: C.white, letterSpacing: "-0.02em", lineHeight: 1 }}>
            Round <span style={{ color: C.gold }}>Table</span>
          </div>
          <div style={{ fontSize: 12, color: C.soft, letterSpacing: "0.3em", marginTop: 8 }}>KLUB 30X6 · DENMARK</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 28 }}>
          {err && (
            <div style={{ border: `1px solid ${C.red}50`, borderRadius: C.rs, padding: "12px 16px", marginBottom: 18, color: C.red, fontSize: 14 }}>{err}</div>
          )}
          <Inp label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@email.dk" />
          <Inp label="Adgangskode" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && go()} />
          <Btn onClick={go} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Log ind</Btn>
          <div style={{ marginTop: 20, fontSize: 12, color: C.faint, borderTop: `1px solid ${C.border}`, paddingTop: 16, textAlign: "center" }}>
            Demo: <span style={{ color: C.gold }}>thomas@rt30x6.dk</span> / demo123
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// UPCOMING MEETING CARD  (stor, grafisk, mobil-venlig)
// ═══════════════════════════════════════════════════════════
const UpcomingCard = ({ meeting, members, user, isAdmin, onView, onRSVP, onFines }) => {
  const days = daysUntil(meeting.date);
  const isAtt = meeting.attendees.includes(user.id);
  const isAbs = meeting.absent.includes(user.id);
  const canFines = (meeting.boedemester === user.id || isAdmin) && meeting.boedemester;
  const totalM = members.length;
  const pct = meetingAttPct(meeting, totalM);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.r, overflow: "hidden" }}>
      {/* Gold accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, transparent 70%)` }} />

      <div style={{ padding: "22px 20px 18px" }}>
        {/* Header row: title + countdown */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>{meeting.subtitle}</div>
            <h3 style={{ margin: 0, fontFamily: "Playfair Display", fontSize: 28, fontWeight: 900, color: C.white, lineHeight: 1.1 }}>{meeting.title}</h3>
          </div>
          {/* Countdown box */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "10px 14px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: "Playfair Display", fontSize: 30, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{days}</div>
            <div style={{ fontSize: 10, color: C.soft, letterSpacing: "0.1em" }}>DAGE</div>
          </div>
        </div>

        {meeting.description && (
          <p style={{ margin: "0 0 16px", fontSize: 15, color: C.soft, lineHeight: 1.6 }}>{meeting.description}</p>
        )}

        {/* Date + location */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.white }}>
            <span style={{ color: C.gold, fontSize: 17 }}>📅</span>
            <span>{fmtLong(meeting.date)} · kl. {meeting.time}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.white }}>
            <span style={{ color: C.gold, fontSize: 17 }}>📍</span>
            <span>{meeting.location}</span>
          </div>
        </div>

        {/* Roles */}
        {(meeting.responsible1 || meeting.boedemester || meeting.treMinutter) && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "14px 16px", marginBottom: 18 }}>
            {meeting.responsible1 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: C.soft }}>Ansvarlig</span>
                <span style={{ color: C.white, fontWeight: 600 }}>
                  {getMember(members, meeting.responsible1)?.name}
                  {meeting.responsible2 ? " & " + getMember(members, meeting.responsible2)?.name : ""}
                </span>
              </div>
            )}
            {meeting.boedemester && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: C.soft }}>Bødemester</span>
                <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, meeting.boedemester)?.name}</span>
              </div>
            )}
            {meeting.treMinutter && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: C.soft }}>3 Minutter</span>
                <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, meeting.treMinutter)?.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Attendance: ring + counts */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 6 }}>
          <PctRing pct={pct} size={70} stroke={6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.soft, marginBottom: 6 }}>Mødeprocent</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Playfair Display", color: C.green }}>{meeting.attendees.length}</div>
                <div style={{ fontSize: 11, color: C.green, letterSpacing: "0.08em" }}>TILMELDT</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Playfair Display", color: C.red }}>{meeting.absent.length}</div>
                <div style={{ fontSize: 11, color: C.red, letterSpacing: "0.08em" }}>AFBUD</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Playfair Display", color: C.soft }}>{totalM - meeting.attendees.length - meeting.absent.length}</div>
                <div style={{ fontSize: 11, color: C.soft, letterSpacing: "0.08em" }}>UBESVARET</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: `1px solid ${C.border}`, padding: "14px 20px", background: C.bg + "cc" }}>
        <SmBtn v="sub" onClick={onView}>Detaljer</SmBtn>
        <SmBtn v={isAtt ? "green" : "ghost"} onClick={() => onRSVP(true)}>✓ Tilmeld</SmBtn>
        <SmBtn v={isAbs ? "danger" : "ghost"} onClick={() => onRSVP(false)}>✕ Afmeld</SmBtn>
        {canFines && (
          <SmBtn v="ghost" onClick={onFines} style={{ marginLeft: "auto", color: C.gold, borderColor: C.gold + "50" }}>⚖️ Bødeliste</SmBtn>
        )}
        {isAdmin && (
          <SmBtn v="ghost" onClick={onView} style={{ color: C.gold, borderColor: C.gold + "40" }}>✎ Redigér</SmBtn>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ARCHIVE ROW  (kompakt, med pct-ring)
// ═══════════════════════════════════════════════════════════
const ArchiveRow = ({ meeting, members, onClick }) => {
  const totalM = members.length;
  const pct = meetingAttPct(meeting, totalM);
  const d = new Date(meeting.date);
  return (
    <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "16px 20px", cursor: "pointer", transition: "border-color 0.15s", display: "flex", alignItems: "center", gap: 16 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      {/* Date */}
      <div style={{ textAlign: "center", minWidth: 46 }}>
        <div style={{ fontFamily: "Playfair Display", fontSize: 26, fontWeight: 900, color: C.soft, lineHeight: 1 }}>{d.getDate()}</div>
        <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {d.toLocaleDateString("da-DK", { month: "short" })}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{meeting.title} – {meeting.subtitle}</div>
        <div style={{ fontSize: 13, color: C.soft, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: C.green }}>{meeting.attendees.length} tilmeldt</span>
          <span style={{ color: C.red }}>{meeting.absent.length} afbud</span>
        </div>
      </div>

      {/* Pct ring – samme som på medlemmer */}
      <PctRing pct={pct} size={56} stroke={5} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MEMBER CARD
// ═══════════════════════════════════════════════════════════
const MemberCard = ({ member, meetings, isAdmin, onEdit, onDelete }) => {
  const pct = memberAttPct(member.id, meetings);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}70, transparent)` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Avatar member={member} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 700, color: C.white, fontSize: 18, lineHeight: 1.2 }}>{member.name}</div>
          {member.role === "admin" && (
            <span style={{ background: C.gold + "20", color: C.gold, border: `1px solid ${C.gold}40`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}>Admin</span>
          )}
        </div>
        {/* Fremmøde-ring – ens med møde-ring */}
        <PctRing pct={pct} size={64} stroke={5} />
      </div>

      {/* Contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {[["✉️", member.email], ["📞", member.phone], ["📍", member.address]].map(([icon, val]) => (
          <div key={icon} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: C.soft }}>
            <span>{icon}</span><span>{val}</span>
          </div>
        ))}
      </div>

      {/* Fremmøde label */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isAdmin ? 14 : 0 }}>
        <span style={{ fontSize: 13, color: C.soft }}>Fremmøde – klubår</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: pct !== null ? pctColor(pct) : C.faint }}>{pct !== null ? pct + "%" : "–"}</span>
      </div>

      {isAdmin && (
        <div style={{ display: "flex", gap: 8 }}>
          <SmBtn v="ghost" onClick={onEdit} style={{ flex: 1, justifyContent: "center" }}>✎ Redigér</SmBtn>
          {member.role !== "admin" && <SmBtn v="danger" onClick={onDelete}>✕</SmBtn>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FINES MODAL
// ═══════════════════════════════════════════════════════════
const FinesModal = ({ meeting, members, isAdmin, user, onClose, onSave }) => {
  const [fines, setFines] = useState((meeting.fines || []).map(f => ({ ...f })));
  const canEdit = meeting.boedemester === user.id || isAdmin;
  const getFine = (mid) => fines.find(f => f.memberId === mid) || { memberId: mid, amount: "", note: "" };
  const setFine = (mid, field, val) => setFines(prev => {
    const ex = prev.find(f => f.memberId === mid);
    if (ex) return prev.map(f => f.memberId === mid ? { ...f, [field]: val } : f);
    return [...prev, { memberId: mid, amount: "", note: "", [field]: val }];
  });
  const total = fines.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const sortedM = [
    ...meeting.attendees.map(id => ({ m: getMember(members, id), g: "att" })).filter(x => x.m),
    ...meeting.absent.map(id => ({ m: getMember(members, id), g: "abs" })).filter(x => x.m),
  ];

  return (
    <Modal title={`Bødeliste – ${meeting.title}`} onClose={onClose} wide tall>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: C.soft }}>Bødemester: <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, meeting.boedemester)?.name || "–"}</span></span>
        {total > 0 && <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{total} kr total</span>}
      </div>

      {["att", "abs"].map(group => {
        const items = sortedM.filter(x => x.g === group);
        if (!items.length) return null;
        return (
          <div key={group} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: group === "att" ? C.green : C.red, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              {group === "att" ? `✓ Tilmeldte  (${meeting.attendees.length})` : `✕ Afbud  (${meeting.absent.length})`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(({ m }) => {
                const fine = getFine(m.id);
                return (
                  <div key={m.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: canEdit ? 12 : 0 }}>
                      <Avatar member={m} size={40} />
                      <span style={{ fontWeight: 600, color: group === "att" ? C.white : C.soft, fontSize: 15, flex: 1 }}>{m.name}</span>
                      {fine.amount && <span style={{ color: C.gold, fontWeight: 700, fontSize: 15 }}>{fine.amount} kr</span>}
                    </div>
                    {!canEdit && fine.note && <div style={{ fontSize: 14, color: C.soft, paddingLeft: 52 }}>{fine.note}</div>}
                    {canEdit && (
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
                        <input type="number" placeholder="Beløb kr" value={fine.amount} onChange={e => setFine(m.id, "amount", e.target.value)}
                          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "11px 14px", color: C.gold, fontSize: 15, fontFamily: "Outfit", outline: "none" }} />
                        <input placeholder="Begrundelse…" value={fine.note} onChange={e => setFine(m.id, "note", e.target.value)}
                          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "11px 14px", color: C.white, fontSize: 15, fontFamily: "Outfit", outline: "none" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {canEdit && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
          <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
          <Btn onClick={() => onSave(fines.filter(f => f.amount || f.note))}>Gem bødeliste</Btn>
        </div>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// DOCUMENT SECTION
// ═══════════════════════════════════════════════════════════
const DocSection = ({ docs, onAdd, canUpload }) => {
  const ref = useRef();
  const iconFor = n => n.endsWith(".pdf") ? "📄" : n.endsWith(".xlsx") || n.endsWith(".xls") ? "📊" : n.endsWith(".docx") ? "📝" : "📎";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Label>Dokumenter ({docs.length})</Label>
        {canUpload && (
          <>
            <input ref={ref} type="file" multiple style={{ display: "none" }} onChange={e => { Array.from(e.target.files).forEach(f => onAdd({ name: f.name, size: (f.size/1024).toFixed(0)+" KB", uploadedAt: TODAY.toISOString().split("T")[0] })); e.target.value = ""; }} />
            <SmBtn v="ghost" onClick={() => ref.current.click()}>⬆ Upload</SmBtn>
          </>
        )}
      </div>
      {docs.length === 0
        ? <div style={{ fontSize: 14, color: C.faint, padding: "10px 0" }}>Ingen dokumenter tilknyttet.</div>
        : docs.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "12px 16px", marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{iconFor(doc.name)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{doc.name}</div>
              <div style={{ fontSize: 12, color: C.faint }}>{doc.size} · {doc.uploadedAt}</div>
            </div>
            <button style={{ background: "none", border: "none", color: C.soft, cursor: "pointer", fontSize: 14, fontFamily: "Outfit" }}>↓</button>
          </div>
        ))
      }
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MEETING DETAIL / EDIT MODAL
// ═══════════════════════════════════════════════════════════
const MeetingModal = ({ mode, meeting, members, isAdmin, onClose, onSave, onDelete, onDocAdd }) => {
  const blank = { title:"", subtitle:"", date:"", time:"19:00", location:"Hytten, Lyngby", description:"", agenda:"", responsible1:null, responsible2:null, boedemester:null, treMinutter:null, attendees:[], absent:[], fines:[], documents:[] };
  const [form, setForm] = useState(mode === "new" ? blank : { ...meeting });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalM = members.length;

  if (mode === "view") {
    const pct = meetingAttPct(meeting, totalM);
    return (
      <Modal title={meeting.title} onClose={onClose} wide tall>
        {/* Big stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 20 }}>
          <PctRing pct={pct} size={80} stroke={7} />
          <div style={{ flex: 1, display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "Playfair Display", color: C.green }}>{meeting.attendees.length}</div>
              <div style={{ fontSize: 12, color: C.green, letterSpacing: "0.1em" }}>TILMELDT</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "Playfair Display", color: C.red }}>{meeting.absent.length}</div>
              <div style={{ fontSize: 12, color: C.red, letterSpacing: "0.1em" }}>AFBUD</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "Playfair Display", color: C.soft }}>{totalM - meeting.attendees.length - meeting.absent.length}</div>
              <div style={{ fontSize: 12, color: C.soft, letterSpacing: "0.1em" }}>UBESVARET</div>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[
            ["Dato", fmtFull(meeting.date) + " kl. " + meeting.time],
            ["Sted", meeting.location],
            ["Ansvarlig", [meeting.responsible1, meeting.responsible2].filter(Boolean).map(id => getMember(members, id)?.name).join(" & ") || "–"],
            ["Bødemester", getMember(members, meeting.boedemester)?.name || "–"],
            ["3 Minutter", getMember(members, meeting.treMinutter)?.name || "–"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 15, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
              <span style={{ color: C.soft }}>{k}</span>
              <span style={{ color: C.white, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
            </div>
          ))}
        </div>

        {meeting.description && <p style={{ fontSize: 15, color: C.soft, lineHeight: 1.65, marginBottom: 16 }}>{meeting.description}</p>}

        {meeting.agenda && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 16, marginBottom: 16 }}>
            <Label>Dagsorden</Label>
            <pre style={{ color: C.soft, fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Outfit" }}>{meeting.agenda}</pre>
          </div>
        )}

        {/* Attendees / absent */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[["Tilmeldte", meeting.attendees, C.green], ["Afbud", meeting.absent, C.red]].map(([lbl, ids, col]) => (
            <div key={lbl} style={{ background: C.bg, border: `1px solid ${col}25`, borderRadius: C.rs, padding: 14 }}>
              <div style={{ fontSize: 11, color: col, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{lbl} ({ids.length})</div>
              {ids.map(id => { const m = getMember(members, id); return m ? (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Avatar member={m} size={28} />
                  <span style={{ fontSize: 14, color: C.white }}>{m.name}</span>
                </div>
              ) : null; })}
              {ids.length === 0 && <div style={{ fontSize: 13, color: C.faint }}>Ingen</div>}
            </div>
          ))}
        </div>

        {/* Fines summary */}
        {(meeting.fines || []).filter(f => f.amount).length > 0 && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Bøder – {(meeting.fines || []).reduce((s, f) => s + (parseFloat(f.amount)||0), 0)} kr total
            </div>
            {(meeting.fines || []).filter(f => f.amount).map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.soft, marginBottom: 6 }}>
                <span>{getMember(members, f.memberId)?.name}: {f.note}</span>
                <span style={{ color: C.gold, fontWeight: 600 }}>{f.amount} kr</span>
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 16, marginBottom: 20 }}>
          <DocSection docs={meeting.documents || []} canUpload={isAdmin} onAdd={doc => onDocAdd(meeting.id, doc)} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <SmBtn v="ghost" onClick={onClose}>Luk</SmBtn>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={mode === "new" ? "Nyt møde" : "Redigér møde"} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="Titel" value={form.title} onChange={e => s("title", e.target.value)} placeholder="Møde #47" />
        <Inp label="Undertitel" value={form.subtitle} onChange={e => s("subtitle", e.target.value)} placeholder="Marts 2026" />
        <Inp label="Dato" type="date" value={form.date} onChange={e => s("date", e.target.value)} />
        <Inp label="Tidspunkt" type="time" value={form.time} onChange={e => s("time", e.target.value)} />
      </div>
      <Inp label="Sted" value={form.location} onChange={e => s("location", e.target.value)} />
      <Txa label="Beskrivelse" value={form.description} onChange={e => s("description", e.target.value)} />
      <Txa label="Dagsorden" value={form.agenda} onChange={e => s("agenda", e.target.value)} style={{ minHeight: 100 }} />
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 16, marginBottom: 16 }}>
        <Label>Roller</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["responsible1","Ansvarlig 1"],["responsible2","Ansvarlig 2"],["boedemester","Bødemester"],["treMinutter","3 Minutter"]].map(([k, lbl]) => (
            <Sel key={k} label={lbl} value={form[k]} onChange={e => s(k, e.target.value ? parseInt(e.target.value) : null)}>
              <option value="">– Vælg –</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Sel>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {mode === "edit" ? <SmBtn v="danger" onClick={() => confirm("Slet møde?") && onDelete(form.id)}>✕ Slet</SmBtn> : <div />}
        <div style={{ display: "flex", gap: 10 }}>
          <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
          <Btn onClick={() => onSave(form)}>Gem møde</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// MEMBER MODAL
// ═══════════════════════════════════════════════════════════
const MemberModal = ({ mode, member, onClose, onSave }) => {
  const [form, setForm] = useState(mode === "new" ? { name:"", email:"", phone:"", address:"" } : { ...member });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal title={mode === "new" ? "Nyt medlem" : "Redigér"} onClose={onClose}>
      <Inp label="Fulde navn" value={form.name} onChange={e => s("name", e.target.value)} />
      <Inp label="Email" type="email" value={form.email} onChange={e => s("email", e.target.value)} />
      <Inp label="Telefon" value={form.phone} onChange={e => s("phone", e.target.value)} />
      <Inp label="Adresse" value={form.address} onChange={e => s("address", e.target.value)} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
        <Btn onClick={() => onSave(form)}>Gem</Btn>
      </div>
    </Modal>
  );
};

const InviteModal = ({ onClose }) => {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  return (
    <Modal title="Invitér medlem" onClose={onClose}>
      {!sent ? <>
        <Inp label="Navn" value={name} onChange={e => setName(e.target.value)} />
        <Inp label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
          <Btn disabled={!name||!email} onClick={() => setSent(true)}>✉️ Send</Btn>
        </div>
      </> : (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
          <div style={{ fontFamily: "Playfair Display", fontSize: 24, color: C.white, marginBottom: 8 }}>Sendt!</div>
          <p style={{ color: C.soft, fontSize: 15 }}>Invitation til <b>{name}</b> afsendt.</p>
          <SmBtn v="ghost" onClick={onClose} style={{ marginTop: 12 }}>Luk</SmBtn>
        </div>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// STATISTICS TAB
// ═══════════════════════════════════════════════════════════
const StatsTab = ({ members, meetings }) => {
  const [view, setView] = useState("members");
  const CY = pastCYMeetings(meetings);
  const totalM = members.length;
  const pastAll = meetings.filter(m => isPast(m.date)).sort((a, b) => b.date.localeCompare(a.date));

  const memberStats = members.map(m => ({
    member: m,
    pct: memberAttPct(m.id, meetings),
    attended: CY.filter(mt => mt.attendees.includes(m.id)).length,
    total: CY.length,
  })).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

  const meetingStats = pastAll.map(m => ({
    meeting: m,
    pct: meetingAttPct(m, totalM),
    att: m.attendees.length, abs: m.absent.length,
  })).sort((a, b) => b.pct - a.pct);

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setView(id)} style={{
      flex: 1, background: view === id ? C.gold + "18" : "transparent",
      color: view === id ? C.gold : C.soft,
      border: view === id ? `1px solid ${C.gold}50` : `1px solid ${C.border}`,
      borderRadius: C.rs, padding: "12px 10px", fontSize: 14, fontWeight: 600,
      fontFamily: "Outfit", cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 6px", fontFamily: "Playfair Display", fontSize: 36, fontWeight: 900, color: C.white }}>Statistik</h1>
        <div style={{ fontSize: 14, color: C.soft }}>
          Klubår: {CY_START.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })} – 31. juli {CY_START.getFullYear()+1} · {CY.length} afholdte møder
        </div>
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <TabBtn id="members" label="👤 Medlemsfremmøde" />
        <TabBtn id="meetings" label="📅 Mødefremmøde" />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 18, marginBottom: 20 }}>
        {[[C.green,"70–100 %"],[C.yellow,"51–69 %"],[C.red,"0–50 %"]].map(([col, lbl]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.soft }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, flexShrink: 0 }} />
            {lbl}
          </div>
        ))}
      </div>

      {/* MEMBER LIST */}
      {view === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {memberStats.map(({ member, pct, attended, total }, i) => (
            <div key={member.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 14, color: C.faint, fontWeight: 700, minWidth: 24, textAlign: "center" }}>#{i+1}</div>
              <Avatar member={member} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{member.name}</div>
                {/* Progress bar */}
                <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (pct ?? 0) + "%", background: pct !== null ? pctColor(pct) : C.faint, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>{attended}/{total} møder i klubåret</div>
              </div>
              <PctRing pct={pct} size={64} stroke={5} />
            </div>
          ))}
        </div>
      )}

      {/* MEETING LIST */}
      {view === "meetings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {meetingStats.map(({ meeting, pct, att, abs }, i) => (
            <div key={meeting.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 14, color: C.faint, fontWeight: 700, minWidth: 24, textAlign: "center" }}>#{i+1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{meeting.title} – {meeting.subtitle}</div>
                <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: pct + "%", background: pctColor(pct), borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                  <span style={{ color: C.green }}>{att} tilmeldt</span>
                  <span style={{ color: C.red }}>{abs} afbud</span>
                  <span style={{ color: C.soft }}>{fmtShort(meeting.date)}</span>
                </div>
              </div>
              <PctRing pct={pct} size={64} stroke={5} />
            </div>
          ))}
          {meetingStats.length === 0 && <div style={{ color: C.faint, fontSize: 15 }}>Ingen afholdte møder endnu.</div>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]       = useState(null);
  const [members, setMembers] = useState(INIT_MEMBERS);
  const [meetings, setMeetings] = useState(INIT_MEETINGS);
  const [tab, setTab]         = useState("home");
  const [meetingModal, setMeetingModal] = useState(null);
  const [memberModal, setMemberModal]   = useState(null);
  const [finesModal, setFinesModal]     = useState(null);
  const [inviteModal, setInviteModal]   = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [showAllUp, setShowAllUp]       = useState(false);
  const [showAllArc, setShowAllArc]     = useState(false);

  if (!user) return <Login members={members} onLogin={setUser} />;

  const isAdmin   = user.role === "admin";
  const upcoming  = meetings.filter(m => isUpcoming(m.date)).sort((a,b) => a.date.localeCompare(b.date));
  const archive   = meetings.filter(m => isPast(m.date)).sort((a,b) => b.date.localeCompare(a.date));

  const rsvp = (id, att) => setMeetings(prev => prev.map(m => {
    if (m.id !== id) return m;
    const attendees = att ? [...new Set([...m.attendees, user.id])] : m.attendees.filter(x => x !== user.id);
    const absent    = !att ? [...new Set([...m.absent, user.id])]   : m.absent.filter(x => x !== user.id);
    return { ...m, attendees, absent };
  }));

  const saveMeeting = data => {
    if (!data.id) setMeetings(p => [...p, { ...data, id: Date.now(), fines:[], documents:[] }]);
    else setMeetings(p => p.map(m => m.id === data.id ? data : m));
    setMeetingModal(null);
  };
  const saveFines = (mid, fines) => { setMeetings(p => p.map(m => m.id === mid ? { ...m, fines } : m)); setFinesModal(null); };
  const addDoc    = (mid, doc)   => setMeetings(p => p.map(m => m.id === mid ? { ...m, documents: [...(m.documents||[]), doc] } : m));

  const NAV = [
    { id:"home",     icon:"⌂", label:"Hjem" },
    { id:"meetings", icon:"◈", label:"Møder" },
    { id:"members",  icon:"◎", label:"Medlemmer" },
    { id:"stats",    icon:"◉", label:"Statistik" },
  ];

  // Fælles stil for mobile-friendly sidebarmenu
  const sidebarWidth = 220;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", fontFamily:"Outfit", color:C.white }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:sidebarWidth, background:C.surface, borderRight:`1px solid ${C.border}`, position:"fixed", top:0, left:0, bottom:0, zIndex:200, display:"flex", flexDirection:"column" }}>
        {/* Wordmark */}
        <div style={{ padding:"28px 20px 22px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontFamily:"Playfair Display", fontSize:20, fontWeight:900, color:C.white, lineHeight:1.1 }}>
            Round <span style={{ color:C.gold }}>Table</span>
          </div>
          <div style={{ fontSize:10, color:C.soft, letterSpacing:"0.26em", marginTop:4 }}>KLUB 30X6 · DENMARK</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"14px 10px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display:"flex", alignItems:"center", gap:12, width:"100%",
              padding:"13px 14px", borderRadius:C.rs, border:"none", cursor:"pointer",
              fontFamily:"Outfit", marginBottom:4,
              background: tab === n.id ? C.gold+"18" : "transparent",
              color:       tab === n.id ? C.gold : C.soft,
              fontSize:15, fontWeight: tab === n.id ? 600 : 400,
              transition:"all 0.15s", textAlign:"left",
            }}>
              <span style={{ fontSize:17 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"14px 12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <Avatar member={user} size={36} />
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.white, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:10, color:C.faint }}>{isAdmin ? "Administrator" : "Medlem"}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => setProfileModal(true)} style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:C.rs, padding:"8px", color:C.soft, fontSize:13, cursor:"pointer", fontFamily:"Outfit" }}>
              ✎ Profil
            </button>
            <button onClick={() => setUser(null)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:C.rs, padding:"8px 12px", color:C.soft, fontSize:13, cursor:"pointer" }}>
              ⏏
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ marginLeft:sidebarWidth, flex:1, padding:"36px 32px 72px", maxWidth:1100 }}>

        {/* HOME */}
        {tab === "home" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:32 }}>
              <div>
                <div style={{ fontSize:12, color:C.gold, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:6 }}>Velkommen, {user.name.split(" ")[0]}</div>
                <h1 style={{ margin:0, fontFamily:"Playfair Display", fontSize:38, fontWeight:900, color:C.white, letterSpacing:"-0.01em" }}>Kommende møder</h1>
              </div>
              {isAdmin && <Btn onClick={() => setMeetingModal({ mode:"new" })}>＋ Nyt møde</Btn>}
            </div>

            {/* 2 upcoming cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:18, marginBottom:12 }}>
              {(showAllUp ? upcoming : upcoming.slice(0,2)).map(m => (
                <UpcomingCard key={m.id} meeting={m} members={members} user={user} isAdmin={isAdmin}
                  onView={() => setMeetingModal({ mode: isAdmin ? "edit" : "view", meeting:m })}
                  onRSVP={a => rsvp(m.id, a)} onFines={() => setFinesModal(m)} />
              ))}
            </div>
            {upcoming.length > 2 && (
              <div style={{ textAlign:"center", marginBottom:40 }}>
                <button onClick={() => setShowAllUp(v => !v)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:20, padding:"10px 24px", color:C.soft, fontSize:14, cursor:"pointer", fontFamily:"Outfit" }}>
                  {showAllUp ? "↑ Vis kun de 2 næste" : `↓ Se alle ${upcoming.length} kommende`}
                </button>
              </div>
            )}

            {/* Archive */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, marginTop:upcoming.length <= 2 ? 40 : 8 }}>
              <h2 style={{ margin:0, fontFamily:"Playfair Display", fontSize:24, color:C.soft, fontWeight:700 }}>Arkiv</h2>
              {archive.length > 3 && (
                <button onClick={() => setShowAllArc(v => !v)} style={{ background:"none", border:"none", color:C.soft, fontSize:14, cursor:"pointer", textDecoration:"underline", fontFamily:"Outfit" }}>
                  {showAllArc ? "Vis færre" : `Se alle ${archive.length}`}
                </button>
              )}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(showAllArc ? archive : archive.slice(0,3)).map(m => (
                <ArchiveRow key={m.id} meeting={m} members={members} onClick={() => setMeetingModal({ mode:"view", meeting:m })} />
              ))}
              {archive.length === 0 && <div style={{ color:C.faint, fontSize:15 }}>Ingen afholdte møder endnu.</div>}
            </div>
          </div>
        )}

        {/* MEETINGS */}
        {tab === "meetings" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:32 }}>
              <h1 style={{ margin:0, fontFamily:"Playfair Display", fontSize:38, fontWeight:900 }}>Alle møder</h1>
              {isAdmin && <Btn onClick={() => setMeetingModal({ mode:"new" })}>＋ Nyt møde</Btn>}
            </div>
            {upcoming.length > 0 && <>
              <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:14 }}>Kommende</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:18, marginBottom:36 }}>
                {upcoming.map(m => (
                  <UpcomingCard key={m.id} meeting={m} members={members} user={user} isAdmin={isAdmin}
                    onView={() => setMeetingModal({ mode: isAdmin ? "edit" : "view", meeting:m })}
                    onRSVP={a => rsvp(m.id, a)} onFines={() => setFinesModal(m)} />
                ))}
              </div>
            </>}
            {archive.length > 0 && <>
              <div style={{ fontSize:11, fontWeight:700, color:C.soft, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:14 }}>Arkiv</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {archive.map(m => <ArchiveRow key={m.id} meeting={m} members={members} onClick={() => setMeetingModal({ mode:"view", meeting:m })} />)}
              </div>
            </>}
          </div>
        )}

        {/* MEMBERS */}
        {tab === "members" && (
          <div>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:32 }}>
              <div>
                <h1 style={{ margin:0, fontFamily:"Playfair Display", fontSize:38, fontWeight:900 }}>Medlemmer</h1>
                <div style={{ fontSize:14, color:C.soft, marginTop:4 }}>{members.length} registrerede</div>
              </div>
              {isAdmin && (
                <div style={{ display:"flex", gap:10 }}>
                  <SmBtn v="ghost" onClick={() => setInviteModal(true)}>✉️ Invitér</SmBtn>
                  <Btn onClick={() => setMemberModal({ mode:"new" })}>＋ Tilføj</Btn>
                </div>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:14 }}>
              {members.map(m => (
                <MemberCard key={m.id} member={m} meetings={meetings} isAdmin={isAdmin}
                  onEdit={() => setMemberModal({ mode:"edit", member:m })}
                  onDelete={() => confirm(`Slet ${m.name}?`) && setMembers(p => p.filter(x => x.id !== m.id))} />
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && <StatsTab members={members} meetings={meetings} />}
      </main>

      {/* ── MODALS ── */}
      {meetingModal && (
        <MeetingModal mode={meetingModal.mode} meeting={meetingModal.meeting} members={members} isAdmin={isAdmin}
          onClose={() => setMeetingModal(null)} onSave={saveMeeting}
          onDelete={id => { setMeetings(p => p.filter(m => m.id !== id)); setMeetingModal(null); }}
          onDocAdd={addDoc} />
      )}
      {finesModal && (
        <FinesModal meeting={finesModal} members={members} isAdmin={isAdmin} user={user}
          onClose={() => setFinesModal(null)} onSave={fines => saveFines(finesModal.id, fines)} />
      )}
      {memberModal && (
        <MemberModal mode={memberModal.mode} member={memberModal.member} onClose={() => setMemberModal(null)}
          onSave={data => {
            if (memberModal.mode === "new") {
              const initials = data.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
              setMembers(p => [...p, { ...data, id:Date.now(), role:"member", initials }]);
            } else setMembers(p => p.map(m => m.id === data.id ? data : m));
            setMemberModal(null);
          }} />
      )}
      {profileModal && (
        <MemberModal mode="edit" member={user} onClose={() => setProfileModal(false)}
          onSave={data => { setMembers(p => p.map(m => m.id === data.id ? data : m)); setUser(data); setProfileModal(false); }} />
      )}
      {inviteModal && <InviteModal onClose={() => setInviteModal(false)} />}
    </div>
  );
}
