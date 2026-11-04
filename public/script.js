const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const shortenBtn = document.getElementById("shorten-btn");
const resultCard = document.getElementById("result");
const shortUrlDisplay = document.getElementById("short-url-display");
const resultOriginal = document.getElementById("result-original");
const copyBtn = document.getElementById("copy-btn");
const copyIcon = document.getElementById("copy-icon");
const checkIcon = document.getElementById("check-icon");
const linksList = document.getElementById("links-list");
const linksCount = document.getElementById("links-count");
const emptyState = document.getElementById("empty-state");

let lastShortUrl = "";

// --- Shorten ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  shortenBtn.classList.add("loading");
  shortenBtn.disabled = true;

  try {
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    lastShortUrl = data.shortUrl;
    shortUrlDisplay.textContent = data.shortUrl;
    resultOriginal.textContent = data.originalUrl;
    resultOriginal.title = data.originalUrl;
    resultCard.hidden = false;

    // Re-trigger animation
    resultCard.style.animation = "none";
    resultCard.offsetHeight; // reflow
    resultCard.style.animation = "";

    urlInput.value = "";
    loadUrls();
  } catch {
    alert("Network error — is the server running?");
  } finally {
    shortenBtn.classList.remove("loading");
    shortenBtn.disabled = false;
  }
});

// --- Copy ---
copyBtn.addEventListener("click", async () => {
  if (!lastShortUrl) return;
  try {
    await navigator.clipboard.writeText(lastShortUrl);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = lastShortUrl;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  copyIcon.style.display = "none";
  checkIcon.style.display = "block";
  copyBtn.classList.add("copied");
  setTimeout(() => {
    copyIcon.style.display = "block";
    checkIcon.style.display = "none";
    copyBtn.classList.remove("copied");
  }, 1800);
});

// --- Load Links ---
async function loadUrls() {
  try {
    const res = await fetch("/api/urls");
    const urls = await res.json();

    if (urls.length === 0) {
      linksList.innerHTML = "";
      emptyState.hidden = false;
      linksCount.textContent = "";
      return;
    }

    emptyState.hidden = true;
    linksCount.textContent = urls.length;

    linksList.innerHTML = urls
      .map((u) => {
        const baseUrl =
          location.origin === "null" ? "http://localhost:3000" : location.origin;
        return `
        <div class="link-card">
          <div class="link-info">
            <a class="link-code" href="/${esc(u.short_code)}" target="_blank" rel="noopener">${baseUrl}/${esc(u.short_code)}</a>
            <span class="link-original" title="${esc(u.original_url)}">${esc(u.original_url)}</span>
          </div>
          <div class="link-meta">
            <span class="clicks-pill">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8c2-3 4-5 5-5s3 2 5 5c-2 3-4 5-5 5s-3-2-5-5z"/><circle cx="8" cy="8" r="1.5"/></svg>
              ${u.clicks}
            </span>
            <span class="link-time">${relativeTime(u.created_at)}</span>
            <button class="link-delete" data-code="${esc(u.short_code)}" title="Delete">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h10M5 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M6 8v4M10 8v4"/><path d="M4 5l.7 8.4a1.5 1.5 0 0 0 1.5 1.6h3.6a1.5 1.5 0 0 0 1.5-1.6L12 5"/></svg>
            </button>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Failed to load URLs:", err);
  }
}

// --- Delete ---
linksList.addEventListener("click", async (e) => {
  const btn = e.target.closest(".link-delete");
  if (!btn) return;
  const code = btn.dataset.code;
  if (!confirm(`Delete /${code}?`)) return;
  try {
    await fetch(`/api/urls/${code}`, { method: "DELETE" });
    loadUrls();
  } catch {
    alert("Failed to delete");
  }
});

// --- Helpers ---
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function relativeTime(iso) {
  const now = Date.now();
  const then = new Date(iso + "Z").getTime();
  const diff = Math.max(0, now - then);
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso + "Z").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// --- Init ---
loadUrls();
