document.addEventListener("DOMContentLoaded", function() {
  const expenseform = document.getElementById("expense-form")
  const expenseNameInput = document.getElementById("expense-name")
  const expenseAmountInput = document.getElementById("expense-amount")
  const expenseList = document.getElementById("expense-list")
  const totalAmountDisplay = document.getElementById("total-amount")

  let expenses = []
  let totalAmount = 0

  expenseform.addEventListener("submit", function(e) {
    e.preventDefault()

    const name = expenseNameInput.value.trim()
    const amount = parseFloat(expenseAmountInput.value)

    if (name === "" || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid expense name and amount.")
      return
      
    }
    const newexpense = {
      name: name,
      amount: amount
    }
    expenses.push(newexpense)
    saveExpensesTolocal();
    renderExpenses();
    updateTotal();

    expenseNameInput.value = ""
    expenseAmountInput.value = ""
  });
  function renderExpenses() {
    expenseList.innerHTML = ""
    expenses.forEach((expense) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${expense.name} - $${expense.amount}
        <button data-id="${expense.id}">Delete</button>
        `;
      expenseList.appendChild(li);
    });
  }
  function calculateTotal() {
    totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
  function saveExpensesTolocal() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function updateTotal() {
    calculateTotal();
    totalAmountDisplay.textContent = `$${totalAmount.toFixed(2)}`;
  }
    expenseList.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const expenseId = parseInt(e.target.getAttribute("data-id"));
      expenses = expenses.filter((expense) => expense.id !== expenseId);

      saveExpensesTolocal();
      renderExpenses();
      updateTotal();
    }
  });


});