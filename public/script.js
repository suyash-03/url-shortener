const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const shortenBtn = document.getElementById("shorten-btn");
const resultDiv = document.getElementById("result");
const shortUrlLink = document.getElementById("short-url");
const copyBtn = document.getElementById("copy-btn");
const urlsBody = document.getElementById("urls-body");
const emptyState = document.getElementById("empty-state");
const urlsTable = document.getElementById("urls-table");

// --- Shorten URL ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  shortenBtn.disabled = true;
  shortenBtn.textContent = "Shortening…";

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

    // Show result
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    resultDiv.classList.remove("hidden");

    urlInput.value = "";
    loadUrls();
  } catch (err) {
    alert("Network error — is the server running?");
    console.error(err);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = "Shorten";
  }
});

// --- Copy to clipboard ---
copyBtn.addEventListener("click", async () => {
  const url = shortUrlLink.textContent;
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "✅";
    setTimeout(() => (copyBtn.textContent = "📋"), 1500);
  } catch {
    // Fallback for older browsers
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    copyBtn.textContent = "✅";
    setTimeout(() => (copyBtn.textContent = "📋"), 1500);
  }
});

// --- Load all URLs ---
async function loadUrls() {
  try {
    const res = await fetch("/api/urls");
    const urls = await res.json();

    if (urls.length === 0) {
      urlsTable.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    urlsTable.style.display = "table";
    emptyState.style.display = "none";

    urlsBody.innerHTML = urls
      .map(
        (u) => `
      <tr>
        <td><a class="code-link" href="/${u.short_code}" target="_blank">${u.short_code}</a></td>
        <td class="url-cell" title="${escapeHtml(u.original_url)}">${escapeHtml(u.original_url)}</td>
        <td><span class="clicks-badge">${u.clicks}</span></td>
        <td style="color: var(--text-muted); font-size: 0.8rem">${formatDate(u.created_at)}</td>
        <td><button class="delete-btn" data-code="${u.short_code}">Delete</button></td>
      </tr>
    `
      )
      .join("");
  } catch (err) {
    console.error("Failed to load URLs:", err);
  }
}

// --- Delete URL ---
urlsBody.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const code = e.target.dataset.code;
  if (!confirm(`Delete short URL /${code}?`)) return;

  try {
    await fetch(`/api/urls/${code}`, { method: "DELETE" });
    loadUrls();
  } catch (err) {
    alert("Failed to delete");
    console.error(err);
  }
});

// --- Helpers ---
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso + "Z");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Initial load
loadUrls();
