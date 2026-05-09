import { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";

const API = "http://127.0.0.1:8000/api";

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

export default function Nutritionist() {
  const [isOpen, setIsOpen] = useState(true);

  // Data
  const [patients, setPatients]           = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats]                 = useState({ total_patients: 0, today_consultations: 0, pending_followups: 0 });

  // UI state
  const [selectedPatient, setSelectedPatient]   = useState(null);
  const [selectedConsult, setSelectedConsult]   = useState(null);
  const [notesInput, setNotesInput]             = useState("");
  const [statusInput, setStatusInput]           = useState("upcoming");
  const [saveMsg, setSaveMsg]                   = useState("");
  const [loading, setLoading]                   = useState(true);

  // ── Fetch all data ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes, sRes] = await Promise.all([
          fetch(`${API}/nutritionist/patients/`,     { headers: authHeaders() }),
          fetch(`${API}/nutritionist/consultations/`,{ headers: authHeaders() }),
          fetch(`${API}/nutritionist/stats/`,        { headers: authHeaders() }),
        ]);
        if (pRes.ok) setPatients(await pRes.json());
        if (cRes.ok) setConsultations(await cRes.json());
        if (sRes.ok) setStats(await sRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Select a consultation to edit notes ──
  const openConsult = (c) => {
    setSelectedConsult(c);
    setNotesInput(c.notes || "");
    setStatusInput(c.status || "upcoming");
    setSaveMsg("");
  };

  // ── Save notes ──
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
        // Update local state so table reflects change immediately
        setConsultations(prev =>
          prev.map(c => c.id === selectedConsult.id
            ? { ...c, notes: notesInput, status: statusInput }
            : c
          )
        );
        setSelectedConsult(prev => ({ ...prev, notes: notesInput, status: statusInput }));
      } else {
        setSaveMsg("❌ Failed to save.");
      }
    } catch {
      setSaveMsg("❌ Network error.");
    }
  };

  const upcomingConsults = consultations.filter(c => c.status === "upcoming");
  const nutritionistName = localStorage.getItem("username") || "Nutritionist";

  return (
    <div className="nc-layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="nc-main">
        <div className="nc-content">

          {/* ── HERO ── */}
          <div className="pb-dash-hero">
            <div className="pb-hero-content">
              <span className="pb-eyebrow">Nutritionist Dashboard</span>
              <h1>Manage your <em>patients</em> efficiently.</h1>
              <p>Conduct consultations, track progress, adjust meal plans, and support patients throughout their journey.</p>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="nc-stats-row">
            <StatCard title="My Patients"           value={loading ? "…" : stats.total_patients}      icon="🧑‍⚕️" />
            <StatCard title="Consultations Today"   value={loading ? "…" : stats.today_consultations} icon="📅"    />
            <StatCard title="Pending Follow-ups"    value={loading ? "…" : stats.pending_followups}   icon="📩"    />
            <StatCard title="Total Consultations"   value={loading ? "…" : consultations.length}      icon="🥗"    />
          </div>

          {/* ── PATIENTS + NOTES PANEL ── */}
          <div className="nutritionist-grid">

            {/* Patients table */}
            <div className="nc-card nutritionist-patients">
              <div className="nc-card-header"><h3>My Patients</h3></div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPatient(selectedPatient?.id === p.id ? null : p)}
                        style={{ cursor: "pointer", background: selectedPatient?.id === p.id ? "rgba(99,211,145,0.07)" : "" }}
                      >
                        <td>{p.full_name}</td>
                        <td>{p.age ?? "—"}</td>
                        <td>{p.goal}</td>
                        <td style={{ color: "#63d391", fontWeight: 600 }}>{p.today_calories} kcal</td>
                        <td>{p.today_meals.length} meal{p.today_meals.length !== 1 ? "s" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Patient detail / meals */}
            <div className="nc-card nutritionist-plan-card">
              <div className="nc-card-header"><h3>Patient Detail</h3></div>

              {selectedPatient ? (
                <>
                  <div className="nutritionist-patient-info">
                    <p><strong>Name:</strong> {selectedPatient.full_name}</p>
                    <p><strong>Age:</strong> {selectedPatient.age ?? "—"}</p>
                    <p><strong>Weight:</strong> {selectedPatient.weight ? `${selectedPatient.weight} kg` : "—"}</p>
                    <p><strong>Height:</strong> {selectedPatient.height ? `${selectedPatient.height} cm` : "—"}</p>
                    <p><strong>Goal:</strong> {selectedPatient.goal}</p>
                    <p><strong>Today's Calories:</strong> <span style={{ color: "#63d391", fontWeight: 700 }}>{selectedPatient.today_calories} kcal</span></p>
                  </div>

                  {selectedPatient.today_meals.length > 0 ? (
                    <table className="nc-meals-table" style={{ marginTop: "1rem" }}>
                      <thead>
                        <tr><th>Meal</th><th>Calories</th></tr>
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
                <p style={{ opacity: 0.5 }}>Click a patient to see their details and today's meals.</p>
              )}
            </div>
          </div>

          {/* ── CONSULTATIONS ── */}
          <div className="nutritionist-bottom-grid">

            {/* Upcoming consultations list */}
            <div className="nc-card">
              <div className="nc-card-header"><h3>Upcoming Consultations</h3></div>

              {loading ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>Loading…</p>
              ) : upcomingConsults.length === 0 ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>No upcoming consultations.</p>
              ) : (
                <div className="consultation-list">
                  {upcomingConsults.map(c => (
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

            {/* Notes / status editor */}
            <div className="nc-card">
              <div className="nc-card-header"><h3>Consultation Notes</h3></div>

              {selectedConsult ? (
                <>
                  <div className="nutritionist-patient-info">
                    <p><strong>Patient:</strong> {selectedConsult.patient}</p>
                    <p><strong>Date:</strong> {selectedConsult.date} · {selectedConsult.time}</p>
                  </div>

                  <label style={{ fontSize: "0.78rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Status</label>
                  <select
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    style={{
                      width: "100%", padding: "0.6rem 0.8rem", borderRadius: 10,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff", marginBottom: "0.75rem", marginTop: "0.3rem"
                    }}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <label style={{ fontSize: "0.78rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes / Nutrition Plan</label>
                  <textarea
                    className="nutritionist-textarea"
                    placeholder="Write notes or a nutrition plan for this patient…"
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    style={{ marginTop: "0.3rem" }}
                  />

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button className="nc-log-btn" onClick={saveNotes}>Save Notes</button>
                    {saveMsg && <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{saveMsg}</span>}
                  </div>
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>Click a consultation to add or edit notes.</p>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}