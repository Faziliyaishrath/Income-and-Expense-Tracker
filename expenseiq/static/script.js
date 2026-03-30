document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-icon');
    const navItems = document.querySelectorAll('.main-nav li');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Modal elements
    const transactionModal = document.getElementById('transaction-modal');
    const categoryModal = document.getElementById('category-modal');
    const goalModal = document.getElementById('goal-modal');
    const addTransactionBtn = document.getElementById('add-transaction');
    const addCategoryBtn = document.getElementById('add-category');
    const addGoalBtn = document.getElementById('add-goal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Form elements
    const transactionForm = document.getElementById('transaction-form');
    const categoryForm = document.getElementById('category-form');
    const goalForm = document.getElementById('goal-form');
    
    // Chart elements
    let categoryChart, monthlyChart, incomeExpenseChart, trendsChart;
    
    // App state
    let state = {
        transactions: [],
        categories: [],
        goals: [],
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
    };
    
    // Set current month and year in picker
    function setCurrentMonthYear() {
    if (state.transactions.length > 0) {
        const latest = state.transactions
            .sort((a, b) => b.date - a.date)[0];

        state.currentMonth = latest.date.getMonth();
        state.currentYear = latest.date.getFullYear();

        const month = String(state.currentMonth + 1).padStart(2, '0');
        document.getElementById('month-picker').value =
            `${state.currentYear}-${month}`;
    }
}
    
    // Update the login/register UI after checking current user
    function updateAuthUI(user) {
        const loginBtn = document.getElementById('login-btn-top');
        const signupBtn = document.getElementById('signup-btn-top');
        const welcomeUser = document.getElementById('welcome-user');

        if (user && user.name) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.classList.add('logout-style');
            signupBtn.style.display = 'none';

            welcomeUser.textContent = `Welcome, ${user.name}`;

            loginBtn.removeEventListener('click', onLoginClick);
            loginBtn.addEventListener('click', logoutUser);
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.href = '/login';
            loginBtn.classList.remove('logout-style');
            signupBtn.style.display = 'inline-block';
            welcomeUser.textContent = 'Welcome!';

            loginBtn.removeEventListener('click', logoutUser);
            loginBtn.addEventListener('click', onLoginClick);
        }
    }

    function onLoginClick(e) {
        // default link behavior to login page
    }

    function logoutUser(e) {
        e.preventDefault();
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(res => res.json())
        .then(() => {
            state.transactions = [];
            loadData();
            updateAuthUI(null);
            // Back to dashboard
            window.location.href = '/';
        });
    }

    function loadCurrentUser() {
        fetch('/current_user', {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            updateAuthUI(data.user);
        });
    }

    // Initialize the app
    function init() {
        setCurrentMonthYear();
        loadCurrentUser();
        loadData();
        setupEventListeners();
        renderDashboard();
        renderCategories();
        updateSummaryCards();
        renderRecentTransactions();
        renderTransactionsTable();
    }
    function renderDashboard() {
    updateSummaryCards(); 
    renderRecentTransactions();
    generateInsights(); // 🔥 this is your AI feature
}
    
    // Load data from database
