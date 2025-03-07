// University Timetable - Frontend JavaScript

const API_BASE_URL = '/api'; // Add this for API communication

document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing event listeners that might be causing problems
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    if (prevWeekBtn) {
        // Remove any existing event listeners by cloning the element
        const newPrevBtn = prevWeekBtn.cloneNode(true);
        prevWeekBtn.parentNode.replaceChild(newPrevBtn, prevWeekBtn);
        
        // Add new event listener
        newPrevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Previous week clicked');
            navigateWeek(-1);
        });
    }
    
    if (nextWeekBtn) {
        // Remove any existing event listeners by cloning the element
        const newNextBtn = nextWeekBtn.cloneNode(true);
        nextWeekBtn.parentNode.replaceChild(newNextBtn, nextWeekBtn);
        
        // Add new event listener
        newNextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Next week clicked');
            navigateWeek(1);
        });
    }
    
    // Initialize the timetable with Week 1 selected
    document.getElementById('display-week').textContent = 'Week 1';
    
    // Start fetching data from API
    fetchDataAndPopulate();
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Poll for updates every 5 seconds
    setInterval(fetchDataAndPopulate, 5000);
});

// Function to fetch all data from the API
function fetchDataAndPopulate() {
    fetchTimetableData();
    fetchAnnouncements();
    fetchNotices();
}

// Function to fetch timetable data from API
function fetchTimetableData() {
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(data => {
            // Store the data in memory
            window.timetableEntries = data;
            // Get current week from display
            const currentWeek = document.getElementById('display-week').textContent;
            populateTimetable(currentWeek);
        })
        .catch(error => {
            console.error('Error fetching timetable data:', error);
            // Fall back to localStorage if API fails
            const timetableEntries = JSON.parse(localStorage.getItem('timetableEntries')) || [];
            window.timetableEntries = timetableEntries;
            const currentWeek = document.getElementById('display-week').textContent;
            populateTimetable(currentWeek);
        });
}

// Function to fetch announcements
function fetchAnnouncements() {
    fetch(`${API_BASE_URL}/announcements`)
        .then(response => response.json())
        .then(data => {
            updateAnnouncementsDisplay(data);
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
            // Fall back to localStorage if API fails
            const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
            updateAnnouncementsDisplay(announcements);
        });
}

// Function to fetch notices
function fetchNotices() {
    fetch(`${API_BASE_URL}/notices`)
        .then(response => response.json())
        .then(data => {
            updateNoticesDisplay(data);
        })
        .catch(error => {
            console.error('Error fetching notices:', error);
            // Fall back to localStorage if API fails
            const notices = JSON.parse(localStorage.getItem('notices')) || [];
            updateNoticesDisplay(notices);
        });
}

// Update the clock display
function updateClock() {
    const now = new Date();
    
    // Update the datetime in the header
    const datetimeElement = document.getElementById('current-datetime');
    if (datetimeElement) {
        datetimeElement.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    }
}

// Navigate between weeks - UPDATED WITH DEBUGGING
function navigateWeek(direction) {
    const displayWeekElement = document.getElementById('display-week');
    const currentWeek = displayWeekElement.textContent;
    console.log('Current week before navigation:', currentWeek);
    
    const weekNumber = parseInt(currentWeek.replace('Week ', ''));
    console.log('Parsed week number:', weekNumber);
    
    const newWeekNumber = Math.max(1, weekNumber + direction);
    console.log('New week number:', newWeekNumber);
    
    const newWeek = `Week ${newWeekNumber}`;
    console.log('Setting new week to:', newWeek);
    
    displayWeekElement.textContent = newWeek;
    window.weekNavigated = true; // Flag that user has manually changed weeks
    populateTimetable(newWeek);
}

// Populate the timetable for the selected week - MODIFIED TO SHOW EACH CLASS IN ITS OWN ROW
function populateTimetable(week) {
    // Use window.timetableEntries instead of localStorage
    const timetableEntries = window.timetableEntries || [];
    
    // Filter entries for the current week
    const weekData = timetableEntries.filter(entry => entry.week === week);
    console.log(`Filtering for week "${week}": Found ${weekData.length} entries`);
    
    // Clear existing timetable
    const table = document.getElementById('timetable-entries');
    if (!table) {
        console.error('Timetable table element not found');
        return;
    }
    table.innerHTML = '';
    
    if (weekData.length === 0) {
        // No entries for this week
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 8; // Adjusted for all 7 days + time column
        emptyCell.textContent = 'No classes scheduled for this week';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '30px';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        return;
    }
    
    // Sort entries by start time
    weekData.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
    });
    
    // Create timetable with one row per class
    createOneRowPerClassTimetable(weekData, table);
}

