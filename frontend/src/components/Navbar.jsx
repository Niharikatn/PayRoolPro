import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#2c3e50",
      color: "white"
    }}>
      <h2>PayrollPro</h2>

      <div>
        <span style={{ marginRight: "20px" }}>
          Logged in as: {role}
        </span>

        <button
          onClick={handleLogout}
          style={{
            padding: "6px 12px",
            backgroundColor: "#e74c3c",
            border: "none",
            color: "white",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;