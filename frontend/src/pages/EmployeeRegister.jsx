import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function EmployeeRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    salaryPerDay: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check passwords match on frontend
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // ✅ Remove confirmPassword before sending to backend
      const { confirmPassword, ...dataToSend } = formData;

      await axios.post(
        `${API}/api/employee/register`,
        dataToSend
      );

      alert("Employee Registered Successfully ✅");
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Employee Register</h2>
        <p style={s.sub}>Create your PayrollPro account</p>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} name="name" placeholder="Full Name" onChange={handleChange} required />
          <input style={s.input} name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <input style={s.input} name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <input style={s.input} name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
          <input style={s.input} name="position" placeholder="Position (e.g. Developer)" onChange={handleChange} required />
          <input style={s.input} name="salaryPerDay" type="number" placeholder="Salary Per Day (₹)" onChange={handleChange} required />
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={s.loginLink}>
          Already registered? <span style={s.link} onClick={() => navigate("/")}>Login here</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "white", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  title: { margin: "0 0 4px", fontSize: "24px", fontWeight: "700", color: "#0f172a" },
  sub: { margin: "0 0 24px", color: "#64748b", fontSize: "14px" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" },
  btn: { padding: "13px", background: "linear-gradient(135deg,#1d4ed8,#2563eb)", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
  loginLink: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#64748b" },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: "600" },
};

export default EmployeeRegister;
