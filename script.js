let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentUser = '';
let userData = {};
let hasUnsavedChanges = false;

const GITHUB_REPO = 'ahemantkr19/wfh-tracker';
const GITHUB_TOKEN = localStorage.getItem('github_token') || '';
const DATA_FILE_PATH = 'team-data.json';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const session = sessionStorage.getItem('wfh_session');
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    const sessionData = JSON.parse(session);
    currentUser = sessionData.email;
    
    // Update header with user info
    document.getElementById('userDisplay').textContent = sessionData.fullName;
    
    loadData();
    
    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('saveBtn').addEventListener('click', handleSave);
});

function handleLogout() {
    if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to logout?')) {
            return;
        }
    }
    sessionStorage.removeItem('wfh_session');
    window.location.href = 'login.html';
}

function handleSave() {
    saveData();
    hasUnsavedChanges = false;
    const saveMessage = document.getElementById('saveMessage');
    saveMessage.textContent = '✓ Changes saved successfully!';
    saveMessage.style.color = '#86efac';
    setTimeout(() => {
        saveMessage.textContent = '';
    }, 3000);
}

async function loadData() {
    // Load data from localStorage for current user
    const stored = localStorage.getItem('workLocationData');
    userData = stored ? JSON.parse(stored) : {};
    
    // Initialize user data structure if needed
    if (!userData[currentUser]) {
        userData[currentUser] = {};
    }
    
    renderCalendar();
}

async function saveData() {
    // Save to local storage
    localStorage.setItem('workLocationData', JSON.stringify(userData));
    console.log('Data saved successfully');
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = createDayElement(daysInPrevMonth - i, true);
        calendar.appendChild(day);
    }
    
    // Add current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && 
                       currentMonth === today.getMonth() && 
                       currentYear === today.getFullYear();
        const day = createDayElement(i, false, isToday);
        calendar.appendChild(day);
    }
    
    // Calculate how many cells we have after adding current month
    const totalCells = calendar.children.length - 7; // Subtract header row
    const cellsInLastRow = totalCells % 7;
    
    // Only add next month's days if they're needed to complete the last row
    if (cellsInLastRow > 0) {
        const daysToAdd = 7 - cellsInLastRow;
        for (let i = 1; i <= daysToAdd; i++) {
            const day = createDayElement(i, true);
            calendar.appendChild(day);
        }
    }
}

function createDayElement(dayNumber, otherMonth = false, isToday = false) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    
    // Calculate day of week (0 = Sunday, 6 = Saturday)
    const date = new Date(currentYear, currentMonth, dayNumber);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    if (otherMonth) {
        day.classList.add('other-month');
    }
    
    if (isWeekend && !otherMonth) {
        day.classList.add('weekend');
    }
    
    if (isToday && !otherMonth) {
        day.classList.add('today');
    }
    
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    
    if (!otherMonth && currentUser && userData[currentUser] && userData[currentUser][dateKey]) {
        const status = userData[currentUser][dateKey];
        day.classList.add(status);
        
        const dateNum = document.createElement('div');
        dateNum.className = 'date-number';
        dateNum.textContent = dayNumber;
        
        const statusText = document.createElement('div');
        statusText.className = 'date-status';
        statusText.textContent = status;
        
        day.appendChild(dateNum);
        if (isToday && !otherMonth) {
            const todayLabel = document.createElement('div');
            todayLabel.className = 'today-label';
            todayLabel.textContent = 'Today';
            day.appendChild(todayLabel);
        }
        day.appendChild(statusText);
    } else {
        const dateNum = document.createElement('div');
        dateNum.className = 'date-number';
        dateNum.textContent = dayNumber;
        day.appendChild(dateNum);
        if (isToday && !otherMonth) {
            const todayLabel = document.createElement('div');
            todayLabel.className = 'today-label';
            todayLabel.textContent = 'Today';
            day.appendChild(todayLabel);
        }
    }
    
    if (!otherMonth && !isWeekend) {
        day.addEventListener('click', () => selectStatus(dateKey, day));
    }
    
    return day;
}

function selectStatus(dateKey, dayElement) {
    if (!currentUser) {
        return;
    }
    
    const statuses = ['office', 'remote', 'off', null];
    const currentStatus = userData[currentUser]?.[dateKey];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (!userData[currentUser]) {
        userData[currentUser] = {};
    }
    
    if (nextStatus === null) {
        delete userData[currentUser][dateKey];
    } else {
        userData[currentUser][dateKey] = nextStatus;
    }
    
    hasUnsavedChanges = true;
    renderCalendar();
}
