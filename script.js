const API      = "https://expense-tracker-1-x5ce.onrender.com/api";
// const API = "http://localhost:8000/api";
const AUTH_API = `${API}/auth`;
const EXP_API  = `${API}/expenses`;

function getToken()     { return localStorage.getItem("token"); }
function getUser()      { return JSON.parse(localStorage.getItem("user") || "null"); }
function saveAuth(data) { localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify({ username: data.username, email: data.email })); }
function clearAuth()    { localStorage.removeItem("token"); localStorage.removeItem("user"); }
function authHeaders()  { return { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` }; }

function switchTab(tab) {
  document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("signup-form").classList.toggle("hidden", tab !== "signup");
  document.getElementById("login-tab").classList.toggle("active", tab === "login");
  document.getElementById("signup-tab").classList.toggle("active", tab === "signup");
}

function handleLogout() {
  clearAuth();
  window.location.reload();
}

function checkAuth() {
  const user = getUser();
  if (getToken() && user) {
    document.getElementById("auth-page").classList.add("hidden");
    document.getElementById("app-page").classList.remove("hidden");
    document.getElementById("username-display").textContent = `👤 ${user.username}`;
    initApp();
  } else {
    document.getElementById("auth-page").classList.remove("hidden");
    document.getElementById("app-page").classList.add("hidden");
  }
}

document.getElementById("signup-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const errorEl  = document.getElementById("signup-error");
  const btn = e.target.querySelector("button[type='submit']");
  const username = document.getElementById("signup-username").value.trim();
  const email    = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  
  const originalText = btn.textContent;
  btn.textContent = "Creating Account...";
  btn.disabled = true;

  try {
    const res  = await fetch(`${AUTH_API}/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, email, password }) });
    const data = await res.json();
    if (!res.ok) { errorEl.textContent = data.error; errorEl.classList.remove("hidden"); btn.textContent = originalText; btn.disabled = false; return; }
    errorEl.classList.add("hidden");
    saveAuth(data);
    checkAuth();
  } catch (err) { errorEl.textContent = "Something went wrong."; errorEl.classList.remove("hidden"); btn.textContent = originalText; btn.disabled = false; }
});

