import { useState, useEffect } from "react";
import logo from '../assets/brandlogo.png';
import { useLocation, useNavigate } from 'react-router-dom';

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("access"));

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sync = () =>
      setToken(localStorage.getItem("access"));

    sync();

    window.addEventListener("storage", sync);

    return () =>
      window.removeEventListener("storage", sync);
  }, [location]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className={`hm-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="hm-nav-inner">

        <div className="hm-nav-brand">
          <img
            src={logo}
            alt="Perfect Body"
            className="hm-nav-logo"
          />

          <span className="hm-nav-name">
            Perfect <em>Body</em>
          </span>
        </div>

        <div className="hm-nav-links">

          {isHome ? (
            <>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("features");
                }}
              >
                Features
              </a>

              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("pricing");
                }}
              >
                Pricing
              </a>

              <a
                href="#testimonials"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("testimonials");
                }}
              >
                Reviews
              </a>
               <button
                className="hm-nav-link-btn"
                onClick={() => navigate("/Blogs")}
              >
                Blogs
              </button>

              <button
                className="hm-nav-link-btn"
                onClick={() => navigate("/About")}
              >
                About
              </button>
            </>
          ) : (
            <button
              className="hm-btn-back"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          )}

        </div>

        <div className="hm-nav-actions">
          {token ? (
            <button
              className="hm-btn-primary"
              onClick={() => navigate("/User")}
            >
              Profile
            </button>
          ) : (
            <>
              <button
                className="hm-btn-ghost"
                onClick={() => navigate("/Login")}
              >
                Log in
              </button>

              <button
                className="hm-btn-primary"
                onClick={() => navigate("/Signup")}
              >
                Get Started
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Nav;