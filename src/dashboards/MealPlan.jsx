import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Sidebar from "../components/Sidebar";

const MEAL_PLANS = [
  {
    id: "weight-loss",
    name: "Weight Loss Plan",
    meta: "Low calorie, high protein",
    weeks: [{
      week: 1,
      meals: [
        { id: "b1", name: "Oatmeal + berries", kcal: 320 },
        { id: "l1", name: "Chicken salad", kcal: 450 },
        { id: "d1", name: "Grilled fish + vegetables", kcal: 400 },
      ],
    }],
  },
  {
    id: "muscle-gain",
    name: "Muscle Gain Plan",
    meta: "High protein, higher calories",
    weeks: [{
      week: 1,
      meals: [
        { id: "b1", name: "Eggs + toast + peanut butter", kcal: 550 },
        { id: "l1", name: "Rice + beef + olive oil", kcal: 750 },
        { id: "d1", name: "Salmon + pasta", kcal: 700 },
      ],
    }],
  },
  {
    id: "maintenance",
    name: "Maintenance Plan",
    meta: "Balanced diet",
    weeks: [{
      week: 1,
      meals: [
        { id: "b1", name: "Yogurt + fruit", kcal: 300 },
        { id: "l1", name: "Chicken + rice", kcal: 600 },
        { id: "d1", name: "Soup + bread", kcal: 500 },
      ],
    }],
  },
];

const planCalorieTargets = {
  "weight-loss": 1500,
  "muscle-gain": 2800,
  maintenance: 2000,
};

const planMeta = [
  { label: "DIET TYPE", emoji: "🌿" },
  { label: "DAILY TARGET", emoji: "🔥" },
];