function loadData() {
    // ✅ GET TRANSACTIONS (correct)
    fetch('/transactions', {
    method: 'GET',
    credentials: 'include'
})
.then(res => {
    if (!res.ok) {
        console.error("Not logged in or error");
        return [];
    }
    return res.json();
})
.then(data => {
    if (!Array.isArray(data)) return;

    state.transactions = data.map(t => ({
        ...t,
        date: new Date(t.date)
    }));
    setCurrentMonthYear(); 
    renderDashboard();
    renderTransactionsTable();
    updateSummaryCards();
    renderRecentTransactions();
    renderCharts();
});

    // Categories
    fetch('/categories', {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        state.categories = data;
        renderCategories();
    });

    // Goals
    fetch('/goals', {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        state.goals = data.map(g => ({
            ...g,
            date: new Date(g.date)
        }));
    });
}
    // Set up event listeners
    function setupEventListeners() {
        // Month picker
        const monthPicker = document.getElementById('month-picker');
        monthPicker.addEventListener('change', function() {
            const selectedDate = new Date(this.value + '-01');
            state.currentMonth = selectedDate.getMonth();
            state.currentYear = selectedDate.getFullYear();
            renderDashboard();
            renderCategories();
            renderCharts();
        });
        
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                const section = item.getAttribute('data-section');
                contentSections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(section).classList.add('active');
                
                // Render specific content when section changes
                if (section === 'transactions') {
                    renderTransactionsTable();
                } else if (section === 'budgets') {
                    renderCategories();
                } else if (section === 'reports') {
                    setTimeout(() => {
                        renderCharts();
                    }, 100); // 🔥 gives DOM time to load

                } else if (section === 'goals') {
                    renderGoals();
                }
            });
        });
        
        // Modal open buttons
        addTransactionBtn.addEventListener('click', () => openModal('transaction'));
        addCategoryBtn.addEventListener('click', () => openModal('category'));
        addGoalBtn.addEventListener('click', () => openModal('goal'));
        
        // Modal close buttons
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModal();
            }
        });
        
        // Form submissions
        transactionForm.addEventListener('submit', handleTransactionSubmit);
        categoryForm.addEventListener('submit', handleCategorySubmit);
        goalForm.addEventListener('submit', handleGoalSubmit);
        
        // Report period navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            if (state.currentMonth === 0) {
                state.currentMonth = 11;
                state.currentYear--;
            } else {
                state.currentMonth--;
            }
            updateMonthDisplay();
            renderCharts();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            if (state.currentMonth === 11) {
                state.currentMonth = 0;
                state.currentYear++;
            } else {
                state.currentMonth++;
            }
            updateMonthDisplay();
            renderCharts();
        });
        
        // Filter changes
        document.getElementById('transaction-type').addEventListener('change', renderTransactionsTable);
        document.getElementById('transaction-category').addEventListener('change', renderTransactionsTable);
        document.getElementById('transaction-month').addEventListener('change', renderTransactionsTable);
        
        // Export data button
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', showExportOptions);
        }
    }
    
    // Show export options
    function showExportOptions() {
        const format = confirm('Export as CSV? (OK = CSV, Cancel = JSON)');
        if (format) {
            exportAsCSV();
        } else {
            exportAsJSON();
        }
    }
    
    // Export data as CSV
    function exportAsCSV() {
        if (state.transactions.length === 0) {
            alert('No transactions to export');
            return;
        }
        
        // Create CSV header
        const headers = ['Date', 'Description',  'Type', 'Amount'];
        const rows = state.transactions.map(trans => [
            trans.date.toISOString().split('T')[0] , // YYYY-MM-DD
            trans.description || '',
            trans.type,
            trans.amount
        ]);
        
        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        // Add summary section
        const totalIncome = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const summary = `\n\nSummary\nTotal Income,${totalIncome.toFixed(2)}\nTotal Expenses,${totalExpense.toFixed(2)}\nNet Savings,${(totalIncome - totalExpense).toFixed(2)}`;
        
        // Download CSV file
        downloadFile(csvContent + summary, 'transactions.csv', 'text/csv');
    }
    
    // Export data as JSON
    function exportAsJSON() {
        if (state.transactions.length === 0) {
            alert('No transactions to export');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            transactions: state.transactions,
            categories: state.categories,
            goals: state.goals,
            summary: {
                totalTransactions: state.transactions.length,
                totalIncome: state.transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0),
                totalExpenses: state.transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
            }
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, 'transactions.json', 'application/json');
    }
    
    // Helper function to download file
    function downloadFile(content, filename, mimeType) {
        const element = document.createElement('a');
        element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        // Show success message
        alert(`✅ Data exported successfully as ${filename}`);
    }
    
    // Toggle between light and dark theme
    function toggleTheme() {
        const body = document.body;
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        }
    }
    
    // Open modal
    function openModal(type) {
        closeModal(); // Close any open modal first
        
        if (type === 'transaction') {
            prepareTransactionModal();
            transactionModal.classList.add('active');
        } else if (type === 'category') {
            prepareCategoryModal();
            categoryModal.classList.add('active');
        } else if (type === 'goal') {
            prepareGoalModal();
            goalModal.classList.add('active');
        }
    }
    
    // Close modal
    function closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Prepare transaction modal
    function prepareTransactionModal() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('trans-date').value = today;
        
        // Populate category dropdown
        const categorySelect = document.getElementById('trans-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        state.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Prepare category modal
    function prepareCategoryModal() {
        document.getElementById('category-name').value = '';
        document.getElementById('category-budget').value = '';
        document.getElementById('category-icon').value = 'fa-utensils';
    }
    
    // Prepare goal modal
    function prepareGoalModal() {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthFormatted = nextMonth.toISOString().split('T')[0];
        
        document.getElementById('goal-name').value = '';
        document.getElementById('goal-target').value = '';
        document.getElementById('goal-saved').value = '0';
        document.getElementById('goal-date').value = nextMonthFormatted;
    }
    
    // Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();

    console.log("Submitting transaction...");

    const type = document.getElementById('trans-type').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const description = document.getElementById('trans-description').value;
    const categoryId = parseInt(document.getElementById('trans-category').value);
    const dateInput = document.getElementById('trans-date').value;

    const formattedDate = new Date(dateInput).toISOString().split('T')[0];

    console.log({ type, amount, description, categoryId, formattedDate });

fetch('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify({
        type,
        amount,
        description,
        categoryId,
        date: formattedDate
    })
})
.then(res => {
    if (!res.ok) {
        return res.text().then(text => {
            throw new Error(text); // shows real backend error
        });
    }
    return res.json();
})
.then(data => {
    console.log("SUCCESS:", data);
    loadData();
    closeModal();
    transactionForm.reset();
})
.catch(err => {
    console.error("ERROR:", err);
});
}
    // Handle category form submission
 function handleCategorySubmit(e) {
    e.preventDefault();

    const name = document.getElementById('category-name').value;
    const budget = parseFloat(document.getElementById('category-budget').value);
    const icon = document.getElementById('category-icon').value;

    // Generate a random color
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#00CC99', '#FF9F40'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    console.log("Submitting category...");

    fetch('/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            name,
            budget,
            icon,
            color
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Failed to add category");
        }
        return res.json();
    })
    .then(data => {
        console.log("SUCCESS:", data);

        // Reload data from DB
        loadData();

        // Update UI
        closeModal();
        categoryForm.reset();
    })
    .catch(err => {
        console.error("ERROR:", err);
    });
}
    // Handle goal form submission
function handleGoalSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const saved = parseFloat(document.getElementById('goal-saved').value);
    const dateInput = document.getElementById('goal-date').value;

    const formattedDate = new Date(dateInput);

    // ✅ 1. INSTANT UI UPDATE
    const newGoal = {
        id: Date.now(),  // temporary id
        name,
        target,
        saved,
        date: formattedDate
    };

    state.goals.push(newGoal);
    renderGoals();  // 🔥 instant update

    // ✅ 2. BACKEND SAVE
    fetch('/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            name,
            target,
            saved,
            date: formattedDate.toISOString().split('T')[0]
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Failed to save goal");
        }
        return res.json();
    })
    .then(() => {
        loadData(); // sync with DB
    })
    .catch(err => {
        console.error("ERROR:", err);
    });

    // ✅ Close modal & reset form
    closeModal();
    goalForm.reset();
}
    // Update summary cards
    function updateSummaryCards() {
        // Filter transactions for selected month
        const monthlyTransactions = state.transactions.filter(trans => {
            return trans.date.getMonth() === state.currentMonth && trans.date.getFullYear() === state.currentYear;
        });
        
        // Calculate totals
        const income = monthlyTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;
        
        // Update DOM
        document.getElementById('total-balance').textContent = `₹${balance.toFixed(2)}`;
        document.getElementById('monthly-income').textContent = `₹${income.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `₹${expenses.toFixed(2)}`;
        document.getElementById('savings-rate').textContent = `${savingsRate}%`;
        
        // Update change indicator
        const changeElement = document.querySelector('#total-balance + .change');
        if (balance > 0) {
            changeElement.classList.add('positive');
            changeElement.classList.remove('negative');
        } else if (balance < 0) {
            changeElement.classList.add('negative');
            changeElement.classList.remove('positive');
        } else {
            changeElement.classList.remove('positive', 'negative');
        }
    }
    
    // Render recent transactions
    function renderRecentTransactions() {
        const container = document.getElementById('recent-transactions');
        container.innerHTML = '';
        
        // Filter transactions for selected month
        const monthlyTransactions = state.transactions.filter(trans => {
            return trans.date.getMonth() === state.currentMonth && trans.date.getFullYear() === state.currentYear;
        });
        
        // Get 5 most recent transactions for the month
        const recentTransactions = monthlyTransactions
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);
        
        if (recentTransactions.length === 0) {
            container.innerHTML = '<p class="no-transactions">No transactions for this month. Add your first transaction!</p>';
            return;
        }
        
        recentTransactions.forEach(trans => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            
            const category = state.categories.find(cat => cat.id === trans.categoryId);
            
            transactionEl.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="fas ${trans.icon || 'fa-money-bill-wave'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${trans.description}</h4>
                        <p>${category?.name || trans.category} • ${formatDate(trans.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${trans.type}">
                    ${trans.type === 'income' ? '+' : '-'}₹${trans.amount.toFixed(2)}
                </div>
            `;
            
            container.appendChild(transactionEl);
        });
    }
    
    // Render transactions table
    function renderTransactionsTable() {
        const container = document.getElementById('transactions-list');
        container.innerHTML = '';
        
        const typeFilter = document.getElementById('transaction-type').value;
        const categoryFilter = document.getElementById('transaction-category').value;
        const monthFilter = document.getElementById('transaction-month').value;
        
        // Populate category filter
        const categorySelect = document.getElementById('transaction-category');
        if (categorySelect.options.length <= 1) { // Only "All Categories" option
            state.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
        
        // Populate month filter
        const monthSelect = document.getElementById('transaction-month');
        if (monthSelect.options.length <= 1) { // Only "All Months" option
            const months = [];
            state.transactions.forEach(trans => {
                const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
                if (!months.includes(monthYear)) {
                    months.push(monthYear);
                    
                    const option = document.createElement('option');
                    option.value = monthYear;
                    option.textContent = `${getMonthName(trans.date.getMonth())} ${trans.date.getFullYear()}`;
                    monthSelect.appendChild(option);
                }
            });
        }
        
        // Filter transactions
        let filteredTransactions = [...state.transactions];
        
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(trans => trans.type === typeFilter);
        }
        
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(trans => trans.categoryId === parseInt(categoryFilter));
        }
        
        if (monthFilter !== 'all') {
            const [year, month] = monthFilter.split('-').map(Number);
            filteredTransactions = filteredTransactions.filter(trans => {
                return trans.date.getFullYear() === year && trans.date.getMonth() === month;
            });
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => b.date - a.date);
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="no-transactions">No transactions found matching your filters.</td>
                </tr>
            `;
            return;
        }
        
        filteredTransactions.forEach(trans => {
            const row = document.createElement('tr');
            
            const category = state.categories.find(cat => cat.id === trans.categoryId);
            
            row.innerHTML = `
                <td>${formatDate(trans.date)}</td>
                <td>${trans.description}</td>
                <td>
                    <i class="fas ${trans.icon || 'fa-money-bill-wave'}"></i>
                    ${category?.name || trans.category}
                </td>
                <td>
                    <span class="badge ${trans.type === 'income' ? 'income' : 'expense'}">
                        ${trans.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="${trans.type === 'income' ? 'income' : 'expense'}">
                    ${trans.type === 'income' ? '+' : '-'}₹${trans.amount.toFixed(2)}
                </td>
                <td class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${trans.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${trans.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            container.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                editTransaction(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                deleteTransaction(id);
            });
        });
    }
    
    // Edit transaction
