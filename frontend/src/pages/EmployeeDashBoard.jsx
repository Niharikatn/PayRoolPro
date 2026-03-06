import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", zIndex:10000, display:"flex", flexDirection:"column", gap:"10px", alignItems:"center" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{ background:"#0f1020", border:`1px solid ${t.type==="error"?"rgba(244,63,94,0.25)":"rgba(167,139,250,0.25)"}`, color:t.type==="error"?"#fda4af":"#c4b5fd", padding:"13px 22px", borderRadius:"13px", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", gap:"10px", width:"max-content", minWidth:"280px", maxWidth:"90vw", boxShadow:"0 8px 40px rgba(0,0,0,0.7)", animation:"toastIn 0.3s ease", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
          <span>{t.type==="error"?"❌":"✅"}</span>{t.msg}
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

  // Smart attendance state
  const [attMode, setAttMode] = useState("Office");
  const [gpsState, setGpsState] = useState("idle"); 
  const [gpsCoords, setGpsCoords] = useState({ lat:null, lng:null, distance:null });
  const [attSettings, setAttSettings] = useState({ wfhEnabled:true, hybridEnabled:true, officeEnabled:true, wfhLimitPerMonth:8 });
  const [wfhUsage, setWfhUsage] = useState({ wfhCount:0, limit:8, remaining:8 });
  const [todayMarked, setTodayMarked] = useState(false);
  const [attLoading, setAttLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const prevLeavesRef = useRef([]);

  const addToast = useCallback((msg, type="success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  }, []);
  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    fetchLeaves();
    const interval = setInterval(fetchLeaves, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prevLeavesRef.current.length > 0) {
      leaves.forEach(leave => {
        const prev = prevLeavesRef.current.find(p => p._id === leave._id);
        if (prev && prev.status === "Pending" && leave.status === "Approved")
          addToast(`✅ Your ${leave.type} request was Approved!`, "success");
        if (prev && prev.status === "Pending" && leave.status === "Rejected")
          addToast(`❌ Your ${leave.type} request was Rejected`, "error");
      });
    }
    prevLeavesRef.current = leaves;
  }, [leaves]);

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttSettings();
      fetchWFHUsage();
      checkTodayMarked();
    }
  }, [activeTab]);

  useEffect(() => {
    setGpsState("idle");
    setGpsCoords({ lat:null, lng:null, distance:null });
  }, [attMode]);

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

  const fetchLeaves = async () => {
    try { const r = await axios.get(`${API}/api/leave/my`, { headers }); setLeaves(r.data); } catch(e) {}
  };

  const fetchAttSettings = async () => {
    try { const r = await axios.get(`${API}/api/attendance-settings`, { headers }); setAttSettings(r.data); } catch(e) {}
  };

  const fetchWFHUsage = async () => {
    try { const r = await axios.get(`${API}/api/attendance/wfh-count`, { headers }); setWfhUsage(r.data); } catch(e) {}
  };

  const checkTodayMarked = async () => {
    try {
      const r = await axios.get(`${API}/api/attendance/me`, { headers });
      const today = new Date().toDateString();
      const marked = r.data.some(a => new Date(a.date).toDateString() === today);
      setTodayMarked(marked);
    } catch(e) {}
  };

  const handleLogout = () => { localStorage.removeItem("role"); localStorage.removeItem("token"); navigate("/"); };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/leave/apply`, leaveForm, { headers });
      addToast("Leave request submitted!");
      setLeaveForm({ fromDate:"", toDate:"", type:"Casual Leave", reason:"" });
      fetchLeaves();
    } catch(err) { addToast(err.response?.data?.message||"Failed","error"); }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) return addToast("Geolocation not supported", "error");
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, distance: null });
        setGpsState("verified");
        addToast("📍 Location fetched!");
      },
      (err) => {
        setGpsState("failed");
        addToast("Allow location access.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMarkAttendance = async () => {
    if (todayMarked) return addToast("Already marked!", "error");
    if ((attMode === "Office" || attMode === "Hybrid") && gpsState !== "verified") {
      return addToast("Verify GPS first!", "error");
    }
    setAttLoading(true);
    try {
      const payload = {
        employeeId: employee._id,
        date: new Date().toISOString(),
        status: "Present",
        workMode: attMode,
        ...(gpsCoords.lat && { latitude: gpsCoords.lat, longitude: gpsCoords.lng }),
      };
      await axios.post(`${API}/api/attendance`, payload, { headers });
      addToast(`✅ Marked as ${attMode}`);
      setTodayMarked(true);
      fetchAll();
      if (attMode === "WFH" || attMode === "Hybrid") fetchWFHUsage();
    } catch(err) {
      addToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setAttLoading(false);
    }
  };

  const presentCount = attendance.filter(a => a.status==="Present").length;
  const absentCount = attendance.filter(a => a.status==="Absent").length;
  const halfCount = attendance.filter(a => a.status==="Half Day").length;
  const latestSalary = salaries[0];
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const wfhPct = Math.min(100, Math.round((wfhUsage.wfhCount / (attSettings.wfhLimitPerMonth||8)) * 100));

  const navItems = [
    { id:"overview", icon:"▦", label:"Overview", bg:"rgba(236,72,153,0.12)", color:"#f472b6" },
    { id:"attendance", icon:"📅", label:"Mark Attendance", bg:"rgba(124,58,237,0.1)", color:"#a78bfa" },
    { id:"history", icon:"📋", label:"Att. History", bg:"rgba(20,184,166,0.1)", color:"#2dd4bf" },
    { id:"salary", icon:"💰", label:"Salary Slips", bg:"rgba(245,158,11,0.1)", color:"#fbbf24" },
    { id:"leaves", icon:"🗓", label:"Leave", bg:"rgba(16,185,129,0.1)", color:"#34d399" },
    { id:"profile", icon:"👤", label:"My Profile", bg:"rgba(99,102,241,0.1)", color:"#818cf8" },
  ];

  const modeOptions = [
    { id:"Office", icon:"🏢", label:"Office", desc:"In-person", req:"📍 GPS", reqColor:"rgba(124,58,237,0.15)", reqText:"#a78bfa", enabled: attSettings.officeEnabled },
    { id:"WFH", icon:"🏠", label:"WFH", desc:"Remote", req:"✓ No GPS", reqColor:"rgba(16,185,129,0.12)", reqText:"#34d399", enabled: attSettings.wfhEnabled },
    { id:"Hybrid", icon:"🔀", label:"Hybrid", desc:"Split", req:"📍 GPS", reqColor:"rgba(245,158,11,0.1)", reqText:"#fbbf24", enabled: attSettings.hybridEnabled },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --bg:#06070f; --surface:#0f1020; --surface2:#161728; --surface3:#1e2035;
          --border:rgba(139,92,246,0.1); --border2:rgba(139,92,246,0.2); 
          --v1:#7c3aed; --pink2:#f472b6; --text:#f0f0ff; --text2:#9898c0; --text3:#4a4a70;
        }
        body { background:var(--bg); color:var(--text); font-family:'Instrument Sans',sans-serif; overflow-x:hidden; }
        
        .emp { display:flex; min-height:100vh; position:relative; }

        /* SIDEBAR DESKTOP */
        .emp-sb { 
          width:260px; background:var(--surface); border-right:1px solid var(--border); 
          display:flex; flex-direction:column; position:fixed; top:0; bottom:0; left:0; 
          z-index:1000; transition: transform 0.3s ease;
        }

        /* MAIN CONTENT DESKTOP */
        .emp-main { flex:1; margin-left:260px; padding:32px; min-width:0; }

        /* MOBILE OVERRIDES */
        @media(max-width:900px){
          .emp-sb { transform: translateX(-100%); width: 280px; }
          .emp-sb.open { transform: translateX(0); }
          .emp-main { margin-left: 0; padding: 16px; width: 100%; }
          .emp-mobile-bar { 
            display:flex; align-items:center; justify-content:space-between; padding:12px 16px;
            background:var(--surface); border-bottom:1px solid var(--border); 
            position:sticky; top:0; z-index:999;
          }
          .emp-stats { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .emp-grid2 { grid-template-columns: 1fr !important; }
          .mode-grid { grid-template-columns: 1fr !important; }
          .gps-panel { flex-direction: column; align-items: flex-start !important; }
          .gps-fetch-btn { width: 100%; margin-top: 10px; }
        }

        .emp-hamburger { background:none; border:none; color:white; font-size:24px; cursor:pointer; }
        .emp-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:998; backdrop-filter:blur(4px); }
        .emp-overlay.open { display:block; }

        .emp-sb-header { padding:24px 20px; border-bottom:1px solid var(--border); }
        .emp-lmark { width:36px; height:36px; background:linear-gradient(135deg,var(--v1),#ec4899); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; }
        
        .emp-nb { 
          display:flex; align-items:center; gap:12px; padding:10px 14px; width:100%; border:none; 
          background:transparent; color:var(--text2); border-radius:10px; cursor:pointer; transition:0.2s;
        }
        .emp-nb.on { background:rgba(236,72,153,0.1); color:var(--pink2); font-weight:600; }

        .emp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .emp-stat { background:var(--surface); border:1px solid var(--border); padding:20px; border-radius:18px; position:relative; overflow:hidden; }
        .emp-sn { font-family:'Bricolage Grotesque'; font-size:28px; font-weight:800; }
        .emp-sl { font-size:10px; color:var(--text3); text-transform:uppercase; margin-top:4px; }

        .emp-hero { 
          background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.1)); 
          padding:24px; border-radius:20px; border:1px solid var(--border2); margin-bottom:24px;
        }
        
        .table-wrap { overflow-x:auto; -webkit-overflow-scrolling: touch; }
        .emp-table { width:100%; border-collapse:collapse; min-width:500px; }
        .emp-table th { text-align:left; padding:12px; font-size:11px; color:var(--text3); border-bottom:1px solid var(--border); }
        .emp-table td { padding:14px 12px; border-bottom:1px solid rgba(255,255,255,0.05); font-size:14px; }

        .mode-card { background:var(--surface2); padding:16px; border-radius:14px; border:1px solid var(--border); cursor:pointer; text-align:center; }
        .mode-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .mode-card.on-Office { border-color:var(--v1); background:rgba(124,58,237,0.05); }

        .gps-panel { background:var(--surface2); padding:16px; border-radius:14px; border:1px solid var(--border); display:flex; align-items:center; gap:16px; margin-top:16px; }
        .gps-fetch-btn { background:var(--v1); color:white; border:none; padding:10px 18px; border-radius:8px; font-weight:600; cursor:pointer; }
        
        .confirm-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; background:var(--surface2); padding:16px; border-radius:12px; margin:16px 0; }
        .mark-btn { width:100%; padding:14px; border-radius:12px; border:none; background:linear-gradient(90deg,var(--v1),#ec4899); color:white; font-weight:700; cursor:pointer; }
      `}</style>

      <Toast toasts={toasts} remove={removeToast} />

      <div className="emp">
        {/* MOBILE BAR */}
        <div className="emp-mobile-bar">
          <button className="emp-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div className="emp-lmark">₹</div>
            <div style={{ fontWeight:800 }}>PayrollPro</div>
          </div>
          <div style={{ width: 24 }}></div>
        </div>

        {/* OVERLAY */}
        <div className={`emp-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}></div>

        {/* SIDEBAR */}
        <aside className={`emp-sb ${sidebarOpen ? "open" : ""}`}>
          <div className="emp-sb-header">
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <div className="emp-lmark">₹</div>
              <span style={{ fontWeight:800 }}>PayrollPro</span>
            </div>
            {employee && (
              <div style={{ background:'rgba(255,255,255,0.03)', padding:'12px', borderRadius:'12px' }}>
                <div style={{ fontWeight:700, fontSize:'14px' }}>{employee.name}</div>
                <div style={{ fontSize:'11px', color:'var(--text3)' }}>{employee.position}</div>
              </div>
            )}
          </div>
          <div style={{ flex:1, padding:'16px 12px' }}>
            {navItems.map(item => (
              <button key={item.id} className={`emp-nb ${activeTab===item.id?"on":""}`} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                <span style={{ fontSize:'18px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ padding:'20px', borderTop:'1px solid var(--border)' }}>
            <button className="emp-nb" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="emp-main">
          <header style={{ marginBottom:'24px' }}>
            <h1 style={{ fontFamily:'Bricolage Grotesque', fontSize:'24px' }}>Hello, {employee?.name?.split(" ")[0]}</h1>
            <p style={{ color:'var(--text3)', fontSize:'14px' }}>{new Date().toDateString()}</p>
          </header>

          <div className="emp-stats">
            <div className="emp-stat">
              <div className="emp-sl">Present</div>
              <div className="emp-sn" style={{ color:'#34d399' }}>{presentCount}</div>
            </div>
            <div className="emp-stat">
              <div className="emp-sl">Absent</div>
              <div className="emp-sn" style={{ color:'#fb7185' }}>{absentCount}</div>
            </div>
            <div className="emp-stat">
              <div className="emp-sl">Attendance</div>
              <div className="emp-sn">{attendanceRate}%</div>
            </div>
            <div className="emp-stat">
              <div className="emp-sl">Salary</div>
              <div className="emp-sn" style={{ fontSize:'18px' }}>₹{latestSalary?.totalSalary?.toLocaleString() || '0'}</div>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="emp-hero">
              <h3>Monthly Progress</h3>
              <p style={{ fontSize:'14px', color:'var(--text2)', margin:'8px 0 16px' }}>You have maintained a {attendanceRate}% attendance rate this month.</p>
              <div style={{ height:'8px', background:'rgba(255,255,255,0.1)', borderRadius:'10px', overflow:'hidden' }}>
                <div style={{ width: `${attendanceRate}%`, height:'100%', background:'var(--v1)' }}></div>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div style={{ background:'var(--surface)', padding:'20px', borderRadius:'20px', border:'1px solid var(--border)' }}>
              <h3>Mark Today's Attendance</h3>
              <div className="mode-grid" style={{ marginTop:'16px' }}>
                {modeOptions.map(m => (
                  <div key={m.id} className={`mode-card on-${attMode===m.id?m.id:""}`} onClick={() => setAttMode(m.id)}>
                    <div style={{ fontSize:'24px' }}>{m.icon}</div>
                    <div style={{ fontWeight:700, margin:'4px 0' }}>{m.label}</div>
                    <div style={{ fontSize:'10px', color:'var(--text3)' }}>{m.req}</div>
                  </div>
                ))}
              </div>

              {(attMode === "Office" || attMode === "Hybrid") && (
                <div className="gps-panel">
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'14px' }}>GPS Verification</div>
                    <div style={{ fontSize:'12px', color:'var(--text3)' }}>{gpsState === "verified" ? "Location Secure" : "Required for Office mode"}</div>
                  </div>
                  <button className="gps-fetch-btn" onClick={handleGetGPS}>
                    {gpsState === "loading" ? "Fetching..." : "📍 Get Location"}
                  </button>
                </div>
              )}

              <div className="confirm-summary">
                <div><div className="emp-sl">Mode</div><div style={{ fontWeight:700 }}>{attMode}</div></div>
                <div><div className="emp-sl">Status</div><div style={{ fontWeight:700 }}>Present</div></div>
                <div><div className="emp-sl">GPS</div><div style={{ fontWeight:700 }}>{gpsState==="verified"?"✅":"❌"}</div></div>
              </div>

              <button className="mark-btn" onClick={handleMarkAttendance} disabled={todayMarked || attLoading}>
                {todayMarked ? "✓ Already Marked Today" : attLoading ? "Processing..." : "Mark Attendance Now"}
              </button>
            </div>
          )}

          {activeTab === "history" && (
            <div className="table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a, i) => (
                    <tr key={i}>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>{a.workMode || 'Office'}</td>
                      <td><span style={{ color: a.status==="Present" ? '#34d399' : '#fb7185' }}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default EmployeeDashboard;