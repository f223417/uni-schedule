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
    
    // Poll for updates every 30 seconds instead of 5 seconds
    setInterval(fetchDataAndPopulate, 30000);
});

// Function to fetch all data from the API
function fetchDataAndPopulate() {
    console.log("Fetching fresh data...");
    fetchTimetableData();
    fetchAnnouncements();
    fetchNotices();
}

// Function to fetch timetable data from API
function fetchTimetableData() {
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data);
            
            // Check if data exists and isn't empty
            if (data && data.length > 0) {
                // Save valid data to localStorage as backup
                localStorage.setItem('cachedTimetableData', JSON.stringify(data));
                window.timetableEntries = data;
            } else {
                console.log("Received empty data, using cached data");
                // Use cached data if the API returns empty
                const cachedData = localStorage.getItem('cachedTimetableData');
                if (cachedData) {
                    window.timetableEntries = JSON.parse(cachedData);
                } else {
                    window.timetableEntries = [];
                }
            }
            
            // Always get current week from display
            const currentWeek = document.getElementById('display-week').textContent;
            populateTimetable(currentWeek);
        })
        .catch(error => {
            console.error("Error fetching timetable:", error);
            // On error, use cached data
            const cachedData = localStorage.getItem('cachedTimetableData');
            if (cachedData) {
                window.timetableEntries = JSON.parse(cachedData);
                
                // Get current week from display
                const currentWeek = document.getElementById('display-week').textContent;
                populateTimetable(currentWeek);
            }
        });
}

// Function to fetch announcements
function fetchAnnouncements() {
    fetch(`${API_BASE_URL}/announcements`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem('cachedAnnouncements', JSON.stringify(data));
                updateAnnouncementsDisplay(data);
            } else {
                const cachedData = localStorage.getItem('cachedAnnouncements');
                if (cachedData) {
                    updateAnnouncementsDisplay(JSON.parse(cachedData));
                } else {
                    updateAnnouncementsDisplay([]);
                }
            }
        })
        .catch(error => {
            console.error("Error fetching announcements:", error);
            const cachedData = localStorage.getItem('cachedAnnouncements');
            if (cachedData) {
                updateAnnouncementsDisplay(JSON.parse(cachedData));
            }
        });
}

// Function to fetch notices
function fetchNotices() {
    fetch(`${API_BASE_URL}/notices`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                localStorage.setItem('cachedNotices', JSON.stringify(data));
                updateNoticesDisplay(data);
            } else {
                const cachedData = localStorage.getItem('cachedNotices');
                if (cachedData) {
                    updateNoticesDisplay(JSON.parse(cachedData));
                } else {
                    updateNoticesDisplay([]);
                }
            }
        })
        .catch(error => {
            console.error("Error fetching notices:", error);
            const cachedData = localStorage.getItem('cachedNotices');
            if (cachedData) {
                updateNoticesDisplay(JSON.parse(cachedData));
            }
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
// Update the populateTimetable function to remove weekend days
function populateTimetable(week) {
    console.log(`Populating timetable for ${week}`);
    
    // Use API data if available, otherwise fall back to localStorage
    const timetableEntries = window.timetableEntries || 
                      JSON.parse(localStorage.getItem('cachedTimetableData')) || [];
    
    // Filter entries for the current week - exact match
    const weekData = timetableEntries.filter(entry => entry.week === week);
    console.log(`Found ${weekData.length} entries for ${week}`);
    
    const table = document.getElementById('timetable-entries');
    if (!table) return;
    
    // Clear existing table content
    table.innerHTML = '';
    
    if (weekData.length === 0) {
        // No entries for this week
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 6; // Adjusted for 5 weekdays + time column
        emptyCell.textContent = 'No classes scheduled for this week';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '20px';
        emptyRow.appendChild(emptyCell);
        table.appendChild(emptyRow);
        return;
    }
    
    // Create the table header
    const header = document.createElement('tr');
    
    // Add time column header
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time';
    timeHeader.className = 'time-column';
    header.appendChild(timeHeader);
    
    // Add day headers (only Monday through Friday)
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = day;
        header.appendChild(dayHeader);
    });
    
    table.appendChild(header);
    
    // Get all unique time slots from entries
    const timeSlots = [];
    
    weekData.forEach(entry => {
        if (entry.startTime && entry.endTime) {
            const timeSlot = `${entry.startTime} - ${entry.endTime}`;
            if (!timeSlots.includes(timeSlot)) {
                timeSlots.push(timeSlot);
            }
        }
    });
    
    // Sort time slots
    timeSlots.sort((a, b) => {
        const timeA = a.split(' - ')[0];
        const timeB = b.split(' - ')[0];
        return timeA.localeCompare(timeB);
    });
    
    // If no time slots found, use default ones
    if (timeSlots.length === 0) {
        const defaultSlots = [
            "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", 
            "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", 
            "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
        ];
        
        defaultSlots.forEach(timeSlot => {
            const row = document.createElement('tr');
            
            // Add time cell
            const timeCell = document.createElement('td');
            timeCell.textContent = formatTime(timeSlot.split(' - ')[0]) + ' - ' + formatTime(timeSlot.split(' - ')[1]);
            timeCell.className = 'time-cell';
            row.appendChild(timeCell);
            
            // Add empty cells for each day (weekdays only)
            weekdays.forEach(() => {
                const dayCell = document.createElement('td');
                row.appendChild(dayCell);
            });
            
            table.appendChild(row);
        });
    } else {
        // Create rows for each time slot
        timeSlots.forEach(timeSlot => {
            const row = document.createElement('tr');
            
            // Add time cell
            const timeCell = document.createElement('td');
            const times = timeSlot.split(' - ');
            timeCell.textContent = formatTime(times[0]) + ' - ' + formatTime(times[1]);
            timeCell.className = 'time-cell';
            row.appendChild(timeCell);
            
            // Add cells for each day (only Monday-Friday)
            weekdays.forEach(day => {
                const cell = document.createElement('td');
                
                // Find entries for this day and time slot
                const entries = weekData.filter(entry => {
                    const entryTimeSlot = `${entry.startTime} - ${entry.endTime}`;
                    const entryDays = entry.days ? entry.days.split(',').map(d => d.trim()) : [];
                    return entryTimeSlot === timeSlot && entryDays.includes(day);
                });
                
                // Add entries to the cell
                entries.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'class-entry';
                    
                    entryDiv.innerHTML = `
                        <strong>${entry.course || 'Course'}</strong>
                        <p class="venue">${entry.venue || ''}</p>
                        ${entry.teacher ? `<p class="teacher">${entry.teacher}</p>` : ''}
                    `;
                    
                    cell.appendChild(entryDiv);
                });
                
                row.appendChild(cell);
            });
            
            table.appendChild(row);
        });
    }
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