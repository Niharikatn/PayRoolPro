import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// const API = "http://localhost:5000/api";
const API = import.meta.env.VITE_API_URL;


function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [presentToday, setPresentToday] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [empForm, setEmpForm] = useState({ name: "", email: "", password: "", position: "", salaryPerDay: "" });
  const [attForm, setAttForm] = useState({ employeeId: "", status: "Present", date: "" });
  const [salaryForm, setSalaryForm] = useState({ employeeId: "", month: "", year: "" });
  const [salaryResult, setSalaryResult] = useState(null);
  // ── NEW: mobile sidebar state ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  useEffect(() => { fetchEmployees(); fetchPresentToday(); }, []);

  const fetchEmployees = async () => {
    try { const res = await axios.get(`${API}/api/employee`, { headers }); setEmployees(res.data); } catch (e) {}
  };
  const fetchPresentToday = async () => {
    try { const res = await axios.get(`${API}/api/attendance/today`, { headers }); setPresentToday(res.data.presentCount || 0); } catch (e) {}
  };
  const handleLogout = () => { localStorage.removeItem("role"); localStorage.removeItem("token"); navigate("/"); };
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/employee/register`, empForm);
      showMessage("Employee added successfully!");
      setEmpForm({ name: "", email: "", password: "", position: "", salaryPerDay: "" });
      fetchEmployees();
    } catch (err) { showMessage(err.response?.data?.message || "Failed to add employee", "error"); }
  };
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/attendance`, attForm, { headers });
      showMessage("Attendance marked successfully!");
      setAttForm({ employeeId: "", status: "Present", date: "" });
      fetchPresentToday();
    } catch (err) { showMessage(err.response?.data?.message || "Failed", "error"); }
  };
  const handleCalculateSalary = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/salary/calculate`, salaryForm, { headers });
      setSalaryResult(res.data);
      showMessage("Salary calculated!");
    } catch (err) { showMessage(err.response?.data?.message || "Failed", "error"); }
  };
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try { await axios.delete(`${API}/api/employee/${id}`, { headers }); showMessage("Employee deleted!"); fetchEmployees(); }
    catch (err) { showMessage("Failed to delete", "error"); }
  };

  const tabs = [
    { id: "employees", icon: "👥", label: "Employees" },
    { id: "add", icon: "➕", label: "Add Employee" },
    { id: "attendance", icon: "📅", label: "Attendance" },
    { id: "salary", icon: "💰", label: "Salary" },
  ];

  // ── NEW: close sidebar on tab select (mobile) ──
  const handleTabSelect = (id) => { setActiveTab(id); setSidebarOpen(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .adm-page { min-height: 100vh; background: #080c14; font-family: 'DM Sans', sans-serif; color: white; }
        .adm-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 240px; background: rgba(255,255,255,0.02); border-right: 1px solid rgba(255,255,255,0.06); padding: 32px 16px; display: flex; flex-direction: column; z-index: 100; }
        .adm-logo { display: flex; align-items: center; gap: 12px; padding: 0 12px; margin-bottom: 40px; }
        .adm-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#eab308,#f59e0b); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: #080c14; flex-shrink: 0; }
        .adm-logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: white; }
        .adm-logo-text span { color: #eab308; }
        .adm-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .adm-nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; color: #475569; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; text-align: left; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .adm-nav-btn:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .adm-nav-btn.active { background: rgba(234,179,8,0.1); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }
        .adm-nav-icon { font-size: 16px; }
        .adm-logout { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .adm-logout:hover { background: rgba(239,68,68,0.1); }
        .adm-main { margin-left: 240px; padding: 40px; }
        .adm-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
        .adm-page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: white; }
        .adm-page-sub { font-size: 13px; color: #475569; margin-top: 2px; }
        .adm-badge { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2); color: #eab308; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .adm-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .adm-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; position: relative; overflow: hidden; }
        .adm-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .adm-stat.blue::before { background: linear-gradient(90deg,#3b82f6,transparent); }
        .adm-stat.gold::before { background: linear-gradient(90deg,#eab308,transparent); }
        .adm-stat.red::before { background: linear-gradient(90deg,#ef4444,transparent); }
        .adm-stat-num { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: white; }
        .adm-stat-label { font-size: 12px; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.8px; }
        .adm-stat-icon { position: absolute; right: 20px; top: 20px; font-size: 28px; opacity: 0.3; }
        .adm-msg { padding: 14px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .adm-msg.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #86efac; }
        .adm-msg.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; }
        .adm-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 32px; }
        .adm-card-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; margin-bottom: 24px; }
        .adm-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .adm-field label { display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .adm-field input, .adm-field select { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; font-size: 14px; color: white; outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .adm-field input::placeholder { color: #334155; }
        .adm-field select option { background: #1e293b; color: white; }
        .adm-field input:focus, .adm-field select:focus { border-color: rgba(234,179,8,0.4); background: rgba(255,255,255,0.06); }
        .adm-btn { padding: 13px 28px; background: linear-gradient(135deg,#eab308,#f59e0b); color: #080c14; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Syne', sans-serif; transition: all 0.2s; }
        .adm-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(234,179,8,0.3); }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .adm-table td { padding: 14px 16px; font-size: 14px; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .adm-table tr:hover td { background: rgba(255,255,255,0.02); }
        .adm-emp-name { color: white; font-weight: 500; }
        .adm-del-btn { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
        .adm-del-btn:hover { background: rgba(239,68,68,0.2); }
        .adm-salary-result { margin-top: 28px; background: rgba(234,179,8,0.05); border: 1px solid rgba(234,179,8,0.15); border-radius: 16px; padding: 24px; }
        .adm-salary-result h4 { font-family: 'Syne', sans-serif; font-size: 16px; color: #eab308; margin-bottom: 16px; }
        .adm-salary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
        .adm-salary-item { display: flex; flex-direction: column; gap: 4px; }
        .adm-salary-item span { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; }
        .adm-salary-item strong { font-size: 16px; color: white; font-weight: 600; }
        .adm-salary-total { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #eab308; }
        .empty-state { text-align: center; padding: 60px 20px; color: #334155; font-size: 15px; }

        /* ── MOBILE RESPONSIVE (CSS only additions below) ── */
        .adm-mobile-bar { display: none; }
        .adm-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 98; }
        .adm-overlay.open { display: block; }
        .adm-sidebar-close { display: none; background: none; border: none; color: #475569; font-size: 20px; cursor: pointer; margin-left: auto; line-height: 1; }

        @media (max-width: 768px) {
          /* Mobile top bar */
          .adm-mobile-bar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 16px; background: #0d1628;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: sticky; top: 0; z-index: 97;
          }
          .adm-hamburger {
            background: none; border: none; color: white;
            font-size: 24px; cursor: pointer; line-height: 1; padding: 2px 6px;
          }
          .adm-mobile-logo { display: flex; align-items: center; gap: 8px; }
          .adm-mobile-badge {
            background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2);
            color: #eab308; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          }

          /* Sidebar: hidden off-screen, slides in */
          .adm-sidebar {
            left: -260px; transition: left 0.28s ease;
            z-index: 99; background: #0d1628;
          }
          .adm-sidebar.open { left: 0; }
          .adm-sidebar-close { display: block; }

          /* Main: full width, no left margin */
          .adm-main { margin-left: 0; padding: 16px 14px 40px; }
          .adm-topbar { margin-bottom: 16px; }
          .adm-page-title { font-size: 20px; }
          .adm-badge { display: none; }

          /* Stats: smaller on mobile */
          .adm-stats { gap: 8px; margin-bottom: 16px; }
          .adm-stat { padding: 14px 10px; border-radius: 12px; }
          .adm-stat-num { font-size: 22px; }
          .adm-stat-label { font-size: 9px; }
          .adm-stat-icon { display: none; }

          /* Card */
          .adm-card { padding: 16px 14px; border-radius: 14px; }
          .adm-card-title { font-size: 16px; margin-bottom: 16px; }

          /* Form: single column */
          .adm-form-grid { grid-template-columns: 1fr; gap: 12px; margin-bottom: 16px; }
          .adm-field input, .adm-field select { font-size: 16px; }
          .adm-btn { width: 100%; padding: 14px; font-size: 15px; }

          /* Table: horizontal scroll */
          .adm-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .adm-table { min-width: 480px; }
          .adm-table th, .adm-table td { padding: 10px 10px; font-size: 12px; }
          .adm-del-btn { padding: 4px 8px; }

          /* Salary result */
          .adm-salary-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .adm-salary-total { font-size: 24px; }
        }
      `}</style>

      <div className="adm-page">

        {/* ── Mobile top bar (NEW) ── */}
        <div className="adm-mobile-bar">
          <button className="adm-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="adm-mobile-logo">
            <div className="adm-logo-icon">₹</div>
            <div className="adm-logo-text">Payroll<span>Pro</span></div>
          </div>
          <div className="adm-mobile-badge">Admin</div>
        </div>

        {/* ── Overlay (NEW) ── */}
        <div className={`adm-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar — unchanged inside, just added close button + open class */}
        <div className={`adm-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="adm-logo">
            <div className="adm-logo-icon">₹</div>
            <div className="adm-logo-text">Payroll<span>Pro</span></div>
            <button className="adm-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          <nav className="adm-nav">
            {tabs.map(t => (
              <button key={t.id} className={`adm-nav-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => handleTabSelect(t.id)}>
                <span className="adm-nav-icon">{t.icon}</span> {t.label}
              </button>
            ))}
          </nav>
          <button className="adm-logout" onClick={handleLogout}>🚪 Logout</button>
        </div>

        {/* Main — completely unchanged */}
        <div className="adm-main">
          <div className="adm-topbar">
            <div>
              <div className="adm-page-title">Admin Dashboard</div>
              <div className="adm-page-sub">Manage your team's payroll & attendance</div>
            </div>
            <div className="adm-badge">👤 Admin</div>
          </div>

          <div className="adm-stats">
            <div className="adm-stat blue">
              <div className="adm-stat-icon">👥</div>
              <div className="adm-stat-num">{employees.length}</div>
              <div className="adm-stat-label">Total Employees</div>
            </div>
            <div className="adm-stat gold">
              <div className="adm-stat-icon">✅</div>
              <div className="adm-stat-num">{presentToday}</div>
              <div className="adm-stat-label">Present Today</div>
            </div>
            <div className="adm-stat red">
              <div className="adm-stat-icon">❌</div>
              <div className="adm-stat-num">{Math.max(0, employees.length - presentToday)}</div>
              <div className="adm-stat-label">Absent Today</div>
            </div>
          </div>

          {message.text && (
            <div className={`adm-msg ${message.type === "error" ? "error" : "success"}`}>
              {message.type === "error" ? "⚠" : "✓"} {message.text}
            </div>
          )}

          <div className="adm-card">
            {activeTab === "employees" && (
              <>
                <div className="adm-card-title">All Employees</div>
                {employees.length === 0 ? (
                  <div className="empty-state">No employees yet. Add one to get started.</div>
                ) : (
                  <div className="adm-table-scroll">
                    <table className="adm-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Position</th><th>Salary/Day</th><th>Action</th></tr></thead>
                      <tbody>
                        {employees.map(emp => (
                          <tr key={emp._id}>
                            <td className="adm-emp-name">{emp.name}</td>
                            <td>{emp.email}</td>
                            <td>{emp.position}</td>
                            <td>₹{emp.salaryPerDay}</td>
                            <td><button className="adm-del-btn" onClick={() => handleDeleteEmployee(emp._id)}>Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === "add" && (
              <>
                <div className="adm-card-title">Add New Employee</div>
                <form onSubmit={handleAddEmployee}>
                  <div className="adm-form-grid">
                    {[["Full Name","text","John Doe","name"],["Email","email","john@co.com","email"],["Password","password","Set password","password"],["Position","text","Developer","position"]].map(([label,type,ph,key]) => (
                      <div className="adm-field" key={key}>
                        <label>{label}</label>
                        <input type={type} placeholder={ph} value={empForm[key]} onChange={e => setEmpForm({...empForm,[key]:e.target.value})} required />
                      </div>
                    ))}
                    <div className="adm-field">
                      <label>Salary Per Day (₹)</label>
                      <input type="number" placeholder="1000" value={empForm.salaryPerDay} onChange={e => setEmpForm({...empForm,salaryPerDay:e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="adm-btn">Add Employee</button>
                </form>
              </>
            )}

            {activeTab === "attendance" && (
              <>
                <div className="adm-card-title">Mark Attendance</div>
                <form onSubmit={handleMarkAttendance}>
                  <div className="adm-form-grid">
                    <div className="adm-field">
                      <label>Employee</label>
                      <select value={attForm.employeeId} onChange={e => setAttForm({...attForm,employeeId:e.target.value})} required>
                        <option value="">Select Employee</option>
                        {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Date</label>
                      <input type="date" value={attForm.date} onChange={e => setAttForm({...attForm,date:e.target.value})} required />
                    </div>
                    <div className="adm-field">
                      <label>Status</label>
                      <select value={attForm.status} onChange={e => setAttForm({...attForm,status:e.target.value})}>
                        <option>Present</option><option>Absent</option><option>Half Day</option><option>Leave</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="adm-btn">Mark Attendance</button>
                </form>
              </>
            )}

            {activeTab === "salary" && (
              <>
                <div className="adm-card-title">Calculate Salary</div>
                <form onSubmit={handleCalculateSalary}>
                  <div className="adm-form-grid">
                    <div className="adm-field">
                      <label>Employee</label>
                      <select value={salaryForm.employeeId} onChange={e => setSalaryForm({...salaryForm,employeeId:e.target.value})} required>
                        <option value="">Select Employee</option>
                        {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Month</label>
                      <select value={salaryForm.month} onChange={e => setSalaryForm({...salaryForm,month:e.target.value})} required>
                        <option value="">Select Month</option>
                        {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Year</label>
                      <input type="number" placeholder="2026" value={salaryForm.year} onChange={e => setSalaryForm({...salaryForm,year:e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="adm-btn">Calculate Salary</button>
                </form>
                {salaryResult && (
                  <div className="adm-salary-result">
                    <h4>💰 Salary Summary — {salaryResult.employeeName}</h4>
                    <div className="adm-salary-grid">
                      <div className="adm-salary-item"><span>Month</span><strong>{salaryResult.month} {salaryResult.year}</strong></div>
                      <div className="adm-salary-item"><span>Working Days</span><strong>{salaryResult.totalDays}</strong></div>
                      <div className="adm-salary-item"><span>Present</span><strong style={{color:"#86efac"}}>{salaryResult.presentDays}</strong></div>
                      <div className="adm-salary-item"><span>Half Days</span><strong style={{color:"#fde68a"}}>{salaryResult.halfDays || 0}</strong></div>
                      <div className="adm-salary-item"><span>Absent</span><strong style={{color:"#fca5a5"}}>{salaryResult.absentDays || 0}</strong></div>
                      <div className="adm-salary-item"><span>Rate/Day</span><strong>₹{salaryResult.salaryPerDay}</strong></div>
                      <div className="adm-salary-item"><span>Total Salary</span><strong className="adm-salary-total">₹{salaryResult.totalSalary?.toLocaleString()}</strong></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
