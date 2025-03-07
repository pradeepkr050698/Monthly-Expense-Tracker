let expenses = JSON.parse(localStorage.getItem('expenses')) || {};  // Load saved expenses from localStorage (if any)
let currentMonth = new Date().getMonth();  // Default to current month
let currentYear = new Date().getFullYear();  // Default to current year

// Function to format date as DD/MM/YYYY
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Display dates based on selected month
function displayDates() {
    const month = document.getElementById('month-selector').value;
    currentMonth = parseInt(month);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const table = document.getElementById('expense-table');
    table.innerHTML = '';  // Clear the table before displaying new month

    for (let i = 1; i <= daysInMonth; i++) {
        let date = new Date(currentYear, currentMonth, i);
        let formattedDate = formatDate(date);
        let row = table.insertRow();
        row.innerHTML = `
            <td class="date" onclick="showExpenses(${i})">${formattedDate}</td>
            <td class="total-expense" id="total-expense-${i}">0 Rs</td>
            <td>
                <button onclick="openPopup(${i})">+</button>
                <span class="eye-icon" onclick="toggleExpenseList(${i})">&#128065;</span>
            </td>
        `;
    }

    // Load expenses for the selected month
    loadExpensesForMonth(currentMonth);
}

// Load expenses for a specific month
function loadExpensesForMonth(month) {
    const savedExpensesForMonth = expenses[month] || {};

    for (let date in savedExpensesForMonth) {
        updateExpenseList(date, savedExpensesForMonth[date]);
    }
}

// Show expenses for a specific date
function showExpenses(date) {
    const expenseList = document.getElementById(`expense-list-${date}`);
    expenseList.style.display = expenseList.style.display === 'none' ? 'block' : 'none';
}

// Toggle the visibility of expense list
function toggleExpenseList(date) {
    const expenseList = document.getElementById(`expense-list-${date}`);
    expenseList.style.display = expenseList.style.display === 'none' ? 'block' : 'none';
}

// Open popup to add expense for a specific date
function openPopup(date) {
    document.getElementById('expense-popup').style.display = 'flex';
    document.getElementById('expense-item').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-popup').setAttribute('data-date', date);
}

// Close popup
function closePopup() {
    document.getElementById('expense-popup').style.display = 'none';
}

// Save expense for a specific date
function saveExpense() {
    const date = document.getElementById('expense-popup').getAttribute('data-date');
    const itemName = document.getElementById('expense-item').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (itemName && amount) {
        expenses[currentMonth] = expenses[currentMonth] || {};  // Initialize month data
        expenses[currentMonth][date] = expenses[currentMonth][date] || [];
        expenses[currentMonth][date].push({ item: itemName, amount: amount });
        updateExpenseList(date, expenses[currentMonth][date]);
        saveToLocalStorage();
        closePopup();
    } else {
        alert("Please enter both item and amount!");
    }
}

// Update the list of expenses for a specific date
function updateExpenseList(date, expenseData) {
    const expenseListContainer = document.getElementById(`expense-list-${date}`) || createExpenseListContainer(date);
    const expenseList = document.getElementById(`expenses-${date}`);

    let totalExpense = 0;
    expenseList.innerHTML = '';  // Clear the current list

    expenseData.forEach((expense, index) => {
        totalExpense += expense.amount;
        const expenseItem = document.createElement('div');
        expenseItem.classList.add('expense-item');
        expenseItem.innerHTML = `
            <span>${expense.item}: ${expense.amount} Rs</span>
            <button onclick="removeExpense(${date}, ${index})">Remove</button>
        `;
        expenseList.appendChild(expenseItem);
    });

    // Update the total expense for this date
    document.getElementById(`total-expense-${date}`).textContent = totalExpense + ' Rs';
    updateRemainingBalance();
}

// Remove a specific expense for a date
function removeExpense(date, index) {
    expenses[currentMonth][date].splice(index, 1);
    updateExpenseList(date, expenses[currentMonth][date]);
    saveToLocalStorage();
}

// Create a new expense list container for a date
function createExpenseListContainer(date) {
    const tableRow = document.querySelectorAll(`#expense-table tr`)[date - 1];  // Get the corresponding row
    const newExpenseList = document.createElement('div');
    newExpenseList.classList.add('expense-list');
    newExpenseList.id = `expense-list-${date}`;
    newExpenseList.innerHTML = `
        <ul id="expenses-${date}"></ul>
        <button class="collapse-button" onclick="collapseExpenses(${date})">X</button>
    `;
    tableRow.appendChild(newExpenseList);
    return newExpenseList;
}

// Collapse the expense list for a date
function collapseExpenses(date) {
    const expenseList = document.getElementById(`expense-list-${date}`);
    expenseList.style.display = 'none';
}

// Update remaining balance
function updateRemainingBalance() {
    const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value) || 0;

    const totalExpenses = calculateTotalExpenses();
    const remainingBalance = monthlyExpenses - totalExpenses;

    // Update only the numeric value of remaining balance
    document.getElementById('remaining-amount').textContent = remainingBalance;  // Rs will be added directly in HTML
}

// Calculate the total expenses for the month
function calculateTotalExpenses() {
    let total = 0;
    for (let date in expenses[currentMonth]) {
        total += expenses[currentMonth][date].reduce((sum, expense) => sum + expense.amount, 0);
    }
    return total;
}

// Save expenses to localStorage
function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Initial call to display dates for the default month
displayDates();
