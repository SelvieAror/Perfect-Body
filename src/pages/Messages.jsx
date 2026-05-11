import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../App.css";

const API = "http://127.0.0.1:8000/api";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  };
}

export default function Messages() {
  const [isOpen, setIsOpen] = useState(true);

  const [nutritionist, setNutritionist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const username = localStorage.getItem("username");

  /* ───────────────── FETCH MESSAGES ───────────────── */

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(
        `${API}/messages/?user_id=${userId}`,
        {
          headers: authHeaders(),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ───────────────── FETCH ASSIGNED NUTRITIONIST ───────────────── */

  const fetchNutritionist = async () => {
  try {
    const res = await fetch(
      `${API}/get-assigned-nutritionist/?username=${username}`
    );
    const data = await res.json();
    
    // Check if no nutritionist is assigned
    if (data.assigned === false || data.error) {
      setNutritionist(null);
      return;
    }
    
    // Nutritionist exists
    setNutritionist(data);
    fetchMessages(data.id);
  } catch (err) {
    console.error(err);
  }
};

  /* ───────────────── SEND MESSAGE ───────────────── */

  const sendMessage = async () => {
    if (!text.trim() || !nutritionist) return;

    try {
      const res = await fetch(
        `${API}/send-message/`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            receiver_id: nutritionist.id,
            text: text.trim(),
          }),
        }
      );

      if (res.ok) {
        setText("");

        // refresh messages
        fetchMessages(nutritionist.id);
      }

    } catch (err) {
      console.error(err);
    }
  };

  /* ───────────────── INIT ───────────────── */

  useEffect(() => {
    fetchNutritionist();
  }, []);

  /* ───────────────── AUTO REFRESH CHAT ───────────────── */

  useEffect(() => {
    if (!nutritionist) return;

    const interval = setInterval(() => {
      fetchMessages(nutritionist.id);
    }, 3000);

    return () => clearInterval(interval);

  }, [nutritionist]);

  return (
    <div className="nc-layout">

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="nc-main">

        <div className="nc-content">

          {/* HERO */}
          <div className="pb-dash-hero">
            <div className="pb-hero-content">
              <span className="pb-eyebrow">
                Messaging
              </span>

              <h1>
                Chat with your <em>nutritionist</em>.
              </h1>

              <p>
                Ask questions, receive advice, and stay connected.
              </p>
            </div>
          </div>

          {/* CHAT */}
          <div className="chat-wrapper">

            {!nutritionist ? (

              <div className="nc-card chat-empty">
                <h3>No Nutritionist Assigned</h3>

                <p>
                  You need to choose a nutritionist before messaging.
                </p>
              </div>

            ) : (

              <div className="nc-card chat-card">

                {/* HEADER */}
                <div className="chat-header">
                  <div>
                    <strong>
                      Dr. {nutritionist.first_name}{" "}
                      {nutritionist.last_name}
                    </strong>

                    <p>
                      @{nutritionist.username}
                    </p>
                  </div>
                </div>

                {/* MESSAGES */}
                <div className="chat-messages">

                  {messages.length === 0 ? (
                    <div className="chat-empty-state">
                      No messages yet.
                    </div>
                  ) : (
                    messages.map((msg) => {

                      const mine =
                        msg.sender_username === username;

                      return (
                        <div
                          key={msg.id}
                          className={`chat-bubble ${
                            mine ? "mine" : "theirs"
                          }`}
                        >
                          <div className="chat-text">
                            {msg.text}
                          </div>

                          <div className="chat-time">
                            {msg.created_at}
                          </div>
                        </div>
                      );
                    })
                  )}

                </div>

                {/* INPUT */}
                <div className="chat-input-row">

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) =>
                      setText(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />

                  <button onClick={sendMessage}>
                    Send
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}