import { useState, useRef, useEffect } from "react";

// ─── PAGE TITLE ───────────────────────────────────────────────────────────────
document.title = "RT30X6";

// ─── FONTS ────────────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@400;500;600;700&display=swap";
document.head.appendChild(_fl);

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:       "#08090b",
  surface:  "#0f1215",
  card:     "#13171c",
  border:   "#1f252d",
  borderHi: "#2c3540",
  gold:     "#c8a84b",
  goldDim:  "#7a6428",
  white:    "#f0ece4",
  soft:     "#9aa4ae",
  faint:    "#3a4550",
  green:    "#4ade80",
  yellow:   "#facc15",
  red:      "#f87171",
  r: 16, rs: 10,
};

const pctColor = (pct) => pct >= 70 ? C.green : pct >= 51 ? C.yellow : C.red;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CLUB_ROLES = ["Formand", "Næstformand", "Revisor", "Kasserer", "Inspektør", "Medlem", "Orlov"];
const SYS_ROLES  = ["admin", "member"]; // system: admin = kan oprette/slette

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TODAY      = new Date("2026-02-28");
const isUpcoming = (d) => new Date(d) >= TODAY;
const isPast     = (d) => !isUpcoming(d);
const daysUntil  = (d) => Math.ceil((new Date(d) - TODAY) / 86400000);
const getMember  = (members, id) => members.find(m => m.id === id);
const initials   = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const fmtLong  = (d) => new Date(d).toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" });
const fmtFull  = (d) => new Date(d).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (d) => new Date(d).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });

const CY_START = (() => {
  const d = TODAY;
  return d.getMonth() >= 7 ? new Date(d.getFullYear(), 7, 1) : new Date(d.getFullYear() - 1, 7, 1);
})();

const pastCYMeetings = (meetings) => meetings.filter(m => isPast(m.date) && new Date(m.date) >= CY_START);
const memberAttPct   = (memberId, meetings) => {
  const rel = pastCYMeetings(meetings);
  if (!rel.length) return null;
  return Math.round((rel.filter(m => m.attendees.includes(memberId)).length / rel.length) * 100);
};
const meetingAttPct = (meeting, total) =>
  total === 0 ? 0 : Math.round((meeting.attendees.length / total) * 100);

