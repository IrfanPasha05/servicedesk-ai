import { useState } from "react";
import "./App.css";

import robot from "./assets/robot.png";
import hologram from "./assets/hologram.png";
import openRouter from "./openrouter";

function App() {
  const [incident, setIncident] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied successfully!");
  };

  const analyzeIncident = async () => {
    if (!incident.trim()) {
      alert("Please enter an incident summary.");
      return;
    }

    try {
      setTicketDescription("🤖 AI is generating ticket description...");
      setResolutionNote("🤖 AI is generating resolution note...");

      const response = await openRouter.post("/chat/completions", {
        model: "deepseek/deepseek-chat-v3",

        messages: [
          {
            role: "system",
            content: `
You are an experienced IT Service Desk Analyst.

Generate:

1. Professional Ticket Description
2. Professional Resolution Note

Rules:
- Do not write "Here's the professional response"
- Do not add headings
- Write in enterprise service desk style
- Keep it concise and professional

Return exactly in this format:

TICKET:
<ticket description>

RESOLUTION:
<resolution note>
`
          },
          {
            role: "user",
            content: incident
          }
        ]
      });

      const result =
        response.data.choices[0].message.content;

      const ticket =
        result.split("RESOLUTION:")[0]
          .replace("TICKET:", "")
          .trim();

      const resolution =
        result.split("RESOLUTION:")[1]?.trim() || "";

      setTicketDescription(ticket);
      setResolutionNote(resolution);

    } catch (error) {
      console.error(error);

      setTicketDescription(
        "Unable to generate ticket description."
      );

      setResolutionNote(
        "Unable to generate resolution note."
      );
    }
  };

  return (
    <div className="app">

      {/* HERO SECTION */}

      <div className="hero">

        <div className="hero-side">
          <div className="robot-wrapper">

            <span className="particle p1"></span>
            <span className="particle p2"></span>
            <span className="particle p3"></span>
            <span className="particle p4"></span>

            <img
              src={robot}
              alt="DXC Robot"
              className="robot"
            />

          </div>
        </div>

        <div className="hero-center">

          <h1>DXC</h1>

          <h2>SERVICE DESK AI</h2>

          <p>
            Transform incidents into professional documentation
            with AI precision
          </p>

        </div>

        <div className="hero-side">

          <img
            src={hologram}
            alt="DXC Hologram"
            className="hologram"
          />

        </div>

      </div>

      {/* CARDS */}

      <div className="cards">

        <div className="card incident">

          <h3>📋 INCIDENT SUMMARY</h3>

          <textarea
            value={incident}
            onChange={(e) => setIncident(e.target.value)}
            placeholder="Enter incident summary..."
          />

        </div>

        <div className="card ticket">

          <h3>📄 TICKET DESCRIPTION</h3>

          <div className="output-box">
            {ticketDescription}
          </div>

          <button
            className="copy-btn"
            onClick={() => copyText(ticketDescription)}
          >
            📋 Copy Ticket
          </button>

        </div>

        <div className="card resolution">

          <h3>✅ RESOLUTION NOTE</h3>

          <div className="output-box">
            {resolutionNote}
          </div>

          <button
            className="copy-btn"
            onClick={() => copyText(resolutionNote)}
          >
            📋 Copy Resolution
          </button>

        </div>

      </div>

      {/* BUTTON */}

      <div className="button-area">

        <button
          className="analyze-btn"
          onClick={analyzeIncident}
        >
          ⚡ ANALYZE INCIDENT
        </button>

      </div>

    </div>
  );
}

export default App;