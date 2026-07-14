export function cleanTranscript(chat) {
  if (!chat) return "";

  const lines = chat.split("\n");

  const cleaned = [];

  for (let line of lines) {
    line = line.trim();

    if (!line) continue;

    // Remove timestamps
    line = line.replace(/\[\d{1,2}:\d{2}\s?[A-Z]{2,4}\]/g, "");

    // Ignore unwanted lines
    if (/virtual\.agent/i.test(line)) continue;
    if (/system:/i.test(line)) continue;
    if (/agent has joined/i.test(line)) continue;
    if (/agent has ended/i.test(line)) continue;
    if (/please stand by/i.test(line)) continue;
    if (/thank you for using/i.test(line)) continue;
    if (/thank you for contacting/i.test(line)) continue;
    if (/have a great day/i.test(line)) continue;
    if (/don't hesitate/i.test(line)) continue;
    if (/@L\/incident/i.test(line)) continue;
    if (/sys_id=/i.test(line)) continue;

    cleaned.push(line);
  }

  return cleaned.join("\n");
}

export function extractIncidentData(chat) {

  const data = {

    applications: [],

    troubleshooting: [],

    status: "Pending",

    businessImpact: [],

    identityVerification: [],

    accountActions: [],

    remoteSupport: [],

    escalation: [],

    errors: [],

    userConfirmation: [],

    ticketNumbers: []

  };

  // --------------------
  // Applications
  // --------------------

  const appList = [

    "Outlook",
    "Teams",
    "VPN",
    "Okta",
    "Zscaler",
    "Software Center",
    "HPE Software Center",
    "OneDrive",
    "Excel",
    "Word",
    "PowerPoint",
    "SAP",
    "Citrix",
    "Windows Hello",
    "Authenticator",
    "Axis Atmos",
    "Atmos",
    "Jenkins",
    "BTRS"

  ];

  appList.forEach(app => {

    if (chat.toLowerCase().includes(app.toLowerCase()))

      data.applications.push(app);

  });

  // --------------------
  // Parse line by line
  // --------------------

  chat.split("\n").forEach(line => {

    const lower = line.toLowerCase();

    // Identity Verification

    if (
      lower.includes("employee id") ||
      lower.includes("manager") ||
      lower.includes("joining date") ||
      lower.includes("verify")
    ) {

      data.identityVerification.push(line.trim());

    }

    // Password / Okta / PIN

    if (
      lower.includes("password") ||
      lower.includes("okta") ||
      lower.includes("pin") ||
      lower.includes("windows hello") ||
      lower.includes("fingerprint")
    ) {

      data.accountActions.push(line.trim());

    }

    // Troubleshooting

    const keywords = [

      "reset",
      "restart",
      "reboot",
      "retry",
      "checked",
      "verified",
      "configured",
      "installed",
      "uninstalled",
      "removed",
      "cleared",
      "disabled",
      "enabled",
      "changed",
      "updated",
      "reinstalled"

    ];

    keywords.forEach(keyword => {

      if (lower.includes(keyword))

        data.troubleshooting.push(line.trim());

    });

    // Remote Support

    if (

      lower.includes("screen share") ||

      lower.includes("teams") ||

      lower.includes("remote") ||

      lower.includes("btrs")

    ) {

      data.remoteSupport.push(line.trim());

    }

    // Escalation

    if (

      lower.includes("escalated") ||

      lower.includes("advanced team") ||

      lower.includes("resolver") ||

      lower.includes("lcs") ||

      lower.includes("war room")

    ) {

      data.escalation.push(line.trim());

    }

    // Business Impact

    if (

      lower.includes("unable") ||

      lower.includes("cannot") ||

      lower.includes("impact") ||

      lower.includes("productivity") ||

      lower.includes("cannot access")

    ) {

      data.businessImpact.push(line.trim());

    }

    // Error Messages

    if (

      lower.includes("error") ||

      lower.includes("failed") ||

      lower.includes("unavailable") ||

      lower.includes("offline")

    ) {

      data.errors.push(line.trim());

    }

    // User Confirmation

    if (

      lower.includes("working now") ||

      lower.includes("resolved") ||

      lower.includes("confirmed") ||

      lower.includes("successfully") ||

      lower.includes("thank you")

    ) {

      data.userConfirmation.push(line.trim());

    }

    // Ticket Numbers

    const match = line.match(/INC\d+/i);

    if (match)

      data.ticketNumbers.push(match[0]);

  });

  // --------------------
  // Status
  // --------------------

  if (/resolved|working now|issue resolved|confirmed/i.test(chat))

    data.status = "Resolved";

  else if (/escalated|advanced team|resolver|lcs/i.test(chat))

    data.status = "Escalated";

  else if (/pending|awaiting|investigation/i.test(chat))

    data.status = "Pending";

  else if (/disconnected|ended before|offline/i.test(chat))

    data.status = "Incomplete";

  return data;

}