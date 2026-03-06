import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:9999, display:"flex", flexDirection:"column", gap:"10px", alignItems:"flex-end" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{ background:"#0f1020", border:`1px solid ${t.type==="error"?"rgba(244,63,94,0.25)":"rgba(167,139,250,0.25)"}`, color:t.type==="error"?"#fda4af":"#c4b5fd", padding:"13px 18px", borderRadius:"13px", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", gap:"10px", minWidth:"200px", maxWidth:"90vw", boxShadow:"0 8px 40px rgba(0,0,0,0.6)", animation:"toastIn 0.3s ease", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
          <span>{t.type==="error"?"❌":"✅"}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [presentToday, setPresentToday] = useState(0);
  const [empForm, setEmpForm] = useState({ name:"", email:"", password:"", position:"", salaryPerDay:"" });
  const [attForm, setAttForm] = useState({ employeeId:"", status:"Present", date:"" });
  const [salaryForm, setSalaryForm] = useState({ employeeId:"", month:"", year:"" });
  const [salaryResult, setSalaryResult] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const addToast = useCallback((msg, type="success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  useEffect(() => { fetchEmployees(); fetchPresentToday(); }, []);
  useEffect(() => { if (activeTab === "leaves") fetchLeaves(); }, [activeTab]);

  const fetchEmployees = async () => { try { const r = await axios.get(`${API}/api/employee`, { headers }); setEmployees(r.data); } catch(e){} };
  const fetchPresentToday = async () => { try { const r = await axios.get(`${API}/api/attendance/today`, { headers }); setPresentToday(r.data.presentCount||0); } catch(e){} };
  const fetchLeaves = async () => { try { const r = await axios.get(`${API}/api/leave/all`, { headers }); setLeaves(r.data); } catch(e){} };
  const handleLogout = () => { localStorage.removeItem("role"); localStorage.removeItem("token"); navigate("/"); };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/api/employee/register`, empForm); addToast("Employee added!"); setEmpForm({name:"",email:"",password:"",position:"",salaryPerDay:""}); fetchEmployees(); setActiveTab("employees"); }
    catch(err) { addToast(err.response?.data?.message||"Failed","error"); }
  };
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/api/attendance`, attForm, { headers }); addToast("Attendance marked!"); setAttForm({employeeId:"",status:"Present",date:""}); fetchPresentToday(); }
    catch(err) { addToast(err.response?.data?.message||"Failed","error"); }
  };
  const handleCalculateSalary = async (e) => {
    e.preventDefault();
    try { const r = await axios.post(`${API}/api/salary/calculate`, salaryForm, { headers }); setSalaryResult(r.data); addToast("Salary calculated!"); }
    catch(err) { addToast(err.response?.data?.message||"Failed","error"); }
  };
  const handleSendPayslip = async () => {
    if (!salaryResult?._id) return addToast("Calculate salary first","error");
    setEmailLoading(true);
    try { const r = await axios.post(`${API}/api/salary/send-payslip`, { salaryId: salaryResult._id }, { headers }); addToast("📧 " + r.data.message); }
    catch(err) { addToast(err.response?.data?.message||"Failed","error"); }
    finally { setEmailLoading(false); }
  };
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try { await axios.delete(`${API}/api/employee/${id}`, { headers }); addToast("Employee deleted!"); fetchEmployees(); }
    catch(e) { addToast("Failed","error"); }
  };
  const handleLeaveAction = async (id, status) => {
    try { await axios.put(`${API}/api/leave/${id}/status`, { status }, { headers }); addToast(`Leave ${status}!`); fetchLeaves(); }
    catch(e) { addToast("Failed","error"); }
  };

  const pendingLeaves = leaves.filter(l => l.status==="Pending").length;
  const absentToday = Math.max(0, employees.length - presentToday);

  const stBadge = (s) => {
    if(s==="Approved") return {c:"#34d399",bg:"rgba(16,185,129,0.1)",br:"rgba(16,185,129,0.2)"};
    if(s==="Rejected") return {c:"#fb7185",bg:"rgba(244,63,94,0.1)",br:"rgba(244,63,94,0.2)"};
    return {c:"#fbbf24",bg:"rgba(245,158,11,0.1)",br:"rgba(245,158,11,0.2)"};
  };

  const navGroups = [
    { label:"Main", items:[
      { id:"overview", icon:"▦", label:"Overview", bg:"rgba(139,92,246,0.15)", color:"#a78bfa" },
      { id:"employees", icon:"👥", label:"Employees", bg:"rgba(20,184,166,0.1)", color:"#2dd4bf" },
      { id:"add", icon:"➕", label:"Add Employee", bg:"rgba(99,102,241,0.1)", color:"#818cf8" },
    ]},
    { label:"Payroll", items:[
      { id:"attendance", icon:"📅", label:"Attendance", bg:"rgba(245,158,11,0.1)", color:"#fbbf24" },
      { id:"salary", icon:"💰", label:"Salary", bg:"rgba(16,185,129,0.1)", color:"#34d399" },
      { id:"leaves", icon:"🗓", label:"Leave Requests", bg:"rgba(236,72,153,0.1)", color:"#f472b6", badge: pendingLeaves },
    ]},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { overflow-x:hidden; max-width:100%; }
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
        .adm { display:flex; min-height:100vh; background:var(--bg); font-family:'Instrument Sans',sans-serif; color:var(--text); }
        .adm-sb { width:260px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; box-shadow:4px 0 32px rgba(0,0,0,0.4); position:fixed; top:0; bottom:0; left:0; z-index:100; overflow-y:auto; }
        .adm-sb-header { padding:26px 20px 22px; background:linear-gradient(180deg,rgba(124,58,237,0.12) 0%,transparent 100%); border-bottom:1px solid var(--border); }
        .adm-sb-logo { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .adm-lmark { width:40px; height:40px; background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:white; box-shadow:0 4px 16px rgba(124,58,237,0.4); flex-shrink:0; }
        .adm-lname { font-family:'Bricolage Grotesque',sans-serif; font-size:19px; font-weight:800; color:var(--text); }
        .adm-lname em { color:var(--v3); font-style:normal; }
        .adm-who { display:flex; align-items:center; gap:10px; background:rgba(139,92,246,0.08); border:1px solid var(--border2); border-radius:12px; padding:10px 13px; }
        .adm-who-av { width:32px; height:32px; background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:white; flex-shrink:0; }
        .adm-who-name { font-size:13px; font-weight:700; color:var(--text); }
        .adm-who-role { font-size:10px; color:var(--v3); font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
        .adm-who-dot { width:7px; height:7px; background:#10b981; border-radius:50%; margin-left:auto; box-shadow:0 0 6px #10b981; flex-shrink:0; }
        .adm-nav-wrap { flex:1; padding:14px 12px; }
        .adm-section { font-size:9px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1.2px; padding:0 10px; margin-bottom:5px; margin-top:14px; }
        .adm-nav { display:flex; flex-direction:column; gap:2px; }
        .adm-nb { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:transparent; color:var(--text2); border-radius:11px; cursor:pointer; font-size:13px; font-weight:500; width:100%; text-align:left; transition:all 0.15s; font-family:'Instrument Sans',sans-serif; }
        .adm-nb:hover { background:rgba(139,92,246,0.08); color:var(--text); }
        .adm-nb.on { background:rgba(139,92,246,0.14); color:var(--v4); font-weight:600; border:1px solid rgba(139,92,246,0.15); }
        .adm-nb-ico { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
        .adm-nb-badge { margin-left:auto; background:#ec4899; color:white; font-size:9px; font-weight:700; padding:2px 7px; border-radius:100px; box-shadow:0 2px 8px rgba(236,72,153,0.4); }
        .adm-sb-stats { padding:14px 20px; border-top:1px solid var(--border); }
        .adm-sb-stats-title { font-size:9px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
        .adm-sb-mini { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .adm-sb-ms { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:10px; text-align:center; }
        .adm-sb-ms-num { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:800; }
        .adm-sb-ms-lbl { font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.4px; margin-top:1px; }
        .adm-sb-foot { padding:12px 20px 20px; border-top:1px solid var(--border); }
        .adm-out { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:transparent; color:var(--text3); border-radius:11px; cursor:pointer; font-size:13px; width:100%; font-family:'Instrument Sans',sans-serif; transition:all 0.15s; }
        .adm-out:hover { background:rgba(244,63,94,0.08); color:#fb7185; }
        .adm-main { margin-left:260px; flex:1; padding:32px 34px 60px; min-width:0; overflow-x:hidden; }
        .adm-topbar { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; animation:fadeUp 0.4s ease; }
        .adm-ptitle { font-family:'Bricolage Grotesque',sans-serif; font-size:24px; font-weight:800; color:var(--text); letter-spacing:-0.5px; }
        .adm-psub { font-size:12px; color:var(--text3); margin-top:3px; }
        .adm-chip { background:rgba(139,92,246,0.1); border:1px solid var(--border2); color:var(--v4); padding:7px 16px; border-radius:100px; font-size:12px; font-weight:700; }
        .adm-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:22px; animation:fadeUp 0.4s ease 0.05s both; }
        .adm-stat { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:24px; position:relative; overflow:hidden; box-shadow:var(--card-shadow); transition:all 0.25s; }
        .adm-stat:hover { box-shadow:var(--card-shadow-hover); transform:translateY(-3px); }
        .adm-stat::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent); }
        .adm-stat-glow { position:absolute; width:140px; height:140px; border-radius:50%; filter:blur(50px); top:-40px; right:-40px; opacity:0.35; }
        .adm-st-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; position:relative; }
        .adm-st-ico { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; font-size:20px; }
        .adm-st-tag { font-size:10px; font-weight:700; padding:3px 9px; border-radius:100px; }
        .adm-st-num { font-family:'Bricolage Grotesque',sans-serif; font-size:38px; font-weight:800; color:var(--text); letter-spacing:-2px; line-height:1; position:relative; }
        .adm-st-lbl { font-size:11px; color:var(--text3); margin-top:6px; text-transform:uppercase; letter-spacing:0.8px; position:relative; }
        .adm-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; animation:fadeUp 0.4s ease 0.1s both; }
        .adm-card { background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:26px; box-shadow:var(--card-shadow); transition:all 0.2s; position:relative; overflow:hidden; }
        .adm-card::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.1),transparent); }
        .adm-card:hover { border-color:var(--border2); box-shadow:var(--card-shadow-hover); }
        .adm-card-full { background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:26px; box-shadow:var(--card-shadow); position:relative; overflow:hidden; animation:fadeUp 0.4s ease 0.15s both; }
        .adm-card-full::after { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.1),transparent); }
        .adm-ch { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
        .adm-ct { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; color:var(--text); }
        .adm-cs { font-size:11px; color:var(--text3); margin-top:2px; }
        .adm-btn { padding:9px 18px; background:linear-gradient(135deg,#7c3aed,#ec4899); color:white; border:none; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; font-family:'Instrument Sans',sans-serif; box-shadow:0 4px 14px rgba(124,58,237,0.3); transition:all 0.2s; white-space:nowrap; }
        .adm-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,0.4); }
        .adm-email-btn { padding:10px 20px; background:linear-gradient(135deg,#0ea5e9,#6366f1); color:white; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Instrument Sans',sans-serif; transition:all 0.2s; box-shadow:0 4px 14px rgba(14,165,233,0.25); }
        .adm-email-btn:hover { transform:translateY(-1px); }
        .adm-email-btn:disabled { opacity:0.5; transform:none; cursor:not-allowed; }
        .adm-feed { display:flex; flex-direction:column; }
        .adm-fi { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid rgba(139,92,246,0.05); }
        .adm-fi:last-child { border-bottom:none; }
        .adm-fd { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
        .adm-ft { font-size:13px; color:var(--text); }
        .adm-ft span { color:var(--v3); font-weight:700; }
        .adm-ftime { font-size:10px; color:var(--text3); margin-top:2px; }
        .adm-ps { display:flex; flex-direction:column; gap:10px; }
        .adm-ps-row { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:12px; gap:8px; }
        .adm-ps-left { display:flex; align-items:center; gap:10px; min-width:0; }
        .adm-ps-ico { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .adm-ps-name { font-size:13px; font-weight:600; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .adm-ps-month { font-size:10px; color:var(--text3); margin-top:1px; }
        .adm-ps-amt { font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:800; color:var(--v3); white-space:nowrap; flex-shrink:0; }
        .adm-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:20px; }
        .adm-fld label { display:block; font-size:10px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:7px; }
        .adm-fld input, .adm-fld select { width:100%; padding:12px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:11px; font-size:14px; color:var(--text); outline:none; font-family:'Instrument Sans',sans-serif; transition:all 0.2s; }
        .adm-fld input::placeholder { color:var(--text3); }
        .adm-fld select option { background:#161728; }
        .adm-fld input:focus, .adm-fld select:focus { border-color:#8b5cf6; box-shadow:0 0 0 3px rgba(139,92,246,0.12); }
        .adm-table { width:100%; border-collapse:collapse; }
        .adm-table th { padding:10px 14px; text-align:left; font-size:10px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); white-space:nowrap; }
        .adm-table td { padding:13px 14px; font-size:13px; color:var(--text2); border-bottom:1px solid rgba(139,92,246,0.05); }
        .adm-table tr:hover td { background:rgba(139,92,246,0.04); }
        .emp-n { color:var(--text)!important; font-weight:600!important; }
        .del-btn { background:rgba(244,63,94,0.08); color:#fb7185; border:1px solid rgba(244,63,94,0.15); padding:5px 12px; border-radius:7px; cursor:pointer; font-size:11px; font-weight:600; transition:all 0.15s; white-space:nowrap; }
        .del-btn:hover { background:rgba(244,63,94,0.15); }
        .ap-btn { background:rgba(16,185,129,0.08); color:#34d399; border:1px solid rgba(16,185,129,0.2); padding:5px 10px; border-radius:7px; cursor:pointer; font-size:11px; font-weight:700; margin-right:6px; }
        .rj-btn { background:rgba(244,63,94,0.08); color:#fb7185; border:1px solid rgba(244,63,94,0.15); padding:5px 10px; border-radius:7px; cursor:pointer; font-size:11px; font-weight:700; }
        .badge { padding:3px 10px; border-radius:100px; font-size:10px; font-weight:700; }
        .sal-result { margin-top:22px; background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06)); border:1px solid rgba(139,92,246,0.2); border-radius:16px; padding:22px; }
        .sal-result h4 { font-family:'Bricolage Grotesque',sans-serif; font-size:15px; font-weight:700; color:var(--v3); margin-bottom:16px; }
        .sal-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(100px,1fr)); gap:12px; margin-bottom:18px; }
        .sal-item span { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; display:block; }
        .sal-item strong { font-size:16px; color:var(--text); font-weight:700; margin-top:2px; display:block; }
        .sal-total { font-family:'Bricolage Grotesque',sans-serif; font-size:30px; font-weight:800; color:var(--v3); }
        .empty-st { text-align:center; padding:50px 20px; color:var(--text3); font-size:13px; }
        .adm-mobile-bar { display:none; }
        .adm-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:98; backdrop-filter:blur(4px); }
        .adm-overlay.open { display:block; }
        .adm-sb-close { display:none; background:rgba(255,255,255,0.06); border:none; color:var(--text2); font-size:18px; cursor:pointer; margin-left:auto; width:34px; height:34px; border-radius:8px; align-items:center; justify-content:center; flex-shrink:0; }

        @media(max-width:900px){
          html,body{overflow-x:hidden;}
          .adm-mobile-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:97;}
          .adm-hamburger{background:none;border:none;color:var(--text);font-size:26px;cursor:pointer;line-height:1;padding:0;}
          .adm-sb{left:-100vw;width:100vw;transition:left 0.3s ease;border-right:none;box-shadow:none;}
          .adm-sb.open{left:0;box-shadow:4px 0 40px rgba(0,0,0,0.7);}
          .adm-sb-close{display:flex;}
          .adm-main{margin-left:0;padding:16px 14px 60px;width:100%;overflow-x:hidden;}
          .adm-topbar{flex-direction:column;gap:6px;margin-bottom:16px;}
          .adm-ptitle{font-size:20px;}
          .adm-psub{font-size:11px;}
          .adm-chip{display:none;}
          .adm-stats{grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
          .adm-stat{padding:12px 10px;border-radius:16px;}
          .adm-st-num{font-size:24px;letter-spacing:-1px;}
          .adm-st-lbl{font-size:9px;}
          .adm-st-ico{width:32px;height:32px;font-size:15px;}
          .adm-st-top{margin-bottom:10px;}
          .adm-st-tag{display:none;}
          .adm-grid2{grid-template-columns:1fr;gap:12px;}
          .adm-card{padding:18px 16px;}
          .adm-card-full{padding:18px 16px;}
          .adm-ch{flex-direction:column;align-items:flex-start;gap:10px;}
          .adm-btn{width:100%;padding:13px;font-size:13px;text-align:center;}
          .adm-email-btn{width:100%;padding:13px;font-size:13px;}
          .adm-form-grid{grid-template-columns:1fr;}
          .adm-fld input,.adm-fld select{font-size:16px;padding:13px 14px;}
          .sal-grid{grid-template-columns:repeat(2,1fr);}
          .sal-total{font-size:24px;}
          .adm-nb{padding:13px;font-size:14px;}
          .adm-nb-ico{width:32px;height:32px;font-size:14px;}
          .adm-sb-header{padding:20px 16px 16px;}
        }
        @media(max-width:400px){
          .adm-stat{padding:10px 8px;}
          .adm-st-num{font-size:20px;}
          .adm-st-ico{display:none;}
          .sal-grid{grid-template-columns:1fr 1fr;}
          .adm-main{padding:12px 10px 60px;}
        }
      `}</style>

      <Toast toasts={toasts} remove={removeToast} />

      <div className="adm">
        {/* Mobile bar */}
        <div className="adm-mobile-bar">
          <button className="adm-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div className="adm-lmark">₹</div>
            <div className="adm-lname">Payroll<em>Pro</em></div>
          </div>
          <div style={{ width:34 }} />
        </div>

        <div className={`adm-overlay ${sidebarOpen?"open":""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <div className={`adm-sb ${sidebarOpen?"open":""}`}>
          <div className="adm-sb-header">
            <div className="adm-sb-logo">
              <div className="adm-lmark">₹</div>
              <div className="adm-lname">Payroll<em>Pro</em></div>
              <button className="adm-sb-close" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            <div className="adm-who">
              <div className="adm-who-av">A</div>
              <div><div className="adm-who-name">Admin</div><div className="adm-who-role">Super Admin</div></div>
              <div className="adm-who-dot" />
            </div>
          </div>

          <div className="adm-nav-wrap">
            {navGroups.map(g => (
              <div key={g.label}>
                <div className="adm-section">{g.label}</div>
                <nav className="adm-nav">
                  {g.items.map(item => (
                    <button key={item.id} className={`adm-nb ${activeTab===item.id?"on":""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                      <div className="adm-nb-ico" style={{ background:item.bg, color:item.color }}>{item.icon}</div>
                      {item.label}
                      {item.badge > 0 && <span className="adm-nb-badge">{item.badge}</span>}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="adm-sb-stats">
            <div className="adm-sb-stats-title">Today at a glance</div>
            <div className="adm-sb-mini">
              <div className="adm-sb-ms"><div className="adm-sb-ms-num" style={{ color:"#34d399" }}>{presentToday}</div><div className="adm-sb-ms-lbl">Present</div></div>
              <div className="adm-sb-ms"><div className="adm-sb-ms-num" style={{ color:"#fb7185" }}>{absentToday}</div><div className="adm-sb-ms-lbl">Absent</div></div>
            </div>
          </div>

          <div className="adm-sb-foot">
            <button className="adm-out" onClick={handleLogout}>🚪 Sign out</button>
          </div>
        </div>

        {/* Main */}
        <div className="adm-main">
          <div className="adm-topbar">
            <div>
              <div className="adm-ptitle">Good morning, Admin 👋</div>
              <div className="adm-psub">{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
            </div>
            <div className="adm-chip">⚙️ Admin Panel</div>
          </div>

          <div className="adm-stats">
            <div className="adm-stat">
              <div className="adm-stat-glow" style={{ background:"#7c3aed" }} />
              <div className="adm-st-top"><div className="adm-st-ico" style={{ background:"rgba(124,58,237,0.15)",color:"#a78bfa" }}>👥</div><span className="adm-st-tag" style={{ background:"rgba(124,58,237,0.1)",color:"#c4b5fd" }}>Total</span></div>
              <div className="adm-st-num">{employees.length}</div><div className="adm-st-lbl">Employees</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-glow" style={{ background:"#10b981" }} />
              <div className="adm-st-top"><div className="adm-st-ico" style={{ background:"rgba(16,185,129,0.15)",color:"#34d399" }}>✅</div><span className="adm-st-tag" style={{ background:"rgba(16,185,129,0.1)",color:"#6ee7b7" }}>Today</span></div>
              <div className="adm-st-num">{presentToday}</div><div className="adm-st-lbl">Present</div>
            </div>
            <div className="adm-stat">
              <div className="adm-stat-glow" style={{ background:"#f43f5e" }} />
              <div className="adm-st-top"><div className="adm-st-ico" style={{ background:"rgba(244,63,94,0.15)",color:"#fb7185" }}>❌</div><span className="adm-st-tag" style={{ background:"rgba(244,63,94,0.1)",color:"#fda4af" }}>Today</span></div>
              <div className="adm-st-num">{absentToday}</div><div className="adm-st-lbl">Absent</div>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="adm-grid2">
              <div className="adm-card">
                <div className="adm-ch"><div><div className="adm-ct">Recent Activity</div><div className="adm-cs">Latest actions on your team</div></div></div>
                <div className="adm-feed">
                  {[
                    { dot:"#34d399", text:<>Attendance marked for <span>your team</span></>, time:"Just now" },
                    { dot:"#fbbf24", text:<>Leave request pending approval</>, time:"Check Leaves tab" },
                    { dot:"#a78bfa", text:<>Salary calculations ready</>, time:"Go to Salary tab" },
                    { dot:"#f472b6", text:<>Add new team members</>, time:"Go to Add Employee" },
                  ].map((f,i) => (
                    <div className="adm-fi" key={i}>
                      <div className="adm-fd" style={{ background:f.dot, boxShadow:`0 0 6px ${f.dot}` }} />
                      <div><div className="adm-ft">{f.text}</div><div className="adm-ftime">{f.time}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="adm-card">
                <div className="adm-ch"><div><div className="adm-ct">Team Summary</div><div className="adm-cs">{employees.length} employees registered</div></div><button className="adm-btn" onClick={() => setActiveTab("add")}>+ Add New</button></div>
                <div className="adm-ps">
                  {employees.slice(0,3).map((e,i) => {
                    const colors = [["rgba(124,58,237,0.12)","#a78bfa"],["rgba(20,184,166,0.12)","#2dd4bf"],["rgba(245,158,11,0.12)","#fbbf24"]];
                    return (
                      <div className="adm-ps-row" key={e._id}>
                        <div className="adm-ps-left">
                          <div className="adm-ps-ico" style={{ background:colors[i%3][0], color:colors[i%3][1] }}>👤</div>
                          <div><div className="adm-ps-name">{e.name}</div><div className="adm-ps-month">{e.position}</div></div>
                        </div>
                        <div className="adm-ps-amt">₹{e.salaryPerDay}/d</div>
                      </div>
                    );
                  })}
                  {employees.length === 0 && <div className="empty-st">No employees yet. Add one!</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="adm-card-full">
              <div className="adm-ch"><div><div className="adm-ct">All Employees</div><div className="adm-cs">{employees.length} members</div></div><button className="adm-btn" onClick={() => setActiveTab("add")}>+ Add New</button></div>
              {employees.length === 0 ? <div className="empty-st">No employees yet.</div> : (
                <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
                  <table className="adm-table" style={{ minWidth:"480px" }}>
                    <thead><tr><th>Name</th><th>Email</th><th>Position</th><th>₹/Day</th><th>Action</th></tr></thead>
                    <tbody>{employees.map(e => (
                      <tr key={e._id}><td className="emp-n">{e.name}</td><td>{e.email}</td><td>{e.position}</td><td>₹{e.salaryPerDay}</td><td><button className="del-btn" onClick={() => handleDeleteEmployee(e._id)}>Delete</button></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "add" && (
            <div className="adm-card-full">
              <div className="adm-ch"><div><div className="adm-ct">Add New Employee</div><div className="adm-cs">Fill in the details below</div></div></div>
              <form onSubmit={handleAddEmployee}>
                <div className="adm-form-grid">
                  {[["Full Name","text","John Doe","name"],["Email","email","john@co.com","email"],["Password","password","Set password","password"],["Position","text","Developer","position"]].map(([l,t,p,k]) => (
                    <div className="adm-fld" key={k}><label>{l}</label><input type={t} placeholder={p} value={empForm[k]} onChange={e => setEmpForm({...empForm,[k]:e.target.value})} required /></div>
                  ))}
                  <div className="adm-fld"><label>Salary Per Day (₹)</label><input type="number" placeholder="1000" value={empForm.salaryPerDay} onChange={e => setEmpForm({...empForm,salaryPerDay:e.target.value})} required /></div>
                </div>
                <button type="submit" className="adm-btn">Add Employee</button>
              </form>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="adm-card-full">
              <div className="adm-ch"><div><div className="adm-ct">Mark Attendance</div><div className="adm-cs">Record daily attendance</div></div></div>
              <form onSubmit={handleMarkAttendance}>
                <div className="adm-form-grid">
                  <div className="adm-fld"><label>Employee</label><select value={attForm.employeeId} onChange={e => setAttForm({...attForm,employeeId:e.target.value})} required><option value="">Select Employee</option>{employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}</select></div>
                  <div className="adm-fld"><label>Date</label><input type="date" value={attForm.date} onChange={e => setAttForm({...attForm,date:e.target.value})} required /></div>
                  <div className="adm-fld"><label>Status</label><select value={attForm.status} onChange={e => setAttForm({...attForm,status:e.target.value})}><option>Present</option><option>Absent</option><option>Half Day</option><option>Leave</option></select></div>
                </div>
                <button type="submit" className="adm-btn">Mark Attendance</button>
              </form>
            </div>
          )}

          {activeTab === "salary" && (
            <div className="adm-card-full">
              <div className="adm-ch"><div><div className="adm-ct">Calculate Salary</div><div className="adm-cs">Monthly payroll</div></div></div>
              <form onSubmit={handleCalculateSalary}>
                <div className="adm-form-grid">
                  <div className="adm-fld"><label>Employee</label><select value={salaryForm.employeeId} onChange={e => setSalaryForm({...salaryForm,employeeId:e.target.value})} required><option value="">Select Employee</option>{employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}</select></div>
                  <div className="adm-fld"><label>Month</label><select value={salaryForm.month} onChange={e => setSalaryForm({...salaryForm,month:e.target.value})} required><option value="">Select Month</option>{["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}</select></div>
                  <div className="adm-fld"><label>Year</label><input type="number" placeholder="2026" value={salaryForm.year} onChange={e => setSalaryForm({...salaryForm,year:e.target.value})} required /></div>
                </div>
                <button type="submit" className="adm-btn">Calculate Salary</button>
              </form>
              {salaryResult && (
                <div className="sal-result">
                  <h4>💰 {salaryResult.employeeName} — {salaryResult.month} {salaryResult.year}</h4>
                  <div className="sal-grid">
                    <div className="sal-item"><span>Working Days</span><strong>{salaryResult.totalDays}</strong></div>
                    <div className="sal-item"><span>Present</span><strong style={{ color:"#34d399" }}>{salaryResult.presentDays}</strong></div>
                    <div className="sal-item"><span>Half Days</span><strong style={{ color:"#fbbf24" }}>{salaryResult.halfDays||0}</strong></div>
                    <div className="sal-item"><span>Absent</span><strong style={{ color:"#fb7185" }}>{salaryResult.absentDays||0}</strong></div>
                    <div className="sal-item"><span>Rate/Day</span><strong>₹{salaryResult.salaryPerDay}</strong></div>
                    <div className="sal-item"><span>Total</span><strong className="sal-total">₹{salaryResult.totalSalary?.toLocaleString()}</strong></div>
                  </div>
                  <button className="adm-email-btn" onClick={handleSendPayslip} disabled={emailLoading}>{emailLoading?"Sending...":"📧 Send Payslip Email"}</button>
                </div>
              )}
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="adm-card-full">
              <div className="adm-ch"><div><div className="adm-ct">Leave Requests</div><div className="adm-cs">{pendingLeaves} pending approval</div></div>{pendingLeaves > 0 && <span className="badge" style={{ background:"rgba(244,63,94,0.1)",color:"#fb7185",border:"1px solid rgba(244,63,94,0.2)" }}>{pendingLeaves} Pending</span>}</div>
              {leaves.length === 0 ? <div className="empty-st">No leave requests yet.</div> : (
                <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
                  <table className="adm-table" style={{ minWidth:"580px" }}>
                    <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>{leaves.map(lv => {
                      const st = stBadge(lv.status);
                      return (
                        <tr key={lv._id}>
                          <td className="emp-n">{lv.employeeName}</td>
                          <td>{lv.type}</td>
                          <td>{new Date(lv.fromDate).toLocaleDateString("en-IN")}</td>
                          <td>{new Date(lv.toDate).toLocaleDateString("en-IN")}</td>
                          <td style={{ maxWidth:"100px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lv.reason}</td>
                          <td><span className="badge" style={{ background:st.bg, color:st.c, border:`1px solid ${st.br}` }}>{lv.status}</span></td>
                          <td>{lv.status==="Pending"?<><button className="ap-btn" onClick={() => handleLeaveAction(lv._id,"Approved")}>✓</button><button className="rj-btn" onClick={() => handleLeaveAction(lv._id,"Rejected")}>✗</button></>:<span style={{ color:"var(--text3)",fontSize:"11px" }}>Done</span>}</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default AdminDashboard;
