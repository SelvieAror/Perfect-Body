import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../App.css";

import Sidebar from "../components/Sidebar";
 

 
const initialLog = [
  { id: 1, meal: "Breakfast", time: "08:00", kcal: 320 },
  { id: 2, meal: "Lunch",     time: "13:00", kcal: 620 },
  { id: 3, meal: "Snack",     time: "16:30", kcal: 180 },
];
 
const GOAL_KCAL = 1800;
 

 
function UploadZone({ preview, dragging, onFile, onDrag, onDrop, onClick, inputRef, onAnalyze, analyzing, result }) {
  return (
    <div className="at-upload-card">
      <h2 className="at-card-title">Upload Meal Photo</h2>
      <p className="at-card-sub">Upload a photo of your meal and get instant nutritional estimates.</p>
 
      <div
        className={`at-dropzone ${dragging ? "dragging" : ""} ${preview ? "has-preview" : ""}`}
        onClick={onClick}
        onDragOver={(e) => { e.preventDefault(); onDrag(true); }}
        onDragLeave={() => onDrag(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="at-file-input"
          onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
        />
 
        {preview ? (
          <div className="at-preview-wrap">
            <img src={preview} alt="Meal preview" className="at-preview-img" />
            <div className="at-preview-overlay">
              <span>Click to change photo</span>
            </div>
          </div>
        ) : (
          <div className="at-dropzone-empty">
            <div className="at-camera-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="at-drop-main">Click to upload your meal photo</p>
            <p className="at-drop-sub">PNG, JPG, WEBP · up to 10MB</p>
          </div>
        )}
      </div>
 
      {preview && (
        <button
          className={`at-analyze-btn ${analyzing ? "loading" : ""}`}
          onClick={onAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <><span className="at-spinner" />  Analyzing…</>
          ) : (
            "✦ Analyze with AI"
          )}
        </button>
      )}
 
      {result && (
        <div className="at-result-box">
          <div className="at-result-header">
            <span className="at-result-badge">AI Result</span>
            <span className="at-result-kcal">{result.kcal} kcal</span>
          </div>
          <p className="at-result-name">{result.name}</p>
          <div className="at-macros">
            <div className="at-macro"><span className="at-macro-val">{result.protein}g</span><span className="at-macro-label">Protein</span></div>
            <div className="at-macro"><span className="at-macro-val">{result.carbs}g</span><span className="at-macro-label">Carbs</span></div>
            <div className="at-macro"><span className="at-macro-val">{result.fat}g</span><span className="at-macro-label">Fat</span></div>
          </div>
          <button className="at-add-log-btn" onClick={result.onAdd}>+ Add to Today's Log</button>
        </div>
      )}
    </div>
  );
}
 
function CalorieLog({ log }) {
  const total = log.reduce((s, e) => s + e.kcal, 0);
  const remaining = GOAL_KCAL - total;
  const pct = Math.min((total / GOAL_KCAL) * 100, 100);
 
  return (
    <div className="at-log-card">
      <h2 className="at-card-title">Today's Calorie Log</h2>
 
      <div className="at-progress-bar-wrap">
        <div className="at-progress-bar">
          <div className="at-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="at-progress-pct">{Math.round(pct)}%</span>
      </div>
 
      <div className="at-log-list">
        {log.map((entry) => (
          <div key={entry.id} className="at-log-row">
            <div className="at-log-info">
              <span className="at-log-meal">{entry.meal}</span>
              <span className="at-log-time">{entry.time}</span>
            </div>
            <span className="at-kcal-badge">{entry.kcal} kcal</span>
          </div>
        ))}
      </div>
 
      <div className="at-log-total">
        <span className="at-total-label">Total</span>
        <span className="at-total-val">{total.toLocaleString()} kcal</span>
      </div>
 
      <p className="at-goal-line">
        Goal: {GOAL_KCAL.toLocaleString()} kcal · Remaining:{" "}
        <strong style={{ color: remaining < 0 ? "#e05c5c" : "#22c97a" }}>
          {remaining < 0 ? `-${Math.abs(remaining)}` : remaining} kcal
        </strong>
      </p>
    </div>
  );
}
 
export default function AiTracker() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [preview, setPreview]         = useState(null);
  const [dragging, setDragging]       = useState(false);
  const [analyzing, setAnalyzing]     = useState(false);
  const [result, setResult]           = useState(null);
  const [log, setLog]                 = useState(initialLog);
  const inputRef                      = useRef();
 
  const handleFile = (file) => {
    if (!file) return;
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };
 
  const handleAnalyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setResult(null);
 
    // Convert blob URL to base64 for the API call
    try {
      const blob = await fetch(preview).then((r) => r.blob());
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(",")[1];
        const mediaType = blob.type || "image/jpeg";
 
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: mediaType, data: base64 },
                },
                {
                  type: "text",
                  text: `Analyze this meal photo and return ONLY a JSON object (no markdown, no backticks) with these exact keys:
{
  "name": "dish name",
  "kcal": number,
  "protein": number,
  "carbs": number,
  "fat": number
}
Be realistic with estimates based on a typical single-serving portion.`,
                },
              ],
            }],
          }),
        });
 
        const data = await response.json();
        const text = data.content?.map((c) => c.text || "").join("") || "";
        try {
          const cleaned = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleaned);
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          setResult({
            ...parsed,
            onAdd: () => {
              setLog((prev) => [
                ...prev,
                { id: Date.now(), meal: parsed.name, time: timeStr, kcal: parsed.kcal },
              ]);
              setResult(null);
              setPreview(null);
            },
          });
        } catch {
          setResult({ name: "Could not parse result", kcal: 0, protein: 0, carbs: 0, fat: 0, onAdd: () => {} });
        }
        setAnalyzing(false);
      };
    } catch {
      setAnalyzing(false);
    }
  };
 
  return (
    <div className="nc-layout">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
 
      <main className="nc-main">
        <div className="nc-content at-content">
          <div className="at-page-header">
            <h1 className="at-page-title">AI Calorie Tracker</h1>
            <p className="at-page-sub">Upload a photo of your meal and get instant nutritional estimates.</p>
          </div>
 
          <div className="at-panels">
            <UploadZone
              preview={preview}
              dragging={dragging}
              onFile={handleFile}
              onDrag={setDragging}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              inputRef={inputRef}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              result={result}
            />
            <CalorieLog log={log} />
          </div>
        </div>
      </main>
    </div>
  );
}
