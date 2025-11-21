let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedYear = new Date().getFullYear();
let currentUser = '';
let userData = {};

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
    currentUser = sessionData.username;
    
    // Update header with user info
    document.getElementById('userDisplay').textContent = sessionData.fullName;
    
    loadData();
    renderCalendar();
    updateYearDisplay();
    
    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    document.getElementById('prevYear').addEventListener('click', () => changeYear(-1));
    document.getElementById('nextYear').addEventListener('click', () => changeYear(1));
});

function handleLogout() {
    sessionStorage.removeItem('wfh_session');
    window.location.href = 'login.html';
}

function changeYear(delta) {
    selectedYear += delta;
    updateYearDisplay();
    loadData();
}

function updateYearDisplay() {
    document.getElementById('selectedYear').textContent = selectedYear;
}

async function loadData() {
    // Load data for all years but display only selected year
    try {
        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${DATA_FILE_PATH}?t=${Date.now()}`);
        if (response.ok) {
            const data = await response.json();
            userData = data;
            localStorage.setItem('workLocationData', JSON.stringify(userData));
        }
    } catch (error) {
        console.log('Loading from local storage');
        const stored = localStorage.getItem('workLocationData');
        userData = stored ? JSON.parse(stored) : {};
    }
    
    // Initialize user data structure if needed
    if (!userData[currentUser]) {
        userData[currentUser] = {};
    }
    if (!userData[currentUser][selectedYear]) {
        userData[currentUser][selectedYear] = {};
    }
    
    renderCalendar();
    renderTeamView();
}

async function saveData() {
    // Save to local storage immediately
    localStorage.setItem('workLocationData', JSON.stringify(userData));
    
    // Try to sync with GitHub (requires token)
    if (GITHUB_TOKEN) {
        try {
            // Get current file SHA
            const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            let sha = '';
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
            
            // Update or create file
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(userData, null, 2))));
            await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update team data - ${new Date().toISOString()}`,
                    content: content,
                    sha: sha
                })
            });
        } catch (error) {
            console.log('GitHub sync failed, data saved locally');
        }
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
    
    const dateKey = `${selectedYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    
    if (!otherMonth && currentUser && userData[currentUser] && 
        userData[currentUser][selectedYear] && userData[currentUser][selectedYear][dateKey]) {
        const status = userData[currentUser][selectedYear][dateKey];
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
        return;
    }
    
    const statuses = ['office', 'remote', 'off', null];
    const currentStatus = userData[currentUser]?.[selectedYear]?.[dateKey];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (!userData[currentUser]) {
        userData[currentUser] = {};
    }
    if (!userData[currentUser][selectedYear]) {
        userData[currentUser][selectedYear] = {};
    }
    
    if (nextStatus === null) {
        delete userData[currentUser][selectedYear][dateKey];
    } else {
        userData[currentUser][selectedYear][dateKey] = nextStatus;
    }
    
    saveData();
    renderCalendar();
    renderTeamView();
}

function renderTeamView() {
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Get list of users from user database
    const usersDb = localStorage.getItem('wfh_users');
    const allUsers = usersDb ? JSON.parse(usersDb) : {};
    
    Object.keys(allUsers).sort().forEach(username => {
        const member = document.createElement('div');
        member.className = 'team-member';
        
        const name = document.createElement('div');
        name.className = 'team-member-name';
        name.textContent = allUsers[username].fullName;
        
        const status = document.createElement('div');
        status.className = 'team-member-status';
        
        const todayYear = today.getFullYear();
        const todayStatus = userData[username]?.[todayYear]?.[dateKey];
        if (todayStatus) {
            status.innerHTML = `Today: <span class="status-badge ${todayStatus}">${todayStatus}</span>`;
        } else {
            status.textContent = 'No status for today';
        }
        
        member.appendChild(name);
        member.appendChild(status);
        teamList.appendChild(member);
    });
    
    if (Object.keys(allUsers).length === 0) {
        teamList.innerHTML = '<p style="text-align: center; color: #999;">No team members yet</p>';
    }
}
