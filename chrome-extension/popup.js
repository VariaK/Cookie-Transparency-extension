import { API_URL } from "./config.js";

document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    chrome.cookies.getAll({ url: url }, async (cookies) => {
      const listEl = document.getElementById("cookieList");
      listEl.innerHTML = "";
      for (const cookie of cookies) {
        const aiData = await fetchAIInsight(cookie.name, cookie.domain);
        const item = document.createElement("div");
        item.className = "cookie-item";
        item.innerHTML = `
        <strong>${cookie.name}</strong>
        <div class="cookie-meta">
        Domain: ${cookie.domain}<br/>
        Category: ${aiData?.category || "Unknown"}<br/>
        Risk Score: 
        <span class="badge ${getRiskClass(aiData?.risk_score)}">${
          aiData?.risk_score || "Unknown"
        }</span>
        </div>
        <div class="cookie-summary">
        ${
          typeof aiData?.ai_explanation === "string"
            ? aiData.ai_explanation
            : JSON.stringify(aiData?.ai_explanation) ||
              "Explanation not available"
        }
  </div>`;
        listEl.appendChild(item);
      }
    });
  });
});
function getRiskClass(risk) {
  if (!risk) return "";
  switch (risk.toLowerCase()) {
    case "low":
      return "low";
    case "medium":
      return "medium";
    case "high":
      return "high";
    default:
      return "";
  }
}

async function fetchAIInsight(name, domain) {
  try {
    const res = await fetch(
      API_URL, // REPLACE WITH ACTUAL API ENDPOINT FROM API_GATEWAY
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cookie_name: name, domain: domain }),
      }
    );

    const data = await res.json();
    return {
      // Updated key name from your Lambda
      ai_explanation: data.ai_explanation,
      category: data.category,
      risk_score: data.risk_score,
    };
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return null;
  }
}
