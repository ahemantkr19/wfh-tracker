let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentUser = localStorage.getItem('currentUser') || '';
let userData = {};

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        document.getElementById('username').value = currentUser;
    }
    loadData();
    renderCalendar();
    
    document.getElementById('saveUser').addEventListener('click', saveUser);
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
});

function saveUser() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        loadData();
        alert(`Welcome, ${username}!`);
    } else {
        alert('Please enter your name');
    }
}

async function loadData() {
    try {
        const response = await fetch(`${API_URL}/api/data`);
        if (response.ok) {
            userData = await response.json();
        }
    } catch (error) {
        console.log('Using local storage fallback');
        const stored = localStorage.getItem('workLocationData');
        userData = stored ? JSON.parse(stored) : {};
    }
    renderCalendar();
    renderTeamView();
}

async function saveData() {
    try {
        await fetch(`${API_URL}/api/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
    } catch (error) {
        console.log('Saving to local storage');
        localStorage.setItem('workLocationData', JSON.stringify(userData));
    }
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
    
    // Add next month's leading days
    const totalCells = calendar.children.length - 7; // Subtract header row
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
        const day = createDayElement(i, true);
        calendar.appendChild(day);
    }
}

function createDayElement(dayNumber, otherMonth = false, isToday = false) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    
    if (otherMonth) {
        day.classList.add('other-month');
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
        day.appendChild(statusText);
    } else {
        const dateNum = document.createElement('div');
        dateNum.className = 'date-number';
        dateNum.textContent = dayNumber;
        day.appendChild(dateNum);
    }
    
    if (!otherMonth) {
        day.addEventListener('click', () => selectStatus(dateKey, day));
    }
    
    return day;
}

function selectStatus(dateKey, dayElement) {
    if (!currentUser) {
        alert('Please set your name first!');
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
    
    saveData();
    renderCalendar();
    renderTeamView();
}

function renderTeamView() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    
    Object.keys(userData).sort().forEach(user => {
        const member = document.createElement('div');
        member.className = 'team-member';
        
        const name = document.createElement('div');
        name.className = 'team-member-name';
        name.textContent = user;
        
        const status = document.createElement('div');
        status.className = 'team-member-status';
        
        const todayStatus = userData[user][dateKey];
        if (todayStatus) {
            status.innerHTML = `Today: <span class="status-badge ${todayStatus}">${todayStatus}</span>`;
        } else {
            status.textContent = 'No status for today';
        }
        
        member.appendChild(name);
        member.appendChild(status);
        teamList.appendChild(member);
    });
    
    if (Object.keys(userData).length === 0) {
        teamList.innerHTML = '<p style="text-align: center; color: #999;">No team members yet</p>';
    }
}
