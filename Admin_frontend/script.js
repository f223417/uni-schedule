// University Timetable Display Script - Session Rotation Version

// Define available sessions
const availableSessions = ["Session 2021", "Session 2022", "Session 2023", "Session 2024"];
let currentSessionIndex = 0;
let rotationInterval;

function displayTimetable() {
    // Get current session to display
    const currentSession = availableSessions[currentSessionIndex];
    document.getElementById('current-session').textContent = currentSession;
    
    fetch('/api/timetable')
        .then(response => response.json())
        .then(data => {
            // Filter entries for current session
            const sessionEntries = data.filter(entry => entry.session === currentSession);
            
            // Display entries in timetable
            const tbody = document.querySelector('#timetable tbody');
            if (!tbody) return;
            
            tbody.innerHTML = ''; // Clear existing entries
            
            if (sessionEntries.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 6; // Adjusted for 5 weekdays + time column
                cell.textContent = `No classes scheduled for ${currentSession}`;
                cell.style.textAlign = 'center';
                cell.style.padding = '20px';
                row.appendChild(cell);
                tbody.appendChild(row);
            } else {
                // Process and display entries
                displaySessionEntries(sessionEntries, tbody);
            }
        })
        .catch(error => {
            console.error('Error loading timetable:', error);
        });
}

function displaySessionEntries(entries, tbody) {
    // Get all unique time slots
    const timeSlots = [];
    entries.forEach(entry => {
        if (entry.startTime && entry.endTime) {
            const timeSlot = `${entry.startTime} - ${entry.endTime}`;
            if (!timeSlots.includes(timeSlot)) {
                timeSlots.push(timeSlot);
            }
        }
    });
    
    timeSlots.sort();
    
    // Create rows for each time slot
    timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        
        // Add time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = formatTimeForDisplay(timeSlot);
        timeCell.className = 'time-cell';
        row.appendChild(timeCell);
        
        // Add cells for each day
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        days.forEach(day => {
            const cell = document.createElement('td');
            
            // Find entries for this day and time slot
            const dayEntries = entries.filter(entry => {
                const entryDays = Array.isArray(entry.days) ? entry.days : [entry.days];
                const entryTimeSlot = `${entry.startTime} - ${entry.endTime}`;
                return entryDays.includes(day) && entryTimeSlot === timeSlot;
            });
            
            // Add entries to cell
            dayEntries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'class-entry';
                entryDiv.innerHTML = `
                    <strong>${entry.course || 'Class'}</strong>
                    ${entry.venue ? `<p class="venue">${entry.venue}</p>` : ''}
                    ${entry.teacher ? `<p class="teacher">${entry.teacher}</p>` : ''}
                `;
                cell.appendChild(entryDiv);
            });
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
}

function displayAnnouncements() {
    // Fetch and display announcements (unchanged)
    fetch('/api/announcements')
        .then(response => response.json())
        .then(data => {
            const announcementContainer = document.getElementById('announcement-entries');
            if (!announcementContainer) return;
            
            announcementContainer.innerHTML = '';
            
            if (data.length === 0) {
                announcementContainer.innerHTML = '<p>No announcements available</p>';
                return;
            }
            
            // Filter valid announcements (not expired)
            const now = new Date();
            const validAnnouncements = data.filter(a => new Date(a.expiryDate) > now);
            
            validAnnouncements.forEach(announcement => {
                const div = document.createElement('div');
                div.className = 'announcement';
                div.innerHTML = `
                    <p>${announcement.announcement}</p>
                    <p class="date">Posted: ${new Date(announcement.date).toLocaleDateString()}</p>
                `;
                announcementContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error loading announcements:', error));
}

function formatTimeForDisplay(timeSlot) {
    const parts = timeSlot.split(' - ');
    return `${formatTime(parts[0])} - ${formatTime(parts[1])}`;
}

function formatTime(time) {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    
    try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHours = hour % 12 || 12;
        return `${displayHours}:${minutes.padStart(2, '0')} ${ampm}`;
    } catch (e) {
        console.error('Error formatting time:', e);
        return time;
    }
}

function startSessionRotation() {
    // Display initial session
    displayTimetable();
    displayAnnouncements();
    
    // Set up one-minute rotation
    rotationInterval = setInterval(() => {
        currentSessionIndex = (currentSessionIndex + 1) % availableSessions.length;
        displayTimetable();
    }, 60000); // 1 minute = 60,000 ms
}

function stopSessionRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
    }
}

// Initialize display on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add session indicator to the UI
    const header = document.querySelector('h1');
    if (header) {
        const sessionElement = document.createElement('div');
        sessionElement.id = 'current-session';
        sessionElement.className = 'current-session';
        sessionElement.textContent = availableSessions[0];
        header.insertAdjacentElement('afterend', sessionElement);
    }
    
    // Start the rotation
    startSessionRotation();
    
    // Add manual refresh button if needed
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', displayTimetable);
    }
});