export default function MealPlan() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(MEAL_PLANS[0]);
  const [weekIndex] = useState(0);
  const [checked, setChecked] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // nutritionist-assigned meals (fetched from backend)
  const [assignedMeals, setAssignedMeals] = useState([]);
  const [hasAssignedPlan, setHasAssignedPlan] = useState(false);

  // user-added custom meals (localStorage)
  const [customMeals, setCustomMeals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [newMealName, setNewMealName] = useState("");
  const [newMealKcal, setNewMealKcal] = useState("");

  const logging = useRef(false);

  // All meals shown = preset plan + assigned + user-added custom
  // If nutritionist assigned meals, they replace the preset meals but user custom ones stay
  const baseMeals = hasAssignedPlan
    ? assignedMeals
    : selectedPlan.weeks[weekIndex].meals;

  const allMeals = [...baseMeals, ...customMeals];
  const TOTAL_ITEMS = allMeals.length;

  // Check subscription
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) { setIsSubscribed(false); return; }

    fetch("http://127.0.0.1:8000/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const subbed =
          data.is_subscribed === true ||
          data.role === "subscribed" ||
          data.role === "nutritionist" ||
          data.role === "admin";
        setIsSubscribed(subbed);
        if (subbed) localStorage.setItem("subscription", "true");
        else localStorage.removeItem("subscription");
        window.dispatchEvent(new Event("storage"));
      })
      .catch(() => {
        setIsSubscribed(
          localStorage.getItem("subscription") === "true" ||
          ["subscribed", "nutritionist", "admin"].includes(localStorage.getItem("role"))
        );
      });
  }, []);

  // Fetch nutritionist-assigned meal plan
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    fetch("http://127.0.0.1:8000/api/my-meal-plan/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.meals?.length > 0) {
          setAssignedMeals(data.meals);
          setHasAssignedPlan(true);
        } else {
          setHasAssignedPlan(false);
        }
      })
      .catch(() => {});
  }, []);

  // Load saved checkboxes
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;
    const key = `mp_checked_${username}_${selectedPlan.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setChecked(JSON.parse(saved)); }
      catch { setChecked({}); }
    } else {
      setChecked({});
    }
  }, [selectedPlan.id]);

  // Load user-added custom meals (localStorage)
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) return;
    const key = `mp_custom_${username}_${selectedPlan.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setCustomMeals(JSON.parse(saved)); }
      catch { setCustomMeals([]); }
    } else {
      setCustomMeals([]);
    }
  }, [selectedPlan.id]);

  const logMeal = async (mealName, calories) => {
    if (logging.current) return;
    logging.current = true;
    const username = localStorage.getItem("username");
    try {
      await fetch("http://127.0.0.1:8000/log-meal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, meal_name: mealName, calories }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      logging.current = false;
    }
  };

  const toggle = (id, item) => {
    setChecked((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      const username = localStorage.getItem("username");
      if (username) {
        localStorage.setItem(
          `mp_checked_${username}_${selectedPlan.id}`,
          JSON.stringify(newState)
        );
      }
      if (newState[id]) logMeal(item.name, item.kcal);
      return newState;
    });
  };

  const handleAddMealClick = () => {
    if (isSubscribed) setShowAddModal(true);
    else setShowSubModal(true);
  };

  const saveCustomMeal = () => {
    const name = newMealName.trim();
    const kcal = parseInt(newMealKcal, 10);
    if (!name || isNaN(kcal) || kcal <= 0) return;
    const meal = { id: `custom_${Date.now()}`, name, kcal };
    const updated = [...customMeals, meal];
    setCustomMeals(updated);
    const username = localStorage.getItem("username");
    if (username) {
      localStorage.setItem(
        `mp_custom_${username}_${selectedPlan.id}`,
        JSON.stringify(updated)
      );
    }
    setNewMealName("");
    setNewMealKcal("");
    setShowAddModal(false);
  };

  const deleteCustomMeal = (id) => {
    const updated = customMeals.filter((m) => m.id !== id);
    setCustomMeals(updated);
    const username = localStorage.getItem("username");
    if (username) {
      localStorage.setItem(
        `mp_custom_${username}_${selectedPlan.id}`,
        JSON.stringify(updated)
      );
    }
    setChecked((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progressPct = TOTAL_ITEMS > 0 ? Math.round((completedCount / TOTAL_ITEMS) * 100) : 0;
  const checkedCalories = allMeals.filter((item) => checked[item.id]).reduce((sum, item) => sum + item.kcal, 0);
  const baseDailyTarget = planCalorieTargets[selectedPlan.id] || 2000;
  const remainingCalories = baseDailyTarget - checkedCalories;
  const dietType = selectedPlan.meta;

  return (
    <div className="nc-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="nc-main">
        <div className="mp-content">

          {/* Plan selector — hidden if nutritionist assigned a plan */}
          {!hasAssignedPlan && (
            <div className="mp-plan-selector-cards">
              {MEAL_PLANS.map((plan) => {
                const icon = plan.id === "weight-loss" ? "🥗" : plan.id === "muscle-gain" ? "💪" : "⚖️";
                return (
                  <button
                    key={plan.id}
                    className={`mp-plan-card-new ${selectedPlan.id === plan.id ? "active" : ""}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <span className="mp-plan-icon">{icon}</span>
                    <span className="mp-plan-name-new">{plan.name}</span>
                    <span className="mp-plan-meta-new">{plan.meta}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Assigned plan banner */}
          {hasAssignedPlan && (
            <div className="mp-assigned-banner">
              <span className="mp-assigned-icon">🧑‍⚕️</span>
              <div>
                <strong>Your nutritionist has set a custom plan for you</strong>
                <p>This plan was created specifically for your goals. You can still add your own meals below.</p>
              </div>
            </div>
          )}

          {/* Page heading */}
          <div className="mp-heading">
            <p className="mp-eyebrow">PERSONALIZED FOR YOU</p>
            <h1 className="mp-title">My nutrition <em>plan</em></h1>
            <p className="mp-subtitle">
              {hasAssignedPlan
                ? "A personalised plan set by your nutritionist."
                : `A ${dietType.toLowerCase()} plan tailored to your goals.`}
            </p>
          </div>

          {/* Meta cards */}
          <div className="mp-meta-grid">
            {planMeta.map((m) => {
              const value = m.label === "DIET TYPE"
                ? (hasAssignedPlan ? "Custom Plan" : dietType)
                : `${remainingCalories.toLocaleString()} kcal`;
              return (
                <div key={m.label} className="mp-meta-card">
                  <div className="mp-meta-emoji">{m.emoji}</div>
                  <p className="mp-meta-label">{m.label}</p>
                  <p className="mp-meta-value">{value}</p>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mp-progress-card">
            <div className="mp-progress-top">
              <div>
                <span className="mp-progress-title">Today's <em>progress</em></span>
                <p className="mp-progress-sub">{completedCount} of {TOTAL_ITEMS} meals completed</p>
              </div>
              <span className="mp-progress-pct">{progressPct}%</span>
            </div>
            <div className="mp-bar">
              <div className="mp-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Meal items */}
          <div className="mp-meals">
            {allMeals.map((item) => (
              <div
                key={item.id}
                className={`mp-item-row ${checked[item.id] ? "checked" : ""}`}
                onClick={() => toggle(item.id, item)}
              >
                <div className="mp-checkbox">
                  {checked[item.id] && <span className="mp-check-mark">✓</span>}
                </div>
                <span className="mp-item-name">{item.name}</span>
                <span className="mp-item-kcal">{item.kcal} kcal</span>
                {String(item.id).startsWith("custom_") && (
                  <button
                    className="mp-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteCustomMeal(item.id); }}
                    title="Remove meal"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add custom meal button */}
          <button className="mp-add-btn" onClick={handleAddMealClick}>
            {isSubscribed ? "＋ Add Custom Meal" : "🔒 Add Custom Meal"}
          </button>

        </div>
      </main>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="mp-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Custom Meal</h2>
            <p className="mp-modal-sub">This meal will be saved to your plan.</p>
            <input
              className="mp-modal-input"
              type="text"
              placeholder="Meal name (e.g. Greek yogurt)"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
            />
            <input
              className="mp-modal-input"
              type="number"
              placeholder="Calories (kcal)"
              value={newMealKcal}
              onChange={(e) => setNewMealKcal(e.target.value)}
            />
            <div className="mp-modal-actions">
              <button className="mp-modal-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="mp-modal-confirm" onClick={saveCustomMeal}>Add Meal</button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribe Modal */}
      {showSubModal && (
        <div className="mp-modal-overlay" onClick={() => setShowSubModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-lock">🔒</div>
            <h2>Premium Feature</h2>
            <p className="mp-modal-sub">
              Custom meal plans are available for subscribed users only.
              Upgrade to unlock this feature and much more.
            </p>
            <div className="mp-modal-actions">
              <button className="mp-modal-cancel" onClick={() => setShowSubModal(false)}>Maybe Later</button>
              <button
                className="mp-modal-confirm"
                onClick={() => { setShowSubModal(false); navigate("/payment"); }}
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}