// New function to create timetable with one row per class entry
function createOneRowPerClassTimetable(weekData, table) {
    // Define all possible days
    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Find which days actually have entries
    const activeDays = new Set();
    weekData.forEach(entry => {
        // Handle different day formats
        if (entry.days && typeof entry.days === 'string') {
            entry.days.split(',').forEach(day => activeDays.add(day.trim()));
        } else if (entry.days && Array.isArray(entry.days)) {
            entry.days.forEach(day => activeDays.add(day));
        } else if (entry.day) {
            activeDays.add(entry.day);
        }
    });
    
    // Create header row
    const headerRow = document.createElement('tr');
    
    // Add Time header
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time';
    timeHeader.className = 'time-column';
    headerRow.appendChild(timeHeader);
    
    // Add day headers for active days
    const daysToDisplay = [];
    allDays.forEach(day => {
        // Include weekdays by default and weekend days with entries
        if (activeDays.has(day) || 
            (["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day))) {
            const dayHeader = document.createElement('th');
            dayHeader.textContent = day;
            headerRow.appendChild(dayHeader);
            daysToDisplay.push(day);
        }
    });
    
    table.appendChild(headerRow);
    
    // Group entries by time for better organization
    const entriesByStartTime = {};
    
    weekData.forEach(entry => {
        if (!entry.startTime || !entry.endTime) return;
        
        const key = entry.startTime;
        if (!entriesByStartTime[key]) {
            entriesByStartTime[key] = [];
        }
        entriesByStartTime[key].push(entry);
    });
    
    // Create a row for each entry, grouped by start time for better sorting
    Object.keys(entriesByStartTime).sort().forEach(startTime => {
        const entries = entriesByStartTime[startTime];
        
        entries.forEach(entry => {
            // For each entry, create a row
            const row = document.createElement('tr');
            
            // Add time cell showing the time range
            const timeCell = document.createElement('td');
            timeCell.className = 'time-cell';
            timeCell.textContent = `${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}`;
            row.appendChild(timeCell);
            
            // Add a cell for each day in the display
            daysToDisplay.forEach(day => {
                const cell = document.createElement('td');
                
                // Check if this entry belongs in this day's cell
                let isDayMatch = false;
                
                if (entry.days && typeof entry.days === 'string') {
                    isDayMatch = entry.days.split(',').map(d => d.trim()).includes(day);
                } else if (entry.days && Array.isArray(entry.days)) {
                    isDayMatch = entry.days.includes(day);
                } else if (entry.day === day) {
                    isDayMatch = true;
                }
                
                // If it's a match, add the entry content
                if (isDayMatch) {
                    const classDiv = document.createElement('div');
                    classDiv.className = 'class-entry';
                    
                    classDiv.innerHTML = `
                        <strong>${entry.course || 'Class'}</strong>
                        <p class="venue">${entry.venue || ''}</p>
                        ${entry.teacher ? `<p class="teacher">${entry.teacher}</p>` : ''}
                    `;
                    
                    cell.appendChild(classDiv);
                }
                
                row.appendChild(cell);
            });
            
            table.appendChild(row);
        });
    });
}

// Function to update announcements display
function updateAnnouncementsDisplay(announcements) {
    const container = document.getElementById('announcement-entries');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get current date for comparing
    const now = new Date();
    
    // Filter out expired announcements
    const activeAnnouncements = announcements.filter(entry => {
        const expiryDate = new Date(entry.expiryDate);
        return expiryDate >= now;
    });
    
    if (activeAnnouncements.length === 0) {
        container.innerHTML = '<p>No active announcements</p>';
        return;
    }
    
    activeAnnouncements.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'announcement';
        
        // Calculate remaining days
        const expiryDate = new Date(entry.expiryDate);
        const diffTime = Math.abs(expiryDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        entryDiv.innerHTML = `
            <p class="announcement-text">${entry.announcement}</p>
            <p class="announcement-date">Posted: ${new Date(entry.date).toLocaleDateString()}</p>
            <p class="announcement-expiry">Expires in: ${diffDays} day(s)</p>
            <hr>
        `;
        container.appendChild(entryDiv);
    });
}

// Function to update notices display
function updateNoticesDisplay(notices) {
    const container = document.getElementById('notice-entries');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (notices.length === 0) {
        container.innerHTML = '<p>No notices available</p>';
        return;
    }
    
    notices.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'notice';
        entryDiv.innerHTML = `
            <p class="notice-text">${entry.notice}</p>
            <p class="notice-date">Posted: ${new Date(entry.date).toLocaleDateString()}</p>
            <hr>
        `;
        container.appendChild(entryDiv);
    });
}

// Helper function to format time
function formatTime(timeString) {
    if (!timeString) return '';
    
    let [hours, minutes] = timeString.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}