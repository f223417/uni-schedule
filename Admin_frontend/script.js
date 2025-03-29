// University Timetable Display Script - Timer Free Version

function displayTimetable() {
    // Get timetable data from API instead of static JSON
    fetch('/api/timetable')
        .then(response => response.json())
        .then(data => {
            // Get current week from display or use default
            const displayWeekElement = document.getElementById('display-week');
            const currentWeek = displayWeekElement ? displayWeekElement.textContent : 'Week 1';
            
            // Filter entries for current week
            const weekEntries = data.filter(entry => entry.week === currentWeek);
            
            // Display entries in timetable
            const tbody = document.querySelector('#timetable tbody');
            if (!tbody) return; // Exit if table not found
            
            tbody.innerHTML = ''; // Clear existing entries
            
            if (weekEntries.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 5;
                cell.textContent = 'No classes scheduled for this week';
                cell.style.textAlign = 'center';
                cell.style.padding = '20px';
                row.appendChild(cell);
                tbody.appendChild(row);
            } else {
                weekEntries.forEach(entry => {
                    const row = document.createElement('tr');
                    const days = Array.isArray(entry.days) ? entry.days.join(', ') : entry.days;
                    
                    row.innerHTML = `
                        <td>${days || ''}</td>
                        <td>${formatTimeForDisplay(`${entry.startTime} - ${entry.endTime}`)}</td>
                        <td>${entry.course || ''}</td>
                        <td>${entry.teacher || ''}</td>
                        <td>${entry.venue || ''}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error loading timetable:', error);
        });
}

function displayAnnouncements() {
    fetch('/api/announcements')
        .then(response => response.json())
        .then(announcements => {
            const announcementDiv = document.getElementById('announcement');
            if (!announcementDiv) return;
            
            announcementDiv.innerHTML = ''; // Clear existing announcements
            
            if (announcements.length === 0) {
                const p = document.createElement('p');
                p.textContent = 'No current announcements';
                p.style.fontStyle = 'italic';
                p.style.textAlign = 'center';
                announcementDiv.appendChild(p);
            } else {
                announcements.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'announcement-item';
                    
                    const text = document.createElement('p');
                    text.textContent = item.announcement;
                    text.className = 'announcement-text';
                    
                    div.appendChild(text);
                    announcementDiv.appendChild(div);
                });
            }
        })
        .catch(error => {
            console.error('Error loading announcements:', error);
        });
}

// Format time from 24h to 12h format
function formatTimeForDisplay(timeSlot) {
    if (!timeSlot) return '';
    
    const times = timeSlot.split(' - ');
    if (times.length !== 2) return timeSlot;
    
    function formatSingleTime(time) {
        const [hours, minutes] = time.split(':');
        if (!hours || !minutes) return time;
        
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    return `${formatSingleTime(times[0])} - ${formatSingleTime(times[1])}`;
}

// Completely removed the cycling display - no timers at all
function initializeDisplay() {
    displayTimetable();
    displayAnnouncements();
    
    // Set up refresh button if it exists
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            displayTimetable();
            displayAnnouncements();
        });
    }
}

// Set up display on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDisplay();
});