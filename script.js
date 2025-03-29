let expenses = JSON.parse(localStorage.getItem('expenses')) || {};  // Load saved expenses from localStorage (if any)
let currentMonth = new Date().getMonth();  // Default to current month
let currentYear = new Date().getFullYear();  // Default to current year
let today = new Date();
let todayDate = today.getDate();  // Get today's date

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
    currentMonth = parseInt(month);  // Update currentMonth based on selected month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const table = document.getElementById('expense-table');
    table.innerHTML = '';  // Clear the table before displaying new month

    for (let i = 1; i <= daysInMonth; i++) {
        let date = new Date(currentYear, currentMonth, i);
        let formattedDate = formatDate(date);
        let row = table.insertRow();
        row.innerHTML = `    
            <td class="date" id="date-${i}" onclick="showExpenses(${i})">${formattedDate}</td>
            <td class="total-expense" id="total-expense-${i}">0 Rs</td>
            <td>
                <button class="add-expense-btn" onclick="openPopup(${i})">+</button>
                <span class="eye-icon" onclick="toggleExpenseList(${i})">&#128065;</span>
            </td>
        `;
    }

    // Load data for the selected month
    loadMonthData();

    // Highlight today's date if it's in the current month and scroll to it
    if (today.getMonth() === currentMonth && todayDate <= new Date(currentYear, currentMonth + 1, 0).getDate()) {
        const todayCell = document.getElementById(`date-${todayDate}`);
        if (todayCell) {
            todayCell.style.backgroundColor = '#f0f0f0'; // Highlight today's date
            todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to today's date
        }
    }
}

// Update the month selector to reflect the current month
function updateMonthSelector() {
    const monthSelector = document.getElementById('month-selector');
    const currentMonthIndex = new Date().getMonth();  // Get the current month index (0-11)
    monthSelector.value = currentMonthIndex;  // Set the value of the month selector
}

// Call the updateMonthSelector when the page loads to auto-select the current month
window.onload = function() {
    updateMonthSelector();  // Ensure the current month is selected in the dropdown
    displayDates();  // Display dates for the selected month
};

// Show expenses for a specific date
function showExpenses(date) {
    const expenseList = document.getElementById(`expense-list-${date}`);
    expenseList.style.display = expenseList.style.display === 'none' ? 'block' : 'none';
}

// Toggle the visibility of the expense list for a specific date
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
        // Initialize the current month's expenses if not already initialized
        if (!expenses[currentMonth]) {
            expenses[currentMonth] = { dailyExpenses: {} };
        }

        // If the date doesn't exist in the daily expenses, initialize it
        if (!expenses[currentMonth].dailyExpenses[date]) {
            expenses[currentMonth].dailyExpenses[date] = [];
        }

        // Push the new expense to the daily expenses of that date
        expenses[currentMonth].dailyExpenses[date].push({ item: itemName, amount: amount });

        // Update the expense list for this date
        updateExpenseList(date);

        // Save the updated expenses to localStorage
        saveToLocalStorage();

        // Close the popup
        closePopup();
    } else {
        alert("Please enter both item and amount!");
    }
}

// Update the list of expenses for a specific date
function updateExpenseList(date) {
    const expenseListContainer = document.getElementById(`expense-list-${date}`) || createExpenseListContainer(date);
    const expenseList = document.getElementById(`expenses-${date}`);

    let totalExpense = 0;
    expenseList.innerHTML = '';  // Clear the current list

    if (expenses[currentMonth] && expenses[currentMonth].dailyExpenses[date]) {
        expenses[currentMonth].dailyExpenses[date].forEach((expense, index) => {
            totalExpense += expense.amount;
            const expenseItem = document.createElement('div');
            expenseItem.classList.add('expense-item');
            expenseItem.innerHTML = `
                <span>${expense.item}: ${expense.amount} Rs</span>
                <button onclick="removeExpense(${date}, ${index})">Remove</button>
            `;
            expenseList.appendChild(expenseItem);
        });
    }

    // Update the total expense for this date
    document.getElementById(`total-expense-${date}`).textContent = totalExpense + ' Rs';

    // Update the remaining balance after each expense
    updateRemainingBalance();
}

// Remove a specific expense for a date
function removeExpense(date, index) {
    expenses[currentMonth].dailyExpenses[date].splice(index, 1);
    updateExpenseList(date);
    saveToLocalStorage();  // Save the updated data to localStorage
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
    if (expenses[currentMonth] && expenses[currentMonth].dailyExpenses) {
        for (let date in expenses[currentMonth].dailyExpenses) {
            total += expenses[currentMonth].dailyExpenses[date].reduce((sum, expense) => sum + expense.amount, 0);
        }
    }
    return total;
}

// Save expenses to localStorage
function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Load data for the selected month
function loadMonthData() {
    const monthData = expenses[currentMonth] || { monthlyExpenses: 0, emergencyFunds: 0, savings: 0, dailyExpenses: {} };

    // Load Monthly Expenses, Emergency Funds, and Savings
    document.getElementById('monthly-expenses').value = monthData.monthlyExpenses;
    document.getElementById('emergency-funds').value = monthData.emergencyFunds;
    document.getElementById('savings').value = monthData.savings;

    // Load daily expenses for this month
    for (let date in monthData.dailyExpenses) {
        updateExpenseList(date);
    }
    updateRemainingBalance();  // Update the remaining balance based on current data
}

// Save current month’s data
function saveMonthData() {
    const monthData = {
        monthlyExpenses: parseFloat(document.getElementById('monthly-expenses').value) || 0,
        emergencyFunds: parseFloat(document.getElementById('emergency-funds').value) || 0,
        savings: parseFloat(document.getElementById('savings').value) || 0,
        dailyExpenses: expenses[currentMonth] ? expenses[currentMonth].dailyExpenses : {},
    };
    expenses[currentMonth] = monthData;
    saveToLocalStorage();  // Save the updated data to localStorage
}

// Add a reset button to clear all data from localStorage
function resetData() {
    localStorage.removeItem('expenses');  // Clear all data from localStorage
    expenses = {};  // Reset the expenses object
    displayDates();  // Re-render the calendar and reset inputs
    document.getElementById('monthly-expenses').value = '';
    document.getElementById('emergency-funds').value = '';
    document.getElementById('savings').value = '';
    document.getElementById('remaining-amount').textContent = '0';  // Reset the remaining balance
}

// Add the reset button at the bottom of the page
document.getElementById('reset-button').addEventListener('click', resetData);
