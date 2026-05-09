import { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";

const API = "http://127.0.0.1:8000/api";

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const modalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

  .co-assigned-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(99,211,145,0.06);
    border: 1px solid rgba(99,211,145,0.15);
    border-radius: 14px;
    padding: 1rem 1.4rem;
    margin-bottom: 1.5rem;
  }
  .co-assigned-label {
    color: rgba(255,255,255,0.4);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
  }
  .co-assigned-name {
    color: #63d391;
    font-size: 0.95rem;
    font-weight: 500;
  }
  .co-assigned-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    flex-shrink: 0;
  }

  /* Modal overlay */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease both;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-box {
    background: #181c27;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    width: 100%;
    max-width: 760px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    color: rgba(255,255,255,0.4);
    font-size: 1.4rem;
    margin: 0;
  }
  .modal-close {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    background: transparent;
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
    transition: all 0.2s;
  }
  .modal-close:hover { background: rgba(255,255,255,0.08); color: #fff; }

  .modal-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 420px;
  }

  .modal-panel {
    padding: 1.8rem 2rem;
  }
  .modal-panel:first-child {
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .modal-panel-title {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.3);
    font-weight: 500;
    margin: 0 0 1.2rem;
  }

  /* Calendar */
  .cal-wrap { font-family: 'DM Sans', sans-serif; }
  .cal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
  }
  .cal-month-label {
    color: rgba(255,255,255,0.4);
    font-size: 0.9rem;
    font-weight: 500;
  }
  .cal-nav {
    background: rgba(255,255,255,0.06);
    border: none;
    color: rgba(255,255,255,0.6);
    width: 28px; height: 28px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1rem;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .cal-nav:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .cal-day-name {
    text-align: center;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.25);
    padding: 0.3rem 0;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .cal-cell {
    aspect-ratio: 1;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.7);
    border-radius: 8px;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .cal-cell:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
  .cal-cell.other-month { color: rgba(255,255,255,0.12); }
  .cal-cell.past { color: rgba(255,255,255,0.15); cursor: not-allowed; }
  .cal-cell.today { color: #63d391; font-weight: 700; }
  .cal-cell.selected {
    background: #63d391;
    color: #0f1117;
    font-weight: 700;
  }
  .cal-cell.selected:hover { background: #4ec97c; }

  /* Right panel */
  .modal-assigned-block {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(99,211,145,0.06);
    border: 1px solid rgba(99,211,145,0.15);
    border-radius: 12px;
    padding: 0.85rem 1rem;
    margin-bottom: 1.4rem;
  }
  .modal-assigned-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2a7a52, #1a5c40);
    color: #63d391;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .modal-assigned-info { flex: 1; min-width: 0; }
  .modal-assigned-role {
    display: block;
    color: rgba(255,255,255,0.35);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .modal-assigned-nutname {
    display: block;
    color: #fff;
    font-size: 0.88rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .modal-hint {
    color: rgba(255,255,255,0.25);
    font-size: 0.85rem;
    margin: 2rem 0;
    text-align: center;
    font-weight: 300;
    line-height: 1.6;
  }

  .modal-date-display {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.9rem;
  margin: 0 0 1.2rem;

  background: rgba(99, 211, 145, 0.12);
  border: 1px solid rgba(99, 211, 145, 0.25);
  border-radius: 999px;

  color: #63d391;
  font-size: 0.85rem;
  font-weight: 500;

  box-shadow: inset 0 0 0 1px rgba(99,211,145,0.08);
}

  .modal-time-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.3);
    font-weight: 500;
    margin: 0 0 0.75rem;
  }

  .time-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.4rem;
  }
  .time-slot {
    padding: 0.55rem 0;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.55);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .time-slot:hover { border-color: rgba(255,255,255,0.18); color: #fff; background: rgba(255,255,255,0.07); }
  .time-slot.selected {
    background: rgba(99,211,145,0.12);
    border-color: rgba(99,211,145,0.4);
    color: #63d391;
    font-weight: 500;
  }

  .confirm-btn {
    width: 100%;
    padding: 0.85rem;
    background: #63d391;
    color: #0f1117;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .confirm-btn:hover:not(.disabled) {
    background: #4ec97c;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99,211,145,0.3);
  }
  .confirm-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }

  .modal-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    gap: 0.75rem;
    padding: 2rem 0;
  }
  .modal-success-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: rgba(99,211,145,0.15);
    border: 2px solid rgba(99,211,145,0.4);
    color: #63d391;
    font-size: 1.5rem;
    display: flex; align-items: center; justify-content: center;
    animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes pop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .modal-success-text { color: #fff; font-weight: 500; font-size: 1rem; margin: 0; }
  .modal-success-sub { color: rgba(255,255,255,0.4); font-size: 0.82rem; margin: 0; font-weight: 300; }
`;

/* ── CALENDAR ── */
function Calendar({ selectedDate, onSelect }) {
  const today = new Date(2026, 4, 2);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  const isPast = (d) => {
    if (!d.current) return true;
    return new Date(viewYear, viewMonth, d.day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  const isToday = (d) => d.current && d.day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSelected = (d) => d.current && selectedDate && selectedDate.day === d.day && selectedDate.month === viewMonth && selectedDate.year === viewYear;

  return (
    <div className="cal-wrap">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((cell, i) => (
          <button
            key={i}
            disabled={isPast(cell) || !cell.current}
            className={["cal-cell", !cell.current ? "other-month" : "", isToday(cell) ? "today" : "", isSelected(cell) ? "selected" : "", isPast(cell) ? "past" : ""].join(" ").trim()}
            onClick={() => cell.current && !isPast(cell) && onSelect({ day: cell.day, month: viewMonth, year: viewYear })}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── BOOKING MODAL ── */
function BookingModal({ onClose, onConfirm, assignedNutritionist }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const dateLabel = selectedDate
    ? `${MONTHS[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`
    : null;

  const nutName = assignedNutritionist
    ? assignedNutritionist.display_name || `${assignedNutritionist.first_name} ${assignedNutritionist.last_name}`
    : null;

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    setConfirmed(true);
    setTimeout(() => {
      onConfirm({
        date: dateLabel,
        time: selectedTime,
        nutritionist: nutName || "Unknown",
        nutritionistId: assignedNutritionist?.id,
      });
      onClose();
    }, 1400);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Book a Session</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-panel">
            <p className="modal-panel-title">Pick a Date</p>
            <Calendar
              selectedDate={selectedDate}
              onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
            />
          </div>
          <div className="modal-panel">
            <p className="modal-panel-title">Select Time</p>

            {nutName && (
              <div className="modal-assigned-block">
                <div className="modal-assigned-avatar">{nutName.charAt(0).toUpperCase()}</div>
                <div className="modal-assigned-info">
                  <span className="modal-assigned-role">Your nutritionist</span>
                  <span className="modal-assigned-nutname">{nutName}</span>
                </div>
              </div>
            )}

            {!selectedDate ? (
              <p className="modal-hint">Select a date to<br />see available slots.</p>
            ) : confirmed ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <p className="modal-success-text">Session booked!</p>
                <p className="modal-success-sub">{dateLabel} · {selectedTime}</p>
              </div>
            ) : (
              <>
                <p className="modal-date-display">{dateLabel}</p>
                <p className="modal-time-label">Available Times</p>
                <div className="time-grid">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      className={`time-slot ${selectedTime === t ? "selected" : ""}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  className={`confirm-btn ${!selectedTime ? "disabled" : ""}`}
                  disabled={!selectedTime}
                  onClick={handleConfirm}
                >
                  Confirm Booking
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function Consultations() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [assignedNutritionist, setAssignedNutritionist] = useState(null);
  const [sessionList, setSessionList] = useState([]);
  console.log(assignedNutritionist);
  useEffect(() => {
    const username = localStorage.getItem("username");

    fetch(`${API}/get-assigned-nutritionist/?username=${username}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setAssignedNutritionist(data); })
      .catch((err) => console.error("Failed to load assigned nutritionist", err));

    fetch(`${API}/get-consultations/?username=${username}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSessionList(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleConfirm = async ({ date, time, nutritionistId }) => {
    const username = localStorage.getItem("username");
    try {
      const res = await fetch(`${API}/book-consultation/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, nutritionist_id: nutritionistId, date, time }),
      });
      const data = await res.json();
      if (res.ok) setSessionList(prev => [data, ...prev]);
      else alert(data.error || "Failed to book consultation");
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const nutName = assignedNutritionist
    ? assignedNutritionist.display_name || `${assignedNutritionist.first_name} ${assignedNutritionist.last_name}`
    : null;

  return (
    <>
      <style>{modalStyles}</style>
      <div className="nc-layout">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="nc-main">
          <div className="co-content">
            <div className="co-page-header">
              <div>
                <h1 className="co-title">My Consultations</h1>
                <p className="co-sub">Book and manage your sessions with nutritionists.</p>
              </div>
              <button className="co-book-btn" onClick={() => setShowModal(true)}>
                + Book Session
              </button>
            </div>

            {nutName && (
              <div className="co-assigned-banner">
                <span className="co-assigned-label">Your Nutritionist</span>
                <div className="co-assigned-dot" />
                <span className="co-assigned-name">{nutName}</span>
              </div>
            )}

            <div className="co-card">
              <h2 className="co-card-title">Session History</h2>
              <table className="co-table">
                <thead>
                  <tr>
                    <th>NUTRITIONIST</th>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>STATUS</th>
                    <th>NOTES / ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionList.map((s) => (
                    <tr key={s.id}>
                      <td className="co-td-name">{s.nutritionist}</td>
                      <td>{s.date}</td>
                      <td>{s.time}</td>
                      <td>
                        <span className={`co-badge co-badge-${s.status}`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {s.status === "upcoming" ? (
                          <a
                            href="https://meet.google.com/prf-ncib-ffz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="co-zoom-btn"
                          >
                            Join Zoom
                          </a>
                        ) : (
                          <span className="co-notes">{s.notes}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {showModal && (
          <BookingModal
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirm}
            assignedNutritionist={assignedNutritionist}
          />
        )}
      </div>
    </>
  );
}