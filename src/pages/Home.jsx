import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ added useLocation
import "./Home.css";
import brandlogo from "../assets/brandlogo.png";
import ananas from "../assets/ananas.jpg";
import apple from "../assets/apple.jpg";
import avoca from "../assets/avoca.jpg";
import blueberries from "../assets/blueberries.jpg";
import brocoli from "../assets/brocoli.jpg";
import carrots from "../assets/carrots.jpg";
import eggs from "../assets/eggs.jpg";
import food from "../assets/food.jpg";
import fruite from "../assets/fruite.webp";
import salad from "../assets/salad.jpg";
import salade from "../assets/salade.jpg";
import strawberies from "../assets/strawberies.jpg";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

/* ── HERO ── */
function Hero() {
  const navigate = useNavigate();

  const bubbles = [
    { img: salad,        alt: "salad",        x: 8,  y: 15, size: 110, delay: 0   },
    { img: apple,        alt: "apple",        x: 84, y: 8,  size: 90,  delay: 0.4 },
    { img: avoca,        alt: "avocado",      x: 4,  y: 58, size: 100, delay: 0.8 },
    { img: fruite,       alt: "fruit",        x: 89, y: 52, size: 85,  delay: 0.2 },
    { img: ananas,       alt: "ananas",       x: 12, y: 78, size: 115, delay: 1.0 },
    { img: brocoli,      alt: "brocoli",      x: 79, y: 76, size: 95,  delay: 0.6 },
    { img: blueberries,  alt: "berries",      x: 48, y: 4,  size: 80,  delay: 1.2 },
    { img: carrots,      alt: "carrots",      x: 91, y: 28, size: 88,  delay: 0.9 },
    { img: eggs,         alt: "eggs",         x: 2,  y: 35, size: 78,  delay: 1.4 },
    { img: food,         alt: "food",         x: 68, y: 86, size: 92,  delay: 0.3 },
    { img: salade,       alt: "salade",       x: 33, y: 91, size: 84,  delay: 0.7 },
    { img: strawberies,  alt: "strawberries", x: 58, y: 2,  size: 76,  delay: 1.1 },
  ];

  return (
    <section className="hm-hero">
      <div className="hm-blob hm-blob-1" />
      <div className="hm-blob hm-blob-2" />
      <div className="hm-blob hm-blob-3" />

      {bubbles.map((b, i) => (
        <div
          key={i}
          className="hm-bubble"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s` }}
        >
          <img src={b.img} alt={b.alt} className="hm-bubble-img" />
        </div>
      ))}

      <div className="hm-grid-overlay" />

      <div className="hm-hero-content">
        <div className="hm-badge">
          <span>🌿</span> AI-Powered Nutrition Platform
        </div>

        <h1 className="hm-hero-title">
          Your Journey to{" "}
          <span className="hm-green-gradient">Healthier<br />Living</span>{" "}
          Starts Here
        </h1>

        <p className="hm-hero-sub">
          Personalized dietary assessments, AI-powered calorie tracking, and<br />
          expert nutritionist consultations — all in one platform.
        </p>

        <div className="hm-hero-cta">
          <button className="hm-btn-primary hm-btn-lg" onClick={() => navigate("/Signup")}>
            Get Started Free &nbsp;→
          </button>
          <button className="hm-btn-outline hm-btn-lg" onClick={() => navigate("/About")}>
            Learn More
          </button>
        </div>

        <div className="hm-stats">
          <div className="hm-stat">
            <span className="hm-stat-val">10K+</span>
            <span className="hm-stat-lbl">Active Users</span>
          </div>
          <div className="hm-stat-divider" />
          <div className="hm-stat">
            <span className="hm-stat-val">500+</span>
            <span className="hm-stat-lbl">Meal Plans</span>
          </div>
          <div className="hm-stat-divider" />
          <div className="hm-stat">
            <span className="hm-stat-val">50+</span>
            <span className="hm-stat-lbl">Experts</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES ── */
const features = [
  { icon: "🧠", title: "AI Calorie Tracking",  desc: "Upload a food photo and get instant calorie estimates powered by AI." },
  { icon: "🥗", title: "Personalized Plans",    desc: "Custom meal plans tailored to your goals, allergies, and preferences." },
  { icon: "📅", title: "Expert Consultations",  desc: "Book 1-on-1 sessions with certified nutritionists via video call." },
  { icon: "📈", title: "Progress Tracking",     desc: "Monitor your weight, calories, and health metrics with beautiful charts." },
  { icon: "👥", title: "Community Support",     desc: "Connect with others on similar health journeys for motivation." },
  { icon: "⚡", title: "Smart Reminders",       desc: "Never miss a meal or supplement with intelligent notifications." },
];

function Features() {
  return (
    <section className="hm-section hm-features" id="features">
      <div className="hm-section-inner">
        <div className="hm-section-head">
          <h2 className="hm-section-title">
            Everything You Need for{" "}
            <span className="hm-green-gradient">Better Nutrition</span>
          </h2>
          <p className="hm-section-sub">
            Our comprehensive platform combines cutting-edge AI with expert guidance.
          </p>
        </div>

        <div className="hm-feat-grid">
          {features.map((f, i) => (
            <div key={i} className="hm-feat-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="hm-feat-icon">{f.icon}</div>
              <h3 className="hm-feat-title">{f.title}</h3>
              <p className="hm-feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
const testimonials = [
  { stars: 5, quote: "Perfect Body completely changed my relationship with food. The AI tracking is so easy!", name: "Sarah M.",     role: "Lost 12kg in 3 months" },
  { stars: 5, quote: "The personalized meal plans during Ramadan were a game changer for me.",                 name: "Ahmed K.",     role: "Fitness Enthusiast"    },
  { stars: 5, quote: "I recommend Perfect Body to all my patients. The platform makes tracking effortless.",   name: "Dr. Fatima L.", role: "Nutritionist"         },
];

function Testimonials() {
  return (
    <section className="hm-section hm-testimonials" id="testimonials">
      <div className="hm-section-inner">
        <div className="hm-section-head">
          <h2 className="hm-section-title">
            Loved by <span className="hm-green-gradient">Thousands</span>
          </h2>
        </div>

        <div className="hm-testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="hm-testi-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hm-stars">{"★".repeat(t.stars)}</div>
              <p className="hm-testi-quote">"{t.quote}"</p>
              <div className="hm-testi-author">
                <span className="hm-testi-name">{t.name}</span>
                <span className="hm-testi-role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PRICING ── */
const plans = [
  {
    name: "Monthly",
    price: 29,
    duration: "month",
    popular: false,
    features: ["AI Calorie Tracking", "Basic Meal Plans", "Community Access", "Weekly Reports"],
  },
  {
    name: "Seasonal",
    price: 69,
    duration: "3 months",
    popular: true,
    features: ["Everything in Monthly", "1 Nutritionist Session", "Custom Meal Plans", "Priority Support", "Advanced Analytics"],
  },
  {
    name: "Ramadan Special",
    price: 49,
    duration: "month",
    popular: false,
    features: ["Iftar & Suhoor Plans", "Fasting Nutrition Guide", "AI Tracking", "Daily Tips", "Community Group"],
  },
];

function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsSubscribed(
        localStorage.getItem("subscription") === "true" ||
        localStorage.getItem("role") === "subscribed"
      );
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [location]); // re-runs whenever the route changes

  if (isSubscribed) return null;

  const handleChoosePlan = (plan) => {
    navigate(
      `/payment?name=${encodeURIComponent(plan.name)}&price=${plan.price}&duration=${encodeURIComponent(plan.duration)}`
    );
  };

  return (
    <section className="hm-section hm-pricing" id="pricing">
      <div className="hm-section-inner">
        <div className="hm-section-head">
          <h2 className="hm-section-title">
            Simple, Transparent <span className="hm-green-gradient">Pricing</span>
          </h2>
        </div>

        <div className="hm-plan-grid">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`hm-plan-card ${p.popular ? "popular" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {p.popular && <div className="hm-popular-badge">Most Popular</div>}
              <h3 className="hm-plan-name">{p.name}</h3>
              <div className="hm-plan-price">
                <span className="hm-price-dollar">$</span>
                <span className="hm-price-val">{p.price}</span>
                <span className="hm-price-dur">/{p.duration}</span>
              </div>
              <ul className="hm-plan-features">
                {p.features.map((f, j) => (
                  <li key={j}><span className="hm-check">✓</span> {f}</li>
                ))}
              </ul>
              <button
                className={`hm-plan-btn ${p.popular ? "hm-plan-btn-primary" : "hm-plan-btn-outline"}`}
                onClick={() => handleChoosePlan(p)}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
// function Footer() {
//   return (
//     <footer className="hm-footer">
//       <div className="hm-footer-inner">
//         <div className="hm-footer-brand">
//           <img src={brandlogo} alt="Perfect Body" className="hm-footer-logo" />
//           <span className="hm-footer-name">Perfect <em>Body</em></span>
//         </div>
//         <p className="hm-footer-copy">© 2026 Perfect Body. All rights reserved.</p>
//         <div className="hm-footer-links">
//           <a href="#">Privacy</a>
//           <a href="#">Terms</a>
//           <a href="#">Contact</a>
//         </div>
//       </div>
//     </footer>
//   );
// }

/* ── HOME PAGE ── */
export default function Home() {
  return (
    <div className="hm-root">
      <Nav />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}