function editTransaction(id) {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;

    openModal('transaction');

    document.getElementById('trans-type').value = transaction.type;
    document.getElementById('trans-amount').value = transaction.amount;
    document.getElementById('trans-description').value = transaction.description;
    document.getElementById('trans-category').value = transaction.categoryId;
    document.getElementById('trans-date').value = transaction.date.toISOString().split('T')[0];

    // Remove old submit
    transactionForm.removeEventListener('submit', handleTransactionSubmit);

    transactionForm.onsubmit = function (e) { 
        e.preventDefault();

        // 🔥 Update UI instantly
        transaction.type = document.getElementById('trans-type').value;
        transaction.amount = parseFloat(document.getElementById('trans-amount').value);
        transaction.description = document.getElementById('trans-description').value;
        transaction.categoryId = parseInt(document.getElementById('trans-category').value);
        transaction.date = new Date(document.getElementById('trans-date').value);

        renderDashboard();
        renderTransactionsTable();
        renderCharts();

        // 🔥 Sync with backend
        fetch(`/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                type: transaction.type,
                amount: transaction.amount,
                description: transaction.description,
                categoryId: transaction.categoryId,
                date: transaction.date.toISOString().split('T')[0]
            })
        })
        .catch(err => console.error(err));

        closeModal();
        transactionForm.reset();

        // Restore default submit
        transactionForm.onsubmit = handleTransactionSubmit;
    };
}
    // Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {

        // 🔥 Instant UI update
        state.transactions = state.transactions.filter(t => t.id !== id);
        renderDashboard();
        renderTransactionsTable();
        renderCharts();

        // 🔥 Backend sync
        fetch(`/transactions/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .catch(err => console.error(err));
    }
}
    
    // Render budget categories
    function renderCategories() {
        const container = document.getElementById('budget-categories');
        container.innerHTML = '';
        
        if (state.categories.length === 0) {
            container.innerHTML = '<p class="no-categories">No categories yet. Add your first category!</p>';
            return;
        }
        
        // Calculate spent amounts per category
        const now = new Date();
        const currentMonth = state.currentMonth;
        const currentYear = state.currentYear;
        
        const categorySpending = {};
        state.transactions
            .filter(trans => trans.type === 'expense' && 
                  trans.date.getMonth() === currentMonth && 
                  trans.date.getFullYear() === currentYear)
            .forEach(trans => {
                if (!categorySpending[trans.categoryId]) {
                    categorySpending[trans.categoryId] = 0;
                }
                categorySpending[trans.categoryId] += trans.amount;
            });
        
        state.categories.forEach(category => {
            if (category.name === 'Income') return; // Skip income category
            
            const spent = categorySpending[category.id] || 0;
            const percentage = category.budget > 0 ? Math.min((spent / category.budget) * 100, 100) : 0;
            const remaining = category.budget - spent;
            
            const categoryEl = document.createElement('div');
            categoryEl.className = 'budget-category';
            
            categoryEl.innerHTML = `
                <div class="budget-category-header">
                    <div class="budget-icon" style="background-color: ${category.color || '#4361ee'}">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <div class="budget-title">
                        <h3>${category.name}</h3>
                        <p>Budget: ₹${category.budget.toFixed(2)}</p>
                    </div>
                </div>
                <div class="budget-amount">
                    Spent: ₹${spent.toFixed(2)} / Remaining: ₹${remaining.toFixed(2)}
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${percentage}%; background-color: ${category.color || '#4361ee'}"></div>
                </div>
                <div class="budget-stats">
                    <span>${percentage.toFixed(0)}% of budget</span>
                    <span>₹${remaining.toFixed(2)} left</span>
                </div>
            `;
            
            container.appendChild(categoryEl);
        });
    }
    
    // Render savings goals
    function renderGoals() {
        const container = document.getElementById('savings-goals');
        container.innerHTML = '';
        
        if (state.goals.length === 0) {
            container.innerHTML = '<p class="no-goals">No savings goals yet. Add your first goal!</p>';
            return;
        }
        
        state.goals.forEach(goal => {
            const percentage = (goal.saved / goal.target) * 100;
            const daysLeft = Math.ceil((goal.date - new Date()) / (1000 * 60 * 60 * 24));
            
            const goalEl = document.createElement('div');
            goalEl.className = 'goal-card';
            
            goalEl.innerHTML = `
                <div class="goal-header">
                    <div class="goal-title">
                        <h3>${goal.name}</h3>
                        <p>Target: ₹${goal.target.toFixed(2)}</p>
                    </div>
                    <div class="goal-actions">
                        <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}</span>
                        <button class="delete-goal-btn" data-id="${goal.id}">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="goal-details">
                    <span class="goal-amount">Saved: ₹${goal.saved.toFixed(2)} (${percentage.toFixed(1)}%)</span>
                    <span class="goal-date">${formatDate(goal.date)}</span>
                </div>
            `;
            
            container.appendChild(goalEl);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                deleteGoal(id);
            });
        });
    }
    
    // Delete goal
    function deleteGoal(id) {
        if (!confirm("Delete this goal?")) return;

        // ✅ 1. Instant UI update (safe)
        state.goals = state.goals.filter(goal => goal.id !== id);
        renderGoals();

        // ✅ 2. Backend delete (safe)
        fetch(`/goals/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Delete failed");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error deleting goal");
        });
    }
    
    // Render charts
    function renderCharts() {
        updateMonthDisplay();
        renderCategoryChart();
        renderMonthlyChart();
        renderIncomeExpenseChart();
        renderTrendsChart();
        renderTopExpenses();
        renderCategoryBreakdown();
    }
    
    // Render category chart
    function renderCategoryChart() {
         if (!state.transactions || state.transactions.length === 0) return;
        const canvas = document.getElementById('categoryChart');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        
        // Calculate spending by category for current month
        const now = new Date();
        const currentMonth = state.currentMonth;
        const currentYear = state.currentYear;
        
        const categorySpending = {};
        state.transactions
            .filter(trans => trans.type === 'expense' && 
                  trans.date.getMonth() === currentMonth && 
                  trans.date.getFullYear() === currentYear)
            .forEach(trans => {
                if (!categorySpending[trans.categoryId]) {
                    categorySpending[trans.categoryId] = 0;
                }
                categorySpending[trans.categoryId] += trans.amount;
            });
        
        // Prepare data for chart
        const categories = state.categories.filter(cat => cat.name !== 'Income');
        const labels = categories.map(cat => cat.name);
        const data = categories.map(cat => categorySpending[cat.id] || 0);
        const backgroundColors = categories.map(cat => cat.color || '#4361ee');
        
        // Destroy previous chart if exists
        if (categoryChart) {
            categoryChart.destroy();
        }
        
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render monthly chart
    function renderMonthlyChart() {
         if (!state.transactions || state.transactions.length === 0) return;
        const canvas = document.getElementById('monthlyChart');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        
        // Calculate income and expenses for each month
        const monthlyData = {};
        
        state.transactions.forEach(trans => {
            const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    income: 0,
                    expenses: 0,
                    month: trans.date.getMonth(),
                    year: trans.date.getFullYear()
                };
            }
            
            if (trans.type === 'income') {
                monthlyData[monthYear].income += trans.amount;
            } else {
                monthlyData[monthYear].expenses += trans.amount;
            }
        });
        
        // Sort by date (oldest first)
        const sortedMonths = Object.values(monthlyData).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
        
        // Get last 6 months
        const last6Months = sortedMonths; // show all months
        
        // Prepare data for chart
        const labels = last6Months.map(month => 
            `${getMonthName(month.month)} ${month.year.toString().slice(2)}`
        );
        const incomeData = last6Months.map(month => month.income);
        const expensesData = last6Months.map(month => month.expenses);
        
        // Destroy previous chart if exists
        if (monthlyChart) {
            monthlyChart.destroy();
        }
        
        monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#4cc9f0',
                        borderColor: '#4cc9f0',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        backgroundColor: '#f94144',
                        borderColor: '#f94144',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ₹${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render income vs expense chart for reports
    function renderIncomeExpenseChart() {
         if (!state.transactions || state.transactions.length === 0) return;
        const canvas = document.getElementById('incomeExpenseChart');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        
        // Filter transactions for selected month/year
        const monthTransactions = state.transactions.filter(trans => {
            return trans.date.getMonth() === state.currentMonth && 
                   trans.date.getFullYear() === state.currentYear;
        });
        
        // Calculate totals
        const income = monthTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        // Destroy previous chart if exists
        if (incomeExpenseChart) {
            incomeExpenseChart.destroy();
        }
        
        incomeExpenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [income, expenses],
                    backgroundColor: ['#4cc9f0', '#f94144'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render trends chart for reports
    function renderTrendsChart() {
         if (!state.transactions || state.transactions.length === 0) return;
        const canvas = document.getElementById('trendsChart');
        if (!canvas || !canvas.getContext) return;

        const ctx = canvas.getContext('2d');
        
        // Calculate monthly trends for the past 12 months
        const monthlyTrends = Array(12).fill().map((_, i) => {
            const date = new Date(state.currentYear, state.currentMonth - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthTransactions = state.transactions.filter(trans => {
                return trans.date.getMonth() === month && 
                       trans.date.getFullYear() === year;
            });
            
            const income = monthTransactions
                .filter(trans => trans.type === 'income')
                .reduce((sum, trans) => sum + trans.amount, 0);
            
            const expenses = monthTransactions
                .filter(trans => trans.type === 'expense')
                .reduce((sum, trans) => sum + trans.amount, 0);
            
            return {
                month,
                year,
                income,
                expenses,
                balance: income - expenses,
                label: `${getMonthName(month)} ${year.toString().slice(2)}`
            };
        }).reverse();
        
        // Prepare data for chart
        const labels = monthlyTrends.map(month => month.label);
        const incomeData = monthlyTrends.map(month => month.income);
        const expensesData = monthlyTrends.map(month => month.expenses);
        const balanceData = monthlyTrends.map(month => month.balance);
        
        // Destroy previous chart if exists
        if (trendsChart) {
            trendsChart.destroy();
        }
        
        trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(76, 201, 240, 0.2)',
                        borderColor: '#4cc9f0',
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        backgroundColor: 'rgba(249, 65, 68, 0.2)',
                        borderColor: '#f94144',
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'Balance',
                        data: balanceData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: '#4bc0c0',
                        borderWidth: 2,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ₹${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render top expenses for reports
    function renderTopExpenses() {
        const container = document.getElementById('top-expenses');
        container.innerHTML = '';
        
        // Filter expenses for selected month/year
        const monthExpenses = state.transactions.filter(trans => {
            return trans.type === 'expense' && 
                   trans.date.getMonth() === state.currentMonth && 
                   trans.date.getFullYear() === state.currentYear;
        });
        
        // Sort by amount (descending)
        const sortedExpenses = [...monthExpenses].sort((a, b) => b.amount - a.amount);
        
        // Get top 5
        const topExpenses = sortedExpenses.slice(0, 5);
        
        if (topExpenses.length === 0) {
            container.innerHTML = '<li>No expenses this month</li>';
            return;
        }
        
        topExpenses.forEach(expense => {
            const li = document.createElement('li');
            const category = state.categories.find(cat => cat.id === expense.categoryId);
            
            li.innerHTML = `
                <span>
                    <i class="fas ${expense.icon || 'fa-money-bill-wave'}"></i>
                    ${expense.description}
                </span>
                <span class="expense">₹${expense.amount.toFixed(2)}</span>
            `;
            
            container.appendChild(li);
        });
    }
    
    // Render category breakdown for reports
    function renderCategoryBreakdown() {
        const container = document.getElementById('category-breakdown');
        container.innerHTML = '';
        
        // Filter expenses for selected month/year
        const monthExpenses = state.transactions.filter(trans => {
            return trans.type === 'expense' && 
                   trans.date.getMonth() === state.currentMonth && 
                   trans.date.getFullYear() === state.currentYear;
        });
        
        // Calculate total expenses
        const totalExpenses = monthExpenses.reduce((sum, trans) => sum + trans.amount, 0);
        
        // Group by category
        const categoryTotals = {};
        monthExpenses.forEach(expense => {
            if (!categoryTotals[expense.categoryId]) {
                categoryTotals[expense.categoryId] = 0;
            }
            categoryTotals[expense.categoryId] += expense.amount;
        });
        
        // Convert to array and sort by amount (descending)
        const categoryArray = Object.entries(categoryTotals)
            .map(([categoryId, amount]) => {
                const category = state.categories.find(cat => cat.id === parseInt(categoryId));
                return {
                    name: category?.name || 'Unknown',
                    amount,
                    percentage: totalExpenses > 0 ? (amount / totalExpenses * 100) : 0,
                    color: category?.color || '#4361ee'
                };
            })
            .sort((a, b) => b.amount - a.amount);
        
        if (categoryArray.length === 0) {
            container.innerHTML = '<li>No expenses this month</li>';
            return;
        }
        
        categoryArray.forEach(category => {
            const li = document.createElement('li');
            
            li.innerHTML = `
                <span>
                    <span class="color-indicator" style="background-color: ${category.color}"></span>
                    ${category.name}
                </span>
                <span>${category.percentage.toFixed(1)}% (₹${category.amount.toFixed(2)})</span>
            `;
            
            container.appendChild(li);
        });
    }
    
    // Set current month/year for reports
    function updateMonthDisplay() {
    const monthName = getMonthName(state.currentMonth);
    document.getElementById('current-month').textContent = `${monthName} ${state.currentYear}`;
}
    
    // Helper function to format date
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Helper function to get month name
    function getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    // AI Insights Function
// ================= AI INSIGHTS =================

function generateInsights() {
    const messagesDiv = document.getElementById("ai-messages");
    
    // Safety check (prevents errors)
    if (!messagesDiv) return;

    messagesDiv.innerHTML = "";

    let totalExpense = 0;
    let foodExpense = 0;
    let totalIncome = 0;

    // Calculate from real data
    state.transactions.forEach(trans => {
        const category = state.categories.find(c => c.id === trans.categoryId);
        if (trans.type === 'expense') {
            totalExpense += trans.amount;

            if (category && category.name === 'Food') {
                foodExpense += trans.amount;
           }
        } else if (trans.type === 'income') {
            totalIncome += trans.amount;
        }
    });

    let savings = totalIncome - totalExpense;

    let insights = [];

    if (totalExpense === 0 && totalIncome === 0) {
        insights.push("📊 Start adding transactions to see insights!");
    } else {
        if (foodExpense > totalExpense * 0.3) {
            insights.push("⚠️ You are spending too much on Food");
        }

        if (totalIncome > 0 && savings < totalIncome * 0.2) {
            insights.push("📉 Your savings rate is low");
        }

        if (totalExpense > 10000) {
            insights.push("💡 Try reducing unnecessary expenses");
        }

        if (savings > totalIncome * 0.3) {
            insights.push("🎉 Great job! You are saving well!");
        }
    }

    // Display messages
    if (insights.length === 0) {
        messagesDiv.innerHTML = "<div class='ai-messages'>✅ Your spending looks good!</div>";
    } else {
        insights.forEach(msg => {
            let div = document.createElement("div");
            div.className = "ai-messages";
            div.innerText = msg;
            messagesDiv.appendChild(div);
        });
    }
}
    const insightBtn = document.getElementById("insight-btn");
    if (insightBtn) {
        insightBtn.addEventListener("click",() =>{
            console.log('Button clicked');
            generateInsights();
    });
}

// ✅ only ONE closing
init();
});