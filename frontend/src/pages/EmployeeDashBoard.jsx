import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [activeTab, setActiveTab] = useState("attendance");
  const [loading, setLoading] = useState(true);
  // ── NEW: mobile sidebar state ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, attRes, salaryRes] = await Promise.all([
        axios.get(`${API}/api/employee/me`, { headers }),
        axios.get(`${API}/api/attendance/me`, { headers }),
        axios.get(`${API}/api/salary/me`, { headers }),
      ]);
      setEmployee(profileRes.data);
      setAttendance(attRes.data);
      setSalaries(salaryRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem("role"); localStorage.removeItem("token"); navigate("/"); };

  const presentCount = attendance.filter(a => a.status === "Present").length;
  const absentCount = attendance.filter(a => a.status === "Absent").length;
  const halfCount = attendance.filter(a => a.status === "Half Day").length;
  const latestSalary = salaries[0];

  const statusStyle = (s) => {
    if (s === "Present") return { bg: "rgba(34,197,94,0.1)", color: "#86efac", border: "rgba(34,197,94,0.2)" };
    if (s === "Absent") return { bg: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "rgba(239,68,68,0.2)" };
    if (s === "Half Day") return { bg: "rgba(234,179,8,0.1)", color: "#fde68a", border: "rgba(234,179,8,0.2)" };
    return { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.2)" };
  };

  const tabs = [
    { id: "attendance", icon: "📅", label: "Attendance" },
    { id: "salary", icon: "💰", label: "Salary Slips" },
    { id: "profile", icon: "👤", label: "My Profile" },
  ];

  // ── NEW: close sidebar on tab select ──
  const handleTabSelect = (id) => { setActiveTab(id); setSidebarOpen(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .emp-page { min-height: 100vh; background: #080c14; font-family: 'DM Sans', sans-serif; color: white; }
        .emp-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 240px; background: rgba(255,255,255,0.02); border-right: 1px solid rgba(255,255,255,0.06); padding: 32px 16px; display: flex; flex-direction: column; z-index: 100; }
        .emp-logo { display: flex; align-items: center; gap: 12px; padding: 0 12px; margin-bottom: 40px; }
        .emp-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#3b82f6,#2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; color: white; flex-shrink: 0; }
        .emp-logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: white; }
        .emp-logo-text span { color: #60a5fa; }
        .emp-profile-mini { padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .emp-avatar-sm { width: 38px; height: 38px; background: linear-gradient(135deg,#3b82f6,#2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: white; flex-shrink: 0; }
        .emp-profile-name { font-size: 14px; font-weight: 600; color: white; }
        .emp-profile-pos { font-size: 12px; color: #475569; }
        .emp-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .emp-nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; color: #475569; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; text-align: left; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .emp-nav-btn:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .emp-nav-btn.active { background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
        .emp-logout { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .emp-main { margin-left: 240px; padding: 40px; }
        .emp-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
        .emp-greeting { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: white; }
        .emp-sub { font-size: 13px; color: #475569; margin-top: 2px; }
        .emp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .emp-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 22px; position: relative; overflow: hidden; }
        .emp-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .emp-stat.blue::before { background: linear-gradient(90deg,#3b82f6,transparent); }
        .emp-stat.red::before { background: linear-gradient(90deg,#ef4444,transparent); }
        .emp-stat.gold::before { background: linear-gradient(90deg,#eab308,transparent); }
        .emp-stat.purple::before { background: linear-gradient(90deg,#8b5cf6,transparent); }
        .emp-stat-num { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; color: white; }
        .emp-stat-label { font-size: 11px; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.8px; }
        .emp-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 32px; }
        .emp-card-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; margin-bottom: 24px; }
        .emp-table { width: 100%; border-collapse: collapse; }
        .emp-table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .emp-table td { padding: 14px 16px; font-size: 14px; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .emp-slip { border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
        .emp-slip-header { background: linear-gradient(135deg,rgba(59,130,246,0.15),rgba(37,99,235,0.05)); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
        .emp-slip-month { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; }
        .emp-slip-status { font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
        .emp-slip-amount { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: #60a5fa; }
        .emp-slip-body { padding: 20px 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 16px; }
        .emp-slip-item { display: flex; flex-direction: column; gap: 4px; }
        .emp-slip-item span { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; }
        .emp-slip-item strong { font-size: 15px; color: white; }
        .emp-profile-card { display: flex; gap: 32px; align-items: flex-start; }
        .emp-avatar-lg { width: 90px; height: 90px; background: linear-gradient(135deg,#3b82f6,#2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: white; flex-shrink: 0; box-shadow: 0 8px 32px rgba(59,130,246,0.3); }
        .emp-profile-rows { flex: 1; }
        .emp-profile-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .emp-profile-key { width: 150px; font-size: 12px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
        .emp-profile-val { font-size: 15px; color: white; font-weight: 500; }
        .empty-state { text-align: center; padding: 60px; color: #334155; font-size: 14px; }
        .loading { text-align: center; padding: 60px; color: #334155; }

        /* ── MOBILE RESPONSIVE (CSS only additions below) ── */
        .emp-mobile-bar { display: none; }
        .emp-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 98; }
        .emp-overlay.open { display: block; }
        .emp-sidebar-close { display: none; background: none; border: none; color: #475569; font-size: 20px; cursor: pointer; margin-left: auto; line-height: 1; }

        @media (max-width: 768px) {
          /* Mobile top bar */
          .emp-mobile-bar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 16px; background: #0d1628;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: sticky; top: 0; z-index: 97;
          }
          .emp-hamburger {
            background: none; border: none; color: white;
            font-size: 24px; cursor: pointer; line-height: 1; padding: 2px 6px;
          }
          .emp-mobile-logo { display: flex; align-items: center; gap: 8px; }
          .emp-mobile-badge {
            background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
            color: #60a5fa; padding: 4px 12px; border-radius: 20px;
            font-size: 12px; font-weight: 600;
            max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          }

          /* Sidebar slides in */
          .emp-sidebar {
            left: -260px; transition: left 0.28s ease;
            z-index: 99; background: #0d1628;
          }
          .emp-sidebar.open { left: 0; }
          .emp-sidebar-close { display: block; }

          /* Main: full width */
          .emp-main { margin-left: 0; padding: 16px 14px 40px; }
          .emp-topbar { margin-bottom: 16px; }
          .emp-greeting { font-size: 20px; }
          .emp-sub { font-size: 12px; }

          /* Stats: 2x2 grid */
          .emp-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; }
          .emp-stat { padding: 14px 12px; border-radius: 12px; }
          .emp-stat-num { font-size: 20px; }
          .emp-stat-label { font-size: 9px; }

          /* Card */
          .emp-card { padding: 16px 14px; border-radius: 14px; }
          .emp-card-title { font-size: 16px; margin-bottom: 16px; }

          /* Table: horizontal scroll */
          .emp-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .emp-table { min-width: 380px; }
          .emp-table th, .emp-table td { padding: 10px 10px; font-size: 12px; }

          /* Salary slip */
          .emp-slip-header { padding: 14px 16px; }
          .emp-slip-month { font-size: 15px; }
          .emp-slip-amount { font-size: 24px; }
          .emp-slip-body { padding: 14px 16px; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .emp-slip-item strong { font-size: 13px; }

          /* Profile */
          .emp-profile-card { flex-direction: column; gap: 16px; }
          .emp-profile-row { flex-direction: column; align-items: flex-start; gap: 2px; padding: 12px 0; }
          .emp-profile-key { width: auto; }
          .emp-avatar-lg { width: 64px; height: 64px; font-size: 26px; }
        }
      `}</style>

      <div className="emp-page">

        {/* ── Mobile top bar (NEW) ── */}
        <div className="emp-mobile-bar">
          <button className="emp-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="emp-mobile-logo">
            <div className="emp-logo-icon">₹</div>
            <div className="emp-logo-text">Payroll<span>Pro</span></div>
          </div>
          <div className="emp-mobile-badge">{employee?.name?.split(" ")[0] || "Employee"}</div>
        </div>

        {/* ── Overlay (NEW) ── */}
        <div className={`emp-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar — unchanged inside, just added close button + open class */}
        <div className={`emp-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="emp-logo">
            <div className="emp-logo-icon">₹</div>
            <div className="emp-logo-text">Payroll<span>Pro</span></div>
            <button className="emp-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          {employee && (
            <div className="emp-profile-mini">
              <div className="emp-avatar-sm">{employee.name?.charAt(0)}</div>
              <div>
                <div className="emp-profile-name">{employee.name}</div>
                <div className="emp-profile-pos">{employee.position}</div>
              </div>
            </div>
          )}

          <nav className="emp-nav">
            {tabs.map(t => (
              <button key={t.id} className={`emp-nav-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => handleTabSelect(t.id)}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </nav>
          <button className="emp-logout" onClick={handleLogout}>🚪 Logout</button>
        </div>

        {/* Main — completely unchanged */}
        <div className="emp-main">
          <div className="emp-topbar">
            <div>
              <div className="emp-greeting">Hello, {employee?.name?.split(" ")[0] || "Employee"} 👋</div>
              <div className="emp-sub">{new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</div>
            </div>
          </div>

          <div className="emp-stats">
            <div className="emp-stat blue">
              <div className="emp-stat-num">{presentCount}</div>
              <div className="emp-stat-label">Days Present</div>
            </div>
            <div className="emp-stat red">
              <div className="emp-stat-num">{absentCount}</div>
              <div className="emp-stat-label">Days Absent</div>
            </div>
            <div className="emp-stat gold">
              <div className="emp-stat-num">{halfCount}</div>
              <div className="emp-stat-label">Half Days</div>
            </div>
            <div className="emp-stat purple">
              <div className="emp-stat-num">₹{latestSalary?.totalSalary?.toLocaleString() || "—"}</div>
              <div className="emp-stat-label">Latest Salary</div>
            </div>
          </div>

          <div className="emp-card">
            {loading ? <div className="loading">Loading your data...</div> : (
              <>
                {activeTab === "attendance" && (
                  <>
                    <div className="emp-card-title">My Attendance History</div>
                    {attendance.length === 0 ? <div className="empty-state">No attendance records yet.</div> : (
                      <div className="emp-table-scroll">
                        <table className="emp-table">
                          <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
                          <tbody>
                            {attendance.map((item, i) => {
                              const d = new Date(item.date);
                              const st = statusStyle(item.status);
                              return (
                                <tr key={i}>
                                  <td>{d.toLocaleDateString("en-IN")}</td>
                                  <td>{d.toLocaleDateString("en-IN", { weekday: "long" })}</td>
                                  <td>
                                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "salary" && (
                  <>
                    <div className="emp-card-title">My Salary Slips</div>
                    {salaries.length === 0 ? <div className="empty-state">No salary slips yet.</div> : (
                      salaries.map((slip, i) => (
                        <div className="emp-slip" key={i}>
                          <div className="emp-slip-header">
                            <div>
                              <div className="emp-slip-month">{slip.month} {slip.year}</div>
                              <span className="emp-slip-status" style={{ background: slip.status === "Paid" ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)", color: slip.status === "Paid" ? "#86efac" : "#fde68a", border: `1px solid ${slip.status === "Paid" ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)"}` }}>
                                {slip.status || "Pending"}
                              </span>
                            </div>
                            <div className="emp-slip-amount">₹{slip.totalSalary?.toLocaleString()}</div>
                          </div>
                          <div className="emp-slip-body">
                            <div className="emp-slip-item"><span>Working Days</span><strong>{slip.totalDays}</strong></div>
                            <div className="emp-slip-item"><span>Present</span><strong style={{color:"#86efac"}}>{slip.presentDays}</strong></div>
                            <div className="emp-slip-item"><span>Half Days</span><strong style={{color:"#fde68a"}}>{slip.halfDays || 0}</strong></div>
                            <div className="emp-slip-item"><span>Absent</span><strong style={{color:"#fca5a5"}}>{slip.absentDays || 0}</strong></div>
                            <div className="emp-slip-item"><span>Rate/Day</span><strong>₹{slip.salaryPerDay}</strong></div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {activeTab === "profile" && (
                  <>
                    <div className="emp-card-title">My Profile</div>
                    {employee ? (
                      <div className="emp-profile-card">
                        <div className="emp-avatar-lg">{employee.name?.charAt(0)}</div>
                        <div className="emp-profile-rows">
                          {[["Full Name", employee.name], ["Email", employee.email], ["Position", employee.position], ["Salary Per Day", `₹${employee.salaryPerDay}`]].map(([k, v]) => (
                            <div className="emp-profile-row" key={k}>
                              <div className="emp-profile-key">{k}</div>
                              <div className="emp-profile-val">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <div className="empty-state">Could not load profile.</div>}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EmployeeDashboard;
