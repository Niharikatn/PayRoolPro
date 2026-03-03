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
      const endpoint = role === "admin"
        ?   `${API}/api/admin/login`
        : `${API}/api/employee/login`;
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .login-page { min-height: 100vh; display: flex; font-family: 'DM Sans', sans-serif; background: #080c14; overflow: hidden; }
        .login-left { flex: 1; position: relative; display: flex; flex-direction: column; justify-content: center; padding: 64px; background: linear-gradient(135deg, #080c14 0%, #0d1628 50%, #091220 100%); overflow: hidden; }
        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .orb1 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(234,179,8,0.08) 0%, transparent 60%); top: -100px; left: -100px; }
        .orb2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%); bottom: -80px; right: 100px; }
        .brand-area { position: relative; z-index: 2; }
        .brand-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #eab308, #f59e0b); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 32px; box-shadow: 0 8px 32px rgba(234,179,8,0.3); }
        .brand-name { font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800; color: white; line-height: 1.1; letter-spacing: -1px; }
        .brand-name span { color: #eab308; }
        .brand-desc { margin-top: 16px; font-size: 16px; color: #64748b; line-height: 1.7; max-width: 380px; font-weight: 300; }
        .stats-row { display: flex; gap: 32px; margin-top: 56px; }
        .stat { border-left: 2px solid rgba(234,179,8,0.3); padding-left: 20px; }
        .stat-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: white; }
        .stat-label { font-size: 12px; color: #475569; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
        .login-right { width: 480px; display: flex; align-items: center; justify-content: center; padding: 48px; background: rgba(255,255,255,0.02); border-left: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(20px); }
        .login-card { width: 100%; }
        .login-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: white; margin-bottom: 6px; }
        .login-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; }
        .role-toggle { display: flex; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; margin-bottom: 28px; gap: 4px; }
        .role-btn { flex: 1; padding: 11px; border: none; border-radius: 9px; background: transparent; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .role-btn.active { background: linear-gradient(135deg, #eab308, #f59e0b); color: #080c14; font-weight: 700; box-shadow: 0 4px 16px rgba(234,179,8,0.3); }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .field input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; font-size: 15px; color: white; outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .field input::placeholder { color: #334155; }
        .field input:focus { border-color: rgba(234,179,8,0.5); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(234,179,8,0.08); }
        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
        .submit-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #eab308, #f59e0b); color: #080c14; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; margin-top: 8px; }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(234,179,8,0.35); }
        .submit-btn:disabled { opacity: 0.6; transform: none; }
        .register-link { text-align: center; margin-top: 24px; font-size: 13px; color: #475569; }
        .register-link a { color: #eab308; text-decoration: none; font-weight: 600; cursor: pointer; }
        @media (max-width: 768px) { .login-left { display: none; } .login-right { width: 100%; border-left: none; } }
      `}</style>

      <div className="login-page">
        <div className="login-left">
          <div className="grid-bg" />
          <div className="orb1" />
          <div className="orb2" />
          <div className="brand-area">
            <div className="brand-icon">₹</div>
            <div className="brand-name">Payroll<span>Pro</span></div>
            <p className="brand-desc">The modern salary & attendance management system built for growing teams.</p>
            <div className="stats-row">
              <div className="stat"><div className="stat-num">100%</div><div className="stat-label">Accurate</div></div>
              <div className="stat"><div className="stat-num">24/7</div><div className="stat-label">Access</div></div>
              <div className="stat"><div className="stat-num">Secure</div><div className="stat-label">& Private</div></div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-title">Welcome back</div>
            <p className="login-sub">Sign in to your PayrollPro account</p>

            <div className="role-toggle">
              <button className={`role-btn ${role === "employee" ? "active" : ""}`} onClick={() => setRole("employee")}>Employee</button>
              <button className={`role-btn ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>Admin</button>
            </div>

            {error && <div className="error-box">⚠ {error}</div>}

            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email Address</label>
                <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing in..." : `Sign in as ${role === "admin" ? "Admin" : "Employee"}`}
              </button>
            </form>

            <p className="register-link">
              New employee? <a onClick={() => navigate("/employee-register")}>Register here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
