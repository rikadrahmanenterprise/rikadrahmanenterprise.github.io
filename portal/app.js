const $ = s => document.querySelector(s);
let items = [];
let category = "All";
const available = new Set();
const icons = {Software:"▣", Games:"◈", Development:"⌘"};
const escapeHtml = (s="") => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function fileUrl(path) {
  const base = (window.PORTAL_CONFIG?.downloadBaseUrl || "/downloads").replace(/\/+$/,"");
  const parts = String(path || "").split("/");
  if (!path || parts.some(p => !p || p === "." || p === "..")) return "";
  return base + "/" + parts.map(encodeURIComponent).join("/");
}
function render() {
  const query = $("#search").value.trim().toLowerCase();
  const filtered = items.filter(item => {
    const matchesCategory = category === "All" || item.category === category;
    const haystack = [item.title,item.category,item.platform,item.description].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(query);
  });
  $("#result-count").textContent = `${filtered.length.toString().padStart(2,"0")} RESOURCE${filtered.length===1?"":"S"}`;
  $("#items").innerHTML = filtered.map(item => {
    const ready = available.has(item.id);
    return `<article class="item">
      <div class="item-top"><div class="item-icon">${icons[item.category] || "◇"}</div><span class="tag">${escapeHtml(item.category)}</span></div>
      <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
      <div class="meta"><span>${escapeHtml(item.platform || "Multiple platforms")}</span><span>${escapeHtml(item.version || "Version N/A")}</span><span>${escapeHtml(item.size || "Size N/A")}</span></div>
      <div class="item-bottom"><span class="path-note">${ready ? "FILE VERIFIED" : "COMING SOON"}</span>
      <button class="download" data-id="${escapeHtml(item.id)}" ${ready ? "" : "disabled"}>${ready ? "Download ↗" : "Unavailable"}</button></div>
    </article>`;
  }).join("");
  $("#empty").classList.toggle("hidden", filtered.length !== 0);
}
async function init() {
  $("#year").textContent = new Date().getFullYear();
  try {
    const response = await fetch("catalog.json",{cache:"no-store"});
    if (!response.ok) throw new Error("Catalog unavailable");
    const data = await response.json();
    items = Array.isArray(data.items) ? data.items : [];
    document.title = `${data.brand || "Download Portal"} — Home`;
    await Promise.all(items.map(async item => {
      const url = fileUrl(item.path);
      if (!url || item.access !== "public") return;
      try {
        const check = await fetch(url,{method:"HEAD",cache:"no-store"});
        if (check.ok) available.add(item.id);
      } catch (_) {}
    }));
    render();
  } catch (_) {
    $("#items").innerHTML = '<div class="loading">Library unavailable. Check catalog.json and server permissions.</div>';
    $("#result-count").textContent = "OFFLINE";
  }
}
$("#search").addEventListener("input",render);
$("#filters").addEventListener("click",event=>{
  const button=event.target.closest("button[data-category]");
  if(!button)return;
  category=button.dataset.category;
  document.querySelectorAll(".filter").forEach(el=>el.classList.toggle("active",el===button));
  render();
});
$("#items").addEventListener("click",event=>{
  const button=event.target.closest("button[data-id]");
  if(!button)return;
  const item=items.find(entry=>entry.id===button.dataset.id);
  const url=item && fileUrl(item.path);
  if(url && available.has(item.id)) window.location.href=url;
});
init();
