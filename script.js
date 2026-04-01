const API = "https://expense-tracker-bb02.onrender.com/api/expenses";

document.addEventListener("DOMContentLoaded", function () {
  const form            = document.getElementById("expense-form");
  const nameInput       = document.getElementById("expense-name");
  const amountInput     = document.getElementById("expense-amount");
  const categoryInput   = document.getElementById("expense-category");
  const dateInput       = document.getElementById("expense-date");
  const expenseList     = document.getElementById("expense-list");
  const totalAmountEl   = document.getElementById("total-amount");
  const entryCountEl    = document.getElementById("entry-count");
  const monthTotalEl    = document.getElementById("month-total");
  const emptyState      = document.getElementById("empty-state");
  const clearBtn        = document.getElementById("clear-btn");
  const searchInput     = document.getElementById("search-input");
  const filterCategory  = document.getElementById("filter-category");

  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  const categoryEmoji = {
    "General":       "🗂",
    "Food":          "🍔",
    "Transport":     "🚗",
    "Shopping":      "🛍",
    "Health":        "💊",
    "Bills":         "📋",
    "Entertainment": "🎮",
    "Travel":        "✈️",
  };

  // ── Load all expenses from MongoDB ──
  async function fetchExpenses() {
    try {
      const res = await fetch(API);
      const expenses = await res.json();
      render(expenses);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  }

  // ── Render expenses to the page ──
  function render(expenses) {
    const query     = (searchInput.value || "").toLowerCase().trim();
    const catFilter = filterCategory.value;

    const filtered = expenses.filter((e) => {
      const matchSearch = !query || e.name.toLowerCase().includes(query) || e.category.toLowerCase().includes(query);
      const matchCat    = catFilter === "All" || e.category === catFilter;
      return matchSearch && matchCat;
    });

    expenseList.innerHTML = "";
    emptyState.classList.toggle("hidden", filtered.length > 0);
    clearBtn.classList.toggle("hidden", expenses.length === 0);

    filtered.forEach((expense) => {
      const li = document.createElement("li");
      li.dataset.id = expense._id;
      li.innerHTML = `
        <div class="expense-emoji">${categoryEmoji[expense.category] || "🗂"}</div>
        <div class="expense-info">
          <div class="expense-name">${escapeHtml(expense.name)}</div>
          <div class="expense-meta">
            <span class="expense-date">📅 ${formatDate(expense.date)}</span>
            <span class="expense-category-tag">${escapeHtml(expense.category)}</span>
          </div>
        </div>
        <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
        <button class="delete-btn" data-id="${expense._id}" title="Delete">✕</button>
      `;
      expenseList.appendChild(li);
    });

    updateSummary(expenses);
  }

  // ── Add expense ──
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name     = nameInput.value.trim();
    const amount   = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date     = dateInput.value;

    if (!name || isNaN(amount) || amount <= 0 || !date) {
      shakeForm();
      return;
    }

    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, category, date }),
      });

      nameInput.value   = "";
      amountInput.value = "";
      dateInput.value   = today;
      nameInput.focus();

      fetchExpenses();
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  });

  // ── Delete expense ──
  expenseList.addEventListener("click", async function (e) {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    const li = btn.closest("li");

    li.style.transition = "opacity 0.2s, transform 0.2s";
    li.style.opacity    = "0";
    li.style.transform  = "translateX(20px)";

    setTimeout(async () => {
      try {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        fetchExpenses();
      } catch (err) {
        console.error("Failed to delete expense:", err);
      }
    }, 200);
  });

  // ── Clear all ──
  clearBtn.addEventListener("click", async function () {
    if (!confirm("Delete all expenses? This cannot be undone.")) return;
    const res      = await fetch(API);
    const expenses = await res.json();
    await Promise.all(expenses.map(e => fetch(`${API}/${e._id}`, { method: "DELETE" })));
    fetchExpenses();
  });

  // ── Search & filter ──
  searchInput.addEventListener("input", fetchExpenses);
  filterCategory.addEventListener("change", fetchExpenses);

  // ── Helpers ──
  function updateSummary(expenses) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const now   = new Date();
    const thisMonth = expenses
      .filter((e) => {
        const [y, m] = (e.date || "").split("-").map(Number);
        return y === now.getFullYear() && m === (now.getMonth() + 1);
      })
      .reduce((sum, e) => sum + e.amount, 0);

    totalAmountEl.textContent = `$${total.toFixed(2)}`;
    entryCountEl.textContent  = expenses.length;
    monthTotalEl.textContent  = `$${thisMonth.toFixed(2)}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date      = new Date(y, m - 1, d);
    const now       = new Date();
    const todayStr  = now.toISOString().split("T")[0];
    const yest      = new Date(now);
    yest.setDate(now.getDate() - 1);
    const yestStr   = yest.toISOString().split("T")[0];
    if (dateStr === todayStr) return "Today";
    if (dateStr === yestStr)  return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function shakeForm() {
    form.style.animation = "none";
    requestAnimationFrame(() => { form.style.animation = "shake 0.35s ease"; });
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  // ── Initial load ──
  fetchExpenses();
});