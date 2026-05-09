import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../App.css";

import Sidebar from "../components/Sidebar";



const DIETARY_GOALS = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "muscle-gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "manage-condition", label: "Manage Condition" },
];

function getBmiInfo(bmi) {
  const n = parseFloat(bmi);

  if (n < 18.5)
    return {
      label: "Underweight",
      color: "#60c2f0",
    };

  if (n < 25)
    return {
      label: "Normal range",
      color: "#22c97a",
    };

  if (n < 30)
    return {
      label: "Overweight",
      color: "#f0a500",
    };

  return {
    label: "Obese",
    color: "#e05c5c",
  };
}



function PersonalInfoCard({
  editing,

  username,
  setUsername,

  firstName,
  setFirstName,

  lastName,
  setLastName,

  email,
  setEmail,

  dob,
  setDob,
}) {
  const fmt = (iso) => {
    if (!iso) return "";

    const [y, m, d] = iso.split("-");

    return `${m}/${d}/${y}`;
  };

  return (
    <div className="pf-card">
      <div className="pf-card-header">
        <h2 className="pf-card-title">
          Personal Info
        </h2>
      </div>

      <form
        className="pf-form"
        onSubmit={(e) =>
          e.preventDefault()
        }
      >
        {/* USERNAME */}
        <div className="pf-field">
          <label className="pf-label">
            USERNAME
          </label>

          {editing ? (
            <input
              className="pf-input"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
            />
          ) : (
            <div className="pf-readonly">
              {username}
            </div>
          )}
        </div>

        <div className="pf-row">
          <div className="pf-field">
            <label className="pf-label">
              FIRST NAME
            </label>

            {editing ? (
              <input
                className="pf-input"
                value={firstName}
                onChange={(e) =>
                  setFirstName(
                    e.target.value
                  )
                }
              />
            ) : (
              <div className="pf-readonly">
                {firstName}
              </div>
            )}
          </div>

          <div className="pf-field">
            <label className="pf-label">
              LAST NAME
            </label>

            {editing ? (
              <input
                className="pf-input"
                value={lastName}
                onChange={(e) =>
                  setLastName(
                    e.target.value
                  )
                }
              />
            ) : (
              <div className="pf-readonly">
                {lastName}
              </div>
            )}
          </div>
        </div>

        <div className="pf-field">
          <label className="pf-label">
            EMAIL
          </label>

          {editing ? (
            <input
              className="pf-input"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />
          ) : (
            <div className="pf-readonly">
              {email}
            </div>
          )}
        </div>

        <div className="pf-field">
          <label className="pf-label">
            DATE OF BIRTH
          </label>

          {editing ? (
            <input
              className="pf-input pf-input-date"
              type="date"
              value={dob}
              onChange={(e) =>
                setDob(
                  e.target.value
                )
              }
            />
          ) : (
            <div className="pf-readonly">
              {fmt(dob)}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function HealthDataCard({
  editing,

  age,
  setAge,

  weight,
  setWeight,

  height,
  setHeight,

  goal,
  setGoal,
}) {
  const bmi = (() => {
    const w = parseFloat(weight);

    const h =
      parseFloat(height) / 100;

    if (!w || !h) return null;

    return (
      w /
      (h * h)
    ).toFixed(1);
  })();

  const bmiInfo = bmi
    ? getBmiInfo(bmi)
    : null;

  const bmiThumb = bmi
    ? Math.min(
        Math.max(
          ((parseFloat(bmi) -
            10) /
            30) *
            100,
          2
        ),
        98
      )
    : 0;

  return (
    <div className="pf-card">
      <h2 className="pf-card-title pf-health-title">
        Health Data
      </h2>

      {/* AGE */}
      <div className="pf-field">
        <label className="pf-label">
          AGE
        </label>

        {editing ? (
          <input
            className="pf-input"
            type="number"
            value={age}
            onChange={(e) =>
              setAge(
                e.target.value
              )
            }
          />
        ) : (
          <div className="pf-readonly">
            {age}
          </div>
        )}
      </div>

      <div className="pf-row">
        <div className="pf-field">
          <label className="pf-label">
            WEIGHT (KG)
          </label>

          {editing ? (
            <input
              className="pf-input"
              type="number"
              value={weight}
              onChange={(e) =>
                setWeight(
                  e.target.value
                )
              }
            />
          ) : (
            <div className="pf-readonly">
              {weight} kg
            </div>
          )}
        </div>

        <div className="pf-field">
          <label className="pf-label">
            HEIGHT (CM)
          </label>

          {editing ? (
            <input
              className="pf-input"
              type="number"
              value={height}
              onChange={(e) =>
                setHeight(
                  e.target.value
                )
              }
            />
          ) : (
            <div className="pf-readonly">
              {height} cm
            </div>
          )}
        </div>
      </div>

      <div className="pf-field">
        <label className="pf-label">
          DIETARY GOAL
        </label>

        {editing ? (
          <div className="pf-select-wrap">
            <select
              className="pf-select"
              value={goal}
              onChange={(e) =>
                setGoal(
                  e.target.value
                )
              }
            >
              {DIETARY_GOALS.map(
                (g) => (
                  <option
                    key={g.value}
                    value={g.value}
                  >
                    {g.label}
                  </option>
                )
              )}
            </select>

            <span className="pf-select-arrow">
              ▾
            </span>
          </div>
        ) : (
          <div className="pf-readonly">
            {
              DIETARY_GOALS.find(
                (g) =>
                  g.value === goal
              )?.label
            }
          </div>
        )}
      </div>

      {bmi && (
        <div className="pf-bmi-box">
          <p className="pf-bmi-label">
            BMI Estimate
          </p>

          <p
            className="pf-bmi-value"
            style={{
              color: bmiInfo.color,
            }}
          >
            {bmi}
          </p>

          <div className="pf-bmi-gauge">
            <div
              className="pf-bmi-thumb"
              style={{
                left: `${bmiThumb}%`,
                background:
                  bmiInfo.color,
              }}
            />
          </div>

          <div className="pf-bmi-zones">
            <span
              style={{
                color: "#60c2f0",
              }}
            >
              Underweight
            </span>

            <span
              style={{
                color: "#22c97a",
              }}
            >
              Normal
            </span>

            <span
              style={{
                color: "#f0a500",
              }}
            >
              Overweight
            </span>

            <span
              style={{
                color: "#e05c5c",
              }}
            >
              Obese
            </span>
          </div>

          <p
            className="pf-bmi-cat"
            style={{
              color: bmiInfo.color,
            }}
          >
            {bmiInfo.label}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [dob, setDob] =
    useState("");

  const [age, setAge] =
    useState("");

  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [goal, setGoal] =
    useState("manage-condition");

  useEffect(() => {
    const fetchProfile = async () => {

      const storedUsername =
        localStorage.getItem(
          "username"
        );

      if (!storedUsername) return;

      try {

        const response =
          await fetch(
            `http://127.0.0.1:8000/get-profile/?username=${storedUsername}`
          );

        const data =
          await response.json();

        if (response.ok) {

          setUsername(
            data.username || ""
          );

          setFirstName(
            data.first_name || ""
          );

          setLastName(
            data.last_name || ""
          );

          setEmail(
            data.email || ""
          );

          setDob(
            data.dob || ""
          );

          setAge(
            data.age || ""
          );

          setWeight(
            data.weight || ""
          );

          setHeight(
            data.height || ""
          );

          setGoal(
            data.goal ||
              "manage-condition"
          );
        }

      } catch (error) {

        console.error(error);

      }
    };

    fetchProfile();

  }, []);

  const saveProfile = async () => {

    const currentUsername =
      localStorage.getItem(
        "username"
      );

    if (!currentUsername) {

      alert(
        "User not logged in"
      );

      return;
    }

    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/update-profile/",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              current_username:
                currentUsername,

              username: username,

              first_name:
                firstName,

              last_name:
                lastName,

              email: email,

              dob: dob,

              age: age,

              weight: weight,

              height: height,

              goal: goal,
            }),
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        localStorage.setItem(
          "username",
          data.username
        );

        setEditing(false);

        alert(
          "Profile updated successfully!"
        );

      } else {

        alert(
          data.error ||
            "Update failed"
        );
      }

    } catch (error) {

      console.error(error);

      alert("Server error");
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <div className="nc-layout">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={
          setSidebarOpen
        }
      />

      <main className="nc-main">
        <div className="pf-content">

          <div
            style={{
              display: "flex",
              alignItems:
                "flex-start",
              justifyContent:
                "space-between",
            }}
          >
            <div>
              <h1 className="pf-title">
                My Profile
              </h1>

              <p className="pf-sub">
                Manage your personal
                information and
                health data.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop:
                  "0.25rem",
              }}
            >
              {editing ? (
                <>
                  <button
                    className="pf-action-btn pf-save-btn"
                    onClick={
                      saveProfile
                    }
                  >
                    Save
                  </button>

                  <button
                    className="pf-action-btn pf-cancel-btn"
                    onClick={
                      handleCancel
                    }
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="pf-action-btn pf-edit-btn"
                  onClick={
                    handleEdit
                  }
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="pf-panels">

            <PersonalInfoCard
              editing={editing}

              username={username}
              setUsername={
                setUsername
              }

              firstName={
                firstName
              }

              setFirstName={
                setFirstName
              }

              lastName={lastName}

              setLastName={
                setLastName
              }

              email={email}

              setEmail={setEmail}

              dob={dob}

              setDob={setDob}
            />

            <HealthDataCard
              editing={editing}

              age={age}

              setAge={setAge}

              weight={weight}

              setWeight={
                setWeight
              }

              height={height}

              setHeight={
                setHeight
              }

              goal={goal}

              setGoal={setGoal}
            />

          </div>
        </div>
      </main>
    </div>
  );
}