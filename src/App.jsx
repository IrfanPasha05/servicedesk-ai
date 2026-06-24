import { useState } from "react";
import "./App.css";

import robot from "./assets/robot.png";
import hologram from "./assets/hologram.png";
import openRouter from "./openrouter";

function App() {
  
  const [chatTranscript, setChatTranscript] = useState("");
const [incident, setIncident] = useState("");
const [ticketDescription, setTicketDescription] = useState("");
const [resolutionNote, setResolutionNote] = useState("");

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied successfully!");
  };

  const analyzeIncident = async () => {
    if (!chatTranscript.trim()) {
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
You are a Service Desk AI Assistant.

Analyze the provided chat transcript and generate:

INCIDENT:
A short professional incident summary (2-3 lines)

TICKET:
A professional ticket description suitable for ServiceNow or ITSM tools

RESOLUTION:
A professional resolution note describing troubleshooting performed and final outcome

Return EXACTLY in this format:

INCIDENT:
<incident summary>

TICKET:
<ticket description>

RESOLUTION:
<resolution note>
`
          },
          {
            role: "user",
            content: chatTranscript
          }
        ]
      });

      const result =
        response.data.choices[0].message.content;

      const incidentSummary =
  result.split("TICKET:")[0]
    .replace("INCIDENT:", "")
    .trim();

const ticket =
  result.split("TICKET:")[1]
    ?.split("RESOLUTION:")[0]
    ?.trim() || "";

const resolution =
  result.split("RESOLUTION:")[1]
    ?.trim() || "";

setIncident(incidentSummary);
setTicketDescription(ticket);
setResolutionNote(resolution);

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
  <h3>💬 CHAT TRANSCRIPT</h3>

  <textarea
    value={chatTranscript}
    onChange={(e) => setChatTranscript(e.target.value)}
    placeholder="Paste Teams chat transcript here..."
  />
</div>

<div className="card ticket">
  <h3>📋 INCIDENT SUMMARY</h3>

  <div className="output-box">
    {incident}
  </div>
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