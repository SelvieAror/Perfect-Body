import { useState } from "react";
import logo from "../assets/brandlogo.png";

const CATEGORIES = [
  { value: "bug",      label: "🐛 Bug Report" },
  { value: "abuse",    label: "🚨 Abuse / Misconduct" },
  { value: "billing",  label: "💳 Billing Issue" },
  { value: "feedback", label: "💬 General Feedback" },
  { value: "other",    label: "📋 Other" },
];

function ReportModal({ onClose }) {
  const [category, setCategory] = useState("feedback");
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [status,   setStatus]   = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setStatus("error:Please fill in the subject and message.");
      return;
    }
    setStatus("sending");

    const token = localStorage.getItem("access");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reports/", {
        method: "POST",
        headers,
        body: JSON.stringify({ category, subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (res.ok) setStatus("success");
      else setStatus(`error:${data.error || "Failed to send report."}`);
    } catch {
      setStatus("error:Network error. Please try again.");
    }
  };

  const isLoggedIn = !!localStorage.getItem("access");
  const isSuccess  = status === "success";
  const isSending  = status === "sending";
  const errorMsg   = status.startsWith("error:") ? status.slice(6) : null;

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <h2 style={S.modalTitle}>Contact Us</h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {!isLoggedIn ? (
          <div style={S.successBox}>
            <div style={{ ...S.successIcon, background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>🔒</div>
            <p style={S.successText}>Login required</p>
            <p style={S.successSub}>You need to be logged in to send a report.</p>
            <button style={S.doneBtn} onClick={onClose}>Close</button>
          </div>
        ) : isSuccess ? (
          <div style={S.successBox}>
            <div style={S.successIcon}>✓</div>
            <p style={S.successText}>Report sent!</p>
            <p style={S.successSub}>Our team will review it shortly.</p>
            <button style={S.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p style={S.modalSub}>Have an issue or feedback? Let us know — your report goes directly to our admin team.</p>

            <label style={S.label}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={S.select}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <label style={S.label}>Subject</label>
            <input
              type="text"
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={S.input}
            />

            <label style={S.label}>Message</label>
            <textarea
              placeholder="Describe your issue or feedback in detail…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={S.textarea}
            />

            {errorMsg && <p style={S.errorMsg}>⚠ {errorMsg}</p>}

            <div style={S.modalActions}>
              <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
              <button style={{ ...S.submitBtn, opacity: isSending ? 0.6 : 1 }} onClick={handleSubmit} disabled={isSending}>
                {isSending ? "Sending…" : "Send Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Footer() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <footer style={S.footer}>
        <div style={S.footerInner}>

          {/* Brand */}
          <div style={S.brand}>
            <img src={logo} alt="Perfect Body" style={S.brandLogo} />
            <span style={S.brandName}>Perfect <em>Body</em></span>
          </div>

          {/* Links */}
          <nav style={S.nav}>
            <a href="#" style={S.link}>Privacy</a>
            <a href="#" style={S.link}>Terms</a>
            <button style={S.linkBtn} onClick={() => setShowModal(true)}>Contact Us</button>
          </nav>

          {/* Right side */}
          <div style={S.right}>
            <p style={S.copy}>© 2026 Perfect Body. All rights reserved.</p>
          </div>

        </div>
      </footer>

      {showModal && <ReportModal onClose={() => setShowModal(false)} />}
    </>
  );
}

/* ── Styles ── */
const S = {
  /* Footer */
  footer: {
    background: "#0d0f14",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    padding: "1.5rem 2.5rem",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  brandLogo: {
    width: 32,
    height: 32,
    objectFit: "contain",
    borderRadius: 8,
  },
  brandName: {
    color: "#f0f2f8",
    fontWeight: 600,
    fontSize: "1rem",
    letterSpacing: "-0.01em",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  link: {
    color: "#6b7280",
    fontSize: "0.875rem",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  linkBtn: {
    background: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.25)",
    color: "#4ade80",
    padding: "6px 16px",
    borderRadius: 20,
    fontSize: "0.82rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  right: {
    textAlign: "right",
  },
  copy: {
    color: "#374151",
    fontSize: "0.78rem",
    margin: 0,
  },

  /* Modal */
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(5px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: "1rem",
  },
  modal: {
    background: "#181c27",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18,
    padding: "2rem",
    width: "100%", maxWidth: 460,
    boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
    display: "flex", flexDirection: "column", gap: "0.75rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  modalTitle: {
    margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "#f0f2f8",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.5)", borderRadius: "50%",
    width: 30, height: 30, cursor: "pointer", fontSize: "0.8rem",
  },
  modalSub: {
    margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
  },
  label: {
    fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.3)", fontWeight: 500,
  },
  select: {
    width: "100%", padding: "0.7rem 0.9rem",
    background: "#1e2233", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
    colorScheme: "dark",
  },
  input: {
    width: "100%", padding: "0.7rem 0.9rem",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "0.7rem 0.9rem",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: "0.9rem", outline: "none",
    minHeight: 110, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
  },
  errorMsg: { margin: 0, fontSize: "0.85rem", color: "#fca5a5" },
  modalActions: { display: "flex", gap: "0.75rem", marginTop: "0.25rem" },
  cancelBtn: {
    flex: 1, padding: "0.75rem", borderRadius: 10,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", cursor: "pointer",
  },
  submitBtn: {
    flex: 1, padding: "0.75rem", borderRadius: 10,
    background: "linear-gradient(135deg, #4ade80, #22c55e)",
    border: "none", color: "#000", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
  },
  successBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "0.5rem", padding: "1.5rem 0", textAlign: "center",
  },
  successIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.4)",
    color: "#4ade80", fontSize: "1.5rem",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successText: { margin: 0, color: "#fff", fontWeight: 600, fontSize: "1rem" },
  successSub:  { margin: 0, color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" },
  doneBtn: {
    marginTop: "0.75rem", padding: "0.65rem 2rem", borderRadius: 10,
    background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
    color: "#4ade80", fontSize: "0.9rem", cursor: "pointer",
  },
};