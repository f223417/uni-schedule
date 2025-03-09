// Constants for API access
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '/api';

// Global variables
let currentWeek = 'Week 1'; // Default to Week 1
let timetableData = [];
let weeksAvailable = [];

// Function to load and display timetable data
function loadTimetable() {
    fetch(`${API_BASE_URL}/timetable?_nocache=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            timetableData = data;
            
            // Extract available weeks from data
            weeksAvailable = [...new Set(data.map(entry => entry.week).filter(Boolean))];
            
            // Populate week selector
            populateWeekSelector();
            
            // Display the current week's timetable
            displayTimetable(currentWeek);
        })
        .catch(error => {
            console.error('Error loading timetable:', error);
            document.getElementById('timetable-container').innerHTML = 
                '<p class="error">Failed to load timetable. Please try again later.</p>';
        });
}

// Function to populate week selector dropdown
function populateWeekSelector() {
    const weekSelector = document.getElementById('week-selector');
    if (weekSelector) {
        weekSelector.innerHTML = '';
        
        weeksAvailable.forEach(week => {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = week;
            if (week === currentWeek) {
                option.selected = true;
            }
            weekSelector.appendChild(option);
        });
        
        // Add event listener for week changes
        weekSelector.addEventListener('change', function() {
            currentWeek = this.value;
            displayTimetable(currentWeek);
        });
    }
    
    // Update week navigation buttons
    updateWeekNavigation();
}

// Function to update week navigation buttons
function updateWeekNavigation() {
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    if (prevWeekBtn && nextWeekBtn) {
        const currentIndex = weeksAvailable.indexOf(currentWeek);
        
        // Enable/disable previous week button
        prevWeekBtn.disabled = currentIndex <= 0;
        prevWeekBtn.classList.toggle('disabled', currentIndex <= 0);
        
        // Enable/disable next week button
        nextWeekBtn.disabled = currentIndex >= weeksAvailable.length - 1;
        nextWeekBtn.classList.toggle('disabled', currentIndex >= weeksAvailable.length - 1);
        
        // Add event listeners
        prevWeekBtn.onclick = function() {
            if (currentIndex > 0) {
                currentWeek = weeksAvailable[currentIndex - 1];
                document.getElementById('week-selector').value = currentWeek;
                displayTimetable(currentWeek);
                updateWeekNavigation();
            }
        };
        
        nextWeekBtn.onclick = function() {
            if (currentIndex < weeksAvailable.length - 1) {
                currentWeek = weeksAvailable[currentIndex + 1];
                document.getElementById('week-selector').value = currentWeek;
                displayTimetable(currentWeek);
                updateWeekNavigation();
            }
        };
    }
}

// Function to display timetable for a specific week
function displayTimetable(week) {
    const timetableContainer = document.getElementById('timetable-container');
    
    if (!timetableContainer) {
        console.error('Timetable container not found');
        return;
    }
    
    // Display current week indicator
    const weekDisplay = document.getElementById('current-week');
    if (weekDisplay) {
        weekDisplay.textContent = week;
    }
    
    // Filter entries for the selected week
    const weekEntries = timetableData.filter(entry => entry.week === week);
    
    if (weekEntries.length === 0) {
        timetableContainer.innerHTML = `<p class="no-entries">No classes scheduled for ${week}.</p>`;
        return;
    }
    
    // Create day-based timetable
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let timetableHTML = '<table class="timetable"><thead><tr><th>Time</th>';
    
    // Add day headers
    days.forEach(day => {
        timetableHTML += `<th>${day}</th>`;
    });
    
    timetableHTML += '</tr></thead><tbody>';
    
    // Get all unique time slots
    const timeSlots = [...new Set(weekEntries.map(entry => `${entry.startTime} - ${entry.endTime}`))];
    
    // Sort time slots
    timeSlots.sort((a, b) => {
        const timeA = a.split(' - ')[0];
        const timeB = b.split(' - ')[0];
        return new Date(`1/1/2023 ${timeA}`) - new Date(`1/1/2023 ${timeB}`);
    });
    
    // Create rows for each time slot
    timeSlots.forEach(timeSlot => {
        timetableHTML += `<tr><td>${formatTimeForDisplay(timeSlot)}</td>`;
        
        // Add cells for each day
        days.forEach(day => {
            const dayEntries = weekEntries.filter(entry => {
                const entryDays = Array.isArray(entry.days) ? entry.days : [entry.days];
                const entryTimeSlot = `${entry.startTime} - ${entry.endTime}`;
                return entryDays.includes(day) && entryTimeSlot === timeSlot;
            });
            
            if (dayEntries.length > 0) {
                timetableHTML += '<td class="has-class">';
                dayEntries.forEach(entry => {
                    timetableHTML += `
                        <div class="class-entry">
                            <div class="course">${entry.course || ''}</div>
                            ${entry.teacher ? `<div class="teacher">${entry.teacher}</div>` : ''}
                            ${entry.venue ? `<div class="venue">${entry.venue}</div>` : ''}
                        </div>
                    `;
                });
                timetableHTML += '</td>';
            } else {
                timetableHTML += '<td></td>';
            }
        });
        
        timetableHTML += '</tr>';
    });
    
    timetableHTML += '</tbody></table>';
    timetableContainer.innerHTML = timetableHTML;
}

// Helper function to format time for display (24h to 12h format)
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

// Function to load announcements
function loadAnnouncements() {
    fetch(`${API_BASE_URL}/announcements?_nocache=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            displayAnnouncements(data);
        })
        .catch(error => {
            console.error('Error loading announcements:', error);
        });
}

// Function to display announcements
function displayAnnouncements(announcements) {
    const announcementContainer = document.getElementById('announcements');
    
    if (!announcementContainer) return;
    
    if (!announcements || announcements.length === 0) {
        announcementContainer.innerHTML = '<p>No announcements at this time.</p>';
        return;
    }
    
    let html = '<ul class="announcement-list">';
    announcements.forEach(announcement => {
        html += `
            <li class="announcement">
                <div class="announcement-title">${announcement.title || 'Announcement'}</div>
                <div class="announcement-content">${announcement.content || ''}</div>
                <div class="announcement-date">${new Date(announcement.date).toLocaleDateString()}</div>
            </li>
        `;
    });
    html += '</ul>';
    
    announcementContainer.innerHTML = html;
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTimetable();
    loadAnnouncements();
    
    // Add event listeners for week navigation if they exist
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    if (prevWeekBtn && nextWeekBtn) {
        updateWeekNavigation();
    }
    
    // No timers - everything is controlled by user interaction only
});