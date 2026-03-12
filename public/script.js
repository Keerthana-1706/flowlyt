
// FLOWLYT - Personal Productivity Intelligence
// Application Logic



// STATE MANAGEMENT

const state = {
    currentUser: null,
    currentPage: 'dashboard',
    goals: [],
    sessions: [],
    events: [],
    streak: {
        current: 0,
        lastActiveDate: null
    }
};


// LOCAL STORAGE KEYS

const STORAGE_KEYS = {
    USERS: 'flowlyt_users',
    CURRENT_USER: 'flowlyt_current_user',
    GOALS: 'flowlyt_goals',
    SESSIONS: 'flowlyt_sessions',
    EVENTS: 'flowlyt_events',
    STREAK: 'flowlyt_streak'
};


// INITIALIZATION

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is logged in
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (currentUser) {
        state.currentUser = JSON.parse(currentUser);
        loadUserData();
        showApp();
    } else {
        showLanding();
    }
}

function loadUserData() {
    const userId = state.currentUser.email;
    
    // Load goals
    const goalsData = localStorage.getItem(`${STORAGE_KEYS.GOALS}_${userId}`);
    state.goals = goalsData ? JSON.parse(goalsData) : [];
    
    // Load sessions
    const sessionsData = localStorage.getItem(`${STORAGE_KEYS.SESSIONS}_${userId}`);
    state.sessions = sessionsData ? JSON.parse(sessionsData) : [];
    
    // Load events
    const eventsData = localStorage.getItem(`${STORAGE_KEYS.EVENTS}_${userId}`);
    state.events = eventsData ? JSON.parse(eventsData) : [];
    
    // Load streak
    const streakData = localStorage.getItem(`${STORAGE_KEYS.STREAK}_${userId}`);
    state.streak = streakData ? JSON.parse(streakData) : { current: 0, lastActiveDate: null };
    
    // Update streak based on current date
    updateStreak();
}

function saveUserData() {
    const userId = state.currentUser.email;
    
    localStorage.setItem(`${STORAGE_KEYS.GOALS}_${userId}`, JSON.stringify(state.goals));
    localStorage.setItem(`${STORAGE_KEYS.SESSIONS}_${userId}`, JSON.stringify(state.sessions));
    localStorage.setItem(`${STORAGE_KEYS.EVENTS}_${userId}`, JSON.stringify(state.events));
    localStorage.setItem(`${STORAGE_KEYS.STREAK}_${userId}`, JSON.stringify(state.streak));
}


// AUTHENTICATION

function showLanding() {
    document.getElementById('landing-container').classList.remove('hidden');
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showAuth() {
    document.getElementById('landing-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('landing-container').classList.add('hidden');
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Update UI
    updateUserGreeting();
    updateDashboard();
    renderGoals();
    renderSessions();
    renderAnalytics();
    updateSettings();
    updateProductivityInsight();
}

function getUsers() {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersData ? JSON.parse(usersData) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function handleLogin(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        state.currentUser = { name: user.name, email: user.email };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
        loadUserData();
        showApp();
        return true;
    }
    return false;
}

function handleSignup(name, email, password) {
    const users = getUsers();
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
        return false;
    }
    
    // Add new user
    users.push({ name, email, password });
    saveUsers(users);
    
    // Log in the new user
    state.currentUser = { name, email };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
    loadUserData();
    showApp();
    return true;
}

function handleLogout() {
    state.currentUser = null;
    state.goals = [];
    state.sessions = [];
    state.events = [];
    state.streak = { current: 0, lastActiveDate: null };
    
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    showLanding();
}

function updateUserGreeting() {
    const greeting = document.getElementById('user-greeting');
    const avatar = document.getElementById('user-avatar');
    
    if (state.currentUser) {
        greeting.textContent = `Welcome, ${state.currentUser.name.split(' ')[0]}`;
        avatar.textContent = state.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}


// STREAK MANAGEMENT

function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (!state.streak.lastActiveDate) {
        // First time - check if there's a session today
        const hasSessionToday = state.sessions.some(s => new Date(s.date).toDateString() === today);
        if (hasSessionToday) {
            state.streak.current = 1;
            state.streak.lastActiveDate = today;
        }
    } else if (state.streak.lastActiveDate === today) {
        // Already active today, do nothing
    } else if (state.streak.lastActiveDate === yesterday) {
        // Check if there's a session today to continue streak
        const hasSessionToday = state.sessions.some(s => new Date(s.date).toDateString() === today);
        if (hasSessionToday) {
            state.streak.current += 1;
            state.streak.lastActiveDate = today;
        }
    } else {
        // Streak broken - check if there's a session today to start new streak
        const hasSessionToday = state.sessions.some(s => new Date(s.date).toDateString() === today);
        if (hasSessionToday) {
            state.streak.current = 1;
            state.streak.lastActiveDate = today;
        } else {
            state.streak.current = 0;
            state.streak.lastActiveDate = null;
        }
    }
    
    saveUserData();
}

function incrementStreak() {
    const today = new Date().toDateString();
    
    if (state.streak.lastActiveDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (state.streak.lastActiveDate === yesterday) {
            state.streak.current += 1;
        } else {
            state.streak.current = 1;
        }
        
        state.streak.lastActiveDate = today;
        saveUserData();
    }
}


// NAVIGATION

function navigateTo(page) {
    state.currentPage = page;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        goals: 'Goals',
        activity: 'Activity Log',
        analytics: 'Analytics',
        settings: 'Settings'
    };
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    
    // Refresh data for the page
    if (page === 'analytics') {
        renderAnalytics();
    }
}


