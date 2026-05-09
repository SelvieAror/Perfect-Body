import { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Register
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ " + (data.error || "Registration failed"));
        return;
      }

      // Step 2: Store tokens from registration response (backend now returns them)
      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", data.username);
        if (data.role) localStorage.setItem("role", data.role);
        if (data.is_subscribed) localStorage.setItem("subscription", "true");

        // Trigger sidebar/nav to refresh auth state
        window.dispatchEvent(new Event("storage"));

        navigate("/User");
      } else {
        // Fallback: tokens not returned — just go to login
        alert("✅ Account created! Please log in.");
        navigate("/login");
      }

    } catch (err) {
      console.error(err);
      alert("❌ Error connecting to server");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Create Account</h1>
        <p>Join us and start your journey</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="150"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={formData.gender === "" ? "placeholder-select" : "selected"}
          >
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>

          <button type="submit">Sign Up</button>

          <p className="login-text">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;