document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const errorEl  = document.getElementById("login-error");
  const btn = e.target.querySelector("button[type='submit']");
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const originalText = btn.textContent;
  btn.textContent = "Logging in...";
  btn.disabled = true;

  try {
    const res  = await fetch(`${AUTH_API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { errorEl.textContent = data.error; errorEl.classList.remove("hidden"); btn.textContent = originalText; btn.disabled = false; return; }
    errorEl.classList.add("hidden");
    saveAuth(data);
    checkAuth();
  } catch (err) { errorEl.textContent = "Something went wrong."; errorEl.classList.remove("hidden"); btn.textContent = originalText; btn.disabled = false; }
});

function initApp() {
  const form           = document.getElementById("expense-form");
  const nameInput      = document.getElementById("expense-name");
  const amountInput    = document.getElementById("expense-amount");
  const categoryInput  = document.getElementById("expense-category");
  const dateInput      = document.getElementById("expense-date");
  const expenseList    = document.getElementById("expense-list");
  const totalAmountEl  = document.getElementById("total-amount");
  const entryCountEl   = document.getElementById("entry-count");
  const monthTotalEl   = document.getElementById("month-total");
  const emptyState     = document.getElementById("empty-state");
  const clearBtn       = document.getElementById("clear-btn");
  const searchInput    = document.getElementById("search-input");
  const filterCategory = document.getElementById("filter-category");

  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  const categoryEmoji = {
    "General": "🗂", "Food": "🍔", "Transport": "🚗",
    "Shopping": "🛍", "Health": "💊", "Bills": "📋",
    "Entertainment": "🎮", "Travel": "✈️",
  };

  async function fetchExpenses() {
    try {
      const res = await fetch(EXP_API, { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const expenses = await res.json();
      render(expenses);
    } catch (err) { console.error("Failed to fetch:", err); }
  }

  function render(expenses) {
    const query     = (searchInput.value || "").toLowerCase().trim();
    const catFilter = filterCategory.value;
    const filtered  = expenses.filter((e) => {
      const matchSearch = !query || e.name.toLowerCase().includes(query) || e.category.toLowerCase().includes(query);
      const matchCat    = catFilter === "All" || e.category === catFilter;
      return matchSearch && matchCat;
    });
    expenseList.innerHTML = "";
    emptyState.classList.toggle("hidden", filtered.length > 0);
    clearBtn.classList.toggle("hidden", expenses.length === 0);
    filtered.forEach((expense) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="expense-emoji">${categoryEmoji[expense.category] || "🗂"}</div>
        <div class="expense-info">
          <div class="expense-name">${escapeHtml(expense.name)}</div>
          <div class="expense-meta">
            <span class="expense-date">📅 ${formatDate(expense.date)}</span>
            <span class="expense-category-tag">${escapeHtml(expense.category)}</span>
          </div>
        </div>
        <span class="expense-amount">${expense.amount.toFixed(2)}Rs</span>
        <button class="delete-btn" data-id="${expense._id}" title="Delete">✕</button>
      `;
      expenseList.appendChild(li);
    });
    updateSummary(expenses);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = nameInput.value.trim(), amount = parseFloat(amountInput.value), category = categoryInput.value, date = dateInput.value;
    if (!name || isNaN(amount) || amount <= 0 || !date) { shakeForm(); return; }
    try {
      await fetch(EXP_API, { method: "POST", headers: authHeaders(), body: JSON.stringify({ name, amount, category, date }) });
      nameInput.value = ""; amountInput.value = ""; dateInput.value = today;
      nameInput.focus();
      fetchExpenses();
    } catch (err) { console.error("Failed to add:", err); }
  });

  expenseList.addEventListener("click", async function (e) {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    const id = btn.dataset.id, li = btn.closest("li");
    li.style.transition = "opacity 0.2s, transform 0.2s";
    li.style.opacity = "0"; li.style.transform = "translateX(20px)";
    setTimeout(async () => {
      try { await fetch(`${EXP_API}/${id}`, { method: "DELETE", headers: authHeaders() }); fetchExpenses(); }
      catch (err) { console.error("Failed to delete:", err); }
    }, 200);
  });

  clearBtn.addEventListener("click", async function () {
    if (!confirm("Delete all expenses? This cannot be undone.")) return;
    const res = await fetch(EXP_API, { headers: authHeaders() });
    const expenses = await res.json();
    await Promise.all(expenses.map(e => fetch(`${EXP_API}/${e._id}`, { method: "DELETE", headers: authHeaders() })));
    fetchExpenses();
  });

  searchInput.addEventListener("input", fetchExpenses);
  filterCategory.addEventListener("change", fetchExpenses);

  function updateSummary(expenses) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const now   = new Date();
    const thisMonth = expenses.filter((e) => { const [y, m] = (e.date || "").split("-").map(Number); return y === now.getFullYear() && m === (now.getMonth() + 1); }).reduce((sum, e) => sum + e.amount, 0);
    totalAmountEl.textContent = `${total.toFixed(2)}Rs`;
    entryCountEl.textContent  = expenses.length;
    monthTotalEl.textContent  = `${thisMonth.toFixed(2)}Rs`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d), now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    if (dateStr === todayStr) return "Today";
    if (dateStr === yest.toISOString().split("T")[0]) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function escapeHtml(str) { return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function shakeForm() {
    form.style.animation = "none";
    requestAnimationFrame(() => { form.style.animation = "shake 0.35s ease"; });
  }

  const style = document.createElement("style");
  style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }`;
  document.head.appendChild(style);

  document.getElementById("logout-btn").addEventListener("click", handleLogout);

  fetchExpenses();
}

checkAuth();
