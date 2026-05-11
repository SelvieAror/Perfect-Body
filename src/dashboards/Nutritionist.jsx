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

  // DATA
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    total_patients: 0,
    today_consultations: 0,
    pending_followups: 0,
  });

  // UI
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedConsult, setSelectedConsult] = useState(null);

  const [notesInput, setNotesInput] = useState("");
  const [statusInput, setStatusInput] = useState("upcoming");

  const [saveMsg, setSaveMsg] = useState("");

  const [loading, setLoading] = useState(true);

  // MESSAGING
  const [chatPatients, setChatPatients] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // FETCH ALL
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const [pRes, cRes, sRes, mRes] = await Promise.all([
          fetch(`${API}/nutritionist/patients/`, {
            headers: authHeaders(),
          }),

          fetch(`${API}/nutritionist/consultations/`, {
            headers: authHeaders(),
          }),

          fetch(`${API}/nutritionist/stats/`, {
            headers: authHeaders(),
          }),

          fetch(`${API}/nutritionist/messages/patients/`, {
            headers: authHeaders(),
          }),
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

  // OPEN CONSULT
  const openConsult = (c) => {
    setSelectedConsult(c);

    setNotesInput(c.notes || "");

    setStatusInput(c.status || "upcoming");

    setSaveMsg("");
  };

  // SAVE NOTES
  const saveNotes = async () => {
    if (!selectedConsult) return;

    try {
      const res = await fetch(
        `${API}/nutritionist/consultations/${selectedConsult.id}/notes/`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            notes: notesInput,
            status: statusInput,
          }),
        }
      );

      if (res.ok) {
        setSaveMsg("✅ Saved!");

        setConsultations((prev) =>
          prev.map((c) =>
            c.id === selectedConsult.id
              ? {
                  ...c,
                  notes: notesInput,
                  status: statusInput,
                }
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

  // FETCH CHAT
  const fetchMessages = async (patientId) => {
    try {
      const res = await fetch(`${API}/messages/?user_id=${patientId}`, { headers: authHeaders() });

      const data = await res.json();

      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SEND MESSAGE
  const sendMessage = async () => {
  if (!messageInput.trim() || !activeChat) return;

  console.log("Sending message:", {
    receiver_id: activeChat.id,
    message: messageInput,
  });

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
    console.log("Send response:", res.status, data);

    if (res.ok) {
      setMessageInput("");
      fetchMessages(activeChat.id);
    } else {
      console.error("Failed to send:", data);
      alert(`Error: ${data.error || "Failed to send message"}`);
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("Network error sending message");
  }
};

  const upcomingConsults = consultations.filter(
    (c) => c.status === "upcoming"
  );

  return (
    <div className="nc-layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="nc-main">
        <div className="nc-content">

          {/* HERO */}
          <div className="pb-dash-hero">
            <div className="pb-hero-content">
              <span className="pb-eyebrow">
                Nutritionist Dashboard
              </span>

              <h1>
                Manage your <em>patients</em> efficiently.
              </h1>

              <p>
                Conduct consultations, track progress,
                adjust meal plans, and support patients.
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="nc-stats-row">

            <StatCard
              title="My Patients"
              value={loading ? "…" : stats.total_patients}
              icon="🧑‍⚕️"
            />

            <StatCard
              title="Consultations Today"
              value={loading ? "…" : stats.today_consultations}
              icon="📅"
            />

            <StatCard
              title="Pending Follow-ups"
              value={loading ? "…" : stats.pending_followups}
              icon="📩"
            />

            <StatCard
              title="Total Consultations"
              value={loading ? "…" : consultations.length}
              icon="🥗"
            />

          </div>

          {/* PATIENTS + DETAILS */}
          <div className="nutritionist-grid">

            {/* PATIENTS */}
            <div className="nc-card nutritionist-patients">

              <div className="nc-card-header">
                <h3>My Patients</h3>
              </div>

              {loading ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>
                  Loading…
                </p>
              ) : patients.length === 0 ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>
                  No patients assigned yet.
                </p>
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

                    {patients.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() =>
                          setSelectedPatient(
                            selectedPatient?.id === p.id
                              ? null
                              : p
                          )
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

                        <td
                          style={{
                            color: "#63d391",
                            fontWeight: 600,
                          }}
                        >
                          {p.today_calories} kcal
                        </td>

                        <td>
                          {p.today_meals.length} meal
                          {p.today_meals.length !== 1
                            ? "s"
                            : ""}
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              )}
            </div>

            {/* DETAILS */}
            <div className="nc-card nutritionist-plan-card">

              <div className="nc-card-header">
                <h3>Patient Detail</h3>
              </div>

              {selectedPatient ? (
                <>
                  <div className="nutritionist-patient-info">

                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedPatient.full_name}
                    </p>

                    <p>
                      <strong>Age:</strong>{" "}
                      {selectedPatient.age ?? "—"}
                    </p>

                    <p>
                      <strong>Weight:</strong>{" "}
                      {selectedPatient.weight
                        ? `${selectedPatient.weight} kg`
                        : "—"}
                    </p>

                    <p>
                      <strong>Height:</strong>{" "}
                      {selectedPatient.height
                        ? `${selectedPatient.height} cm`
                        : "—"}
                    </p>

                    <p>
                      <strong>Goal:</strong>{" "}
                      {selectedPatient.goal}
                    </p>

                    <p>
                      <strong>Today's Calories:</strong>{" "}
                      <span
                        style={{
                          color: "#63d391",
                          fontWeight: 700,
                        }}
                      >
                        {selectedPatient.today_calories} kcal
                      </span>
                    </p>

                  </div>

                  {selectedPatient.today_meals.length > 0 ? (
                    <table
                      className="nc-meals-table"
                      style={{ marginTop: "1rem" }}
                    >
                      <thead>
                        <tr>
                          <th>Meal</th>
                          <th>Calories</th>
                        </tr>
                      </thead>

                      <tbody>

                        {selectedPatient.today_meals.map(
                          (m, i) => (
                            <tr key={i}>
                              <td>{m.meal_name}</td>
                              <td>{m.calories} kcal</td>
                            </tr>
                          )
                        )}

                      </tbody>
                    </table>
                  ) : (
                    <p
                      style={{
                        opacity: 0.5,
                        marginTop: "1rem",
                      }}
                    >
                      No meals logged today.
                    </p>
                  )}
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>
                  Click a patient to see details.
                </p>
              )}
            </div>
          </div>

          {/* CONSULTATIONS */}
          <div className="nutritionist-bottom-grid">

            {/* CONSULT LIST */}
            <div className="nc-card">

              <div className="nc-card-header">
                <h3>Upcoming Consultations</h3>
              </div>

              {loading ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>
                  Loading…
                </p>
              ) : upcomingConsults.length === 0 ? (
                <p style={{ padding: "1rem", opacity: 0.5 }}>
                  No upcoming consultations.
                </p>
              ) : (
                <div className="consultation-list">

                  {upcomingConsults.map((c) => (
                    <div
                      key={c.id}
                      className="consultation-item"
                      style={{
                        cursor: "pointer",
                        background:
                          selectedConsult?.id === c.id
                            ? "rgba(99,211,145,0.07)"
                            : "",
                        borderRadius: 10,
                      }}
                      onClick={() => openConsult(c)}
                    >
                      <div>
                        <strong>{c.patient}</strong>

                        <p
                          style={{
                            opacity: 0.6,
                            fontSize: "0.82rem",
                          }}
                        >
                          {c.patient_username}
                        </p>
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

            {/* NOTES */}
            <div className="nc-card">

              <div className="nc-card-header">
                <h3>Consultation Notes</h3>
              </div>

              {selectedConsult ? (
                <>
                  <div className="nutritionist-patient-info">

                    <p>
                      <strong>Patient:</strong>{" "}
                      {selectedConsult.patient}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {selectedConsult.date} ·{" "}
                      {selectedConsult.time}
                    </p>

                  </div>

                  <label className="nutritionist-label">
                    Status
                  </label>

                  <select
                    value={statusInput}
                    onChange={(e) =>
                      setStatusInput(e.target.value)
                    }
                    className="nutritionist-select"
                  >
                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>

                  <label className="nutritionist-label">
                    Notes / Nutrition Plan
                  </label>

                  <textarea
                    className="nutritionist-textarea"
                    placeholder="Write notes..."
                    value={notesInput}
                    onChange={(e) =>
                      setNotesInput(e.target.value)
                    }
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="nc-log-btn"
                      onClick={saveNotes}
                    >
                      Save Notes
                    </button>

                    {saveMsg && (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          opacity: 0.8,
                        }}
                      >
                        {saveMsg}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>
                  Click a consultation to edit notes.
                </p>
              )}
            </div>

          </div>

          {/* MESSAGING */}
          <div className="nutritionist-messages-grid">

            {/* PATIENTS */}
            <div className="nc-card">

              <div className="nc-card-header">
                <h3>Patient Chats</h3>
              </div>

              <div className="chat-patient-list">

                {chatPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`chat-patient ${
                      activeChat?.id === patient.id
                        ? "active"
                        : ""
                    }`}
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

            {/* CHAT */}
            <div className="nc-card">

              <div className="nc-card-header">
                <h3>
                  {activeChat
                    ? activeChat.name
                    : "Select a patient"}
                </h3>
              </div>

              {activeChat ? (
                <>
                  <div className="chat-messages">

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message-bubble ${
                          msg.is_mine ? "mine" : "theirs"
                        }`}
                      >
                        <p>{msg.text}</p>  {/* ← Change from msg.message to msg.text or msg.message depending on what backend returns */}
                        <span>{msg.created_at}</span>
                      </div>
                       ))}

                  </div>

                  <div className="messages-input">

                    <input
                      value={messageInput}
                      onChange={(e) =>
                        setMessageInput(e.target.value)
                      }
                      placeholder="Write message..."
                    />

                    <button onClick={sendMessage}>
                      Send
                    </button>

                  </div>
                </>
              ) : (
                <p style={{ opacity: 0.5 }}>
                  Select a patient to start chatting.
                </p>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}