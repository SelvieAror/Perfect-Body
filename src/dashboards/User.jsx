import React, { useState, useEffect } from "react";
import "../App.css";

import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const GOAL_PERCENT = 72;

/* ── RING ── */
function RingProgress({ percent }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="pb-ring">
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ffffff33" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#c8f04a"
          strokeWidth="9"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>

      <div className="pb-ring-inner">
        <span className="pb-ring-val">{percent}%</span>
        <span className="pb-ring-label">Daily goal</span>
      </div>
    </div>
  );
}

/* ── HERO ── */
function HeroBanner({ username }) {
  return (
    <div className="pb-dash-hero">
      <div className="pb-hero-content">
        <span className="pb-eyebrow">Thursday · April 30</span>
        <h1>Welcome back, <em>{username}</em>.</h1>
        <p>
          You're {GOAL_PERCENT}% to today's goal. One mindful meal at a time — keep going.
        </p>

        <div className="pb-dash-hero-actions">
          <button className="pb-btn pb-btn-gold">Log a meal →</button>
          <button className="pb-btn pb-btn-light">View plan</button>
        </div>
      </div>

      <RingProgress percent={GOAL_PERCENT} />
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon, value, label, color }) {
  return (
    <div className="nc-stat-card">
      <span className="nc-stat-icon">{icon}</span>
      <div className="nc-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="nc-stat-label">{label}</div>
    </div>
  );
}

/* ── MAIN ── */
export default function User() {

  const [weight, setWeight] = useState(0);
  const [goal, setGoal] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);

  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);

  const displayName =
    localStorage.getItem("username") || "User";

  /* ── TOTAL CALORIES ── */
  const totalCalories = meals.reduce(
    (sum, meal) => sum + Number(meal.calories),
    0
  );

  /* ── FETCH MEALS ── */
  const fetchMeals = async () => {
    const username = localStorage.getItem("username");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/get-meals/?username=${username}`
      );

      const data = await response.json();

      if (response.ok) {
        setMeals(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ── FETCH PROFILE ── */
  const fetchProfile = async () => {
    const username = localStorage.getItem("username");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/get-profile/?username=${username}`
      );

      const data = await response.json();

      if (response.ok) {
        setWeight(data.weight || 0);
        setGoal(data.goal || "No goal");
        setFirstName(data.first_name || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ── FETCH CONSULTATIONS (SYNC WITH PAGE) ── */
  const fetchConsultations = async () => {
    const username = localStorage.getItem("username");
    try {
      // ✅ fixed: /api/ prefix to match your urls.py
      const response = await fetch(
        `http://127.0.0.1:8000/api/get-consultations/?username=${username}`
      );
      const data = await response.json();
      if (response.ok) setConsultations(data);
    } catch (err) {
      console.error(err);
    }
  };
  /* ── LOG MEAL ── */
  const logMeal = async () => {
    const username = localStorage.getItem("username");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/log-meal/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            meal_name: mealName,
            calories,
          }),
        }
      );

      if (response.ok) {
        fetchMeals();
        setMealName("");
        setCalories("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ── DELETE MEAL ── */
  const deleteMeal = async (mealId) => {
    const username = localStorage.getItem("username");

    try {
      await fetch(
        `http://127.0.0.1:8000/delete-meal/?meal_id=${mealId}&username=${username}`,
        { method: "DELETE" }
      );

      fetchMeals();
    } catch (err) {
      console.error(err);
    }
  };

  /* ── INIT ── */
  useEffect(() => {
    fetchMeals();
    fetchProfile();
    fetchConsultations();
  }, []);

  const nextConsultation = consultations.find(c => c.status === "upcoming") || null;

  return (
    <div className="nc-layout">

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="nc-main">

        <div className="nc-content">

          <HeroBanner username={displayName} />

          {/* ── STATS ── */}
          <div className="nc-stats-row">

            <StatCard
              icon="🔥"
              value={totalCalories.toLocaleString()}
              label="Calories Today"
              color="#22c97a"
            />

            <StatCard
              icon="⚖️"
              value={`${weight} kg`}
              label="Current Weight"
              color="#22c97a"
            />

            <StatCard
              icon="🎯"
              value={goal}
              label="Current Goal"
              color="#22c97a"
            />

          </div>

          {/* ── PANELS ── */}
          <div className="nc-panels">

            {/* MEALS */}
            <div className="nc-card nc-meals">

              <div className="nc-card-header">

                <h3>Today's Meals</h3>

                <input
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Meal name"
                />

                <input
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories"
                  type="number"
                />

                <button onClick={logMeal}>
                  + Log Meal
                </button>

              </div>

              <table className="nc-meals-table">

                <thead>
                  <tr>
                    <th>MEAL</th>
                    <th>TIME</th>
                    <th>CALORIES</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {meals.map((meal) => (
                    <tr key={meal.id}>
                      <td>{meal.meal_name}</td>
                      <td>{meal.time || "Today"}</td>
                      <td>{meal.calories} kcal</td>
                      <td>
                        <button onClick={() => deleteMeal(meal.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* CONSULTATION (SYNCED) */}
{/* CONSULTATION */}
<div className="nc-card nc-consult">
  <h3>Next Consultation</h3>

  {nextConsultation ? (
    <div className="nc-consult-card">

      <div className="nc-doctor-name">
        {nextConsultation.nutritionist}
      </div>

      <div className="nc-consult-time">
        {nextConsultation.date} — {nextConsultation.time}
      </div>

      <div className="nc-consult-via">
        Status: {nextConsultation.status}
      </div>

      <div className="nc-consult-actions">
        {/* ✅ identical logic to Consultations.jsx */}
        {nextConsultation.status === "upcoming" ? (
          <a
            href="https://meet.google.com/prf-ncib-ffz"
            target="_blank"
            rel="noopener noreferrer"
            className="nc-zoom-btn"
          >
            Join Session
          </a>
        ) : (
          <span className="nc-notes">{nextConsultation.notes}</span>
        )}

        <button
          className="nc-viewall-btn"
          onClick={() => navigate("/consultations")}
        >
          View All
        </button>
      </div>

    </div>
  ) : (
    <div className="nc-consult-empty">
      <p>No upcoming consultations.</p>
      <button
        className="nc-zoom-btn"
        onClick={() => navigate("/consultations")}
      >
        Book a Session
      </button>
    </div>
  )}
</div>



            </div>

          </div>

       

      </main>

    </div>
  );
}