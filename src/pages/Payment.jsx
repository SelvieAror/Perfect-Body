import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Payment.css";

const API = "http://127.0.0.1:8000/api";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [plan, setPlan] = useState(null);

  const [step, setStep] = useState("payment");

  const [nutritionists, setNutritionists] = useState([]);
  const [selectedNutritionist, setSelectedNutritionist] = useState("");

  const [savingNutritionist, setSavingNutritionist] = useState(false);
  const [nutsLoading, setNutsLoading] = useState(false);

  useEffect(() => {
    const name = searchParams.get("name");
    const price = searchParams.get("price");
    const duration = searchParams.get("duration");

    setPlan(
      name && price && duration
        ? { name, price, duration }
        : { name: "Premium", price: "29", duration: "month" }
    );
  }, [searchParams]);

  useEffect(() => {
    if (step !== "pick-nutritionist") return;

    setNutsLoading(true);
fetch(`${API}/get-nutritionists/`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setNutritionists(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);

        setMessage({
          text: "Could not load nutritionists.",
          type: "error",
        });
      })
      .finally(() => {
        setNutsLoading(false);
      });
  }, [step]);

  const handlePay = async () => {
    setLoading(true);

    setMessage({
      text: "",
      type: "",
    });

    const token =
      localStorage.getItem("access") ||
      localStorage.getItem("token");

    const username = localStorage.getItem("username");

    if (!token || !username) {
      setMessage({
        text: "Please login first.",
        type: "error",
      });

      setTimeout(() => navigate("/login"), 1500);

      setLoading(false);

      return;
    }

    try {
      const response = await fetch(
        `${API}/mock-subscribe/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setMessage({
          text: "Session expired. Please login again.",
          type: "error",
        });

        localStorage.clear();

        setTimeout(() => navigate("/login"), 1500);

        return;
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Subscription failed"
        );
      }

      localStorage.setItem("role", "subscribed");
      localStorage.setItem("subscription", "true");

      setStep("pick-nutritionist");
    } catch (err) {
      setMessage({
        text:
          err.message ||
          "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNutritionist = async () => {
  if (!selectedNutritionist) return;

  setSavingNutritionist(true);

  setMessage({
    text: "",
    type: "",
  });

  const token =
    localStorage.getItem("access") ||
    localStorage.getItem("token");

  try {
    const res = await fetch(
      `${API}/save_nutritionist/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          nutritionist_id: Number(selectedNutritionist),
        }),
      }
    );

    // IMPORTANT
    const contentType =
      res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Server returned HTML (${res.status}). Check Django URL.`
      );
    }

    const data = await res.json();

     if (!res.ok) {
      throw new Error(data.error || "Failed to save nutritionist");
    }

    // ✅ Finalize subscription state in localStorage
    localStorage.setItem("role", "subscribed");
    localStorage.setItem("subscription", "true");
    window.dispatchEvent(new Event("storage")); // notify Nav, Sidebar, MealPlan

    setMessage({ text: "All set! Redirecting...", type: "success" });
    setTimeout(() => navigate("/user"), 1500);

  } catch (err) {
    console.error(err);

    setMessage({
      text: err.message || "Something went wrong.",
      type: "error",
    });
  } finally {
    setSavingNutritionist(false);
  }
};
  return (
    <div className="pay-root">
      <div className="pay-card">

        <div className="pay-step-indicator">
          <div
            className={`pay-step-dot ${
              step === "payment" ? "active" : ""
            }`}
          />

          <div
            className={`pay-step-dot ${
              step === "pick-nutritionist"
                ? "active"
                : ""
            }`}
          />
        </div>

        {step === "payment" ? (
          <>
            <h1 className="pay-title">
              Complete your
              <br />
              subscription
            </h1>

            <p className="pay-subtitle">
              One step away from your health
              journey.
            </p>

            {plan && (
              <div className="plan-box">
                <p className="plan-name">
                  {plan.name} Plan
                </p>

                <div className="plan-price">
                  ${plan.price}
                  <span> /{plan.duration}</span>
                </div>

                <ul className="plan-features">
                  <li>AI Calorie Tracking</li>
                  <li>Personalized Meal Plans</li>
                  <li>Expert Consultations</li>
                  <li>Progress Analytics</li>
                </ul>
              </div>
            )}

            <button
              className="pay-btn"
              onClick={handlePay}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Pay Now"}
            </button>

            {message.text && (
              <div
                className={`pay-message ${message.type}`}
              >
                {message.text}
              </div>
            )}

            <p className="pay-demo-note">
              ⚡ Demo mode – no real payment
              taken
            </p>
          </>
        ) : (
          <>
            <div className="pay-success-badge">
              ✓ Payment confirmed
            </div>

            <h1 className="pay-title">
              Pick your
              <br />
              nutritionist
            </h1>

            <p className="pay-subtitle">
              Choose the expert you'll work
              with.
            </p>

            <div className="nut-list">
              {nutsLoading ? (
                <p className="nut-loading">
                  Loading nutritionists...
                </p>
              ) : nutritionists.length === 0 ? (
                <p className="nut-loading">
                  No nutritionists available.
                </p>
              ) : (
                nutritionists.map((nut) => {
                  const id = nut.id.toString();

                  const name =
                    nut.display_name ||
                    `${nut.first_name} ${nut.last_name}`;

                  const isSelected =
                    selectedNutritionist === id;

                  return (
                    <button
                      key={id}
                      className={`nut-card ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedNutritionist(id)
                      }
                    >
                      <div className="nut-avatar">
                        {name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="nut-info">
                        <span className="nut-name">
                          {name}
                        </span>

                        {nut.specialty && (
                          <span className="nut-specialty">
                            {nut.specialty}
                          </span>
                        )}
                      </div>

                      <div className="nut-check">
                        ✓
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <button
              className="pay-btn"
              disabled={
                !selectedNutritionist ||
                savingNutritionist
              }
              onClick={handleSaveNutritionist}
            >
              {savingNutritionist
                ? "Saving..."
                : "Confirm & Go to Dashboard"}
            </button>

            {message.text && (
              <div
                className={`pay-message ${message.type}`}
              >
                {message.text}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}