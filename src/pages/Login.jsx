import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
if (response.ok) {
  setMessage("✅ Login successful!");

  localStorage.setItem("access",       data.access);
  localStorage.setItem("refresh",      data.refresh);
  localStorage.setItem("username",     data.username);
  localStorage.setItem("user_id",      data.user_id);        // ← ADD THIS
  localStorage.setItem("role",         data.role);
  localStorage.setItem("is_superuser", data.is_superuser ? "true" : "false");

  if (data.is_subscribed) {
    localStorage.setItem("subscription", "true");
  } else {
    localStorage.removeItem("subscription");
  }

  window.dispatchEvent(new Event("storage"));
  setTimeout(() => navigate("/User"), 1000);
} else {
        setMessage(`❌ ${data.detail || data.error || "Invalid email or password."}`);
      }

    } catch (error) {
      setMessage("❌ Server error. Try again.");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        {message && <p className="login-message">{message}</p>}

        <p className="signup-text">
          Don't have an account? <Link to="/signup">Sign up now</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;