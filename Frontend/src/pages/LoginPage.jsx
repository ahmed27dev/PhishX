// import { useState } from "react";
// import { loginUser } from "../api/authApi";
// import { saveToken, saveUser } from "../utils/auth";
// import { useNavigate } from "react-router-dom";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       const res = await loginUser({ email, password });

//       const token = res.data.access_token;
//       saveToken(token);

//       const payload = JSON.parse(atob(token.split(".")[1]));
//       const role = payload.role;

//       saveUser(payload);

//       if (role === "admin") navigate("/admin");
//       else if (role === "soc") navigate("/soc");
//       else navigate("/user");

//     } catch (err) {
//       alert("Invalid credentials");
//     }
//   };

//   return (
//     <div className="h-screen bg-[#0a0f1c] flex items-center justify-center">

//       <div className="bg-[#0f172a] border border-gray-800 p-8 rounded-2xl w-96 shadow-xl">

//         <h2 className="text-2xl font-bold mb-2 text-white">
//           Welcome Back
//         </h2>

//         <p className="text-gray-400 mb-6 text-sm">
//           Login to your phishing simulation dashboard
//         </p>

//         <input
//           className="w-full mb-3 p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//           placeholder="Email"
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           className="w-full mb-4 p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
//           placeholder="Password"
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           onClick={handleLogin}
//           className="w-full bg-blue-600 hover:bg-blue-700 transition p-2 rounded font-semibold"
//         >
//           Login
//         </button>

//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { loginUser } from "../api/authApi";
import { saveToken, saveUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

// ── Animated hex-grid canvas background ──────────────────────────────────────
function HexGrid() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      const R = 36, cols = Math.ceil(W / (R * 1.73)) + 3, rows = Math.ceil(H / (R * 1.5)) + 3;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const xOff = row % 2 === 0 ? 0 : R * 0.866;
          const cx = col * R * 1.73 + xOff, cy = row * R * 1.5;
          const dist = Math.sqrt((cx - W / 2) ** 2 + (cy - H / 2) ** 2);
          const wave = Math.sin(dist / 85 - t * 0.013) * 0.5 + 0.5;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            i === 0
              ? ctx.moveTo(cx + R * Math.cos(a), cy + R * Math.sin(a))
              : ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(30,100,255,${wave * 0.05 + 0.007})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(50,130,255,${wave * 0.22 + 0.04})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.55 }} />;
}

// ── Scanline overlay ──────────────────────────────────────────────────────────
function ScanLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
        zIndex: 1,
      }}
    />
  );
}

// ── Glitch logo ───────────────────────────────────────────────────────────────
function GlitchLogo() {
  return (
    <span style={{
      position: "relative", display: "inline-block",
      fontFamily: "'Orbitron', monospace", fontWeight: 900,
      fontSize: "1.6rem", color: "#3d8bff", letterSpacing: "0.08em",
    }}>
      PHISH<span style={{ color: "#fff" }}>X</span>
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, color: "#60aaff", animation: "glitch1 6s infinite", mixBlendMode: "screen", pointerEvents: "none", userSelect: "none" }}>
        PHISH<span style={{ color: "#e0f0ff" }}>X</span>
      </span>
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, color: "#ff3c6e", animation: "glitch2 6s 0.2s infinite", mixBlendMode: "screen", pointerEvents: "none", userSelect: "none" }}>
        PHISH<span style={{ color: "#ffaacc" }}>X</span>
      </span>
    </span>
  );
}

// ── Threat feed ticker ────────────────────────────────────────────────────────
const THREATS = [
  { text: "WARNING  PHISHING DETECTED — paypa1.secure-login.cc", color: "#ffb347" },
  { text: "BLOCKED  CREDENTIAL HARVEST — 143.220.5.11 smtp relay", color: "#ff4d6d" },
  { text: "LAUNCHED Campaign #A7 — 240 targets active", color: "#3d8bff" },
  { text: "FLAGGED  SPEAR PHISH — spoofed sender hr@acme-corp.co", color: "#ffb347" },
  { text: "BLOCKED  C2 BEACON — TLS callback known IOC", color: "#ff4d6d" },
  { text: "REPORTED Suspicious link flagged in Slack thread", color: "#3d8bff" },
];

function ThreatTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % THREATS.length); setVisible(true); }, 350);
    }, 3500);
    return () => clearInterval(iv);
  }, []);
  const { text, color } = THREATS[idx];
  return (
    <div style={{
      background: "rgba(0,8,25,0.8)",
      border: "1px solid rgba(30,120,255,0.16)",
      borderRadius: 7, padding: "7px 10px", marginBottom: 16,
      height: 30, overflow: "hidden",
    }}>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: "0.68rem", color,
        opacity: visible ? 1 : 0, transition: "opacity 0.35s",
        whiteSpace: "nowrap", display: "block",
      }}>
        {text}
      </span>
    </div>
  );
}

// ── Cyber input ───────────────────────────────────────────────────────────────
function CyberInput({ type = "text", placeholder, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      <span style={{
        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
        fontSize: 13, color: focused ? "#3d8bff" : "#1a3a6b",
        pointerEvents: "none", transition: "color .2s",
      }}>
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 12px 10px 30px", borderRadius: 8,
          background: "rgba(0,8,25,0.8)",
          border: `1px solid ${focused ? "#3d8bff" : "rgba(30,120,255,0.15)"}`,
          color: "#c8e0ff",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.82rem", outline: "none",
          transition: "border .2s, box-shadow .2s",
          boxShadow: focused
            ? "0 0 0 2px rgba(30,120,255,0.12), inset 0 0 12px rgba(30,120,255,0.04)"
            : "none",
          caretColor: "#3d8bff",
        }}
      />
    </div>
  );
}

