import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import brandlogo from "../assets/brandlogo.png";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "user");

  // Re-read role whenever route changes or storage updates
  useEffect(() => {
    const sync = () => setRole(localStorage.getItem("role") || "user");
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [location]);

  
  const userMenuItems = [
    { name: "Overview",      path: "/User",          icon: "📊" },
    { name: "AI Tracker",    path: "/AiTracker",     icon: "🤖" },
    { name: "Meal Plan",     path: "/MealPlan",      icon: "🍽️" },
    { name: "Consultations", path: "/consultations", icon: "📅" },
    { name: "Profile",       path: "/Profile",       icon: "👤" },
    { name: "Blogs",         path: "/blogs",         icon: "📝" },
  ];

  const nutritionistMenuItems = [
    { name: "Dashboard",     path: "/nutritionist",  icon: "🧑‍⚕️" },
    { name: "Profile",       path: "/Profile",       icon: "👤" },
  ];

  let menuItems = role === "nutritionist" ? nutritionistMenuItems : userMenuItems;

  if (localStorage.getItem("is_superuser") === "true") {
    menuItems = [...menuItems, { name: "Admin", path: "/admin", icon: "🛠️" }];
  }

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  return (
    <aside className={`nc-sidebar ${isOpen ? "open" : "collapsed"}`}>

      <div className="nc-sidebar-top">
        <button className="nc-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
        <div className="nc-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img src={brandlogo} alt="Perfect Body" className="nc-logo-img" />
          {isOpen && <span className="nc-logo-text">Perfect <em>Body</em></span>}
        </div>
      </div>

      <nav className="nc-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nc-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nc-nav-icon">{item.icon}</span>
            {isOpen && <span className="nc-nav-label">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="nc-sidebar-bottom">
        {confirmOpen ? (
          <div className="nc-logout-confirm">
            {isOpen && <span className="nc-logout-confirm-text">Log out?</span>}
            <button className="nc-confirm-yes" onClick={handleLogout}>✓</button>
            <button className="nc-confirm-no" onClick={() => setConfirmOpen(false)}>✕</button>
          </div>
        ) : (
          <button className="nc-nav-item nc-logout" onClick={() => setConfirmOpen(true)}>
            <span className="nc-nav-icon">→</span>
            {isOpen && <span className="nc-nav-label">Log out</span>}
          </button>
        )}
      </div>

    </aside>
  );
}