// DASHBOARD

function updateDashboard() {
    // Update stats
    const totalHours = state.sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
    const completedGoals = state.goals.filter(g => g.progress >= g.target).length;
    const today = new Date().toDateString();
    const sessionsToday = state.sessions.filter(s => new Date(s.date).toDateString() === today).length;
    
    document.getElementById('total-hours').textContent = `${totalHours.toFixed(1)}h`;
    document.getElementById('goals-completed').textContent = completedGoals;
    document.getElementById('sessions-today').textContent = sessionsToday;
    document.getElementById('current-streak').textContent = `${state.streak.current} day${state.streak.current !== 1 ? 's' : ''}`;
    
    // Update activity timeline
    renderActivityTimeline();
    
    // Update goals preview
    renderGoalsPreview();
    
    // Update weekly chart
    renderWeeklyChart('weekly-chart');
    
    // Update productivity insight
    updateProductivityInsight();
}


// PRODUCTIVITY INSIGHT

function updateProductivityInsight() {
    const container = document.getElementById('productivity-insight');
    
    if (state.sessions.length === 0) {
        container.innerHTML = `
            <div class="insight-icon">💡</div>
            <p class="insight-text">Log more sessions to unlock personalized insights about your productivity patterns.</p>
        `;
        return;
    }
    
    // Calculate insights
    const sessionsByHour = {};
    state.sessions.forEach(session => {
        // Simplified - assume random hours for demo
        const hour = Math.floor(Math.random() * 14) + 6; // 6 AM to 8 PM
        sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
    });
    
    // Find most productive hour
    let maxHour = 9;
    let maxSessions = 0;
    Object.entries(sessionsByHour).forEach(([hour, count]) => {
        if (count > maxSessions) {
            maxSessions = count;
            maxHour = parseInt(hour);
        }
    });
    
    // Get most common category
    const categoryCount = {};
    state.sessions.forEach(s => {
        categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'work';
    
    // Generate insights
    const insights = [
        `You are most productive between ${maxHour}:00 and ${maxHour + 2}:00.`,
        `Your focus category is <strong>${topCategory}</strong> — ${categoryCount[topCategory] || 0} sessions logged.`,
        `You've logged ${state.sessions.length} total sessions. Keep the momentum! `,
        `Current streak: ${state.streak.current} day${state.streak.current !== 1 ? 's' : ''}. Amazing consistency! ⭐`
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    container.innerHTML = `
        <div class="insight-icon">🔎</div>
        <p class="insight-text">${randomInsight}</p>
    `;
}

function renderActivityTimeline() {
    const container = document.getElementById('activity-timeline');
    
    if (state.events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No activity yet. Start logging sessions!</p>
            </div>
        `;
        return;
    }
    
    // Get last 10 events
    const recentEvents = [...state.events].reverse().slice(0, 10);
    
    container.innerHTML = recentEvents.map(event => {
        let iconClass = 'session';
        let icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
        
        if (event.type === 'goal_created') {
            iconClass = 'goal';
            icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
        } else if (event.type === 'goal_completed') {
            iconClass = 'complete';
            icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
        }
        
        return `
            <div class="timeline-item">
                <div class="timeline-icon ${iconClass}">${icon}</div>
                <div class="timeline-content">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                </div>
                <span class="timeline-meta">${formatRelativeTime(event.timestamp)}</span>
            </div>
        `;
    }).join('');
}

function renderGoalsPreview() {
    const container = document.getElementById('goals-preview');
    
    if (state.goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No goals yet. Create your first goal!</p>
            </div>
        `;
        return;
    }
    
    const activeGoals = state.goals.filter(g => g.progress < g.target).slice(0, 3);
    
    if (activeGoals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>All goals completed! Create new goals.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeGoals.map(goal => {
        const percentage = Math.min(100, (goal.progress / goal.target) * 100);
        return `
            <div class="goal-preview-item">
                <div class="goal-preview-header">
                    <h4>${goal.title}</h4>
                    <span>${goal.progress}/${goal.target}</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}


// GOALS

function renderGoals() {
    const container = document.getElementById('goals-grid');
    
    if (state.goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state-large">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                </svg>
                <h3>No Goals Yet</h3>
                <p>Create your first goal to start tracking your progress.</p>
                <button class="btn btn-primary" id="empty-add-goal-btn">Create Goal</button>
            </div>
        `;
        
        document.getElementById('empty-add-goal-btn')?.addEventListener('click', () => openGoalModal());
        return;
    }
    
    container.innerHTML = state.goals.map(goal => {
        const percentage = Math.min(100, (goal.progress / goal.target) * 100);
        const isComplete = goal.progress >= goal.target;
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="goal-card" data-id="${goal.id}">
                <div class="goal-card-header">
                    <h3>${goal.title}</h3>
                    <div class="goal-card-actions">
                        <button class="edit-goal" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="delete delete-goal" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="goal-card-progress">
                    <div class="progress-text">
                        <span>${goal.progress} / ${goal.target}</span>
                        <span>${percentage.toFixed(0)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="goal-card-meta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>${isComplete ? 'Completed!' : daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners
    container.querySelectorAll('.edit-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = e.target.closest('.goal-card').dataset.id;
            openGoalModal(goalId);
        });
    });
    
    container.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = e.target.closest('.goal-card').dataset.id;
            deleteGoal(goalId);
        });
    });
}

function openGoalModal(goalId = null) {
    const modal = document.getElementById('goal-modal');
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('goal-form');
    const title = document.getElementById('goal-modal-title');
    
    if (goalId) {
        const goal = state.goals.find(g => g.id === goalId);
        if (goal) {
            title.textContent = 'Edit Goal';
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-target').value = goal.target;
            document.getElementById('goal-progress').value = goal.progress;
            document.getElementById('goal-deadline').value = goal.deadline;
            document.getElementById('goal-id').value = goal.id;
        }
    } else {
        title.textContent = 'Add Goal';
        form.reset();
        document.getElementById('goal-id').value = '';
        document.getElementById('goal-progress').value = 0;
        
        // Set default deadline to 30 days from now
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 30);
        document.getElementById('goal-deadline').value = defaultDeadline.toISOString().split('T')[0];
    }
    
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function closeGoalModal() {
    document.getElementById('goal-modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
}

function saveGoal(formData) {
    const goalId = formData.id || `goal_${Date.now()}`;
    const isNew = !formData.id;
    const existingGoal = state.goals.find(g => g.id === formData.id);
    
    const goal = {
        id: goalId,
        title: formData.title,
        target: parseInt(formData.target),
        progress: parseInt(formData.progress),
        deadline: formData.deadline
    };
    
    if (isNew) {
        state.goals.push(goal);
        addEvent('goal_created', goal.title, `New goal created with target: ${goal.target}`);
    } else {
        const index = state.goals.findIndex(g => g.id === goal.id);
        if (index !== -1) {
            // Check if goal was just completed
            if (existingGoal && existingGoal.progress < existingGoal.target && goal.progress >= goal.target) {
                addEvent('goal_completed', goal.title, 'Goal completed!');
            }
            state.goals[index] = goal;
        }
    }
    
    saveUserData();
    renderGoals();
    updateDashboard();
    renderAnalytics();
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        state.goals = state.goals.filter(g => g.id !== goalId);
        saveUserData();
        renderGoals();
        updateDashboard();
        renderAnalytics();
    }
}


// SESSIONS

function renderSessions() {
    const container = document.getElementById('sessions-list');
    
    if (state.sessions.length === 0) {
        container.innerHTML = `
            <div class="empty-state-large">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <h3>No Sessions Logged</h3>
                <p>Start tracking your productivity by logging a session.</p>
                <button class="btn btn-primary" id="empty-add-session-btn">Log Session</button>
            </div>
        `;
        
        document.getElementById('empty-add-session-btn')?.addEventListener('click', () => openSessionModal());
        return;
    }
    
    // Sort by date descending
    const sortedSessions = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedSessions.map(session => {
        const categoryIcons = {
            work: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
            learning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
            creative: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
            health: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            other: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        };
        
        return `
            <div class="session-card">
                <div class="session-icon ${session.category}">
                    ${categoryIcons[session.category] || categoryIcons.other}
                </div>
                <div class="session-content">
                    <h3>${session.title}</h3>
                    ${session.notes ? `<p>${session.notes}</p>` : ''}
                    <div class="session-meta">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${session.duration} min
                        </span>
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${formatDate(session.date)}
                        </span>
                        <span class="category-badge">${session.category}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openSessionModal() {
    const modal = document.getElementById('session-modal');
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('session-form');
    
    form.reset();
    document.getElementById('session-date').value = new Date().toISOString().split('T')[0];
    
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function closeSessionModal() {
    document.getElementById('session-modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
}

function saveSession(formData) {
    const session = {
        id: `session_${Date.now()}`,
        title: formData.title,
        duration: parseInt(formData.duration),
        category: formData.category,
        notes: formData.notes,
        date: formData.date,
        timestamp: new Date().toISOString()
    };
    
    state.sessions.push(session);
    addEvent('session_logged', session.title, `${session.duration} min of ${session.category}`);
    
    // Update streak
    incrementStreak();
    
    saveUserData();
    renderSessions();
    updateDashboard();
    renderAnalytics();
}


// ANALYTICS

let weeklyChartInstance = null;
let analyticsWeeklyChartInstance = null;
let categoryChartInstance = null;

function renderAnalytics() {
    renderWeeklyChart('analytics-weekly-chart');
    renderCategoryChart();
    renderGoalProgressList();
}

function renderWeeklyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (canvasId === 'weekly-chart' && weeklyChartInstance) {
        weeklyChartInstance.destroy();
    } else if (canvasId === 'analytics-weekly-chart' && analyticsWeeklyChartInstance) {
        analyticsWeeklyChartInstance.destroy();
    }
    
    // Get last 7 days data
    const days = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayTotal = state.sessions
            .filter(s => new Date(s.date).toDateString() === dateStr)
            .reduce((acc, s) => acc + (s.duration || 0), 0);
        
        data.push(dayTotal);
    }
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Minutes',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                hoverBackgroundColor: 'rgba(6, 182, 212, 0.9)',
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 5,
                borderSkipped: false,
                barThickness: 24,
                maxBarThickness: 32
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 600,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 18, 16, 0.95)',
                    titleColor: '#fafaf9',
                    bodyColor: '#a8a29e',
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    displayColors: false,
                    titleFont: {
                        size: 13,
                        weight: '600',
                        family: 'Inter'
                    },
                    bodyFont: {
                        size: 12,
                        family: 'Inter'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    border: {
                        display: false
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)',
                        drawTicks: false
                    },
                    ticks: {
                        color: '#78716c',
                        padding: 10,
                        font: {
                            size: 11,
                            family: 'Inter'
                        }
                    }
                },
                x: {
                    border: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#78716c',
                        padding: 6,
                        font: {
                            size: 11,
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    };
    
    const chart = new Chart(ctx, chartConfig);
    
    if (canvasId === 'weekly-chart') {
        weeklyChartInstance = chart;
    } else {
        analyticsWeeklyChartInstance = chart;
    }
}

function renderCategoryChart() {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }
    
    // Calculate category totals
    const categories = ['work', 'learning', 'creative', 'health', 'other'];
    const categoryColors = {
        work: '#3b82f6',
        learning: '#06b6d4',
        creative: '#8b5cf6',
        health: '#10b981',
        other: '#64748b'
    };
    
    const categoryData = categories.map(cat => {
        return state.sessions
            .filter(s => s.category === cat)
            .reduce((acc, s) => acc + (s.duration || 0), 0);
    });
    
    // Check if there's any data
    const hasData = categoryData.some(d => d > 0);
    
    if (!hasData) {
        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#27272a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        return;
    }
    
    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                data: categoryData,
                backgroundColor: categories.map(c => categoryColors[c]),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 600,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#a8a29e',
                        padding: 14,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 18, 16, 0.95)',
                    titleColor: '#fafaf9',
                    bodyColor: '#a8a29e',
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    displayColors: true,
                    boxWidth: 10,
                    boxHeight: 10,
                    boxPadding: 6,
                    titleFont: {
                        size: 13,
                        weight: '600',
                        family: 'Inter'
                    },
                    bodyFont: {
                        size: 12,
                        family: 'Inter'
                    }
                }
            }
        }
    });
}

function renderGoalProgressList() {
    const container = document.getElementById('goal-progress-list');
    
    if (state.goals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No goals to display. Create some goals to see your progress.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.goals.map(goal => {
        const percentage = Math.min(100, (goal.progress / goal.target) * 100);
        return `
            <div class="goal-progress-item">
                <span class="label">${goal.title}</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="percentage">${percentage.toFixed(0)}%</span>
            </div>
        `;
    }).join('');
}


// SETTINGS

function updateSettings() {
    if (state.currentUser) {
        document.getElementById('settings-name').value = state.currentUser.name;
        document.getElementById('settings-email').value = state.currentUser.email;
    }
}

function saveSettings(name) {
    state.currentUser.name = name;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
    
    // Update in users list
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === state.currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].name = name;
        saveUsers(users);
    }
    
    updateUserGreeting();
}

function exportData() {
    const data = {
        goals: state.goals,
        sessions: state.sessions,
        events: state.events,
        streak: state.streak,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowlyt-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
        state.goals = [];
        state.sessions = [];
        state.events = [];
        state.streak = { current: 0, lastActiveDate: null };
        
        saveUserData();
        updateDashboard();
        renderGoals();
        renderSessions();
        renderAnalytics();
    }
}


// EVENTS

function addEvent(type, title, description) {
    state.events.push({
        id: `event_${Date.now()}`,
        type,
        title,
        description,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 events
    if (state.events.length > 100) {
        state.events = state.events.slice(-100);
    }
    
    saveUserData();
}


// PRODUCTIVITY REPLAY

let replayInterval = null;
let replayIndex = 0;

function openReplayModal() {
    const modal = document.getElementById('replay-modal');
    const overlay = document.getElementById('modal-overlay');
    
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    
    renderReplayTimeline();
}

function closeReplayModal() {
    document.getElementById('replay-modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
    
    // Stop any running replay
    stopReplay();
}

function renderReplayTimeline() {
    const container = document.getElementById('replay-blocks');
    container.innerHTML = '';
    
    const today = new Date().toDateString();
    const todaySessions = state.sessions.filter(s => new Date(s.date).toDateString() === today);
    
    if (todaySessions.length === 0) {
        document.getElementById('replay-info').innerHTML = '<p>No sessions logged today. Log some sessions to replay your day!</p>';
        return;
    }
    
    document.getElementById('replay-info').innerHTML = `<p>${todaySessions.length} session${todaySessions.length !== 1 ? 's' : ''} today. Click play to replay your productivity!</p>`;
    
    // Create blocks for each session
    todaySessions.forEach((session, index) => {
        // Parse the time from the session (assume sessions have timestamps or use index for demo)
        const startHour = 6 + (index * 2); // Simple distribution for demo
        const durationHours = session.duration / 60;
        
        // Calculate position (6 AM to 9 PM = 15 hours)
        const startPercent = ((startHour - 6) / 15) * 100;
        const widthPercent = Math.min((durationHours / 15) * 100, 100 - startPercent);
        
        const block = document.createElement('div');
        block.className = `timeline-block ${session.category}`;
        block.style.left = `${startPercent}%`;
        block.style.width = `${Math.max(widthPercent, 5)}%`;
        block.textContent = session.title;
        block.dataset.index = index;
        
        container.appendChild(block);
    });
}

function playReplay() {
    const blocks = document.querySelectorAll('.timeline-block');
    if (blocks.length === 0) return;
    
    document.getElementById('replay-play').classList.add('hidden');
    document.getElementById('replay-pause').classList.remove('hidden');
    
    // Reset all blocks
    blocks.forEach(b => b.classList.remove('visible'));
    replayIndex = 0;
    
    replayInterval = setInterval(() => {
        if (replayIndex < blocks.length) {
            blocks[replayIndex].classList.add('visible');
            replayIndex++;
        } else {
            stopReplay();
        }
    }, 800);
}

function pauseReplay() {
    if (replayInterval) {
        clearInterval(replayInterval);
        replayInterval = null;
    }
    
    document.getElementById('replay-play').classList.remove('hidden');
    document.getElementById('replay-pause').classList.add('hidden');
}

function stopReplay() {
    pauseReplay();
    replayIndex = 0;
}

function resetReplay() {
    stopReplay();
    const blocks = document.querySelectorAll('.timeline-block');
    blocks.forEach(b => b.classList.remove('visible'));
}


// UTILITY FUNCTIONS

function formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


// EVENT LISTENERS

function setupEventListeners() {
    // Landing page buttons
    document.getElementById('landing-get-started')?.addEventListener('click', () => {
        showAuth();
        // Switch to signup tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.auth-tab[data-tab="signup"]')?.classList.add('active');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    });
    
    document.getElementById('landing-sign-in')?.addEventListener('click', () => {
        showAuth();
        // Switch to login tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.auth-tab[data-tab="login"]')?.classList.add('active');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
    });
    
    document.getElementById('landing-cta-start')?.addEventListener('click', () => {
        showAuth();
        // Switch to signup tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.auth-tab[data-tab="signup"]')?.classList.add('active');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
    });
    
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabType = tab.dataset.tab;
            const authCard = document.querySelector('.auth-card');
            
            // Toggle auth card layout
            if (tabType === 'signup') {
                authCard.classList.add('signup-active');
            } else {
                authCard.classList.remove('signup-active');
            }
            
            document.getElementById('login-form').classList.toggle('hidden', tabType !== 'login');
            document.getElementById('signup-form').classList.toggle('hidden', tabType !== 'signup');
        });
    });
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!handleLogin(email, password)) {
            document.getElementById('login-error').textContent = 'Invalid email or password';
        }
    });
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        if (!handleSignup(name, email, password)) {
            document.getElementById('signup-error').textContent = 'An account with this email already exists';
        }
    });
    
    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Mobile menu
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    // Quick log form
    document.getElementById('quick-log-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const session = {
            id: `session_${Date.now()}`,
            title: document.getElementById('quick-title').value,
            duration: parseInt(document.getElementById('quick-duration').value),
            category: document.getElementById('quick-category').value,
            notes: '',
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };
        
        state.sessions.push(session);
        addEvent('session_logged', session.title, `${session.duration} min of ${session.category}`);
        incrementStreak();
        
        saveUserData();
        e.target.reset();
        updateDashboard();
        renderSessions();
        renderAnalytics();
    });
    
    // Add goal button
    document.getElementById('add-goal-btn').addEventListener('click', () => openGoalModal());
    
    // Add session button
    document.getElementById('add-session-btn').addEventListener('click', () => openSessionModal());
    
    // View all goals button
    document.querySelector('[data-action="view-goals"]')?.addEventListener('click', () => {
        navigateTo('goals');
    });
    
    // Goal form
    document.getElementById('goal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        saveGoal({
            id: document.getElementById('goal-id').value,
            title: document.getElementById('goal-title').value,
            target: document.getElementById('goal-target').value,
            progress: document.getElementById('goal-progress').value,
            deadline: document.getElementById('goal-deadline').value
        });
        
        closeGoalModal();
    });
    
    // Session form
    document.getElementById('session-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        saveSession({
            title: document.getElementById('session-title').value,
            duration: document.getElementById('session-duration').value,
            category: document.getElementById('session-category').value,
            notes: document.getElementById('session-notes').value,
            date: document.getElementById('session-date').value
        });
        
        closeSessionModal();
    });
    
    // Profile form
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings(document.getElementById('settings-name').value);
        alert('Settings saved!');
    });
    
    // Export data
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    
    // Clear data
    document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modal-overlay').classList.add('hidden');
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            stopReplay();
        });
    });
    
    // Close modal on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('modal-overlay').classList.add('hidden');
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            stopReplay();
        }
    });
    
    // Replay button
    document.getElementById('replay-btn').addEventListener('click', openReplayModal);
    
    // Replay controls
    document.getElementById('replay-play').addEventListener('click', playReplay);
    document.getElementById('replay-pause').addEventListener('click', pauseReplay);
    document.getElementById('replay-reset').addEventListener('click', resetReplay);
}
