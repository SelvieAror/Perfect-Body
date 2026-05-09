import { useState, useEffect } from "react";

/**
 * Call this once at the top of your app (e.g. in App.jsx).
 * It fetches fresh subscription status from the backend on every load
 * and keeps localStorage in sync — so it never goes stale.
 */
export function useAuth() {
  const [isLoggedIn,    setIsLoggedIn]    = useState(!!localStorage.getItem("access"));
  const [isSubscribed,  setIsSubscribed]  = useState(false);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      // Not logged in — clear everything and stop
      localStorage.removeItem("subscription");
      setIsLoggedIn(false);
      setIsSubscribed(false);
      setLoading(false);
      return;
    }

    // ✅ Always re-fetch subscription from backend on app load
    fetch("http://127.0.0.1:8000/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          // Token expired — log the user out cleanly
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("subscription");
          window.dispatchEvent(new Event("storage"));
          setIsLoggedIn(false);
          setIsSubscribed(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        // Adjust field name to match what your API returns
        const subbed = data.is_subscribed === true;
        setIsSubscribed(subbed);
        setIsLoggedIn(true);

        // Keep localStorage in sync so Nav/Pricing still work
        if (subbed) {
          localStorage.setItem("subscription", "true");
        } else {
          localStorage.removeItem("subscription");
        }
        window.dispatchEvent(new Event("storage"));
      })
      .catch(() => {
        // Network error — keep whatever was in localStorage
      })
      .finally(() => setLoading(false));
  }, []);

  return { isLoggedIn, isSubscribed, loading };
}