// src/pages/About.jsx

import "../App.css";
import "./About.css";
import Nav from "../components/Nav";


export default function About() {
  

  
  const creators = [
    {
        name: "Chouai Louai",
            role: "Backend Developer",
            description:
                "Built the Django backend, APIs, authentication, and database logic.",
    },
    {
            name: "Taki Bourhane",
      role: "Frontend Developer",
      description:
        "Worked on the UI, React pages, and overall user experience.",
    },
    {
      name: "Grine Salah Eddine",
      role: "AI Engineer",
      description:
        "Handled AI features, nutrition analysis, and database optimization.",
    },
  ];

  return (
    <div className="ab-layout">

      {/* Navbar instead of sidebar */}
      <Nav />

      <main className="ab-main">
        <div className="ab-wrapper">

          

          <div className="ab-hero">
            <span className="ab-badge">
              ABOUT THE PLATFORM
            </span>

            <h1 className="ab-title">
              Smart nutrition guidance
              <br />
              built for healthier lives
            </h1>

            <p className="ab-description">
              Our platform combines nutrition tracking,
              AI-powered health tools, personalized meal
              management, and direct consultations with
              nutritionists to help users achieve their
              wellness goals more efficiently and
              consistently.
            </p>
          </div>

          <div className="ab-section">
            <div className="ab-section-header">
              <h2 className="ab-section-title">
                What the platform offers
              </h2>

              <p className="ab-section-sub">
                Designed to simplify health tracking and
                communication between users and experts.
              </p>
            </div>

            <div className="ab-feature-grid">

              <div className="ab-feature-card">
                <div className="ab-feature-icon">
                  🍎
                </div>

                <h3>Nutrition Tracking</h3>

                <p>
                  Monitor calories, proteins, carbs,
                  fats, and meal history in real time.
                </p>
              </div>

              <div className="ab-feature-card">
                <div className="ab-feature-icon">
                  🤖
                </div>

                <h3>AI Assistance</h3>

                <p>
                  Smart tools that help users understand
                  their eating habits and health goals.
                </p>
              </div>

              <div className="ab-feature-card">
                <div className="ab-feature-icon">
                  👨‍⚕️
                </div>

                <h3>Consultations</h3>

                <p>
                  Book sessions with nutritionists and
                  receive personalized guidance.
                </p>
              </div>

            </div>
          </div>

          <div className="ab-section">
            <div className="ab-section-header">
              <h2 className="ab-section-title">
                Meet the creators
              </h2>

              <p className="ab-section-sub">
                The team behind the project.
              </p>
            </div>

            <div className="ab-creators-grid">
              {creators.map((creator, index) => (
                <div
                  className="ab-creator-card"
                  key={index}
                >
                  <div className="ab-avatar">
                    {creator.name.charAt(0)}
                  </div>

                  <h3 className="ab-name">
                    {creator.name}
                  </h3>

                  <p className="ab-role">
                    {creator.role}
                  </p>

                  <p className="ab-creator-description">
                    {creator.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}