// ─── SEED MEMBERS ────────────────────────────────────────────────────────────
const INIT_MEMBERS = [
  { id: 1,  name: "Morten Bøjland",         email: "boejland@gmail.com", phone: "28250180", address: "", birthday: "", sysRole: "admin",  clubRole: "Medlem",   board: false, initials: "MB", password: "demo123", mustChangePw: false },
  { id: 2,  name: "Ulrik Walter Rasmussen",  email: "uwr@live.dk",        phone: "40681555", address: "", birthday: "", sysRole: "admin",  clubRole: "Medlem",   board: false, initials: "UW", password: "demo123", mustChangePw: false },
  { id: 3,  name: "Henrik Høegh",            email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Formand",   board: false, initials: "HH", password: "rt30x6", mustChangePw: true },
  { id: 4,  name: "Peter Følbæk Nielsen",    email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Kasserer",  board: false, initials: "PF", password: "rt30x6", mustChangePw: true },
  { id: 5,  name: "Peter Lindholm Sørensen", email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "PL", password: "rt30x6", mustChangePw: true },
  { id: 6,  name: "Bo Forsberg",             email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "BF", password: "rt30x6", mustChangePw: true },
  { id: 7,  name: "Henrik Ulsø",             email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "HU", password: "rt30x6", mustChangePw: true },
  { id: 8,  name: "Christian Jensen",        email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "CJ", password: "rt30x6", mustChangePw: true },
  { id: 9,  name: "Henrik Frickmann",        email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "HF", password: "rt30x6", mustChangePw: true },
  { id: 10, name: "Anders Nyberg",           email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "AN", password: "rt30x6", mustChangePw: true },
  { id: 11, name: "Lars Asmussen",           email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "LA", password: "rt30x6", mustChangePw: true },
  { id: 12, name: "Lars Fendt-Hansen",       email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "LF", password: "rt30x6", mustChangePw: true },
  { id: 13, name: "Lars Skibsted",           email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "LS", password: "rt30x6", mustChangePw: true },
  { id: 14, name: "Leif Olsen",              email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "LO", password: "rt30x6", mustChangePw: true },
  { id: 15, name: "Kåre Schneekloth",        email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "KS", password: "rt30x6", mustChangePw: true },
  { id: 16, name: "Anders Bytoft",           email: "", phone: "", address: "", birthday: "", sysRole: "member", clubRole: "Medlem",    board: false, initials: "AB", password: "rt30x6", mustChangePw: true },
];

const INIT_MEETINGS = [
  { id: 101, title: "Møde #44", subtitle: "Oktober 2025",  date: "2025-10-09", time: "19:00", location: "Hytten, Lyngby",
    description: "Efterårsmøde med fokus på klubbens økonomi og fremtidigt program.",
    agenda: "1. Velkomst\n2. Godkendelse af referat\n3. Økonomifremlæggelse\n4. 3 min\n5. Bøder\n6. Eventuelt",
    responsible1: 1, responsible2: 2, boedemester: 3, treMinutter: 4,
    attendees: [1,2,3,5,6,7,8,9,10,11], absent: [4,12,13,14,15,16],
    fines: [{memberId:1,amount:50,note:"For sen ankomst"},{memberId:5,amount:100,note:"Glemte rundbord-hatten"}],
    documents: [] },
  { id: 102, title: "Møde #45", subtitle: "November 2025", date: "2025-11-13", time: "19:00", location: "Hytten, Lyngby",
    description: "Novembermøde med juleforberedelser og årsopgørelse.",
    agenda: "1. Velkomst\n2. Referat\n3. Julefest planlægning\n4. 3 min\n5. Bøder\n6. Eventuelt",
    responsible1: 5, responsible2: 6, boedemester: 1, treMinutter: 3,
    attendees: [1,2,3,4,5,6,7,8,9,10,11,12], absent: [13,14,15,16],
    fines: [{memberId:2,amount:75,note:"Mobiltelefon ringte"},{memberId:4,amount:50,note:"Forkert tøjkode"}],
    documents: [{name:"Referat_Nov2025.pdf",size:"84 KB",uploadedAt:"2025-11-14"}] },
  { id: 103, title: "Møde #46", subtitle: "Januar 2026",   date: "2026-01-08", time: "19:00", location: "Hytten, Lyngby",
    description: "Nytårsmøde med status og ønsker for det nye år.",
    agenda: "1. Velkomst og nytårshilsen\n2. Referat\n3. Planer for 2026\n4. 3 min\n5. Bøder\n6. Eventuelt",
    responsible1: 3, responsible2: 4, boedemester: 2, treMinutter: 2,
    attendees: [1,3,4,5,6,7,8,9,10,11,12,13], absent: [2,14,15,16],
    fines: [{memberId:3,amount:100,note:"Kedelig nytårssang"},{memberId:6,amount:50,note:"Glemte referat"}],
    documents: [{name:"Referat_Jan2026.pdf",size:"91 KB",uploadedAt:"2026-01-09"},{name:"Budget2026.xlsx",size:"42 KB",uploadedAt:"2026-01-09"}] },
  { id: 201, title: "Møde #47", subtitle: "Marts 2026",    date: "2026-03-12", time: "19:00", location: "Hytten, Lyngby",
    description: "Månedligt møde med fællesspisning og diskussion om sommerplaner.",
    agenda: "1. Velkomst\n2. Godkendelse af referat\n3. 3 min\n4. Bøder\n5. Eventuelt",
    responsible1: 2, responsible2: 3, boedemester: 4, treMinutter: 5,
    attendees: [1,2,3,5,7,9,11], absent: [4,6,8,10], fines: [], documents: [] },
  { id: 202, title: "Møde #48", subtitle: "April 2026",    date: "2026-04-09", time: "19:00", location: "Hytten, Lyngby",
    description: "Forårsmøde med særligt tema om Round Table historien.",
    agenda: "1. Velkomst\n2. Tema: RT historien\n3. 3 min\n4. Bøder\n5. Eventuelt",
    responsible1: 5, responsible2: 6, boedemester: 1, treMinutter: 2,
    attendees: [1,3,4], absent: [], fines: [], documents: [] },
  { id: 203, title: "Møde #49", subtitle: "Maj 2026",      date: "2026-05-14", time: "19:00", location: "Hytten, Lyngby",
    description: "Forårets afsluttende møde inden sommerpause.", agenda: "",
    responsible1: null, responsible2: null, boedemester: null, treMinutter: null,
    attendees: [], absent: [], fines: [], documents: [] },
];

// ═══════════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════════
const Avatar = ({ member, size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: C.goldDim + "55", border: `2px solid ${C.goldDim}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.gold, fontWeight: 700, fontFamily: "Outfit",
    fontSize: Math.round(size * 0.35), letterSpacing: "0.02em",
  }}>{member.initials}</div>
);

const PctRing = ({ pct, size = 64, stroke = 5 }) => {
  if (pct === null || pct === undefined)
    return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: C.faint, fontSize: 14 }}>–</div>;
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, arc = (pct / 100) * circ, col = pctColor(pct);
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
    gold:   { bg: C.gold,  color: "#08090b", border: "none" },
    ghost:  { bg: "transparent", color: C.soft, border: `1px solid ${C.border}` },
    danger: { bg: "transparent", color: C.red,  border: `1px solid ${C.red}50` },
    green:  { bg: "transparent", color: C.green, border: `1px solid ${C.green}50` },
    sub:    { bg: C.card,  color: C.white, border: `1px solid ${C.border}` },
  };
  const vv = vs[v] || vs.gold;
  return (
    <button disabled={disabled} onClick={onClick} style={{
      background: vv.bg, color: vv.color, border: vv.border, borderRadius: C.rs,
      padding: "12px 20px", fontSize: 15, fontWeight: 600, fontFamily: "Outfit",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
      display: "inline-flex", alignItems: "center", gap: 6,
      letterSpacing: "0.01em", minHeight: 48, ...style,
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
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
    zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 12,
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
const Login = ({ members, onLogin, onSetPassword }) => {
  const [screen, setScreen] = useState("login"); // login | mustChange | forgot
  const [email, setEmail]   = useState("");
  const [pw, setPw]         = useState("");
  const [newPw, setNewPw]   = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [err, setErr]       = useState("");
  const [pendingMember, setPendingMember] = useState(null);
  const [resetDone, setResetDone] = useState(false);

  const go = () => {
    setErr("");
    const m = members.find(m => m.email && m.email.trim().toLowerCase() === email.trim().toLowerCase());
    // Also allow login by member name for members without email
    const mByName = !m && members.find(mm => mm.name.toLowerCase() === email.trim().toLowerCase());
    const found = m || mByName;
    if (!found) return setErr("Email / navn ikke fundet");
    if (found.password !== pw) return setErr("Forkert adgangskode");
    if (found.mustChangePw) { setPendingMember(found); setScreen("mustChange"); return; }
    onLogin(found);
  };

  const doChangePassword = () => {
    setErr("");
    if (newPw.length < 6) return setErr("Adgangskode skal være mindst 6 tegn");
    if (newPw !== newPw2) return setErr("Adgangskoderne matcher ikke");
    const updated = { ...pendingMember, password: newPw, mustChangePw: false };
    onSetPassword(updated);
    onLogin(updated);
  };

  const doForgot = () => {
    setErr("");
    const found = members.find(m => m.email && m.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!found) return setErr("Email ikke fundet");
    // In real app this would send email. Here we show the temp password.
    setResetDone(true);
  };

  const Logo = () => (
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{ fontFamily: "Playfair Display", fontSize: 44, fontWeight: 900, color: C.white, letterSpacing: "-0.02em", lineHeight: 1 }}>
        Round <span style={{ color: C.gold }}>Table</span>
      </div>
      <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: "0.28em", marginTop: 6 }}>30X6</div>
    </div>
  );

  const ErrBox = ({ msg }) => msg ? (
    <div style={{ border: `1px solid ${C.red}50`, borderRadius: C.rs, padding: "12px 16px", marginBottom: 18, color: C.red, fontSize: 14 }}>{msg}</div>
  ) : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Outfit", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Logo />

        {/* ─── NORMAL LOGIN ─── */}
        {screen === "login" && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 28 }}>
            <ErrBox msg={err} />
            <Inp label="Email eller navn" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@email.dk" />
            <Inp label="Adgangskode" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && go()} />
            <Btn onClick={go} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Log ind</Btn>
            <button onClick={() => { setScreen("forgot"); setErr(""); setResetDone(false); }} style={{ background: "none", border: "none", color: C.soft, cursor: "pointer", fontSize: 13, fontFamily: "Outfit", marginTop: 16, display: "block", textAlign: "center", width: "100%", textDecoration: "underline" }}>
              Glemt adgangskode?
            </button>
            <div style={{ marginTop: 18, fontSize: 12, color: C.faint, borderTop: `1px solid ${C.border}`, paddingTop: 14, textAlign: "center" }}>
              Admin demo: <span style={{ color: C.gold }}>boejland@gmail.com</span> / demo123
            </div>
          </div>
        )}

        {/* ─── FIRST LOGIN / MUST CHANGE PASSWORD ─── */}
        {screen === "mustChange" && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 28 }}>
            <div style={{ background: C.gold+"18", border: `1px solid ${C.gold}40`, borderRadius: C.rs, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: C.gold }}>
              Velkommen, {pendingMember?.name.split(" ")[0]}! Du logger ind for første gang. Vælg venligst din egen adgangskode.
            </div>
            <ErrBox msg={err} />
            <Inp label="Ny adgangskode" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mindst 6 tegn" />
            <Inp label="Gentag adgangskode" type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doChangePassword()} />
            <Btn onClick={doChangePassword} style={{ width: "100%", justifyContent: "center" }}>Gem og log ind</Btn>
          </div>
        )}

        {/* ─── FORGOT PASSWORD ─── */}
        {screen === "forgot" && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, padding: 28 }}>
            {resetDone ? (
              <div>
                <div style={{ background: C.green+"18", border: `1px solid ${C.green}40`, borderRadius: C.rs, padding: "14px 16px", color: C.green, fontSize: 14, marginBottom: 20 }}>
                  Din adgangskode er nulstillet til <strong>rt30x6</strong>. Log ind og skift den straks.
                </div>
                <Btn onClick={() => { setScreen("login"); setErr(""); }} style={{ width: "100%", justifyContent: "center" }}>← Tilbage til login</Btn>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 15, color: C.white, fontWeight: 600, marginBottom: 6 }}>Glemt adgangskode</div>
                <div style={{ fontSize: 13, color: C.soft, marginBottom: 20 }}>Indtast din email, og din adgangskode nulstilles.</div>
                <ErrBox msg={err} />
                <Inp label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@email.dk" />
                <Btn onClick={doForgot} style={{ width: "100%", justifyContent: "center" }}>Nulstil adgangskode</Btn>
                <button onClick={() => { setScreen("login"); setErr(""); }} style={{ background: "none", border: "none", color: C.soft, cursor: "pointer", fontSize: 13, fontFamily: "Outfit", marginTop: 14, display: "block", textAlign: "center", width: "100%", textDecoration: "underline" }}>
                  ← Tilbage til login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// UPCOMING MEETING CARD
// ═══════════════════════════════════════════════════════════
const UpcomingCard = ({ meeting, members, user, isAdmin, onView, onRSVP, onFines }) => {
  const days   = daysUntil(meeting.date);
  const isAtt  = meeting.attendees.includes(user.id);
  const isAbs  = meeting.absent.includes(user.id);
  const canFines = (meeting.boedemester === user.id || isAdmin) && meeting.boedemester;
  const totalM = members.length;
  const pct    = meetingAttPct(meeting, totalM);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.r, overflow: "hidden" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, transparent 70%)` }} />
      <div style={{ padding: "22px 20px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>{meeting.subtitle}</div>
            <h3 style={{ margin: 0, fontFamily: "Playfair Display", fontSize: 28, fontWeight: 900, color: C.white, lineHeight: 1.1 }}>{meeting.title}</h3>
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "10px 14px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: "Playfair Display", fontSize: 30, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{days}</div>
            <div style={{ fontSize: 10, color: C.soft, letterSpacing: "0.1em" }}>DAGE</div>
          </div>
        </div>
        {meeting.description && <p style={{ margin: "0 0 16px", fontSize: 15, color: C.soft, lineHeight: 1.6 }}>{meeting.description}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.white }}>
            <span style={{ color: C.gold }}>📅</span>
            <span style={{ flex: 1 }}>{fmtLong(meeting.date)} · kl. {meeting.time}</span>
            <button onClick={() => downloadICS(meeting)} style={{ background: C.gold+"20", border:`1px solid ${C.gold}50`, borderRadius: C.rs, padding: "5px 12px", color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit", whiteSpace: "nowrap" }}>＋ Kalender</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.white }}>
            <span style={{ color: C.gold }}>📍</span><span>{meeting.location}</span>
          </div>
        </div>
        {(meeting.responsible1 || meeting.boedemester || meeting.treMinutter) && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "14px 16px", marginBottom: 18 }}>
            {meeting.responsible1 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: C.soft }}>Ansvarlig</span>
                <span style={{ color: C.white, fontWeight: 600 }}>
                  {getMember(members, meeting.responsible1)?.name}{meeting.responsible2 ? " & " + getMember(members, meeting.responsible2)?.name : ""}
                </span>
              </div>
            )}
            {meeting.boedemester && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: meeting.treMinutter ? 8 : 0 }}>
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
        {/* Attendance */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <PctRing pct={pct} size={70} stroke={6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.soft, marginBottom: 8 }}>Mødeprocent</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Playfair Display", color: C.green }}>{meeting.attendees.length}</div>
                <div style={{ fontSize: 11, color: C.green, letterSpacing: "0.08em" }}>TILMELDT</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Playfair Display", color: C.red }}>{meeting.absent.length}</div>
                <div style={{ fontSize: 11, color: C.red, letterSpacing: "0.08em" }}>AFBUD</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "Playfair Display", color: C.soft }}>{totalM - meeting.attendees.length - meeting.absent.length}</div>
                <div style={{ fontSize: 11, color: C.soft, letterSpacing: "0.08em" }}>UBESVARET</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: `1px solid ${C.border}`, padding: "14px 20px", background: C.bg + "cc" }}>
        <SmBtn v="sub" onClick={onView}>Detaljer</SmBtn>
        <SmBtn v={isAtt ? "green" : "ghost"} onClick={() => onRSVP(true)}>✓ Tilmeld</SmBtn>
        <SmBtn v={isAbs ? "danger" : "ghost"} onClick={() => onRSVP(false)}>✕ Afmeld</SmBtn>
        {canFines && <SmBtn v="ghost" onClick={onFines} style={{ marginLeft: "auto", color: C.gold, borderColor: C.gold + "50" }}>⚖️ Bødeliste</SmBtn>}
        {isAdmin && <SmBtn v="ghost" onClick={onView} style={{ color: C.gold, borderColor: C.gold + "40" }}>✎ Redigér</SmBtn>}
      </div>
    </div>
  );
};

