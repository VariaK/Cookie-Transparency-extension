document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    chrome.cookies.getAll({ url: url }, async (cookies) => {
      const listEl = document.getElementById("cookieList");
      listEl.innerHTML = ""; // Clear previous

      for (const cookie of cookies) {
        const aiSummary = await fetchAIInsight(cookie.name, cookie.domain);

        const item = document.createElement("div");
        item.className = "cookie-item";
        item.innerHTML = `
          <strong>${cookie.name}</strong><br/>
          Domain: ${cookie.domain}<br/>
          Summary: ${aiSummary || "Explanation not available"}
          <hr/>
        `;
        listEl.appendChild(item);
      }
    });
  });
});

async function fetchAIInsight(name, domain) {
  try {
    const res = await fetch("https://YOUR_API_ENDPOINT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookie_name: name, domain: domain }),
    });

    const data = await res.json();
    return data.description_ai;
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return null;
  }
}
