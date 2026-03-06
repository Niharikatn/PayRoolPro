import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = role === "admin" ? `${API}/api/admin/login` : `${API}/api/employee/login`;
      const res = await axios.post(endpoint, { email, password });
      const userRole = res.data.role || role;
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", userRole);
      navigate(userRole.toLowerCase() === "admin" ? "/admin" : "/employee");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:#06070f; --surface:#0f1020; --surface2:#161728;
          --border:rgba(139,92,246,0.1); --border2:rgba(139,92,246,0.2); --border3:rgba(139,92,246,0.35);
          --v1:#7c3aed; --v2:#8b5cf6; --v3:#a78bfa; --v4:#c4b5fd;
          --pink:#ec4899; --pink2:#f472b6;
          --text:#f0f0ff; --text2:#9898c0; --text3:#4a4a70;
          --card-shadow:0 4px 24px rgba(0,0,0,0.5),0 1px 0 rgba(139,92,246,0.06) inset;
          --card-shadow-hover:0 8px 40px rgba(0,0,0,0.65),0 0 0 1px rgba(139,92,246,0.2),0 1px 0 rgba(139,92,246,0.12) inset;
        }
        body { background: var(--bg); }
        .lp { min-height:100vh; min-height:100dvh; display:flex; background:var(--bg); position:relative; overflow:hidden; font-family:'Instrument Sans',sans-serif; color:var(--text); }
        .lp-atm { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .lp-glow1 { position:absolute; width:700px; height:700px; background:radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 65%); top:-200px; left:-150px; animation:g1 10s ease-in-out infinite; }
        .lp-glow2 { position:absolute; width:500px; height:500px; background:radial-gradient(circle,rgba(236,72,153,0.09) 0%,transparent 65%); bottom:-120px; right:-80px; animation:g2 12s ease-in-out infinite; }
        .lp-glow3 { position:absolute; width:300px; height:300px; background:radial-gradient(circle,rgba(139,92,246,0.09) 0%,transparent 65%); top:50%; left:48%; animation:g3 8s ease-in-out infinite; }
        @keyframes g1{0%,100%{transform:translate(0,0);}50%{transform:translate(35px,-25px);}}
        @keyframes g2{0%,100%{transform:translate(0,0);}50%{transform:translate(-25px,18px);}}
        @keyframes g3{0%,100%{transform:translate(-50%,-50%) scale(1);}50%{transform:translate(-50%,-50%) scale(1.08);}}
        .lp-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(139,92,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.03) 1px,transparent 1px); background-size:56px 56px; pointer-events:none; }
        .lp-left { flex:1; display:flex; flex-direction:column; justify-content:center; padding:80px 72px; position:relative; z-index:2; }
        .lp-eyebrow { display:inline-flex; align-items:center; gap:10px; margin-bottom:28px; }
        .lp-pill { background:rgba(139,92,246,0.12); border:1px solid rgba(139,92,246,0.25); color:var(--v3); padding:5px 14px; border-radius:100px; font-size:11px; font-weight:600; letter-spacing:0.8px; text-transform:uppercase; }
        .lp-pulse { width:7px; height:7px; background:var(--pink2); border-radius:50%; animation:blink 2s ease infinite; box-shadow:0 0 8px var(--pink); }
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        .lp-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:clamp(38px,4.5vw,58px); font-weight:800; color:var(--text); line-height:1.02; letter-spacing:-2.5px; margin-bottom:20px; }
        .lp-h1-grad { background:linear-gradient(135deg,#a78bfa 0%,#ec4899 55%,#f59e0b 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .lp-desc { font-size:16px; color:var(--text2); line-height:1.75; max-width:420px; margin-bottom:48px; }
        .lp-feats { display:flex; flex-direction:column; gap:12px; margin-bottom:48px; }
        .lp-feat { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:18px 20px; display:flex; align-items:center; gap:16px; box-shadow:var(--card-shadow); transition:all 0.25s; }
        .lp-feat:hover { border-color:var(--border2); box-shadow:var(--card-shadow-hover); transform:translateX(4px); }
        .lp-feat-ico { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .lp-feat-title { font-size:13px; font-weight:700; color:var(--text); font-family:'Bricolage Grotesque',sans-serif; }
        .lp-feat-sub { font-size:12px; color:var(--text3); margin-top:2px; }
        .lp-trust { display:flex; align-items:center; gap:14px; }
        .lp-trust-avatars { display:flex; }
        .lp-ta { width:32px; height:32px; border-radius:50%; border:2px solid var(--bg); margin-left:-8px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:white; }
        .lp-trust-count { font-size:12px; color:var(--text2); font-weight:600; margin-left:8px; }
        .lp-right { width:500px; display:flex; align-items:center; justify-content:center; padding:48px 52px; position:relative; z-index:2; }
        .lp-divider { position:absolute; left:0; top:8%; bottom:8%; width:1px; background:linear-gradient(to bottom,transparent,rgba(139,92,246,0.2),transparent); }
        .lp-form-card { width:100%; background:var(--surface); border:1px solid var(--border2); border-radius:26px; padding:40px; box-shadow:0 24px 80px rgba(0,0,0,0.65),0 0 0 1px rgba(139,92,246,0.07),0 1px 0 rgba(255,255,255,0.04) inset; }
        .lp-logo { display:flex; align-items:center; gap:12px; margin-bottom:32px; }
        .lp-lmark { width:46px; height:46px; background:linear-gradient(135deg,var(--v1),var(--pink)); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; color:white; box-shadow:0 8px 28px rgba(124,58,237,0.45); }
        .lp-lname { font-family:'Bricolage Grotesque',sans-serif; font-size:20px; font-weight:800; color:var(--text); }
        .lp-lname em { color:var(--v3); font-style:normal; }
        .lp-ftitle { font-family:'Bricolage Grotesque',sans-serif; font-size:26px; font-weight:800; color:var(--text); letter-spacing:-0.5px; margin-bottom:4px; }
        .lp-fsub { font-size:13px; color:var(--text2); margin-bottom:28px; }
        .lp-roles { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:24px; }
        .lp-role { padding:14px 10px; border-radius:14px; border:1px solid var(--border); background:var(--surface2); color:var(--text3); cursor:pointer; font-size:13px; font-weight:600; display:flex; flex-direction:column; align-items:center; gap:6px; transition:all 0.2s; font-family:'Instrument Sans',sans-serif; }
        .lp-role.on { background:rgba(139,92,246,0.12); border-color:var(--border3); color:var(--v4); box-shadow:0 4px 20px rgba(124,58,237,0.2); }
        .lp-role-icon { font-size:22px; }
        .lp-fld { margin-bottom:16px; }
        .lp-fld label { display:block; font-size:10px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:1px; margin-bottom:7px; }
        .lp-inp { width:100%; padding:13px 16px; background:var(--surface2); border:1px solid var(--border); border-radius:12px; font-size:14px; color:var(--text); outline:none; font-family:'Instrument Sans',sans-serif; transition:all 0.2s; }
        .lp-inp:focus { border-color:var(--v2); box-shadow:0 0 0 3px rgba(139,92,246,0.15); }
        .lp-inp::placeholder { color:var(--text3); }
        .lp-error { background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.2); color:#fda4af; padding:11px 14px; border-radius:10px; font-size:13px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .lp-sbmt { width:100%; padding:14px; background:linear-gradient(135deg,var(--v1),var(--pink)); color:white; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Bricolage Grotesque',sans-serif; margin-top:6px; box-shadow:0 8px 28px rgba(124,58,237,0.35); letter-spacing:0.3px; transition:all 0.2s; }
        .lp-sbmt:hover { transform:translateY(-1px); box-shadow:0 12px 36px rgba(124,58,237,0.45); }
        .lp-sbmt:disabled { opacity:0.6; transform:none; cursor:not-allowed; }
        .lp-hint { text-align:center; margin-top:18px; font-size:12px; color:var(--text3); }
        .lp-hint a { color:var(--v3); font-weight:600; cursor:pointer; }
        @media(max-width:900px){
          .lp { flex-direction:column; }
          .lp-left { display:none; }
          .lp-right { width:100%; padding:32px 20px; }
          .lp-right::before { display:none; }
          .lp-inp { font-size:16px; }
        }
      `}</style>

      <div className="lp">
        <div className="lp-atm">
          <div className="lp-glow1" /><div className="lp-glow2" /><div className="lp-glow3" />
        </div>
        <div className="lp-grid" />

        <div className="lp-left">
          <div className="lp-eyebrow">
            <div className="lp-pill">Payroll Management</div>
            <div className="lp-pulse" />
          </div>
          <div className="lp-h1">Smart payroll<br/>for <span className="lp-h1-grad">modern teams</span></div>
          <p className="lp-desc">Manage salaries, track attendance, and handle leave requests — all from one beautiful dashboard built for speed and clarity.</p>
          <div className="lp-feats">
            {[
              { ico:"⚡", bg:"rgba(124,58,237,0.14)", color:"#a78bfa", title:"Instant salary calculations", sub:"Auto-computed from attendance records in real-time" },
              { ico:"📧", bg:"rgba(236,72,153,0.12)", color:"#f472b6", title:"Email payslips instantly", sub:"Beautiful payslip emails sent to employees with one click" },
              { ico:"🗓", bg:"rgba(20,184,166,0.12)", color:"#2dd4bf", title:"Leave management", sub:"Employees apply, admins approve — fully tracked" },
              { ico:"📊", bg:"rgba(245,158,11,0.12)", color:"#fbbf24", title:"Attendance tracking", sub:"Present, absent, half-day — complete monthly history" },
            ].map(f => (
              <div className="lp-feat" key={f.title}>
                <div className="lp-feat-ico" style={{ background:f.bg, color:f.color }}>{f.ico}</div>
                <div><div className="lp-feat-title">{f.title}</div><div className="lp-feat-sub">{f.sub}</div></div>
              </div>
            ))}
          </div>
          <div className="lp-trust">
            <div className="lp-trust-avatars">
              {[["N","#7c3aed","#ec4899"],["R","#0ea5e9","#6366f1"],["P","#10b981","#0ea5e9"],["A","#f59e0b","#ef4444"],["+"," #8b5cf6","#ec4899"]].map(([l,c1,c2]) => (
                <div key={l} className="lp-ta" style={{ background:`linear-gradient(135deg,${c1},${c2})` }}>{l}</div>
              ))}
            </div>
            <div className="lp-trust-count">Trusted by growing teams</div>
          </div>
        </div>

        <div className="lp-right">
          <div className="lp-divider" />
          <div className="lp-form-card">
            <div className="lp-logo">
              <div className="lp-lmark">₹</div>
              <div className="lp-lname">Payroll<em>Pro</em></div>
            </div>
            <div className="lp-ftitle">Welcome back</div>
            <p className="lp-fsub">Sign in to your workspace</p>
            <div className="lp-roles">
              <button className={`lp-role ${role==="employee"?"on":""}`} onClick={() => setRole("employee")}><div className="lp-role-icon">👤</div>Employee</button>
              <button className={`lp-role ${role==="admin"?"on":""}`} onClick={() => setRole("admin")}><div className="lp-role-icon">⚙️</div>Admin</button>
            </div>
            {error && <div className="lp-error">⚠️ {error}</div>}
            <form onSubmit={handleLogin}>
              <div className="lp-fld"><label>Email address</label><input className="lp-inp" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div className="lp-fld"><label>Password</label><input className="lp-inp" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              <button type="submit" className="lp-sbmt" disabled={loading}>{loading ? "Signing in..." : `Sign in as ${role==="admin"?"Admin":"Employee"} →`}</button>
            </form>
            <p className="lp-hint">New employee? <a onClick={() => navigate("/employee-register")}>Create account</a></p>
          </div>
        </div>
      </div>
    </>
  );
}
export default Login;
