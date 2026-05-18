import { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";

const API = "http://127.0.0.1:8000/api";

const PRESET_PLANS = {
  "weight-loss": [
    { id: "b1", name: "Oatmeal + berries", kcal: 320 },
    { id: "l1", name: "Chicken salad", kcal: 450 },
    { id: "d1", name: "Grilled fish + vegetables", kcal: 400 },
  ],
  "muscle-gain": [
    { id: "b1", name: "Eggs + toast + peanut butter", kcal: 550 },
    { id: "l1", name: "Rice + beef + olive oil", kcal: 750 },
    { id: "d1", name: "Salmon + pasta", kcal: 700 },
  ],
  maintenance: [
    { id: "b1", name: "Yogurt + fruit", kcal: 300 },
    { id: "l1", name: "Chicken + rice", kcal: 600 },
    { id: "d1", name: "Soup + bread", kcal: 500 },
  ],
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  };
}

function StatCard({ title, value, icon }) {
  return (
    <div className="nc-stat-card">
      <div className="nc-stat-icon">{icon}</div>
      <div className="nc-stat-value">{value}</div>
      <div className="nc-stat-label">{title}</div>
    </div>
  );
}

// ── Meal Plan Editor Modal ──────────────────────────────────────────────────
function MealPlanModal({ patient, onClose }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [newKcal, setNewKcal] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editKcal, setEditKcal] = useState("");
  const [preset, setPreset] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/nutritionist/patients/${patient.id}/meal-plan/`,
          { headers: authHeaders() }
        );
        if (res.ok) {
          const data = await res.json();
          setMeals(data.meals || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patient.id]);

  const totalKcal = meals.reduce((s, m) => s + Number(m.kcal), 0);

  const addMeal = () => {
    const name = newName.trim();
    const kcal = parseInt(newKcal, 10);
    if (!name || isNaN(kcal) || kcal <= 0) return;
    setMeals((prev) => [
      ...prev,
      { id: `meal_${Date.now()}`, name, kcal },
    ]);
    setNewName("");
    setNewKcal("");
    setSaveMsg("");
  };

  const removeMeal = (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    setSaveMsg("");
  };

  const startEdit = (meal) => {
    setEditingId(meal.id);
    setEditName(meal.name);
    setEditKcal(String(meal.kcal));
  };

  const commitEdit = (id) => {
    const name = editName.trim();
    const kcal = parseInt(editKcal, 10);
    if (!name || isNaN(kcal) || kcal <= 0) return;
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name, kcal } : m))
    );
    setEditingId(null);
    setSaveMsg("");
  };

  const applyPreset = (key) => {
    if (!key) return;
    const base = PRESET_PLANS[key] || [];
    // Keep custom meals, replace preset ones
    const customOnly = meals.filter((m) => m.id.startsWith("meal_"));
    setMeals([
      ...base.map((m) => ({ ...m, id: `preset_${m.id}_${Date.now()}` })),
      ...customOnly,
    ]);
    setPreset("");
    setSaveMsg("");
  };

  const save = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(
        `${API}/nutritionist/patients/${patient.id}/meal-plan/save/`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ meals }),
        }
      );
      if (res.ok) setSaveMsg("✅ Plan saved!");
      else setSaveMsg("❌ Failed to save.");
    } catch {
      setSaveMsg("❌ Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div
        className="nmp-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="nmp-modal-header">
          <div>
            <h2 className="nmp-modal-title">
              {patient.full_name}'s Meal Plan
            </h2>
            <p className="nmp-modal-sub">
              {patient.goal} · {patient.age ? `${patient.age} yrs` : ""}{" "}
              {patient.weight ? `· ${patient.weight} kg` : ""}
            </p>
          </div>
          <button className="nmp-modal-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="nmp-loading">Loading plan…</div>
        ) : (
          <div className="nmp-body">

            {/* Left: meal list */}
            <div className="nmp-left">
              <div className="nmp-section-label">
                Current Plan
                <span className="nmp-kcal-total">{totalKcal} kcal total</span>
              </div>

              {meals.length === 0 ? (
                <p className="nmp-empty">No meals yet. Add some or load a preset.</p>
              ) : (
                <div className="nmp-meal-list">
                  {meals.map((meal) =>
                    editingId === meal.id ? (
                      <div key={meal.id} className="nmp-meal-row nmp-meal-row--editing">
                        <input
                          className="nmp-edit-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Meal name"
                          autoFocus
                        />
                        <input
                          className="nmp-edit-input nmp-edit-input--kcal"
                          type="number"
                          value={editKcal}
                          onChange={(e) => setEditKcal(e.target.value)}
                          placeholder="kcal"
                        />
                        <button
                          className="nmp-btn nmp-btn--save"
                          onClick={() => commitEdit(meal.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="nmp-btn nmp-btn--cancel"
                          onClick={() => setEditingId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div key={meal.id} className="nmp-meal-row">
                        <span className="nmp-meal-dot" />
                        <span className="nmp-meal-name">{meal.name}</span>
                        <span className="nmp-meal-kcal">{meal.kcal} kcal</span>
                        <button
                          className="nmp-btn nmp-btn--edit"
                          onClick={() => startEdit(meal)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="nmp-btn nmp-btn--remove"
                          onClick={() => removeMeal(meal.id)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Add meal */}
              <div className="nmp-section-label" style={{ marginTop: "1.25rem" }}>
                Add Meal
              </div>
              <div className="nmp-add-row">
                <input
                  className="nmp-input"
                  placeholder="e.g. Greek yogurt + honey"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMeal()}
                />
                <input
                  className="nmp-input nmp-input--kcal"
                  type="number"
                  placeholder="kcal"
                  value={newKcal}
                  onChange={(e) => setNewKcal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMeal()}
                />
                <button className="nmp-add-btn" onClick={addMeal}>
                  + Add
                </button>
              </div>
            </div>

            {/* Right: presets + save */}
            <div className="nmp-right">
              <div className="nmp-section-label">Load Preset Plan</div>
              <p className="nmp-preset-hint">
                Load a starter plan based on the patient's goal, then customise as needed.
              </p>

              <div className="nmp-preset-cards">
                {[
                  { key: "weight-loss", icon: "🥗", label: "Weight Loss", sub: "Low cal · high protein" },
                  { key: "muscle-gain", icon: "💪", label: "Muscle Gain", sub: "High cal · high protein" },
                  { key: "maintenance", icon: "⚖️", label: "Maintenance", sub: "Balanced diet" },
                ].map((p) => (
                  <button
                    key={p.key}
                    className={`nmp-preset-card ${preset === p.key ? "active" : ""}`}
                    onClick={() => applyPreset(p.key)}
                  >
                    <span className="nmp-preset-icon">{p.icon}</span>
                    <span className="nmp-preset-label">{p.label}</span>
                    <span className="nmp-preset-sub">{p.sub}</span>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="nmp-summary">
                <div className="nmp-summary-row">
                  <span>Total meals</span>
                  <strong>{meals.length}</strong>
                </div>
                <div className="nmp-summary-row">
                  <span>Total calories</span>
                  <strong style={{ color: "var(--green-mid)" }}>{totalKcal} kcal</strong>
                </div>
              </div>

              {/* Save */}
              <button
                className="nmp-save-btn"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "💾 Save Plan"}
              </button>
              {saveMsg && (
                <p className="nmp-save-msg">{saveMsg}</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Nutritionist Page ──────────────────────────────────────────────────
export default function Nutritionist() {
  const [isOpen, setIsOpen] = useState(true);

  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    total_patients: 0,
    today_consultations: 0,
    pending_followups: 0,
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState("upcoming");
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [chatPatients, setChatPatients] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // Meal plan modal
  const [mealPlanPatient, setMealPlanPatient] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes, sRes, mRes] = await Promise.all([
          fetch(`${API}/nutritionist/patients/`, { headers: authHeaders() }),
          fetch(`${API}/nutritionist/consultations/`, { headers: authHeaders() }),
          fetch(`${API}/nutritionist/stats/`, { headers: authHeaders() }),
          fetch(`${API}/nutritionist/messages/patients/`, { headers: authHeaders() }),
        ]);
        if (pRes.ok) setPatients(await pRes.json());
        if (cRes.ok) setConsultations(await cRes.json());
        if (sRes.ok) setStats(await sRes.json());
        if (mRes.ok) setChatPatients(await mRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openConsult = (c) => {
    setSelectedConsult(c);
    setNotesInput(c.notes || "");
    setStatusInput(c.status || "upcoming");
    setSaveMsg("");
  };

  const saveNotes = async () => {
    if (!selectedConsult) return;
    try {
      const res = await fetch(
        `${API}/nutritionist/consultations/${selectedConsult.id}/notes/`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ notes: notesInput, status: statusInput }),
        }
      );
      if (res.ok) {
        setSaveMsg("✅ Saved!");
        setConsultations((prev) =>
          prev.map((c) =>
            c.id === selectedConsult.id
              ? { ...c, notes: notesInput, status: statusInput }
              : c
          )
        );
        setSelectedConsult((prev) => ({
          ...prev,
          notes: notesInput,
          status: statusInput,
        }));
      } else {
        setSaveMsg("❌ Failed to save.");
      }
    } catch {
      setSaveMsg("❌ Network error.");
    }
  };

  const fetchMessages = async (patientId) => {
    try {
      const res = await fetch(`${API}/messages/?user_id=${patientId}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;
    try {
      const res = await fetch(`${API}/send-message/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          receiver_id: activeChat.id,
          text: messageInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessageInput("");
        fetchMessages(activeChat.id);
      } else {
        alert(`Error: ${data.error || "Failed to send message"}`);
      }
    } catch (err) {
      alert("Network error sending message");
    }
  };

  const upcomingConsults = consultations.filter((c) => c.status === "upcoming");

  return (
    <div className="nc-layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="nc-main">
        <div className="nc-content">

          {/* HERO */}
          <div className="pb-dash-hero">
            <div className="pb-hero-content">
              <span className="pb-eyebrow">Nutritionist Dashboard</span>
              <h1>Manage your <em>patients</em> efficiently.</h1>
              <p>Conduct consultations, track progress, adjust meal plans, and support patients.</p>
            </div>
          </div>

          {/* STATS */}
          <div className="nc-stats-row">
            <StatCard title="My Patients" value={loading ? "…" : stats.total_patients} icon="🧑‍⚕️" />
            <StatCard title="Consultations Today" value={loading ? "…" : stats.today_consultations} icon="📅" />
            <StatCard title="Pending Follow-ups" value={loading ? "…" : stats.pending_followups} icon="📩" />
            <StatCard title="Total Consultations" value={loading ? "…" : consultations.length} icon="🥗" />
          </div>

          {/* PATIENTS + DETAILS */}
          <div className="nutritionist-grid">

            {/* PATIENTS TABLE */}
            <div className="nc-card nutritionist-patients">
              <div className="nc-card-header">
                <h3>My Patients</h3>
              </div>
              {loading ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>Loading…</p>
              ) : patients.length === 0 ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>No patients assigned yet.</p>
              ) : (
                <table className="nc-meals-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Goal</th>
                      <th>Today's kcal</th>
                      <th>Meals today</th>
                      <th>Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() =>
                          setSelectedPatient(selectedPatient?.id === p.id ? null : p)
                        }
                        style={{
                          cursor: "pointer",
                          background:
                            selectedPatient?.id === p.id
                              ? "rgba(99,211,145,0.07)"
                              : "",
                        }}
                      >
                        <td>{p.full_name}</td>
                        <td>{p.age ?? "—"}</td>
                        <td>{p.goal}</td>
                        <td style={{ color: "#63d391", fontWeight: 600 }}>
                          {p.today_calories} kcal
                        </td>
                        <td>
                          {p.today_meals.length} meal{p.today_meals.length !== 1 ? "s" : ""}
                        </td>
                        <td>
                          <button
                            className="nmp-edit-plan-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMealPlanPatient(p);
                            }}
                            title="Edit meal plan"
                          >
                            🥗 Edit Plan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PATIENT DETAILS */}
            <div className="nc-card nutritionist-plan-card">
              <div className="nc-card-header">
                <h3>Patient Detail</h3>
                {selectedPatient && (
                  <button
                    className="nmp-edit-plan-btn"
                    onClick={() => setMealPlanPatient(selectedPatient)}
                  >
                    🥗 Edit Meal Plan
                  </button>
                )}
              </div>

              {selectedPatient ? (
                <>
                  <div className="nutritionist-patient-info">
                    <p><strong>Name:</strong> {selectedPatient.full_name}</p>
                    <p><strong>Age:</strong> {selectedPatient.age ?? "—"}</p>
                    <p><strong>Weight:</strong> {selectedPatient.weight ? `${selectedPatient.weight} kg` : "—"}</p>
                    <p><strong>Height:</strong> {selectedPatient.height ? `${selectedPatient.height} cm` : "—"}</p>
                    <p><strong>Goal:</strong> {selectedPatient.goal}</p>
                    <p>
                      <strong>Today's Calories:</strong>{" "}
                      <span style={{ color: "#63d391", fontWeight: 700 }}>
                        {selectedPatient.today_calories} kcal
                      </span>
                    </p>
                  </div>

                  {selectedPatient.today_meals.length > 0 ? (
                    <table className="nc-meals-table" style={{ marginTop: "1rem" }}>
                      <thead>
                        <tr>
                          <th>Meal</th>
                          <th>Calories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPatient.today_meals.map((m, i) => (
                          <tr key={i}>
                            <td>{m.meal_name}</td>
                            <td>{m.calories} kcal</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ opacity: 0.5, marginTop: "1rem" }}>No meals logged today.</p>
                  )}
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>Click a patient to see details.</p>
              )}
            </div>
          </div>

          {/* CONSULTATIONS */}
          <div className="nutritionist-bottom-grid">

            <div className="nc-card">
              <div className="nc-card-header">
                <h3>Upcoming Consultations</h3>
              </div>
              {loading ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>Loading…</p>
              ) : upcomingConsults.length === 0 ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>No upcoming consultations.</p>
              ) : (
                <div className="consultation-list">
                  {upcomingConsults.map((c) => (
                    <div
                      key={c.id}
                      className="consultation-item"
                      style={{
                        cursor: "pointer",
                        background: selectedConsult?.id === c.id ? "rgba(99,211,145,0.07)" : "",
                        borderRadius: 10,
                      }}
                      onClick={() => openConsult(c)}
                    >
                      <div>
                        <strong>{c.patient}</strong>
                        <p style={{ opacity: 0.6, fontSize: "0.82rem" }}>{c.patient_username}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p>{c.date}</p>
                        <p>{c.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="nc-card">
              <div className="nc-card-header">
                <h3>Consultation Notes</h3>
              </div>
              {selectedConsult ? (
                <>
                  <div className="nutritionist-patient-info">
                    <p><strong>Patient:</strong> {selectedConsult.patient}</p>
                    <p><strong>Date:</strong> {selectedConsult.date} · {selectedConsult.time}</p>
                  </div>
                  <label className="nutritionist-label">Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="nutritionist-select"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <label className="nutritionist-label">Notes / Nutrition Plan</label>
                  <textarea
                    className="nutritionist-textarea"
                    placeholder="Write notes..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button className="nc-log-btn" onClick={saveNotes}>Save Notes</button>
                    {saveMsg && <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{saveMsg}</span>}
                  </div>
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>Click a consultation to edit notes.</p>
              )}
            </div>

          </div>

          {/* MESSAGING */}
          <div className="nutritionist-messages-grid">

            <div className="nc-card">
              <div className="nc-card-header">
                <h3>Patient Chats</h3>
              </div>
              <div className="chat-patient-list">
                {chatPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`chat-patient ${activeChat?.id === patient.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveChat(patient);
                      fetchMessages(patient.id);
                    }}
                  >
                    {patient.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="nc-card">
              <div className="nc-card-header">
                <h3>{activeChat ? activeChat.name : "Select a patient"}</h3>
              </div>
              {activeChat ? (
                <>
                  <div className="chat-messages">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message-bubble ${msg.is_mine ? "mine" : "theirs"}`}
                      >
                        <p>{msg.text}</p>
                        <span>{msg.created_at}</span>
                      </div>
                    ))}
                  </div>
                  <div className="messages-input">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Write message..."
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button onClick={sendMessage}>Send</button>
                  </div>
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>Select a patient to start chatting.</p>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* MEAL PLAN MODAL */}
      {mealPlanPatient && (
        <MealPlanModal
          patient={mealPlanPatient}
          onClose={() => setMealPlanPatient(null)}
        />
      )}

    </div>
  );
}