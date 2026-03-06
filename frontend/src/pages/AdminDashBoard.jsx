import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", zIndex:10000, display:"flex", flexDirection:"column", gap:"10px", alignItems:"center" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{ background:"#0f1020", border:`1px solid ${t.type==="error"?"rgba(244,63,94,0.25)":"rgba(167,139,250,0.25)"}`, color:t.type==="error"?"#fda4af":"#c4b5fd", padding:"13px 18px", borderRadius:"13px", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", gap:"10px", width:"max-content", minWidth:"200px", maxWidth:"90vw", boxShadow:"0 8px 40px rgba(0,0,0,0.6)", animation:"toastIn 0.3s ease", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
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
        
        :root {
          --bg:#06070f; --surface:#0f1020; --surface2:#161728; --surface3:#1e2035;
          --border:rgba(139,92,246,0.1); --border2:rgba(139,92,246,0.2); --border3:rgba(139,92,246,0.35);
          --v1:#7c3aed; --v2:#8b5cf6; --v3:#a78bfa; --v4:#c4b5fd;
          --pink:#ec4899; --pink2:#f472b6;
          --text:#f0f0ff; --text2:#9898c0; --text3:#4a4a70;
        }

        body { background:var(--bg); color:var(--text); font-family:'Instrument Sans',sans-serif; overflow-x:hidden; }

        .adm { display:flex; min-height:100vh; position:relative; }

        /* Sidebar Desktop */
        .adm-sb { 
          width:260px; 
          background:var(--surface); 
          border-right:1px solid var(--border); 
          display:flex; 
          flex-direction:column; 
          position:fixed; 
          top:0; 
          bottom:0; 
          left:0; 
          z-index:1000; 
          transition: transform 0.3s ease;
        }

        .adm-main { 
          flex: 1;
          margin-left: 260px;
          padding: 32px;
          min-width: 0;
          width: calc(100% - 260px);
        }

        /* Mobile Adjustments */
        @media (max-width: 900px) {
          .adm-sb { transform: translateX(-100%); width: 280px; }
          .adm-sb.open { transform: translateX(0); }
          .adm-main { margin-left: 0; width: 100%; padding: 16px; }
          .adm-mobile-bar { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding: 12px 16px; 
            background: var(--surface); 
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 999;
          }
          .adm-stats { grid-template-columns: 1fr !important; }
          .adm-grid2 { grid-template-columns: 1fr !important; }
        }

        /* Styling Components */
        .adm-sb-header { padding:24px 20px; border-bottom:1px solid var(--border); }
        .adm-sb-logo { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
        .adm-lmark { width:36px; height:36px; background:linear-gradient(135deg,var(--v1),var(--pink)); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; }
        .adm-lname { font-family:'Bricolage Grotesque'; font-size:18px; font-weight:800; }
        
        .adm-nav-wrap { flex:1; padding:20px 12px; overflow-y:auto; }
        .adm-section { font-size:10px; font-weight:800; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin:16px 8px 8px; }
        
        .adm-nb { 
          display:flex; align-items:center; gap:12px; padding:10px 12px; width:100%; border:none; 
          background:transparent; color:var(--text2); border-radius:10px; cursor:pointer; 
          font-size:14px; transition:0.2s; text-align:left; 
        }
        .adm-nb.on { background:rgba(139,92,246,0.1); color:var(--v3); font-weight:600; }
        .adm-nb-ico { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; }

        .adm-stat { 
          background:var(--surface); border:1px solid var(--border); padding:20px; border-radius:18px;
          display:flex; flex-direction:column; gap:8px; position:relative; overflow:hidden;
        }
        .adm-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .adm-st-num { font-family:'Bricolage Grotesque'; font-size:32px; font-weight:800; }
        .adm-st-lbl { font-size:12px; color:var(--text3); text-transform:uppercase; }

        .adm-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:20px; margin-bottom:16px; }
        .adm-grid2 { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }

        .adm-mobile-bar { display: none; }
        .adm-hamburger { background:none; border:none; color:white; font-size:24px; cursor:pointer; }
        
        .adm-overlay { 
          position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:999; 
          display:none; backdrop-filter:blur(4px); 
        }
        .adm-overlay.open { display:block; }
        
        .adm-sb-close { display:none; }
        @media (max-width: 900px) { .adm-sb-close { display:block; margin-left:auto; background:none; border:none; color:white; font-size:20px; } }

        .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; border: 1px solid var(--border); }
        .adm-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .adm-table th { background: var(--surface2); padding: 12px; text-align: left; font-size: 11px; color: var(--text3); text-transform: uppercase; }
        .adm-table td { padding: 14px 12px; border-bottom: 1px solid var(--border); font-size: 14px; }

        .adm-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .adm-fld input, .adm-fld select { 
          width: 100%; padding: 12px; background: var(--surface2); border: 1px solid var(--border); 
          border-radius: 8px; color: white; margin-top: 6px; 
        }

        .adm-btn { 
          background: linear-gradient(135deg, var(--v1), var(--pink)); color: white; border: none; 
          padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 10px;
        }

        @keyframes toastIn { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      <Toast toasts={toasts} remove={removeToast} />

      <div className="adm">
        {/* Mobile Navbar */}
        <div className="adm-mobile-bar">
          <button className="adm-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <div className="adm-lmark">₹</div>
            <div className="adm-lname">PayrollPro</div>
          </div>
          <div style={{ width: 24 }}></div>
        </div>

        {/* Sidebar Overlay */}
        <div className={`adm-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)}></div>

        {/* Sidebar */}
        <aside className={`adm-sb ${sidebarOpen ? "open" : ""}`}>
          <div className="adm-sb-header">
            <div className="adm-sb-logo">
              <div className="adm-lmark">₹</div>
              <span className="adm-lname">PayrollPro</span>
              <button className="adm-sb-close" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Admin Dashboard</div>
          </div>

          <div className="adm-nav-wrap">
            {navGroups.map(g => (
              <div key={g.label}>
                <div className="adm-section">{g.label}</div>
                {g.items.map(item => (
                  <button 
                    key={item.id} 
                    className={`adm-nb ${activeTab === item.id ? "on" : ""}`}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  >
                    <div className="adm-nb-ico" style={{ background: item.bg, color: item.color }}>{item.icon}</div>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="adm-nb" onClick={handleLogout}>🚪 Sign Out</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="adm-main">
          <header style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'Bricolage Grotesque', fontSize: '24px' }}>Good morning, Admin 👋</h1>
            <p style={{ color: 'var(--text3)', fontSize: '14px' }}>{new Date().toDateString()}</p>
          </header>

          <div className="adm-stats">
            <div className="adm-stat">
              <span className="adm-st-lbl">Employees</span>
              <span className="adm-st-num">{employees.length}</span>
            </div>
            <div className="adm-stat">
              <span className="adm-st-lbl" style={{ color: '#34d399' }}>Present Today</span>
              <span className="adm-st-num">{presentToday}</span>
            </div>
            <div className="adm-stat">
              <span className="adm-st-lbl" style={{ color: '#fb7185' }}>Absent Today</span>
              <span className="adm-st-num">{absentToday}</span>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="adm-grid2">
              <div className="adm-card">
                <h3>Recent Activity</h3>
                <div style={{ marginTop: '16px' }}>
                   <p style={{ fontSize: '14px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>✅ Attendance marked for team</p>
                   <p style={{ fontSize: '14px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>🗓️ {pendingLeaves} Leave requests pending</p>
                </div>
              </div>
              <div className="adm-card">
                <h3>Quick Actions</h3>
                <button className="adm-btn" onClick={() => setActiveTab("add")} style={{ width: '100%' }}>Add Employee</button>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="adm-card">
              <div className="table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Daily Rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(e => (
                      <tr key={e._id}>
                        <td>{e.name}</td>
                        <td>{e.position}</td>
                        <td>₹{e.salaryPerDay}</td>
                        <td><button onClick={() => handleDeleteEmployee(e._id)} style={{ color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="adm-card">
              <form onSubmit={handleAddEmployee} className="adm-form-grid">
                <div className="adm-fld"><label>Full Name</label><input type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} required /></div>
                <div className="adm-fld"><label>Email</label><input type="email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} required /></div>
                <div className="adm-fld"><label>Password</label><input type="password" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} required /></div>
                <div className="adm-fld"><label>Position</label><input type="text" value={empForm.position} onChange={e => setEmpForm({...empForm, position: e.target.value})} required /></div>
                <div className="adm-fld"><label>Salary/Day</label><input type="number" value={empForm.salaryPerDay} onChange={e => setEmpForm({...empForm, salaryPerDay: e.target.value})} required /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="adm-btn">Register Employee</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="adm-card">
              <form onSubmit={handleMarkAttendance} className="adm-form-grid">
                <div className="adm-fld"><label>Employee</label>
                  <select value={attForm.employeeId} onChange={e => setAttForm({...attForm, employeeId: e.target.value})} required>
                    <option value="">Select</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="adm-fld"><label>Date</label><input type="date" value={attForm.date} onChange={e => setAttForm({...attForm, date: e.target.value})} required /></div>
                <div className="adm-fld"><label>Status</label>
                  <select value={attForm.status} onChange={e => setAttForm({...attForm, status: e.target.value})}>
                    <option>Present</option><option>Absent</option><option>Half Day</option>
                  </select>
                </div>
                <button type="submit" className="adm-btn">Mark Attendance</button>
              </form>
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="adm-card">
              <div className="table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(lv => (
                      <tr key={lv._id}>
                        <td>{lv.employeeName}</td>
                        <td>{lv.type}</td>
                        <td>{new Date(lv.fromDate).toLocaleDateString()}</td>
                        <td>
                          {lv.status === "Pending" ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleLeaveAction(lv._id, "Approved")} style={{ color: '#34d399', background: 'none', border: 'none', cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => handleLeaveAction(lv._id, "Rejected")} style={{ color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer' }}>Reject</button>
                            </div>
                          ) : <span>{lv.status}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;