// ── Success overlay ───────────────────────────────────────────────────────────
function SuccessOverlay({ role, visible }) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (visible) setTimeout(() => setChecked(true), 80);
    else setChecked(false);
  }, [visible]);

  const roleMap = { admin: "ADMIN DASHBOARD", soc: "SOC CONSOLE", user: "USER PORTAL" };
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,8,25,0.96)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
    }}>
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="28" stroke="#3d8bff" strokeWidth="2" fill="rgba(30,100,255,0.08)" />
        <polyline
          points="18,30 26,38 42,22"
          stroke="#3d8bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 40, strokeDashoffset: checked ? 0 : 40, transition: "stroke-dashoffset .5s .1s ease" }}
        />
      </svg>
      <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "1rem", color: "#3d8bff", letterSpacing: "0.18em" }}>
        ACCESS GRANTED — {roleMap[role] || "DASHBOARD"}
      </span>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.72rem", color: "#1a3a6b", letterSpacing: "0.12em" }}>
        REDIRECTING...
      </span>
    </div>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleLogin = async () => {
    if (loading) return;
    setError("");

    if (!email && !password) { setError("email and password required"); triggerShake(); return; }
    if (!email) { setError("email required"); triggerShake(); return; }
    if (!password) { setError("password required"); triggerShake(); return; }

    setLoading(true);
    setProgress(0);

    const piv = setInterval(
      () => setProgress(p => Math.min(85, p + Math.random() * 14)),
      80
    );

    try {
      const res = await loginUser({ email, password });
      clearInterval(piv);
      setProgress(100);

      const token = res.data.access_token;
      saveToken(token);
      const payload = JSON.parse(atob(token.split(".")[1]));
      saveUser(payload);

      setSuccess(payload.role);
      setTimeout(() => {
        if (payload.role === "admin") navigate("/admin");
        else if (payload.role === "soc") navigate("/soc");
        else navigate("/user");
      }, 2000);
    } catch (err) {
      clearInterval(piv);
      setProgress(0);
      const msg = err?.response?.data?.detail || "AUTH_FAILED — invalid credentials";
      setError(msg);
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes glitch1 {
          0%,90%,100%{clip-path:inset(0 0 100% 0);transform:translate(0)}
          92%{clip-path:inset(30% 0 50% 0);transform:translate(-3px,1px)}
          94%{clip-path:inset(70% 0 10% 0);transform:translate(3px,-1px)}
          96%{clip-path:inset(10% 0 80% 0);transform:translate(-2px,2px)}
          98%{clip-path:inset(50% 0 30% 0);transform:translate(2px,-2px)}
        }
        @keyframes glitch2 {
          0%,88%,100%{clip-path:inset(0 0 100% 0);transform:translate(0)}
          90%{clip-path:inset(20% 0 60% 0);transform:translate(3px,-1px)}
          93%{clip-path:inset(60% 0 20% 0);transform:translate(-3px,1px)}
          97%{clip-path:inset(40% 0 40% 0);transform:translate(2px,2px)}
        }
        @keyframes scanDown {
          0%{top:-3px;opacity:0.9} 100%{top:102%;opacity:0}
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)} 40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }
        .f1{animation:fadeUp .5s .08s both}
        .f2{animation:fadeUp .5s .18s both}
        .f3{animation:fadeUp .5s .28s both}
        .f4{animation:fadeUp .5s .38s both}
        .f5{animation:fadeUp .5s .48s both}
        .f6{animation:fadeUp .5s .58s both}
        .blink{animation:blink 1s step-start infinite}
        .shake{animation:shake .35s ease}
      `}</style>

      <SuccessOverlay role={success} visible={!!success} />

      <div
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse 90% 80% at 50% 55%, #000d1a 0%, #020810 100%)" }}
        onKeyDown={e => e.key === "Enter" && handleLogin()}
      >
        <HexGrid />
        <ScanLines />

        {/* Ambient blobs */}
        <div className="absolute pointer-events-none" style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,100,255,0.07) 0%, transparent 70%)", top: 0, left: "-10%" }} />
        <div className="absolute pointer-events-none" style={{ width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,150,255,0.06) 0%, transparent 70%)", bottom: 0, right: "-5%" }} />

        {/* Card */}
        <div
          className="relative z-10 w-full mx-4"
          style={{
            maxWidth: 360,
            background: "rgba(2,8,20,0.9)",
            border: "1px solid rgba(30,120,255,0.28)",
            borderRadius: 16,
            boxShadow: "0 0 0 1px rgba(30,120,255,0.07), 0 8px 48px rgba(0,0,0,0.8), 0 0 80px rgba(30,120,255,0.08)",
            backdropFilter: "blur(18px)",
            padding: "30px 26px 24px",
            overflow: "hidden",
          }}
        >
          {/* Scan bar */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" style={{ zIndex: 0 }}>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, transparent 0%, rgba(30,120,255,0.3) 35%, rgba(80,160,255,0.55) 55%, transparent 100%)",
              animation: "scanDown 4s linear infinite", top: -3,
            }} />
          </div>

          {/* Corner accents */}
          <div style={{ position: "absolute", top: -1, left: -1, width: 20, height: 20, borderTop: "2px solid #3d8bff", borderLeft: "2px solid #3d8bff", borderRadius: "12px 0 0 0", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -1, right: -1, width: 20, height: 20, borderTop: "2px solid #3d8bff", borderRight: "2px solid #3d8bff", borderRadius: "0 12px 0 0", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -1, left: -1, width: 20, height: 20, borderBottom: "2px solid #3d8bff", borderLeft: "2px solid #3d8bff", borderRadius: "0 0 0 12px", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 20, height: 20, borderBottom: "2px solid #3d8bff", borderRight: "2px solid #3d8bff", borderRadius: "0 0 12px 0", zIndex: 2, pointerEvents: "none" }} />

          <div className="relative" style={{ zIndex: 3 }}>
            {/* Logo row */}
            <div className="f1" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="#3d8bff" strokeWidth="1.5" fill="rgba(30,100,255,0.08)" />
                <polygon points="16,8 23,12 23,20 16,24 9,20 9,12" stroke="#3d8bff" strokeWidth="1" fill="rgba(30,100,255,0.12)" />
                <circle cx="16" cy="16" r="3" fill="#3d8bff" />
                <line x1="16" y1="2" x2="16" y2="8" stroke="#3d8bff" strokeWidth="1" />
                <line x1="16" y1="24" x2="16" y2="30" stroke="#3d8bff" strokeWidth="1" />
                <line x1="4" y1="9" x2="9" y2="12" stroke="#3d8bff" strokeWidth="1" />
                <line x1="23" y1="12" x2="28" y2="9" stroke="#3d8bff" strokeWidth="1" />
              </svg>
              <GlitchLogo />
            </div>

            <p className="f2" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.66rem", color: "#1a3a6b", letterSpacing: "0.2em", marginBottom: 14 }}>
              SECURITY AWARENESS PLATFORM <span className="blink" style={{ color: "#3d8bff" }}>█</span>
            </p>

            <div className="f3"><ThreatTicker /></div>

            <div className="f3" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: "#0f2a55", letterSpacing: "0.18em" }}>
                // AUTHENTICATE_OPERATOR
              </span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(30,120,255,0.25), transparent)" }} />
            </div>

            {/* Inputs */}
            <div className={`f4 ${shake ? "shake" : ""}`}>
              <CyberInput
                placeholder="operator@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon="◈"
              />
              <CyberInput
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                icon="⬡"
              />
              <div style={{ textAlign: "right", marginBottom: 14 }}>
                <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: "#0f2244", cursor: "pointer", letterSpacing: "0.08em", transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = "#3d8bff"}
                  onMouseLeave={e => e.target.style.color = "#0f2244"}
                >
                  FORGOT CREDENTIALS?
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", color: "#ff4d6d",
                marginBottom: 10, padding: "7px 10px",
                background: "rgba(255,60,80,0.07)", border: "1px solid rgba(255,60,80,0.2)", borderRadius: 6,
              }}>
                // {error}
              </div>
            )}

            {/* Progress bar */}
            {loading && (
              <div style={{ width: "100%", height: 3, background: "rgba(30,120,255,0.12)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                <div style={{
                  height: "100%", width: `${progress}%`,
                  background: "linear-gradient(90deg, #3d8bff, #80c0ff)",
                  borderRadius: 99, boxShadow: "0 0 8px #3d8bff",
                  transition: "width .1s linear",
                }} />
              </div>
            )}

            {/* Login button */}
            <div className="f5">
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: "100%", padding: "11px 0", borderRadius: 8,
                  border: "1px solid rgba(30,120,255,0.42)",
                  background: "linear-gradient(135deg, rgba(30,100,255,0.2) 0%, rgba(20,80,200,0.1) 100%)",
                  color: loading ? "#1a3a6b" : "#3d8bff",
                  fontFamily: "'Orbitron', monospace", fontWeight: 700,
                  fontSize: "0.78rem", letterSpacing: "0.15em",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all .2s", outline: "none",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 28px rgba(30,120,255,0.25), inset 0 0 16px rgba(30,120,255,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
              >
                {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
              </button>
            </div>

            {/* Status badges */}
            <div className="f6" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
              {[["TLS 1.3", true], ["MFA READY", true], ["SOC LINK", true], ["DARK WEB", false]].map(([label, active]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: active ? "#3d8bff" : "#0f2244" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#3d8bff" : "#0a1830", boxShadow: active ? "0 0 5px #3d8bff" : "none", display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>

            <p style={{ marginTop: 12, textAlign: "center", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.58rem", color: "#0d1f40", letterSpacing: "0.1em" }}>
              PHISHX v2.4.1 · UNAUTHORIZED ACCESS IS A CRIMINAL OFFENSE
            </p>
          </div>
        </div>
      </div>
    </>
  );
}