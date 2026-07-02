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

  const applications = [];

  const troubleshooting = [];

  let status = "Pending";

  // Common enterprise apps
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
    "ServiceNow"
  ];

  appList.forEach(app => {
    if (chat.toLowerCase().includes(app.toLowerCase())) {
      applications.push(app);
    }
  });

  // Troubleshooting keywords
  const keywords = [
    "reset",
    "reinstall",
    "retry",
    "verified",
    "checked",
    "cleared",
    "installed",
    "removed",
    "updated",
    "configured",
    "rebooted",
    "tested"
  ];

  chat.split("\n").forEach(line => {

    keywords.forEach(keyword => {
      if (line.toLowerCase().includes(keyword)) {
        troubleshooting.push(line.trim());
      }
    });

  });

  if (/resolved|working|fixed|confirmed/i.test(chat))
    status = "Resolved";

  if (/escalated|lcs|resolver team/i.test(chat))
    status = "Escalated";

  if (/pending|awaiting/i.test(chat))
    status = "Pending";

  if (/disconnected|ended before/i.test(chat))
    status = "Incomplete";

  return {

    applications,

    troubleshooting,

    status

  };

}