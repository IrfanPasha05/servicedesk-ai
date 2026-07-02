import { useState } from "react";
import "./App.css";

import {
  cleanTranscript,
  extractIncidentData
} from "./utils/chatParser";
import robot from "./assets/robot.png";
import hologram from "./assets/hologram.png";
import openRouter from "./openrouter";

function App() {
  const [customerEmail, setCustomerEmail] = useState("");
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
// Clean the raw Teams chat before sending to AI

const cleanedTranscript = cleanTranscript(chatTranscript);

const incidentData = extractIncidentData(cleanedTranscript);

const structuredInput = `
APPLICATIONS:
${incidentData.applications.join(", ")}

STATUS:
${incidentData.status}

TROUBLESHOOTING:
${incidentData.troubleshooting.join("\n")}

CHAT:
${cleanedTranscript}
`;


      const response = await openRouter.post("/chat/completions", {
  model: "deepseek/deepseek-chat-v3",

  temperature: 0,
  top_p: 1,
  max_tokens: 1500,

  messages: [
          {

            
            role: "system",
            
content: `
You are a Senior IT Service Desk Analyst with extensive experience creating ServiceNow incident documentation.

Your responsibility is to analyze Service Desk conversations and create professional documentation.

The input may be:
- Microsoft Teams chat transcript
- Live support chat
- Incident summary
- Troubleshooting notes
- User issue description

=========================
IMPORTANT
=========================

Ignore the following completely:

- Virtual Agent messages
- System messages
- "Agent has joined"
- "Agent has ended"
- Greetings
- Employee ID verification
- Waiting messages
- Hold messages
- Closing messages
- Ticket numbers
- Timestamps

These are not part of the technical issue.

Focus ONLY on:

• User's actual problem
• Error messages
• Application or system affected
• Troubleshooting performed
• Important technical details
• Final outcome

=========================
WRITING STYLE
=========================

Write like an experienced IT Service Desk Engineer.

Keep the language professional.

Do not invent information.

If the issue is unresolved, clearly mention that.

If the issue was escalated, clearly mention that.

If the issue was resolved, clearly explain how.

=========================
FACTUAL ACCURACY
=========================

Everything you write must be supported by the conversation.

Never invent or assume information.

Never create:

• Time commitments
• SLA commitments
• Follow-up commitments
• Ticket numbers
• Case numbers
• Resolver groups unless explicitly mentioned
• Engineer names unless explicitly mentioned
• Customer names unless explicitly confirmed
• Resolution steps that never occurred
• Future actions that are not mentioned
• Estimated timelines

If the transcript does not mention something, do not write it.

Do not guess.

Do not make assumptions.

If information is unavailable, simply omit it.

Customer emails must only communicate facts that appear in the transcript.

Do not promise callbacks.

Do not promise resolution times.

Do not promise another team will contact the customer unless explicitly stated in the transcript.
=========================
SERVICE DESK DOCUMENTATION RULES
=========================

Write documentation exactly as a ServiceNow analyst would.

Summarize the conversation.

Do not rewrite or embellish the conversation.

Keep every section concise.

INCIDENT
• 2–3 sentences only.
• State the problem.
• State the outcome.

TICKET
• Describe:
  - User issue
  - Error message(s)
  - Troubleshooting performed
  - Current status

Do not repeat information.

RESOLUTION
Only include actions that actually happened.

If escalated:
State:
"The incident was escalated to the LCS team for further investigation."

Do not describe what the LCS team will do unless explicitly stated.

EMAIL
Keep the email short.

Maximum 6 sentences.

Do not repeat the ticket description.

Do not promise callbacks.

Do not promise timelines.

Do not promise resolution.

If escalated simply state:

"Your request has been escalated to the appropriate support team for further investigation."

End with:

Regards,
IT Service Desk
=========================
OUTPUT
=========================

Return EXACTLY in this format.

INCIDENT:
A concise 2–3 sentence incident summary.

TICKET:
A detailed ServiceNow ticket description.

RESOLUTION:
Professional resolution notes.

EMAIL:
A professional customer email.

=========================
EXAMPLE 1 (RESOLVED)
=========================

Example Input:

User cannot access HPE Software Center.

Application shows "Temporarily unavailable".

User confirms colleagues can access it.

Later the user retries and confirms it is working.

Example Output:

INCIDENT:
User reported inability to access HPE Software Center due to a temporary availability issue. The application became accessible during the support session and the user confirmed successful access.

TICKET:
The user contacted the Service Desk regarding inability to access HPE Software Center. The application displayed a temporary unavailable message. During troubleshooting the user retried the application and confirmed it was functioning normally.

RESOLUTION:
Verified application accessibility. User confirmed successful access. Ticket closed after user confirmation.

EMAIL:
Hello,

Your reported issue with HPE Software Center has been resolved successfully.

Please verify everything continues to work as expected. If you require additional assistance, please contact the IT Service Desk.

Regards,
IT Service Desk

=========================
EXAMPLE 2 (ESCALATED)
=========================

Example Input:

User received a replacement laptop.

Okta authentication keeps looping.

Zscaler installation fails.

Issue could not be resolved.

Escalated to the LCS Team.

Example Output:

INCIDENT:
User experienced issues configuring a replacement laptop due to repeated Okta authentication prompts and Zscaler installation failures. Initial troubleshooting was completed and the issue required escalation for further investigation.

TICKET:
The user contacted the Service Desk after receiving a replacement laptop. Okta authentication repeatedly looped and Zscaler installation failed. Initial troubleshooting was performed but the issue could not be resolved during the support session. The incident was escalated to the LCS support team for further investigation.

RESOLUTION:
Performed initial troubleshooting. As the issue could not be resolved during the support session, the incident was escalated to the LCS support team. Awaiting further investigation by the assigned support team.

EMAIL:
Subject: Update on Your Support Request

Hello,

Your issue requires additional investigation and has been escalated to the appropriate support team. Your request has been escalated to the appropriate support team for further investigation.

Thank you for your patience.

Regards,
IT Service Desk

=========================
SPECIAL HANDLING
=========================

If the conversation indicates the issue was RESOLVED:

• Generate a complete professional resolution.
• State that the user confirmed the fix.
• Close the ticket professionally.

------------------------------------------------

If the conversation indicates the issue was ESCALATED:

• Never state "Issue resolved."
• Clearly state that the issue has been escalated.
• Mention the resolver/support team if available.
• Mention that further investigation is required.
• Customer email should explain that another team will contact the user.

------------------------------------------------

If the conversation is PENDING:

• Do not invent troubleshooting.
• Mention that investigation is still in progress.
• Customer email should indicate that updates will follow.

------------------------------------------------

If the conversation is INCOMPLETE:

• Do not invent a resolution.
• Mention that the conversation ended before troubleshooting could be completed.
• Customer email should request that the user reconnect with the Service Desk.

------------------------------------------------

Always determine the final ticket status as one of the following:

• Resolved
• Escalated
• Pending
• Incomplete

=========================
FINAL INSTRUCTIONS
=========================

Analyze ONLY the user's conversation.

Ignore all examples above.

The examples are provided only as guidance and MUST NEVER appear in the output.

Do not copy or reference:
- Example headings
- Chat numbers
- Incident IDs
- Example text
- Example ticket numbers

Return ONLY the documentation for the conversation supplied by the user.

Do not include any introduction or explanation.

Return EXACTLY in this format:

INCIDENT:
...

TICKET:
...

RESOLUTION:
...

EMAIL:
...
`
        },
        {
  role: "user",
  content: structuredInput
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
    ?.split("EMAIL:")[0]
    ?.trim() || "";

const email =
  result.split("EMAIL:")[1]
    ?.trim() || "";

setIncident(incidentSummary);
setTicketDescription(ticket);
setResolutionNote(resolution);
setCustomerEmail(email);


    } catch (error) {
      console.error(
  "OpenRouter Error:",
  error.response?.data || error.message
);

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
  <h3>💬📝 INCIDENT / CHAT INPUT</h3>

  <textarea
    value={chatTranscript}
    onChange={(e) => setChatTranscript(e.target.value)}
    placeholder="Paste Teams chat, ticket summary, troubleshooting notes, or incident details here..."
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

<div className="card resolution">

  <h3>📧 CUSTOMER EMAIL</h3>

  <div className="output-box">
    {customerEmail}
  </div>

  <button
    className="copy-btn"
    onClick={() => copyText(customerEmail)}
  >
    📧 Copy Email
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