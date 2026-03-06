import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:9999, display:"flex", flexDirection:"column", gap:"10px", alignItems:"flex-end" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{ background:"#0f1020", border:`1px solid ${t.type==="error"?"rgba(244,63,94,0.25)":"rgba(167,139,250,0.25)"}`, color:t.type==="error"?"#fda4af":"#c4b5fd", padding:"13px 18px", borderRadius:"13px", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", gap:"10px", minWidth:"260px", maxWidth:"360px", boxShadow:"0 8px 40px rgba(0,0,0,0.6)", animation:"toastIn 0.3s ease", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
          <span>{t.type==="error"?"❌":"✓"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ fromDate:"", toDate:"", type:"Casual Leave", reason:"" });
  const [toasts, setToasts] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const addToast = useCallback((msg, type="success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === "leaves") fetchLeaves(); }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, a, s] = await Promise.all([
        axios.get(`${API}/api/employee/me`, { headers }),
        axios.get(`${API}/api/attendance/me`, { headers }),
        axios.get(`${API}/api/salary/me`, { headers }),
      ]);
      setEmployee(p.data); setAttendance(a.data); setSalaries(s.data);
    } catch(e) {}
    finally { setLoading(false); }
  };
  const fetchLeaves = async () => { try { const r = await axios.get(`${API}/api/leave/my`, { headers }); setLeaves(r.data); } catch(e){} };
  const handleLogout = () => { localStorage.removeItem("role"); localStorage.removeItem("token"); navigate("/"); };
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/api/leave/apply`, leaveForm, { headers }); addToast("Leave request submitted!"); setLeaveForm({ fromDate:"", toDate:"", type:"Casual Leave", reason:"" }); fetchLeaves(); }
    catch(err) { addToast(err.response?.data?.message||"Failed","error"); }
  };

  const presentCount = attendance.filter(a => a.status==="Present").length;
  const absentCount = attendance.filter(a => a.status==="Absent").length;
  const halfCount = attendance.filter(a => a.status==="Half Day").length;
  const latestSalary = salaries[0];
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const stBadgeAtt = (s) => {
    if(s==="Present") return {c:"#34d399",bg:"rgba(16,185,129,0.1)",br:"rgba(16,185,129,0.2)"};
    if(s==="Absent") return {c:"#fb7185",bg:"rgba(244,63,94,0.1)",br:"rgba(244,63,94,0.2)"};
    if(s==="Half Day") return {c:"#fbbf24",bg:"rgba(245,158,11,0.1)",br:"rgba(245,158,11,0.2)"};
    return {c:"#9898c0",bg:"rgba(100,116,139,0.1)",br:"rgba(100,116,139,0.2)"};
  };
  const stBadgeLv = (s) => {
    if(s==="Approved") return {c:"#34d399",bg:"rgba(16,185,129,0.1)",br:"rgba(16,185,129,0.2)"};
    if(s==="Rejected") return {c:"#fb7185",bg:"rgba(244,63,94,0.1)",br:"rgba(244,63,94,0.2)"};
    return {c:"#fbbf24",bg:"rgba(245,158,11,0.1)",br:"rgba(245,158,11,0.2)"};
  };

  const navItems = [
    { id:"overview", icon:"▦", label:"Overview", bg:"rgba(236,72,153,0.12)", color:"#f472b6" },
    { id:"attendance", icon:"📅", label:"Attendance", bg:"rgba(124,58,237,0.1)", color:"#a78bfa" },
    { id:"salary", icon:"💰", label:"Salary Slips", bg:"rgba(245,158,11,0.1)", color:"#fbbf24" },
    { id:"leaves", icon:"🗓", label:"Leave", bg:"rgba(20,184,166,0.1)", color:"#2dd4bf" },
    { id:"profile", icon:"👤", label:"My Profile", bg:"rgba(99,102,241,0.1)", color:"#818cf8" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --bg:#06070f; --surface:#0f1020; --surface2:#161728; --surface3:#1e2035;
          --border:rgba(139,92,246,0.1); --border2:rgba(139,92,246,0.2); --border3:rgba(139,92,246,0.35);
          --v1:#7c3aed; --v2:#8b5cf6; --v3:#a78bfa; --v4:#c4b5fd;
          --pink:#ec4899; --pink2:#f472b6;
          --text:#f0f0ff; --text2:#9898c0; --text3:#4a4a70;
          --card-shadow:0 4px 24px rgba(0,0,0,0.5),0 1px 0 rgba(139,92,246,0.06) inset;
          --card-shadow-hover:0 8px 40px rgba(0,0,0,0.65),0 0 0 1px rgba(139,92,246,0.2),0 1px 0 rgba(139,92,246,0.12) inset;
        }
        body { background:var(--bg); }
        @keyframes toastIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .emp { display:flex; min-height:100vh; background:var(--bg); font-family:'Instrument Sans',sans-serif; color:var(--text); }
        .emp-sb { width:260px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; box-shadow:4px 0 32px rgba(0,0,0,0.4); position:fixed; top:0; bottom:0; left:0; z-index:100; overflow-y:auto; }
        .emp-sb-header { padding:26px 20px 22px; background:linear-gradient(180deg,rgba(236,72,153,0.1) 0%,transparent 100%); border-bottom:1px solid var(--border); }
        .emp-sb-logo { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .emp-lmark { width:40px; height:40px; background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:white; box-shadow:0 4px 16px rgba(124,58,237,0.4); flex-shrink:0; }
        .emp-lname { font-family:'Bricolage Grotesque',sans-serif; font-size:19px; font-weight:800; color:var(--text); }
        .emp-lname em { color:var(--pink2); font-style:normal; }
        .emp-profile-card { background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.08)); border:1px solid var(--border2); border-radius:16px; padding:16px; }
        .emp-av-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
        .emp-avatar { width:42px; height:42px; background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:800; color:white; box-shadow:0 4px 16px rgba(124,58,237,0.4); flex-shrink:0; }
        .emp-pname { font-family:'Bricolage Grotesque',sans-serif; font-size:14px; font-weight:700; color:var(--text); }
        .emp-ppos { font-size:11px; color:var(--text3); margin-top:1px; }
        .emp-online { display:flex; align-items:center; gap:5px; font-size:10px; color:#34d399; font-weight:600; margin-bottom:10px; }
        .emp-online-dot { width:6px; height:6px; background:#10b981; border-radius:50%; box-shadow:0 0 5px #10b981; }
        .emp-sal-badge { background:rgba(139,92,246,0.1); border:1px solid var(--border2); border-radius:9px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; }
        .emp-sal-l { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
        .emp-sal-v { font-family:'Bricolage Grotesque',sans-serif; font-size:15px; font-weight:800; color:var(--v3); }
        .emp-nav-wrap { flex:1; padding:14px 12px; }
        .emp-section { font-size:9px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1.2px; padding:0 10px; margin-bottom:6px; margin-top:4px; }
        .emp-nav { display:flex; flex-direction:column; gap:2px; }
        .emp-nb { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:transparent; color:var(--text2); border-radius:11px; cursor:pointer; font-size:13px; font-weight:500; width:100%; text-align:left; transition:all 0.15s; font-family:'Instrument Sans',sans-serif; }
        .emp-nb:hover { background:rgba(139,92,246,0.08); color:var(--text); }
        .emp-nb.on { background:rgba(236,72,153,0.12); color:var(--pink2); font-weight:600; border:1px solid rgba(236,72,153,0.15); }
        .emp-nb-ico { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
        .emp-sb-att { padding:14px 20px; border-top:1px solid var(--border); }
        .emp-sb-att-title { font-size:9px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
        .emp-sb-att-bar { display:flex; justify-content:space-between; font-size:11px; color:var(--text3); margin-bottom:6px; }
        .emp-sb-att-bar span:last-child { color:var(--v3); font-weight:700; }
        .emp-sb-track { height:5px; background:rgba(255,255,255,0.05); border-radius:100px; overflow:hidden; }
        .emp-sb-fill { height:100%; background:linear-gradient(90deg,var(--v1),var(--pink)); border-radius:100px; transition:width 1s ease; }
        .emp-sb-foot { padding:12px 20px 20px; border-top:1px solid var(--border); }
        .emp-out { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:transparent; color:var(--text3); border-radius:11px; cursor:pointer; font-size:13px; width:100%; font-family:'Instrument Sans',sans-serif; transition:all 0.15s; }
        .emp-out:hover { background:rgba(244,63,94,0.08); color:#fb7185; }
        .emp-main { margin-left:260px; flex:1; padding:32px 34px 60px; }
        .emp-topbar { margin-bottom:24px; animation:fadeUp 0.4s ease; }
        .emp-greeting { font-family:'Bricolage Grotesque',sans-serif; font-size:26px; font-weight:800; color:var(--text); letter-spacing:-0.5px; }
        .emp-sub { font-size:12px; color:var(--text3); margin-top:3px; }
        .emp-hero { background:linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.1),rgba(124,58,237,0.04)); border:1px solid var(--border2); border-radius:22px; padding:28px 32px; margin-bottom:22px; position:relative; overflow:hidden; box-shadow:0 8px 40px rgba(124,58,237,0.1); animation:fadeUp 0.4s ease 0.05s both; }
        .emp-hero::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(167,139,250,0.35),transparent); }
        .emp-hero-deco { position:absolute; right:-20px; top:-20px; width:160px; height:160px; border:1px solid rgba(139,92,246,0.15); border-radius:50%; pointer-events:none; }
        .emp-hero-deco2 { position:absolute; right:20px; top:20px; width:100px; height:100px; border:1px solid rgba(236,72,153,0.1); border-radius:50%; pointer-events:none; }
        .emp-hero-deco3 { position:absolute; right:55px; top:55px; width:40px; height:40px; background:radial-gradient(circle,rgba(139,92,246,0.2),transparent); border-radius:50%; pointer-events:none; }
        .emp-hero-content { position:relative; z-index:1; }
        .emp-hero-content h3 { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:800; color:var(--text); margin-bottom:4px; }
        .emp-hero-content p { font-size:13px; color:var(--text2); max-width:380px; }
        .emp-bar-area { margin-top:18px; max-width:420px; }
        .emp-bar-top { display:flex; justify-content:space-between; font-size:11px; color:var(--text3); margin-bottom:7px; }
        .emp-bar-top span:last-child { color:var(--v3); font-weight:700; }
        .emp-track { height:7px; background:rgba(255,255,255,0.05); border-radius:100px; overflow:hidden; }
        .emp-fill { height:100%; background:linear-gradient(90deg,var(--v1),var(--pink)); border-radius:100px; transition:width 1s ease; }
        .emp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; animation:fadeUp 0.4s ease 0.1s both; }
        .emp-stat { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:22px; box-shadow:var(--card-shadow); transition:all 0.25s; position:relative; overflow:hidden; }
        .emp-stat:hover { box-shadow:var(--card-shadow-hover); transform:translateY(-3px); }
        .emp-stat::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); }
        .emp-stat-glow { position:absolute; width:80px; height:80px; border-radius:50%; filter:blur(30px); top:-10px; right:-10px; opacity:0.3; }
        .emp-sn { font-family:'Bricolage Grotesque',sans-serif; font-size:30px; font-weight:800; letter-spacing:-1px; line-height:1; position:relative; }
        .emp-sl { font-size:10px; color:var(--text3); margin-top:6px; text-transform:uppercase; letter-spacing:0.8px; position:relative; }
        .emp-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; animation:fadeUp 0.4s ease 0.15s both; }
        .emp-card { background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:24px; box-shadow:var(--card-shadow); position:relative; overflow:hidden; transition:all 0.2s; }
        .emp-card::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(236,72,153,0.08),transparent); }
        .emp-card:hover { border-color:rgba(236,72,153,0.2); box-shadow:0 8px 40px rgba(0,0,0,0.6),0 0 0 1px rgba(236,72,153,0.12); }
        .emp-card-full { background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:24px; box-shadow:var(--card-shadow); position:relative; overflow:hidden; animation:fadeUp 0.4s ease 0.1s both; }
        .emp-card-full::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(236,72,153,0.06),transparent); }
        .emp-ch { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
        .emp-ct { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; color:var(--text); }
        .emp-cs { font-size:11px; color:var(--text3); margin-top:2px; }
        .emp-att-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:14px; }
        .emp-att-item { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px 10px; text-align:center; }
        .emp-att-num { font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800; }
        .emp-att-lbl { font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-top:3px; }
        .emp-sal-card { background:linear-gradient(135deg,rgba(124,58,237,0.14),rgba(236,72,153,0.08)); border:1px solid rgba(139,92,246,0.2); border-radius:16px; padding:20px; }
        .emp-sal-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .emp-sal-title { font-family:'Bricolage Grotesque',sans-serif; font-size:14px; font-weight:700; color:var(--text); }
        .emp-sal-status { display:inline-flex; align-items:center; gap:5px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); color:#34d399; padding:4px 10px; border-radius:100px; font-size:10px; font-weight:700; }
        .emp-sal-amount { font-family:'Bricolage Grotesque',sans-serif; font-size:34px; font-weight:800; color:var(--v3); letter-spacing:-1.5px; margin-bottom:4px; }
        .emp-sal-detail { font-size:12px; color:var(--text3); }
        .emp-sal-breakdown { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:12px; }
        .emp-sal-br { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:9px; padding:9px 11px; }
        .emp-sal-br-l { font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; }
        .emp-sal-br-v { font-size:14px; font-weight:700; color:var(--text); margin-top:2px; }
        .emp-slip { border:1px solid var(--border); border-radius:16px; overflow:hidden; margin-bottom:12px; transition:all 0.2s; }
        .emp-slip:hover { border-color:var(--border2); }
        .emp-slip-head { background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06)); border-bottom:1px solid var(--border); padding:18px 20px; display:flex; justify-content:space-between; align-items:center; }
        .emp-slip-month { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:800; color:var(--text); }
        .emp-slip-amount { font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800; color:var(--v3); }
        .emp-slip-body { padding:16px 20px; display:grid; grid-template-columns:repeat(auto-fit,minmax(90px,1fr)); gap:12px; }
        .emp-slip-item span { font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; }
        .emp-slip-item strong { font-size:14px; color:var(--text); font-weight:700; margin-top:2px; display:block; }
        .emp-leave-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .emp-leave-box { background:var(--surface2); border:1px solid var(--border); border-radius:16px; padding:20px; }
        .emp-leave-box-title { font-family:'Bricolage Grotesque',sans-serif; font-size:14px; font-weight:700; color:var(--text); margin-bottom:16px; }
        .emp-fld { margin-bottom:14px; }
        .emp-fld label { display:block; font-size:10px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:7px; }
        .emp-fld input, .emp-fld select, .emp-fld textarea { width:100%; padding:11px 13px; background:var(--surface); border:1px solid var(--border); border-radius:10px; font-size:14px; color:var(--text); outline:none; font-family:'Instrument Sans',sans-serif; transition:all 0.2s; }
        .emp-fld textarea { resize:vertical; min-height:80px; }
        .emp-fld select option { background:#161728; }
        .emp-fld input:focus, .emp-fld select:focus, .emp-fld textarea:focus { border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,0.12); }
        .emp-submit { width:100%; padding:13px; background:linear-gradient(135deg,#7c3aed,#ec4899); color:white; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Bricolage Grotesque',sans-serif; transition:all 0.2s; box-shadow:0 6px 20px rgba(124,58,237,0.3); }
        .emp-submit:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(124,58,237,0.4); }
        .emp-lv-item { border-bottom:1px solid rgba(139,92,246,0.06); padding-bottom:12px; margin-bottom:12px; }
        .emp-lv-item:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }
        .emp-lv-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px; }
        .emp-lv-type { font-size:13px; font-weight:700; color:var(--text); }
        .emp-lv-dates { font-size:11px; color:var(--text3); margin-top:2px; }
        .emp-lv-reason { font-size:12px; color:var(--text3); margin-top:4px; }
        .emp-profile-wrap { display:flex; gap:24px; align-items:flex-start; }
        .emp-avatar-lg { width:80px; height:80px; background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Bricolage Grotesque',sans-serif; font-size:32px; font-weight:800; color:white; flex-shrink:0; box-shadow:0 8px 32px rgba(124,58,237,0.4); }
        .emp-profile-rows { flex:1; }
        .emp-profile-row { display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid rgba(139,92,246,0.06); }
        .emp-profile-row:last-child { border-bottom:none; }
        .emp-profile-key { width:150px; font-size:10px; color:var(--text3); font-weight:700; text-transform:uppercase; letter-spacing:0.6px; flex-shrink:0; }
        .emp-profile-val { font-size:15px; color:var(--text); font-weight:500; }
        .badge { padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; }
        .emp-table { width:100%; border-collapse:collapse; }
        .emp-table th { padding:10px 14px; text-align:left; font-size:10px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); }
        .emp-table td { padding:13px 14px; font-size:13px; color:var(--text2); border-bottom:1px solid rgba(139,92,246,0.05); }
        .emp-table tr:hover td { background:rgba(139,92,246,0.04); }
        .empty-st { text-align:center; padding:48px 20px; color:var(--text3); font-size:13px; }
        .loading-st { text-align:center; padding:60px; color:var(--text3); }
        .emp-mobile-bar { display:none; }
        .emp-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:98; backdrop-filter:blur(4px); }
        .emp-overlay.open { display:block; }
        .emp-sb-close { display:none; background:none; border:none; color:var(--text3); font-size:20px; cursor:pointer; margin-left:auto; }
        @media(max-width:900px){
          .emp-mobile-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:97;}
          .emp-hamburger{background:none;border:none;color:var(--text);font-size:22px;cursor:pointer;}
          .emp-sb{left:-280px;transition:left 0.28s ease;}
          .emp-sb.open{left:0;}
          .emp-sb-close{display:block;}
          .emp-main{margin-left:0;padding:16px 14px 40px;}
          .emp-hero{padding:18px 20px;}
          .emp-hero-deco,.emp-hero-deco2,.emp-hero-deco3{display:none;}
          .emp-stats{grid-template-columns:repeat(2,1fr);gap:10px;}
          .emp-stat{padding:16px 12px;}
          .emp-sn{font-size:24px;}
          .emp-grid2{grid-template-columns:1fr;}
          .emp-leave-grid{grid-template-columns:1fr;}
          .emp-profile-wrap{flex-direction:column;}
          .emp-profile-row{flex-direction:column;align-items:flex-start;gap:2px;}
          .emp-profile-key{width:auto;}
          .emp-fld input,.emp-fld select,.emp-fld textarea{font-size:16px;}
        }
      `}</style>

      <Toast toasts={toasts} remove={removeToast} />

      <div className="emp">
        {/* Mobile bar */}
        <div className="emp-mobile-bar">
          <button className="emp-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div className="emp-lmark">₹</div>
            <div className="emp-lname">Payroll<em>Pro</em></div>
          </div>
          <div style={{ fontSize:"12px", color:"var(--pink2)", fontWeight:700 }}>{employee?.name?.split(" ")[0]||"Employee"}</div>
        </div>

        <div className={`emp-overlay ${sidebarOpen?"open":""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <div className={`emp-sb ${sidebarOpen?"open":""}`}>
          <div className="emp-sb-header">
            <div className="emp-sb-logo">
              <div className="emp-lmark">₹</div>
              <div className="emp-lname">Payroll<em>Pro</em></div>
              <button className="emp-sb-close" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            {employee && (
              <div className="emp-profile-card">
                <div className="emp-av-row">
                  <div className="emp-avatar">{employee.name?.charAt(0)}</div>
                  <div><div className="emp-pname">{employee.name}</div><div className="emp-ppos">{employee.position}</div></div>
                </div>
                <div className="emp-online"><div className="emp-online-dot" />Online</div>
                <div className="emp-sal-badge">
                  <div className="emp-sal-l">Daily Rate</div>
                  <div className="emp-sal-v">₹{employee.salaryPerDay}</div>
                </div>
              </div>
            )}
          </div>

          <div className="emp-nav-wrap">
            <div className="emp-section">Navigation</div>
            <nav className="emp-nav">
              {navItems.map(item => (
                <button key={item.id} className={`emp-nb ${activeTab===item.id?"on":""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                  <div className="emp-nb-ico" style={{ background:item.bg, color:item.color }}>{item.icon}</div>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="emp-sb-att">
            <div className="emp-sb-att-title">This month's attendance</div>
            <div className="emp-sb-att-bar"><span>Rate</span><span>{attendanceRate}%</span></div>
            <div className="emp-sb-track"><div className="emp-sb-fill" style={{ width:`${attendanceRate}%` }} /></div>
          </div>

          <div className="emp-sb-foot">
            <button className="emp-out" onClick={handleLogout}>🚪 Sign out</button>
          </div>
        </div>

        {/* Main */}
        <div className="emp-main">
          <div className="emp-topbar">
            <div className="emp-greeting">Good morning, {employee?.name?.split(" ")[0]||"there"}</div>
            <div className="emp-sub">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} — Here's your workspace</div>
          </div>

          {/* Banner */}
          <div className="emp-hero">
            <div className="emp-hero-deco" /><div className="emp-hero-deco2" /><div className="emp-hero-deco3" />
            <div className="emp-hero-content">
              <h3>Your attendance this month</h3>
              <p>You're performing well. Consistent attendance builds a strong track record.</p>
              <div className="emp-bar-area">
                <div className="emp-bar-top"><span>Attendance Rate</span><span>{attendanceRate}%</span></div>
                <div className="emp-track"><div className="emp-fill" style={{ width:`${attendanceRate}%` }} /></div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="emp-stats">
            <div className="emp-stat"><div className="emp-stat-glow" style={{ background:"#10b981" }} /><div className="emp-sn" style={{ color:"#34d399" }}>{presentCount}</div><div className="emp-sl">Days Present</div></div>
            <div className="emp-stat"><div className="emp-stat-glow" style={{ background:"#f43f5e" }} /><div className="emp-sn" style={{ color:"#fb7185" }}>{absentCount}</div><div className="emp-sl">Days Absent</div></div>
            <div className="emp-stat"><div className="emp-stat-glow" style={{ background:"#f59e0b" }} /><div className="emp-sn" style={{ color:"#fbbf24" }}>{halfCount}</div><div className="emp-sl">Half Days</div></div>
            <div className="emp-stat"><div className="emp-stat-glow" style={{ background:"#7c3aed" }} /><div className="emp-sn" style={{ fontSize:"20px", color:"#c4b5fd" }}>{latestSalary ? `₹${latestSalary.totalSalary?.toLocaleString()}` : "—"}</div><div className="emp-sl">Latest Salary</div></div>
          </div>

          {loading ? <div className="loading-st">Loading your workspace...</div> : (
            <>
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="emp-grid2">
                  <div className="emp-card">
                    <div className="emp-ch"><div><div className="emp-ct">Attendance Breakdown</div><div className="emp-cs">{attendance.length > 0 ? `${new Date(attendance[0]?.date).toLocaleString("en-IN",{month:"long",year:"numeric"})}` : "This month"}</div></div></div>
                    <div className="emp-att-grid">
                      <div className="emp-att-item"><div className="emp-att-num" style={{ color:"#34d399" }}>{presentCount}</div><div className="emp-att-lbl">Present</div></div>
                      <div className="emp-att-item"><div className="emp-att-num" style={{ color:"#fb7185" }}>{absentCount}</div><div className="emp-att-lbl">Absent</div></div>
                      <div className="emp-att-item"><div className="emp-att-num" style={{ color:"#fbbf24" }}>{halfCount}</div><div className="emp-att-lbl">Half Day</div></div>
                    </div>
                    <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:"12px", color:"var(--text2)" }}>Total records</span>
                      <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:"16px", fontWeight:800, color:"var(--text)" }}>{attendance.length}</span>
                    </div>
                  </div>
                  <div className="emp-card">
                    <div className="emp-ch"><div><div className="emp-ct">Latest Salary</div><div className="emp-cs">{latestSalary ? `${latestSalary.month} ${latestSalary.year}` : "Not calculated yet"}</div></div></div>
                    {latestSalary ? (
                      <div className="emp-sal-card">
                        <div className="emp-sal-head"><div className="emp-sal-title">Net Salary</div><div className="emp-sal-status">✓ {latestSalary.status||"Pending"}</div></div>
                        <div className="emp-sal-amount">₹{latestSalary.totalSalary?.toLocaleString()}</div>
                        <div className="emp-sal-detail">{latestSalary.presentDays} days present · ₹{latestSalary.salaryPerDay}/day</div>
                        <div className="emp-sal-breakdown">
                          <div className="emp-sal-br"><div className="emp-sal-br-l">Days worked</div><div className="emp-sal-br-v">{latestSalary.presentDays + (latestSalary.halfDays||0)*0.5}</div></div>
                          <div className="emp-sal-br"><div className="emp-sal-br-l">Rate/day</div><div className="emp-sal-br-v">₹{latestSalary.salaryPerDay}</div></div>
                        </div>
                      </div>
                    ) : <div className="empty-st">No salary slips yet.</div>}
                  </div>
                </div>
              )}

              {/* Attendance */}
              {activeTab === "attendance" && (
                <div className="emp-card-full">
                  <div className="emp-ch"><div><div className="emp-ct">Attendance History</div><div className="emp-cs">{attendance.length} records</div></div></div>
                  {attendance.length === 0 ? <div className="empty-st">No attendance records yet.</div> : (
                    <div style={{ overflowX:"auto" }}>
                      <table className="emp-table">
                        <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
                        <tbody>{attendance.map((item,i) => {
                          const d = new Date(item.date);
                          const st = stBadgeAtt(item.status);
                          return (<tr key={i}><td style={{ fontWeight:600, color:"var(--text)" }}>{d.toLocaleDateString("en-IN")}</td><td>{d.toLocaleDateString("en-IN",{weekday:"long"})}</td><td><span className="badge" style={{ background:st.bg, color:st.c, border:`1px solid ${st.br}` }}>{item.status}</span></td></tr>);
                        })}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Salary slips */}
              {activeTab === "salary" && (
                <div className="emp-card-full">
                  <div className="emp-ch"><div><div className="emp-ct">Salary Slips</div><div className="emp-cs">{salaries.length} slips</div></div></div>
                  {salaries.length === 0 ? <div className="empty-st">No salary slips yet.</div> : (
                    salaries.map((slip,i) => (
                      <div className="emp-slip" key={i}>
                        <div className="emp-slip-head">
                          <div>
                            <div className="emp-slip-month">{slip.month} {slip.year}</div>
                            <span className="badge" style={{ background:slip.status==="Paid"?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)", color:slip.status==="Paid"?"#34d399":"#fbbf24", border:`1px solid ${slip.status==="Paid"?"rgba(16,185,129,0.2)":"rgba(245,158,11,0.2)"}`, marginTop:"4px", display:"inline-block" }}>{slip.status||"Pending"}</span>
                          </div>
                          <div className="emp-slip-amount">₹{slip.totalSalary?.toLocaleString()}</div>
                        </div>
                        <div className="emp-slip-body">
                          <div className="emp-slip-item"><span>Working Days</span><strong>{slip.totalDays}</strong></div>
                          <div className="emp-slip-item"><span>Present</span><strong style={{ color:"#34d399" }}>{slip.presentDays}</strong></div>
                          <div className="emp-slip-item"><span>Half Days</span><strong style={{ color:"#fbbf24" }}>{slip.halfDays||0}</strong></div>
                          <div className="emp-slip-item"><span>Absent</span><strong style={{ color:"#fb7185" }}>{slip.absentDays||0}</strong></div>
                          <div className="emp-slip-item"><span>Rate/Day</span><strong>₹{slip.salaryPerDay}</strong></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Leaves */}
              {activeTab === "leaves" && (
                <div className="emp-card-full">
                  <div className="emp-ch"><div><div className="emp-ct">Leave Management</div></div></div>
                  <div className="emp-leave-grid">
                    <div className="emp-leave-box">
                      <div className="emp-leave-box-title">Apply for Leave</div>
                      <form onSubmit={handleApplyLeave}>
                        <div className="emp-fld"><label>Leave Type</label><select value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm,type:e.target.value})}><option>Casual Leave</option><option>Sick Leave</option><option>Emergency Leave</option><option>Other</option></select></div>
                        <div className="emp-fld"><label>From Date</label><input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm({...leaveForm,fromDate:e.target.value})} required /></div>
                        <div className="emp-fld"><label>To Date</label><input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm({...leaveForm,toDate:e.target.value})} required /></div>
                        <div className="emp-fld"><label>Reason</label><textarea placeholder="Briefly describe your reason..." value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm,reason:e.target.value})} required /></div>
                        <button type="submit" className="emp-submit">Submit Request</button>
                      </form>
                    </div>
                    <div className="emp-leave-box">
                      <div className="emp-leave-box-title">My Leave History</div>
                      {leaves.length === 0 ? <div style={{ color:"var(--text3)", textAlign:"center", padding:"32px 0", fontSize:"13px" }}>No leave requests yet.</div> : (
                        leaves.map((lv,i) => {
                          const st = stBadgeLv(lv.status);
                          return (
                            <div className="emp-lv-item" key={i}>
                              <div className="emp-lv-top"><div><div className="emp-lv-type">{lv.type}</div><div className="emp-lv-dates">{new Date(lv.fromDate).toLocaleDateString("en-IN")} → {new Date(lv.toDate).toLocaleDateString("en-IN")}</div></div><span className="badge" style={{ background:st.bg, color:st.c, border:`1px solid ${st.br}` }}>{lv.status}</span></div>
                              <div className="emp-lv-reason">{lv.reason}</div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile */}
              {activeTab === "profile" && (
                <div className="emp-card-full">
                  <div className="emp-ch"><div><div className="emp-ct">My Profile</div></div></div>
                  {employee ? (
                    <div className="emp-profile-wrap">
                      <div className="emp-avatar-lg">{employee.name?.charAt(0)}</div>
                      <div className="emp-profile-rows">
                        {[["Full Name",employee.name],["Email",employee.email],["Position",employee.position],["Salary Per Day",`₹${employee.salaryPerDay}`]].map(([k,v]) => (
                          <div className="emp-profile-row" key={k}><div className="emp-profile-key">{k}</div><div className="emp-profile-val">{v}</div></div>
                        ))}
                      </div>
                    </div>
                  ) : <div className="empty-st">Could not load profile.</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
export default EmployeeDashboard;