// ─── ARCHIVE ROW ──────────────────────────────────────────────────────────────
const ArchiveRow = ({ meeting, members, onClick }) => {
  const totalM = members.length;
  const pct    = meetingAttPct(meeting, totalM);
  const d      = new Date(meeting.date);
  return (
    <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "16px 20px", cursor: "pointer", transition: "border-color 0.15s", display: "flex", alignItems: "center", gap: 16 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ textAlign: "center", minWidth: 46 }}>
        <div style={{ fontFamily: "Playfair Display", fontSize: 26, fontWeight: 900, color: C.soft, lineHeight: 1 }}>{d.getDate()}</div>
        <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.08em" }}>{d.toLocaleDateString("da-DK", { month: "short" })}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{meeting.title} – {meeting.subtitle}</div>
        <div style={{ fontSize: 13, color: C.soft, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: C.green }}>{meeting.attendees.length} tilmeldt</span>
          <span style={{ color: C.red }}>{meeting.absent.length} afbud</span>
        </div>
      </div>
      <PctRing pct={pct} size={56} stroke={5} />
    </div>
  );
};

// ─── MEMBER CARD ──────────────────────────────────────────────────────────────
const MemberCard = ({ member, meetings, isAdmin, onEdit, onDelete, onResetPw }) => {
  const pct = memberAttPct(member.id, meetings);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div style={{ background: C.surface, border: `1px solid ${confirmDelete ? C.red+"80" : C.border}`, borderRadius: C.r, padding: 20, position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}70, transparent)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <Avatar member={member} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Playfair Display", fontWeight: 700, color: C.white, fontSize: 18, lineHeight: 1.2, marginBottom: 4 }}>{member.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span style={{ background: C.gold + "20", color: C.gold, border: `1px solid ${C.gold}40`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
              {member.clubRole}
            </span>
            {member.sysRole === "admin" && (
              <span style={{ background: C.white + "12", color: C.white, border: `1px solid ${C.white}20`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
                Administrator
              </span>
            )}
            {member.board && (
              <span style={{ background: C.faint, color: C.soft, border: `1px solid ${C.border}`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                Bestyrelsen
              </span>
            )}
          </div>
        </div>
        <PctRing pct={pct} size={64} stroke={5} />
      </div>
      {(member.email || member.phone || member.address) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
          {member.email   && <a href={`mailto:${member.email}`} style={{ display: "flex", gap: 10, fontSize: 14, color: C.soft, textDecoration: "none" }}><span>✉️</span><span style={{ borderBottom: `1px solid ${C.faint}` }}>{member.email}</span></a>}
          {member.phone   && <a href={`tel:${member.phone.replace(/\s/g,"")}`} style={{ display: "flex", gap: 10, fontSize: 14, color: C.soft, textDecoration: "none" }}><span>📞</span><span style={{ borderBottom: `1px solid ${C.faint}` }}>{member.phone}</span></a>}
          {member.address && <div style={{ display: "flex", gap: 10, fontSize: 14, color: C.soft }}><span>📍</span><span>{member.address}</span></div>}
        </div>
      )}
      {/* Admin actions */}
      {isAdmin && !confirmDelete && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <SmBtn v="ghost" onClick={onEdit} style={{ flex: 1, justifyContent: "center" }}>✎ Redigér</SmBtn>
          <SmBtn v="ghost" onClick={onResetPw} style={{ color: C.gold, borderColor: C.gold+"40" }}>🔑</SmBtn>
          <SmBtn v="danger" onClick={() => setConfirmDelete(true)}>✕ Slet</SmBtn>
        </div>
      )}

      {/* Inline delete confirmation */}
      {isAdmin && confirmDelete && (
        <div style={{ background: C.red + "12", border: `1px solid ${C.red}40`, borderRadius: C.rs, padding: "14px 16px" }}>
          <div style={{ fontSize: 14, color: C.white, marginBottom: 12 }}>
            Slet <strong>{member.name}</strong>? Dette kan ikke fortrydes.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SmBtn v="ghost" onClick={() => setConfirmDelete(false)} style={{ flex: 1, justifyContent: "center" }}>Annullér</SmBtn>
            <SmBtn v="danger" onClick={onDelete} style={{ flex: 1, justifyContent: "center" }}>✕ Ja, slet</SmBtn>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FINES MODAL ──────────────────────────────────────────────────────────────
const FinesModal = ({ meeting, members, isAdmin, user, onClose, onSave }) => {
  const uidRef = useRef((meeting.fines || []).length);
  const [fines, setFines] = useState(
    (meeting.fines || []).map((f, i) => ({ ...f, _uid: i }))
  );
  const canEdit = meeting.boedemester === user.id || isAdmin;

  const addFineRow  = (memberId) =>
    setFines(p => [...p, { _uid: uidRef.current++, memberId, amount: "", note: "" }]);
  const updFineRow  = (uid, field, val) =>
    setFines(p => p.map(f => f._uid === uid ? { ...f, [field]: val } : f));
  const delFineRow  = (uid) =>
    setFines(p => p.filter(f => f._uid !== uid));

  const total       = fines.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
  const mFines      = (mid) => fines.filter(f => f.memberId === mid);
  const mTotal      = (mid) => mFines(mid).reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);

  const unansweredIds = members
    .filter(m => !meeting.attendees.includes(m.id) && !meeting.absent.includes(m.id))
    .map(m => m.id);
  const groups = [
    { g: "att", label: "Tilmeldte",   ids: meeting.attendees, col: C.green },
    { g: "abs", label: "Afbud",       ids: meeting.absent,    col: C.red },
    { g: "un",  label: "Ikke svaret", ids: unansweredIds,     col: C.soft },
  ];

  const inpStyle = (colr) => ({
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs,
    padding: "10px 12px", color: colr, fontSize: 14, fontFamily: "Outfit", outline: "none", width: "100%", boxSizing: "border-box",
  });

  return (
    <Modal title={`Bødeliste – ${meeting.title}`} onClose={onClose} wide tall>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: C.soft }}>
          Bødemester: <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, meeting.boedemester)?.name || "–"}</span>
        </span>
        {total > 0 && <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{total} kr total</span>}
      </div>

      {groups.map(({ g, label, ids, col }) => {
        if (!ids.length) return null;
        return (
          <div key={g} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: col, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              {label} ({ids.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ids.map(id => {
                const m = getMember(members, id);
                if (!m) return null;
                const rows  = mFines(m.id);
                const mtot  = mTotal(m.id);
                return (
                  <div key={m.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 14 }}>
                    {/* Member header row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: rows.length ? 10 : 0 }}>
                      <Avatar member={m} size={38} />
                      <span style={{ fontWeight: 600, color: g === "att" ? C.white : C.soft, fontSize: 15, flex: 1 }}>{m.name}</span>
                      {mtot > 0 && <span style={{ color: C.gold, fontWeight: 700, fontSize: 14 }}>{mtot} kr</span>}
                      {canEdit && (
                        <button onClick={() => addFineRow(m.id)} title="Tilføj bøde" style={{
                          background: C.gold + "22", border: `1px solid ${C.gold}50`, borderRadius: C.rs,
                          width: 34, height: 34, cursor: "pointer", color: C.gold, fontSize: 22,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>＋</button>
                      )}
                    </div>

                    {/* Fine rows */}
                    {rows.map((fine, fi) => (
                      <div key={fine._uid} style={{ display: "grid", gridTemplateColumns: "100px 1fr 34px", gap: 8, marginBottom: fi < rows.length - 1 ? 8 : 0 }}>
                        <input type="number" placeholder="Beløb kr" value={fine.amount}
                          onChange={e => updFineRow(fine._uid, "amount", e.target.value)}
                          readOnly={!canEdit} style={inpStyle(C.gold)} />
                        <input placeholder="Begrundelse…" value={fine.note}
                          onChange={e => updFineRow(fine._uid, "note", e.target.value)}
                          readOnly={!canEdit} style={inpStyle(C.white)} />
                        {canEdit && (
                          <button onClick={() => delFineRow(fine._uid)} style={{
                            background: "transparent", border: `1px solid ${C.red}40`,
                            borderRadius: C.rs, cursor: "pointer", color: C.red, fontSize: 16,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>✕</button>
                        )}
                      </div>
                    ))}

                    {rows.length === 0 && !canEdit && (
                      <div style={{ fontSize: 12, color: C.faint }}>Ingen bøder</div>
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
          <Btn onClick={() => onSave(fines.filter(f => f.amount || f.note).map(({ _uid, ...f }) => f))}>
            Gem bødeliste
          </Btn>
        </div>
      )}
    </Modal>
  );
};

// ─── DOCUMENT SECTION ─────────────────────────────────────────────────────────
const DocSection = ({ docs, onAdd, canUpload }) => {
  const ref = useRef();
  const iconFor = n => n.endsWith(".pdf") ? "📄" : n.endsWith(".xlsx") || n.endsWith(".xls") ? "📊" : "📎";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Label>Dokumenter ({docs.length})</Label>
        {canUpload && <>
          <input ref={ref} type="file" multiple style={{ display: "none" }} onChange={e => { Array.from(e.target.files).forEach(f => onAdd({ name: f.name, size: (f.size/1024).toFixed(0)+" KB", uploadedAt: TODAY.toISOString().split("T")[0] })); e.target.value = ""; }} />
          <SmBtn v="ghost" onClick={() => ref.current.click()}>⬆ Upload</SmBtn>
        </>}
      </div>
      {docs.length === 0
        ? <div style={{ fontSize: 14, color: C.faint }}>Ingen dokumenter tilknyttet.</div>
        : docs.map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "12px 16px", marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{iconFor(doc.name)}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: C.white }}>{doc.name}</div><div style={{ fontSize: 12, color: C.faint }}>{doc.size} · {doc.uploadedAt}</div></div>
            <button style={{ background: "none", border: "none", color: C.soft, cursor: "pointer", fontSize: 14, fontFamily: "Outfit" }}>↓</button>
          </div>
        ))
      }
    </div>
  );
};

// ─── MEETING MODAL (view / edit / new) ────────────────────────────────────────
const MeetingModal = ({ mode, meeting, members, isAdmin, onClose, onSave, onDelete, onDocAdd }) => {
  const blank = { title:"", subtitle:"", date:"", time:"19:00", location:"Hytten, Lyngby", description:"", agenda:"", responsible1:null, responsible2:null, boedemester:null, treMinutter:null, attendees:[], absent:[], fines:[], documents:[] };
  const [form, setForm] = useState(mode === "new" ? blank : { ...meeting });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalM = members.length;

  if (mode === "view") {
    const pct = meetingAttPct(meeting, totalM);
    return (
      <Modal title={meeting.title} onClose={onClose} wide tall>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 20 }}>
          <PctRing pct={pct} size={80} stroke={7} />
          <div style={{ flex: 1, display: "flex", gap: 24 }}>
            {[["Tilmeldt", meeting.attendees.length, C.green],["Afbud", meeting.absent.length, C.red],["Ubesvaret", totalM-meeting.attendees.length-meeting.absent.length, C.soft]].map(([l,v,c]) => (
              <div key={l}>
                <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "Playfair Display", color: c }}>{v}</div>
                <div style={{ fontSize: 11, color: c, letterSpacing: "0.1em" }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[["Dato", fmtFull(meeting.date)+" kl. "+meeting.time, true],["Sted", meeting.location, false],
            ["Ansvarlig", [meeting.responsible1, meeting.responsible2].filter(Boolean).map(id => getMember(members,id)?.name).join(" & ")||"–", false],
            ["Bødemester", getMember(members,meeting.boedemester)?.name||"–", false],
            ["3 Minutter", getMember(members,meeting.treMinutter)?.name||"–", false]].map(([k,v,isDate]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
              <span style={{ color: C.soft }}>{k}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: C.white, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                {isDate && <button onClick={() => downloadICS(meeting)} style={{ background: C.gold+"20", border:`1px solid ${C.gold}50`, borderRadius: C.rs, padding: "4px 10px", color: C.gold, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit", whiteSpace: "nowrap" }}>＋ Kalender</button>}
              </div>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[["Tilmeldte", meeting.attendees, C.green],["Afbud", meeting.absent, C.red]].map(([lbl,ids,col]) => (
            <div key={lbl} style={{ background: C.bg, border: `1px solid ${col}25`, borderRadius: C.rs, padding: 14 }}>
              <div style={{ fontSize: 11, color: col, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{lbl} ({ids.length})</div>
              {ids.map(id => { const m = getMember(members, id); return m ? <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Avatar member={m} size={28}/><span style={{ fontSize: 14, color: C.white }}>{m.name}</span></div> : null; })}
              {ids.length === 0 && <div style={{ fontSize: 13, color: C.faint }}>Ingen</div>}
            </div>
          ))}
        </div>
        {(meeting.fines||[]).filter(f=>f.amount).length > 0 && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Bøder – {(meeting.fines||[]).reduce((s,f)=>s+(parseFloat(f.amount)||0),0)} kr</div>
            {(meeting.fines||[]).filter(f=>f.amount).map((f,i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.soft, marginBottom: 6 }}>
                <span>{getMember(members,f.memberId)?.name}: {f.note}</span>
                <span style={{ color: C.gold, fontWeight: 600 }}>{f.amount} kr</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 16, marginBottom: 20 }}>
          <DocSection docs={meeting.documents||[]} canUpload={isAdmin} onAdd={doc => onDocAdd(meeting.id, doc)} />
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
        <Inp label="Titel" value={form.title} onChange={e => s("title",e.target.value)} placeholder="Møde #47" />
        <Inp label="Undertitel" value={form.subtitle} onChange={e => s("subtitle",e.target.value)} placeholder="Marts 2026" />
        <div style={{ marginBottom: 16 }}>
          <Label>📅 Dato</Label>
          <input type="date" value={form.date} onChange={e => s("date",e.target.value)}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}60`, borderRadius: C.rs, padding: "13px 16px", color: C.white, fontSize: 16, fontFamily: "Outfit", outline: "none", boxSizing: "border-box", cursor: "pointer" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Label>🕐 Tidspunkt</Label>
          <input type="time" value={form.time} onChange={e => s("time",e.target.value)}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.gold}60`, borderRadius: C.rs, padding: "13px 16px", color: C.white, fontSize: 16, fontFamily: "Outfit", outline: "none", boxSizing: "border-box", cursor: "pointer" }} />
        </div>
      </div>
      <Inp label="Sted" value={form.location} onChange={e => s("location",e.target.value)} />
      <Txa label="Beskrivelse" value={form.description} onChange={e => s("description",e.target.value)} />
      <Txa label="Dagsorden" value={form.agenda} onChange={e => s("agenda",e.target.value)} style={{ minHeight: 100 }} />
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: 16, marginBottom: 16 }}>
        <Label>Roller</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["responsible1","Ansvarlig 1"],["responsible2","Ansvarlig 2"],["boedemester","Bødemester"],["treMinutter","3 Minutter"]].map(([k,lbl]) => (
            <Sel key={k} label={lbl} value={form[k]} onChange={e => s(k, e.target.value ? parseInt(e.target.value) : null)}>
              <option value="">– Vælg –</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Sel>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {mode === "edit" ? <SmBtn v="danger" onClick={() => onDelete(form.id)}>✕ Slet møde</SmBtn> : <div/>}
        <div style={{ display: "flex", gap: 10 }}>
          <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
          <Btn onClick={() => onSave(form)}>Gem møde</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─── MEMBER MODAL ─────────────────────────────────────────────────────────────
const MemberModal = ({ mode, member, onClose, onSave }) => {
  const blank = { name:"", email:"", phone:"", address:"", birthday:"", sysRole:"member", clubRole:"Medlem", board:false, password:"rt30x6", mustChangePw:true };
  const [form, setForm] = useState(mode === "new" ? blank : { ...member, birthday: member?.birthday || "" });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal title={mode === "new" ? "Nyt medlem" : "Redigér medlem"} onClose={onClose}>
      <Inp label="Fulde navn" value={form.name} onChange={e => s("name", e.target.value)} />
      <Inp label="Email" type="email" value={form.email||""} onChange={e => s("email", e.target.value)} />
      <Inp label="Telefon" value={form.phone||""} onChange={e => s("phone", e.target.value)} />
      <Inp label="Adresse" value={form.address||""} onChange={e => s("address", e.target.value)} />

      <div style={{ marginBottom: 16 }}>
        <Label>🎂 Fødselsdag</Label>
        <input type="date" value={form.birthday||""} onChange={e => s("birthday", e.target.value)}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "13px 16px", color: form.birthday ? C.white : C.faint, fontSize: 15, fontFamily: "Outfit", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="Systemrolle" value={form.sysRole} onChange={e => s("sysRole", e.target.value)}>
          <option value="member">Medlem</option>
          <option value="admin">Administrator</option>
        </Sel>
        <Sel label="Klubrolle" value={form.clubRole} onChange={e => s("clubRole", e.target.value)}>
          {CLUB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </Sel>
      </div>

      {/* I bestyrelsen */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, color: C.white }}>I bestyrelsen</span>
        <button onClick={() => s("board", !form.board)} style={{
          background: form.board ? C.gold : "transparent",
          border: `2px solid ${form.board ? C.gold : C.border}`,
          borderRadius: 20, width: 52, height: 28, cursor: "pointer",
          position: "relative", transition: "all 0.2s",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: C.white,
            position: "absolute", top: 2, left: form.board ? 28 : 4,
            transition: "left 0.2s",
          }} />
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
        <Btn disabled={!form.name} onClick={() => onSave(form)}>Gem</Btn>
      </div>
    </Modal>
  );
};

// ─── STATS MEMBER DETAIL MODAL ────────────────────────────────────────────────
const StatsMemberModal = ({ member, meetings, onClose }) => {
  const pastAll = meetings.filter(m => isPast(m.date)).sort((a, b) => b.date.localeCompare(a.date));
  const getStatus = (m) => {
    if (m.attendees.includes(member.id)) return { label: "Tilmeldt", col: C.green };
    if (m.absent.includes(member.id))   return { label: "Afbud",    col: C.red };
    return { label: "Ikke svaret", col: C.soft };
  };
  return (
    <Modal title={member.name} onClose={onClose} tall>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Avatar member={member} size={52} />
        <div>
          <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, letterSpacing: "0.1em" }}>{member.clubRole}</div>
          <div style={{ fontSize: 14, color: C.soft }}>Fremmøde – klubår</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <PctRing pct={memberAttPct(member.id, meetings)} size={64} stroke={5} />
        </div>
      </div>

      {pastAll.length === 0 && <div style={{ color: C.faint, fontSize: 14 }}>Ingen afholdte møder endnu.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pastAll.map(m => {
          const { label, col } = getStatus(m);
          return (
            <div key={m.id} style={{ background: C.bg, border: `1px solid ${col}25`, borderRadius: C.rs, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontWeight: 600, color: C.white, fontSize: 15 }}>{m.title}</div>
                <span style={{ background: col + "20", color: col, border: `1px solid ${col}40`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{label}</span>
              </div>
              <div style={{ fontSize: 13, color: C.soft }}>{fmtShort(m.date)} · {m.location}</div>
              {m.description && <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{m.description}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <SmBtn v="ghost" onClick={onClose}>Luk</SmBtn>
      </div>
    </Modal>
  );
};

// ─── STATISTICS TAB ───────────────────────────────────────────────────────────
const StatsTab = ({ members, meetings }) => {
  const [view, setView]               = useState("members");
  const [detailMeeting, setDetailMeeting] = useState(null);
  const [detailMember, setDetailMember]   = useState(null);
  const CY     = pastCYMeetings(meetings);
  const totalM = members.length;
  const pastAll = meetings.filter(m => isPast(m.date)).sort((a, b) => b.date.localeCompare(a.date));

  const memberStats = members.map(m => ({
    member: m, pct: memberAttPct(m.id, meetings),
    attended: CY.filter(mt => mt.attendees.includes(m.id)).length, total: CY.length,
  })).sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));

  const meetingStats = pastAll.map(m => ({
    meeting: m, pct: meetingAttPct(m, totalM), att: m.attendees.length, abs: m.absent.length,
  })).sort((a, b) => b.pct - a.pct);

  // Meeting detail inline modal
  const MeetingDetailModal = ({ meeting, onClose }) => {
    const unanswered = members.filter(m => !meeting.attendees.includes(m.id) && !meeting.absent.includes(m.id));
    return (
      <Modal title={`${meeting.title} – ${meeting.subtitle}`} onClose={onClose}>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 20 }}>{fmtFull(meeting.date)} · kl. {meeting.time}</div>
        {[
          ["Tilmeldte", meeting.attendees, C.green],
          ["Afbud", meeting.absent, C.red],
          ["Ikke svaret", unanswered.map(m => m.id), C.soft],
        ].map(([lbl, ids, col]) => (
          <div key={lbl} style={{ background: C.bg, border: `1px solid ${col}25`, borderRadius: C.rs, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: col, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{lbl} ({ids.length})</div>
            {ids.map(id => { const m = getMember(members, id); return m ? (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Avatar member={m} size={28}/><span style={{ fontSize: 14, color: C.white }}>{m.name}</span>
              </div>
            ) : null; })}
            {ids.length === 0 && <div style={{ fontSize: 13, color: C.faint }}>Ingen</div>}
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <SmBtn v="ghost" onClick={onClose}>Luk</SmBtn>
        </div>
      </Modal>
    );
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setView(id)} style={{
      flex: 1, background: view === id ? C.gold+"18" : "transparent",
      color: view === id ? C.gold : C.soft,
      border: view === id ? `1px solid ${C.gold}50` : `1px solid ${C.border}`,
      borderRadius: C.rs, padding: "12px 10px", fontSize: 14, fontWeight: 600,
      fontFamily: "Outfit", cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div>
      {detailMeeting && <MeetingDetailModal meeting={detailMeeting} onClose={() => setDetailMeeting(null)} />}
      {detailMember  && <StatsMemberModal member={detailMember} meetings={meetings} onClose={() => setDetailMember(null)} />}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 6px", fontFamily: "Playfair Display", fontSize: 36, fontWeight: 900, color: C.white }}>Statistik</h1>
        <div style={{ fontSize: 14, color: C.soft }}>
          Klubår: {CY_START.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })} – 31. juli {CY_START.getFullYear()+1} · {CY.length} afholdte møder
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <TabBtn id="members" label="👤 Medlemsfremmøde" />
        <TabBtn id="meetings" label="📅 Fremmøde" />
      </div>
      <div style={{ display: "flex", gap: 18, marginBottom: 20 }}>
        {[[C.green,"70–100 %"],[C.yellow,"51–69 %"],[C.red,"0–50 %"]].map(([col, lbl]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.soft }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, flexShrink: 0 }} />{lbl}
          </div>
        ))}
      </div>

      {view === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {memberStats.map(({ member, pct, attended, total }, i) => (
            <div key={member.id} onClick={() => setDetailMember(member)}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{ fontSize: 14, color: C.faint, fontWeight: 700, minWidth: 24, textAlign: "center" }}>#{i+1}</div>
              <Avatar member={member} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  {pct === 100 && <span style={{ fontSize: 18 }} title="100% fremmøde">🥇</span>}
                  {member.name}
                </div>
                <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (pct??0)+"%", background: pct !== null ? pctColor(pct) : C.faint, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>{attended}/{total} møder i klubåret</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PctRing pct={pct} size={64} stroke={5} />
                <span style={{ fontSize: 18, color: C.faint }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "meetings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {meetingStats.map(({ meeting, pct, att, abs }, i) => {
            const unans = totalM - att - abs;
            return (
              <div key={meeting.id} onClick={() => setDetailMeeting(meeting)}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                <div style={{ fontSize: 14, color: C.faint, fontWeight: 700, minWidth: 24, textAlign: "center" }}>#{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{meeting.title} – {meeting.subtitle}</div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: pct+"%", background: pctColor(pct), borderRadius: 3 }} />
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                    <span style={{ color: C.green }}>{att} tilmeldt</span>
                    <span style={{ color: C.red }}>{abs} afbud</span>
                    <span style={{ color: C.soft }}>{unans} ubesvaret</span>
                    <span style={{ color: C.faint }}>{fmtShort(meeting.date)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PctRing pct={pct} size={64} stroke={5} />
                  <span style={{ fontSize: 18, color: C.faint }}>›</span>
                </div>
              </div>
            );
          })}
          {meetingStats.length === 0 && <div style={{ color: C.faint, fontSize: 15 }}>Ingen afholdte møder endnu.</div>}
        </div>
      )}
    </div>
  );
};

// ─── NEXT BIRTHDAY ────────────────────────────────────────────────────────────
const nextBirthday = (members) => {
  const now = TODAY;
  const withDays = members
    .filter(m => m.birthday)
    .map(m => {
      const bd = new Date(m.birthday);
      // Next occurrence this year or next
      let next = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      if (next < now) next = new Date(now.getFullYear() + 1, bd.getMonth(), bd.getDate());
      const days = Math.ceil((next - now) / 86400000);
      return { member: m, next, days };
    })
    .sort((a, b) => a.days - b.days);
  return withDays[0] || null;
};

const fmtBirthday = (bd) => {
  const d = new Date(bd);
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "long" });
};
const downloadICS = (meeting) => {
  const dt = meeting.date.replace(/-/g, "") + "T" + meeting.time.replace(":", "") + "00";
  // end = start + 2 hours
  const endH = String(parseInt(meeting.time.split(":")[0]) + 2).padStart(2, "0");
  const dtEnd = meeting.date.replace(/-/g, "") + "T" + endH + meeting.time.split(":")[1] + "00";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Round Table 30X6//DA",
    "BEGIN:VEVENT",
    `DTSTART:${dt}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:RT30X6 – ${meeting.title} – ${meeting.subtitle}`,
    `LOCATION:${meeting.location}`,
    `DESCRIPTION:${meeting.description || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${meeting.title}.ics`; a.click();
  URL.revokeObjectURL(url);
};

// ─── CHANGE PASSWORD MODAL (for admin setting others' passwords) ──────────────
const ChangePasswordModal = ({ member, onClose, onSave }) => {
  const [pw, setPw]   = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    if (pw.length < 6) return setErr("Min. 6 tegn");
    if (pw !== pw2)    return setErr("Matcher ikke");
    onSave({ ...member, password: pw, mustChangePw: true });
    onClose();
  };
  return (
    <Modal title={`Nulstil adgangskode – ${member.name}`} onClose={onClose}>
      {err && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{err}</div>}
      <Inp label="Ny adgangskode" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mindst 6 tegn" />
      <Inp label="Gentag" type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && go()} />
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 16 }}>Brugeren skal skifte adgangskode ved næste login.</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <SmBtn v="ghost" onClick={onClose}>Annullér</SmBtn>
        <Btn onClick={go}>Gem adgangskode</Btn>
      </div>
    </Modal>
  );
};

// ─── CHAT TAB ────────────────────────────────────────────────────────────────
const INIT_MESSAGES = [
  { id: 1, memberId: 1, text: "Hej alle! Glæder mig til næste møde 🥂", ts: "2026-02-20T18:30:00" },
  { id: 2, memberId: 3, text: "Ligeledes! Hvad er menuen denne gang?",    ts: "2026-02-20T18:45:00" },
  { id: 3, memberId: 2, text: "Det er stadig hemmeligt 😄",               ts: "2026-02-20T19:00:00" },
];
const ChatTab = ({ user, members, messages, onSend }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  const fmtTs = (ts) => new Date(ts).toLocaleString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "Playfair Display", fontSize: 36, fontWeight: 900, color: C.white }}>Chat</h1>
        <div style={{ fontSize: 14, color: C.soft }}>{members.length} medlemmer</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        {messages.map(msg => {
          const m   = getMember(members, msg.memberId);
          const own = msg.memberId === user.id;
          return (
            <div key={msg.id} style={{ display: "flex", gap: 10, flexDirection: own ? "row-reverse" : "row", alignItems: "flex-end" }}>
              {!own && <Avatar member={m || { initials: "?" }} size={32} />}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: own ? "flex-end" : "flex-start" }}>
                {!own && <div style={{ fontSize: 11, color: C.soft, marginBottom: 3 }}>{m?.name || "?"}</div>}
                <div style={{
                  background: own ? C.gold : C.surface,
                  color: own ? "#08090b" : C.white,
                  borderRadius: own ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "10px 14px", fontSize: 15, lineHeight: 1.5,
                  border: own ? "none" : `1px solid ${C.border}`,
                }}>{msg.text}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{fmtTs(msg.ts)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Skriv en besked…" style={{
            flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r,
            padding: "13px 16px", color: C.white, fontSize: 15, fontFamily: "Outfit", outline: "none",
          }} />
        <Btn onClick={send} style={{ minHeight: 48, padding: "12px 18px" }}>Send</Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(null);
  const [members, setMembers]   = useState(INIT_MEMBERS);
  const [meetings, setMeetings] = useState(INIT_MEETINGS);
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [tab, setTab]           = useState("home");
  const [meetingModal, setMeetingModal]   = useState(null);
  const [memberModal, setMemberModal]     = useState(null);
  const [finesModal, setFinesModal]       = useState(null);
  const [changePwModal, setChangePwModal] = useState(null);
  const [showAllUp,  setShowAllUp]        = useState(false);
  const [showAllArc, setShowAllArc]       = useState(false);

  const handleSetPassword = (updated) => {
    setMembers(p => p.map(m => m.id === updated.id ? updated : m));
    if (user && user.id === updated.id) setUser(updated);
  };

  if (!user) return <Login members={members} onLogin={m => { setUser(m); }} onSetPassword={handleSetPassword} />;

  const isAdmin  = user.sysRole === "admin";
  const upcoming = meetings.filter(m => isUpcoming(m.date)).sort((a,b) => a.date.localeCompare(b.date));
  const archive  = meetings.filter(m => isPast(m.date)).sort((a,b) => b.date.localeCompare(a.date));
  const BOTTOM_NAV_H = 72;

  const rsvp = (id, att) => setMeetings(prev => prev.map(m => {
    if (m.id !== id) return m;
    const attendees = att ? [...new Set([...m.attendees, user.id])] : m.attendees.filter(x => x !== user.id);
    const absent    = !att ? [...new Set([...m.absent, user.id])] : m.absent.filter(x => x !== user.id);
    return { ...m, attendees, absent };
  }));
  const saveMeeting = data => {
    if (!data.id) setMeetings(p => [...p, { ...data, id:Date.now(), fines:[], documents:[] }]);
    else setMeetings(p => p.map(m => m.id === data.id ? data : m));
    setMeetingModal(null);
  };
  const saveFines = (mid, fines) => { setMeetings(p => p.map(m => m.id === mid ? { ...m, fines } : m)); setFinesModal(null); };
  const addDoc    = (mid, doc)   => setMeetings(p => p.map(m => m.id === mid ? { ...m, documents:[...(m.documents||[]),doc] } : m));

  // ── Bottom nav items ──────────────────────────────────────────────────────
  const NAV = [
    { id: "home",     emoji: "🏠", label: "Hjem" },
    { id: "meetings", emoji: "📅", label: "Møder" },
    { id: "members",  emoji: "👥", label: "Medlemmer" },
    { id: "stats",    emoji: "📊", label: "Statistik" },
    { id: "chat",     emoji: "💬", label: "Chat" },
    { id: "profile",  emoji: "👤", label: user.name.split(" ")[0] },
  ];

  // Profile "tab" is just a modal-ish inline view
  const ProfileView = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Avatar member={user} size={64} />
        <div>
          <div style={{ fontFamily: "Playfair Display", fontSize: 24, fontWeight: 900, color: C.white }}>{user.name}</div>
          <div style={{ fontSize: 14, color: C.gold, marginTop: 2 }}>{user.clubRole}{user.board ? " · Bestyrelsen" : ""}</div>
          <div style={{ fontSize: 12, color: C.soft }}>{user.sysRole === "admin" ? "Administrator" : "Medlem"}</div>
        </div>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r, overflow: "hidden", marginBottom: 16 }}>
        {[["Email", user.email||"–"],["Telefon", user.phone||"–"],["Adresse", user.address||"–"]].map(([k,v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", fontSize: 15 }}>
            <span style={{ color: C.soft }}>{k}</span>
            <span style={{ color: C.white }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
        {isAdmin && <Btn v="ghost" style={{ justifyContent: "center" }} onClick={() => setMemberModal({ mode:"edit", member:user })}>✎ Redigér profil</Btn>}
        <Btn v="danger" style={{ justifyContent: "center" }} onClick={() => setUser(null)}>Afslut session</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "Outfit", color: C.white }}>

      {/* ── TOP HEADER ───────────────────────────────────────────── */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: "Playfair Display", fontSize: 20, fontWeight: 900, color: C.white, lineHeight: 1 }}>
            Round <span style={{ color: C.gold }}>Table</span> <span style={{ color: C.soft, fontSize: 16 }}>30X6</span>
          </div>
        </div>
        {/* Context action for current tab */}
        {tab === "home" && isAdmin && <Btn onClick={() => setMeetingModal({ mode:"new" })} style={{ fontSize: 14, padding: "9px 16px", minHeight: 40 }}>＋ Nyt møde</Btn>}
        {tab === "meetings" && isAdmin && <Btn onClick={() => setMeetingModal({ mode:"new" })} style={{ fontSize: 14, padding: "9px 16px", minHeight: 40 }}>＋ Nyt møde</Btn>}
        {tab === "members" && isAdmin && <Btn onClick={() => setMemberModal({ mode:"new" })} style={{ fontSize: 14, padding: "9px 16px", minHeight: 40 }}>＋ Tilføj</Btn>}
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "24px 20px", paddingBottom: BOTTOM_NAV_H + 24, maxWidth: 800, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* HOME */}
        {tab === "home" && (() => {
          const nextMeeting = upcoming[0] || null;
          const days = nextMeeting ? daysUntil(nextMeeting.date) : null;
          const totalM = members.length;
          const pct = nextMeeting ? meetingAttPct(nextMeeting, totalM) : null;
          const isAtt = nextMeeting ? nextMeeting.attendees.includes(user.id) : false;
          const isAbs = nextMeeting ? nextMeeting.absent.includes(user.id) : false;
          const unanswered = nextMeeting ? members.filter(m => !nextMeeting.attendees.includes(m.id) && !nextMeeting.absent.includes(m.id)) : [];
          const canFines = nextMeeting && (nextMeeting.boedemester === user.id || isAdmin) && nextMeeting.boedemester;

          return (
            <div>
              {/* Big welcome */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 14, color: C.gold, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Velkommen</div>
                <h1 style={{ margin: "0 0 6px", fontFamily: "Playfair Display", fontSize: 44, fontWeight: 900, color: C.white, lineHeight: 1.05 }}>
                  {user.name.split(" ")[0]}
                </h1>
                {nextMeeting && (
                  <div style={{ fontSize: 20, color: C.soft, fontWeight: 400, marginTop: 8 }}>
                    Vi ses allerede om{" "}
                    <span style={{ color: C.gold, fontWeight: 700, fontFamily: "Playfair Display", fontSize: 24 }}>{days}</span>
                    {" "}dag{days === 1 ? "" : "e"}
                  </div>
                )}
                {/* Next birthday */}
                {(() => {
                  const nb = nextBirthday(members);
                  if (!nb) return null;
                  const bdYear  = new Date(nb.member.birthday).getFullYear();
                  const ageNext = nb.next.getFullYear() - bdYear;
                  const isToday = nb.days === 0;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, background: C.surface, border: `1px solid ${C.gold}30`, borderRadius: C.rs, padding: "14px 16px" }}>
                      <span style={{ fontSize: 26 }}>🎂</span>
                      <div>
                        <div style={{ fontSize: 15, color: C.white, fontWeight: 700 }}>
                          {isToday ? "Tillykke " : "Næste: "}{nb.member.name}
                          {" "}<span style={{ color: C.gold }}>fylder {ageNext} år</span>
                        </div>
                        <div style={{ fontSize: 13, color: C.soft }}>
                          {isToday ? "🎉 Tillykke i dag!" : `${fmtBirthday(nb.member.birthday)} · om ${nb.days} dag${nb.days === 1 ? "" : "e"}`}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Next meeting card */}
              {nextMeeting && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: C.r, overflow: "hidden" }}>
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, transparent 70%)` }} />
                  <div style={{ padding: "22px 20px 18px" }}>
                    <div style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>{nextMeeting.subtitle}</div>
                    <h2 style={{ margin: "0 0 14px", fontFamily: "Playfair Display", fontSize: 28, fontWeight: 900, color: C.white }}>{nextMeeting.title}</h2>

                    {nextMeeting.description && <p style={{ margin: "0 0 16px", fontSize: 15, color: C.soft, lineHeight: 1.6 }}>{nextMeeting.description}</p>}

                    {/* Date with ICS download + location */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.white }}>
                        <span style={{ color: C.gold }}>📅</span>
                        <span style={{ flex: 1 }}>{fmtLong(nextMeeting.date)} · kl. {nextMeeting.time}</span>
                        <button onClick={() => downloadICS(nextMeeting)} style={{ background: C.gold+"20", border:`1px solid ${C.gold}50`, borderRadius: C.rs, padding: "5px 12px", color: C.gold, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit", whiteSpace: "nowrap" }}>
                          ＋ Kalender
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.white }}>
                        <span style={{ color: C.gold }}>📍</span><span>{nextMeeting.location}</span>
                      </div>
                    </div>

                    {/* Roles */}
                    {(nextMeeting.responsible1 || nextMeeting.boedemester || nextMeeting.treMinutter) && (
                      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: C.rs, padding: "14px 16px", marginBottom: 18 }}>
                        {nextMeeting.responsible1 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                          <span style={{ color: C.soft }}>Ansvarlig</span>
                          <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, nextMeeting.responsible1)?.name}{nextMeeting.responsible2 ? " & " + getMember(members, nextMeeting.responsible2)?.name : ""}</span>
                        </div>}
                        {nextMeeting.boedemester && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: nextMeeting.treMinutter ? 8 : 0 }}>
                          <span style={{ color: C.soft }}>Bødemester</span>
                          <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, nextMeeting.boedemester)?.name}</span>
                        </div>}
                        {nextMeeting.treMinutter && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                          <span style={{ color: C.soft }}>3 Minutter</span>
                          <span style={{ color: C.white, fontWeight: 600 }}>{getMember(members, nextMeeting.treMinutter)?.name}</span>
                        </div>}
                      </div>
                    )}

                    {/* Attendance ring + counts */}
                    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
                      <PctRing pct={pct} size={70} stroke={6} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: C.soft, marginBottom: 8 }}>Mødeprocent</div>
                        <div style={{ display: "flex", gap: 20 }}>
                          <div><div style={{ fontSize: 26, fontWeight: 900, fontFamily: "Playfair Display", color: C.green }}>{nextMeeting.attendees.length}</div><div style={{ fontSize: 11, color: C.green }}>TILMELDT</div></div>
                          <div><div style={{ fontSize: 26, fontWeight: 900, fontFamily: "Playfair Display", color: C.red }}>{nextMeeting.absent.length}</div><div style={{ fontSize: 11, color: C.red }}>AFBUD</div></div>
                          <div><div style={{ fontSize: 26, fontWeight: 900, fontFamily: "Playfair Display", color: C.soft }}>{unanswered.length}</div><div style={{ fontSize: 11, color: C.soft }}>UBESVARET</div></div>
                        </div>
                      </div>
                    </div>

                    {/* Attendee lists */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 6 }}>
                      {[
                        ["Tilmeldte", nextMeeting.attendees, C.green],
                        ["Afbud", nextMeeting.absent, C.red],
                        ["Ikke svaret", unanswered.map(m => m.id), C.soft],
                      ].map(([lbl, ids, col]) => (
                        <div key={lbl} style={{ background: C.bg, border: `1px solid ${col}20`, borderRadius: C.rs, padding: 12 }}>
                          <div style={{ fontSize: 10, color: col, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{lbl} ({ids.length})</div>
                          {ids.map(id => { const m = getMember(members, id); return m ? <div key={id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Avatar member={m} size={22}/><span style={{ fontSize: 12, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span></div> : null; })}
                          {ids.length === 0 && <div style={{ fontSize: 12, color: C.faint }}>Ingen</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: `1px solid ${C.border}`, padding: "14px 20px", background: C.bg + "cc" }}>
                    <SmBtn v="sub" onClick={() => setMeetingModal({ mode: isAdmin ? "edit" : "view", meeting: nextMeeting })}>Detaljer</SmBtn>
                    <SmBtn v={isAtt ? "green" : "ghost"} onClick={() => rsvp(nextMeeting.id, true)}>✓ Tilmeld</SmBtn>
                    <SmBtn v={isAbs ? "danger" : "ghost"} onClick={() => rsvp(nextMeeting.id, false)}>✕ Afmeld</SmBtn>
                    {canFines && <SmBtn v="ghost" onClick={() => setFinesModal(nextMeeting)} style={{ marginLeft: "auto", color: C.gold, borderColor: C.gold + "50" }}>⚖️ Bødeliste</SmBtn>}
                    {isAdmin && <SmBtn v="ghost" onClick={() => setMeetingModal({ mode: "edit", meeting: nextMeeting })} style={{ color: C.gold, borderColor: C.gold + "40" }}>✎ Redigér</SmBtn>}
                  </div>
                </div>
              )}
              {!nextMeeting && <div style={{ color: C.faint, fontSize: 16 }}>Ingen kommende møder planlagt.</div>}
            </div>
          );
        })()}

        {/* MEETINGS */}
        {tab === "meetings" && (
          <div>
            <h1 style={{ margin: "0 0 28px", fontFamily: "Playfair Display", fontSize: 36, fontWeight: 900 }}>Alle møder</h1>
            {upcoming.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Kommende</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 36 }}>
                {upcoming.map(m => (
                  <UpcomingCard key={m.id} meeting={m} members={members} user={user} isAdmin={isAdmin}
                    onView={() => setMeetingModal({ mode: isAdmin ? "edit" : "view", meeting:m })}
                    onRSVP={a => rsvp(m.id, a)} onFines={() => setFinesModal(m)} />
                ))}
              </div>
            </>}
            {archive.length > 0 && <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.soft, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Arkiv</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {archive.map(m => <ArchiveRow key={m.id} meeting={m} members={members} onClick={() => setMeetingModal({ mode:"view", meeting:m })} />)}
              </div>
            </>}
          </div>
        )}

        {/* MEMBERS */}
        {tab === "members" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: "0 0 4px", fontFamily: "Playfair Display", fontSize: 36, fontWeight: 900 }}>Medlemmer</h1>
              <div style={{ fontSize: 14, color: C.soft }}>{members.length} registrerede</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {members.map(m => (
                <MemberCard key={m.id} member={m} meetings={meetings} isAdmin={isAdmin}
                  onEdit={() => setMemberModal({ mode:"edit", member:m })}
                  onDelete={() => setMembers(p => p.filter(x => x.id !== m.id))}
                  onResetPw={() => setChangePwModal(m)} />
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && <StatsTab members={members} meetings={meetings} />}

        {/* CHAT */}
        {tab === "chat" && (
          <ChatTab user={user} members={members} messages={messages} onSend={text =>
            setMessages(p => [...p, { id: Date.now(), memberId: user.id, text, ts: new Date().toISOString() }])
          } />
        )}

        {/* PROFILE */}
        {tab === "profile" && <ProfileView />}
      </main>

      {/* ── BOTTOM NAVIGATION ────────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "stretch",
        height: BOTTOM_NAV_H,
        // safe area for iOS notch
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {NAV.map(n => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, background: "none", border: "none", cursor: "pointer",
              padding: "8px 4px", transition: "opacity 0.15s",
            }}>
              {/* Icon circle – highlighted when active */}
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: active ? C.gold + "22" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
                fontSize: 20,
              }}>
                {n.emoji}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 400,
                color: active ? C.gold : C.soft,
                letterSpacing: "0.04em", fontFamily: "Outfit",
                whiteSpace: "nowrap",
              }}>{n.label}</span>
              {/* Active dot */}
              {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, position: "absolute", bottom: 8 }} />}
            </button>
          );
        })}
      </nav>

      {/* ── MODALS ───────────────────────────────────────────────── */}
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
      {changePwModal && (
        <ChangePasswordModal member={changePwModal} onClose={() => setChangePwModal(null)}
          onSave={updated => { setMembers(p => p.map(m => m.id === updated.id ? updated : m)); }} />
      )}
      {memberModal && (
        <MemberModal mode={memberModal.mode} member={memberModal.member} onClose={() => setMemberModal(null)}
          onSave={data => {
            const inits = initials(data.name);
            if (memberModal.mode === "new") {
              setMembers(p => [...p, { ...data, id:Date.now(), initials:inits }]);
            } else {
              const updated = { ...data, initials: inits };
              setMembers(p => p.map(m => m.id === data.id ? updated : m));
              if (data.id === user.id) setUser(updated);
            }
            setMemberModal(null);
          }} />
      )}
    </div>
  );
}
