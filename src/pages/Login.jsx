import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../components/Button";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,  
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Login successful!");
        
       
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setTimeout(() => {
          navigate("/User");
        }, 1000);
      } else {
        setMessage("❌ " + (data.error || "Login failed"));
      }
    } catch {
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
          Don't have an account?{" "}
          <Link to="/signup">Sign up now</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;