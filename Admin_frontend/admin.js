// admin.js

// Authentication check at the beginning of admin.js

// Check if user is logged in
(function() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true' || 
                       localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        //window.location.href = 'login.html';
        return;
    }
    
    // Show user info when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const adminUsername = sessionStorage.getItem('adminUsername') || 
                              localStorage.getItem('adminUsername');
                              
        // Create user info bar
        const userInfoBar = document.createElement('div');
        userInfoBar.className = 'admin-user-bar';
        userInfoBar.innerHTML = `
            <div class="admin-user-info">
                <i class="fas fa-user-circle"></i>
                <span>Welcome, ${adminUsername}</span>
            </div>
            <button id="logout-btn" title="Logout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        
        // Add to document body
        const firstChild = document.body.firstChild;
        document.body.insertBefore(userInfoBar, firstChild);
        
        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminUsername');
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminUsername');
                window.location.href = 'login.html';
            }
        });
    });
})();

// Define default time slots
const defaultTimeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

// Save default time slots if none exist
if (!localStorage.getItem('timeSlots')) {
    localStorage.setItem('timeSlots', JSON.stringify(defaultTimeSlots));
}

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Format time from 24-hour format to 12-hour format with AM/PM
function formatTimeToAMPM(time) {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert hour '0' to '12'
    return `${hour}:${minutes} ${ampm}`;
}

// Add these global functions at the top of your admin.js file

// Global functions for week number buttons
function decreaseWeek() {
    console.log('Decrease week called');
    const weekNumberInput = document.getElementById('week-number');
    if (weekNumberInput) {
        const currentValue = parseInt(weekNumberInput.value);
        if (currentValue > 1) {
            weekNumberInput.value = currentValue - 1;
            updateWeekLabel();
        }
    } else {
        console.error('Week number input not found');
    }
}

function increaseWeek() {
    console.log('Increase week called');
    const weekNumberInput = document.getElementById('week-number');
    if (weekNumberInput) {
        const currentValue = parseInt(weekNumberInput.value);
        weekNumberInput.value = currentValue + 1;
        updateWeekLabel();
    } else {
        console.error('Week number input not found');
    }
}

function updateWeekLabel() {
    const weekNumberInput = document.getElementById('week-number');
    const weekInput = document.getElementById('week');
    const weekValueDisplay = document.getElementById('week-value-display');
    
    if (!weekNumberInput) {
        console.error('Week number input not found in updateWeekLabel');
        return;
    }
    
    const weekValue = `Week ${weekNumberInput.value}`;
    
    if (weekValueDisplay) {
        weekValueDisplay.textContent = weekValue;
    } else {
        console.error('Week value display not found');
    }
    
    if (weekInput) {
        weekInput.value = weekValue;
    } else {
        console.error('Week input not found');
    }
    
    console.log('Week updated to:', weekValue);
}

// Store unique courses and teachers
function storeUniqueCourse(courseName) {
    if (!courseName) return;
    
    let uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
    if (!uniqueCourses.includes(courseName)) {
        uniqueCourses.push(courseName);
        localStorage.setItem('uniqueCourses', JSON.stringify(uniqueCourses));
    }
}

function storeUniqueTeacher(teacherName) {
    if (!teacherName) return;
    
    let uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
    if (!uniqueTeachers.includes(teacherName)) {
        uniqueTeachers.push(teacherName);
        localStorage.setItem('uniqueTeachers', JSON.stringify(uniqueTeachers));
    }
}

function storeUniqueVenue(venueName) {
    if (!venueName) return;
    
    let uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
    if (!uniqueVenues.includes(venueName)) {
        uniqueVenues.push(venueName);
        localStorage.setItem('uniqueVenues', JSON.stringify(uniqueVenues));
    }
}

// Load saved values and populate datalists
function loadSavedValues() {
    // Populate course datalist
    const courseDatalist = document.getElementById('course-list');
    if (courseDatalist) {
        const uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
        courseDatalist.innerHTML = '';
        uniqueCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            courseDatalist.appendChild(option);
        });
    }
    
    // Populate teacher datalist
    const teacherDatalist = document.getElementById('teacher-list');
    if (teacherDatalist) {
        const uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
        teacherDatalist.innerHTML = '';
        uniqueTeachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher;
            teacherDatalist.appendChild(option);
        });
    }
    
    // Populate venue datalist
    const venueDatalist = document.getElementById('venue-list');
    if (venueDatalist) {
        const uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
        venueDatalist.innerHTML = '';
        uniqueVenues.forEach(venue => {
            const option = document.createElement('option');
            option.value = venue;
            venueDatalist.appendChild(option);
        });
    }
}

// Handle timetable form submission
const API_BASE_URL = '/api';

document.getElementById('timetable-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const week = document.getElementById('week').value;
    const course = document.getElementById('course').value;
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(el => el.value);
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const teacher = document.getElementById('teacher').value;
    const venue = document.getElementById('venue').value;

    // Check if at least one day is selected
    if (days.length === 0) {
        alert('Please select at least one day');
        return;
    }
    
    // Validate start time is before end time
    if (startTime >= endTime) {
        alert('Start time must be before end time');
        return;
    }

    const timetableEntry = {
        week,
        course,
        days: days.join(','),
        startTime,
        endTime,
        teacher,
        venue
    };

    fetch(`${API_BASE_URL}/timetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timetableEntry)
    })
    .then(response => response.json())
    .then(data => {
        alert('Timetable entry added successfully!');
        document.getElementById('timetable-form').reset();
        updateTimetable();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding timetable entry.');
    });
});

function updateTimetable() {
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(timetableEntries => {
            const tbody = document.querySelector('#admin-timetable tbody');
            
            if (!tbody) {
                console.error('Timetable tbody not found');
                return;
            }
            
            tbody.innerHTML = '';

            if (timetableEntries.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 7;
                cell.textContent = 'No timetable entries available';
                cell.style.textAlign = 'center';
                cell.style.padding = '20px';
                row.appendChild(cell);
                tbody.appendChild(row);
                return;
            }

            timetableEntries.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.week}</td>
                    <td>${entry.course || ''}</td>
                    <td>${entry.days ? entry.days.split(',').join(', ') : ''}</td>
                    <td>${entry.startTime} - ${entry.endTime}</td>
                    <td>${entry.teacher || ''}</td>
                    <td>${entry.venue || ''}</td>
                    <td>
                        <button class="delete-btn" data-id="${entry.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteTimetableEntry(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching timetable entries:', error);
            const tbody = document.querySelector('#admin-timetable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7">Error loading timetable.</td></tr>';
            }
        });
}

function deleteTimetableEntry(id) {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
        fetch(`${API_BASE_URL}/timetable/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            updateTimetable();
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            alert('Error deleting timetable entry.');
        });
    }
}

// Handle announcement form submission
document.getElementById('announcement-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const announcementText = document.getElementById('announcement').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    if (!announcementText || isNaN(duration) || duration < 1) {
        alert('Please enter valid announcement text and duration');
        return;
    }
    
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + duration);
    
    const announcement = {
        announcement: announcementText,
        date: now.toISOString(),
        expiryDate: expiryDate.toISOString()
    };
    
    fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcement)
    })
    .then(response => response.json())
    .then(data => {
        alert('Announcement added successfully!');
        document.getElementById('announcement-form').reset();
        updateAnnouncements();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding announcement.');
    });
});

// Handle notice form submission
document.getElementById('notice-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const noticeText = document.getElementById('notice').value;
    
    if (!noticeText) {
        alert('Please enter valid notice text');
        return;
    }
    
    const notice = {
        notice: noticeText,
        date: new Date().toISOString()
    };
    
    fetch(`${API_BASE_URL}/notices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notice)
    })
    .then(response => response.json())
    .then(data => {
        alert('Notice added successfully!');
        document.getElementById('notice-form').reset();
        updateNotices();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding notice.');
    });
});

// Update timetable in admin view
function updateTimetable() {
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(timetableEntries => {
            const tbody = document.querySelector('#admin-timetable tbody');
            tbody.innerHTML = '';

            if (timetableEntries.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 7;
                cell.textContent = 'No timetable entries available';
                cell.style.textAlign = 'center';
                cell.style.padding = '20px';
                row.appendChild(cell);
                tbody.appendChild(row);
                return;
            }

            timetableEntries.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.week}</td>
                    <td>${entry.course || ''}</td>
                    <td>${entry.days ? entry.days.split(',').join(', ') : ''}</td>
                    <td>${entry.startTime} - ${entry.endTime}</td>
                    <td>${entry.teacher || ''}</td>
                    <td>${entry.venue || ''}</td>
                    <td>
                        <button class="delete-btn" data-id="${entry.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteTimetableEntry(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching timetable entries:', error);
            tbody.innerHTML = '<tr><td colspan="7">Error loading timetable.</td></tr>';
        });
}

// Delete a timetable entry
function deleteTimetableEntry(id) {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
        fetch(`${API_BASE_URL}/timetable/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            updateTimetable();
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            alert('Error deleting timetable entry.');
        });
    }
}

// Update announcements in admin view
function updateAnnouncements() {
    fetch(`${API_BASE_URL}/announcements`)
        .then(response => response.json())
        .then(announcements => {
            const container = document.getElementById('admin-announcements');
            
            if (!container) {
                console.error('Announcements container not found');
                return;
            }
            
            container.innerHTML = '';
            
            if (announcements.length === 0) {
                container.innerHTML = '<p>No announcements available</p>';
                return;
            }
            
            announcements.forEach((announcement, index) => {
                const div = document.createElement('div');
                div.className = 'announcement-item';
                div.innerHTML = `
                    <p><strong>Announcement:</strong> ${announcement.announcement}</p>
                    <p><strong>Date:</strong> ${new Date(announcement.date).toLocaleDateString()}</p>
                    <p><strong>Expires:</strong> ${new Date(announcement.expiryDate).toLocaleDateString()}</p>
                    <button class="delete-btn" data-type="announcement" data-id="${announcement.id}">Delete</button>
                    <hr>
                `;
                container.appendChild(div);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn[data-type="announcement"]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteAnnouncement(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
            document.getElementById('admin-announcements').innerHTML = '<p>Error loading announcements.</p>';
        });
}

// Update notices in admin view
function updateNotices() {
    fetch(`${API_BASE_URL}/notices`)
        .then(response => response.json())
        .then(notices => {
            const container = document.getElementById('admin-notices');
            
            if (!container) {
                console.error('Notices container not found');
                return;
            }
            
            container.innerHTML = '';
            
            if (notices.length === 0) {
                container.innerHTML = '<p>No notices available</p>';
                return;
            }
            
            notices.forEach((notice, index) => {
                const div = document.createElement('div');
                div.className = 'notice-item';
                div.innerHTML = `
                    <p><strong>Notice:</strong> ${notice.notice}</p>
                    <p><strong>Date:</strong> ${new Date(notice.date).toLocaleDateString()}</p>
                    <button class="delete-btn" data-type="notice" data-id="${notice.id}">Delete</button>
                    <hr>
                `;
                container.appendChild(div);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn[data-type="notice"]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteNotice(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching notices:', error);
            document.getElementById('admin-notices').innerHTML = '<p>Error loading notices.</p>';
        });
}

// Delete an announcement
function deleteAnnouncement(id) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        fetch(`${API_BASE_URL}/announcements/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            updateAnnouncements();
        })
        .catch(error => {
            console.error('Error deleting announcement:', error);
            alert('Error deleting announcement.');
        });
    }
}

// Delete a notice
function deleteNotice(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
        fetch(`${API_BASE_URL}/notices/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            updateNotices();
        })
        .catch(error => {
            console.error('Error deleting notice:', error);
            alert('Error deleting notice.');
        });
    }
}

// Reset time slots to default
document.getElementById('reset-timeslots').addEventListener('click', function() {
    if (confirm('Are you sure you want to reset time slots to default?')) {
        localStorage.setItem('timeSlots', JSON.stringify(defaultTimeSlots));
        alert('Time slots have been reset to default');
    }
});

// Clear all entries
document.getElementById('clear-all').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear ALL entries? This cannot be undone.')) {
        // Clear timetable entries
        fetch(`${API_BASE_URL}/timetable/clear`, {
            method: 'DELETE'
        })
        .then(() => {
            // Clear announcements
            return fetch(`${API_BASE_URL}/announcements/clear`, {
                method: 'DELETE'
            });
        })
        .then(() => {
            // Clear notices
            return fetch(`${API_BASE_URL}/notices/clear`, {
                method: 'DELETE'
            });
        })
        .then(() => {
            // Update UI
            updateTimetable();
            updateAnnouncements();
            updateNotices();
            alert('All entries have been cleared');
        })
        .catch(error => {
            console.error('Error clearing entries:', error);
            alert('Error clearing entries');
        });
    }
});

// Add or update the manageSavedData function

function manageSavedData() {
    const uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
    const uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
    const uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
    
    let coursesList = uniqueCourses.map(course => `<li>${course} <button class="delete-saved-data" data-type="course" data-value="${course}">Delete</button></li>`).join('');
    let teachersList = uniqueTeachers.map(teacher => `<li>${teacher} <button class="delete-saved-data" data-type="teacher" data-value="${teacher}">Delete</button></li>`).join('');
    let venuesList = uniqueVenues.map(venue => `<li>${venue} <button class="delete-saved-data" data-type="venue" data-value="${venue}">Delete</button></li>`).join('');
    
    const modalContent = `
        <div class="saved-data-modal">
            <h3>Saved Courses</h3>
            <ul>${coursesList || '<li>No saved courses</li>'}</ul>
            <button class="clear-category-btn" data-type="courses">Clear All Courses</button>
            
            <h3>Saved Teachers</h3>
            <ul>${teachersList || '<li>No saved teachers</li>'}</ul>
            <button class="clear-category-btn" data-type="teachers">Clear All Teachers</button>
            
            <h3>Saved Venues</h3>
            <ul>${venuesList || '<li>No saved venues</li>'}</ul>
            <button class="clear-category-btn" data-type="venues">Clear All Venues</button>
            
            <div class="modal-actions">
                <button class="clear-all-data-btn">Clear All Saved Data</button>
                <button id="close-saved-data-modal">Close</button>
            </div>
        </div>
    `;
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-saved-data-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Individual item delete handler
    document.querySelectorAll('.delete-saved-data').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');
            
            if (type === 'course') {
                let uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
                uniqueCourses = uniqueCourses.filter(course => course !== value);
                localStorage.setItem('uniqueCourses', JSON.stringify(uniqueCourses));
            } else if (type === 'teacher') {
                let uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
                uniqueTeachers = uniqueTeachers.filter(teacher => teacher !== value);
                localStorage.setItem('uniqueTeachers', JSON.stringify(uniqueTeachers));
            } else if (type === 'venue') {
                let uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
                uniqueVenues = uniqueVenues.filter(venue => venue !== value);
                localStorage.setItem('uniqueVenues', JSON.stringify(uniqueVenues));
            }
            
            // Update UI
            document.body.removeChild(modal);
            manageSavedData();
            loadSavedValues();
        });
    });
    
    // Category clear button handler
    document.querySelectorAll('.clear-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            if (confirm(`Are you sure you want to clear all saved ${type}?`)) {
                if (type === 'courses') {
                    localStorage.removeItem('uniqueCourses');
                } else if (type === 'teachers') {
                    localStorage.removeItem('uniqueTeachers');
                } else if (type === 'venues') {
                    localStorage.removeItem('uniqueVenues');
                }
                
                // Update UI
                document.body.removeChild(modal);
                manageSavedData();
                loadSavedValues();
            }
        });
    });
    
    // Clear all data button
    document.querySelector('.clear-all-data-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear ALL saved courses, teachers, and venues?')) {
            localStorage.removeItem('uniqueCourses');
            localStorage.removeItem('uniqueTeachers');
            localStorage.removeItem('uniqueVenues');
            
            // Update UI
            document.body.removeChild(modal);
            manageSavedData();
            loadSavedValues();
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize timetable and other components
    updateTimetable();
    updateAnnouncements();
    updateNotices();
    loadSavedValues(); // Load saved courses and teachers
    
    // Week number selector direct binding
    const decreaseWeekBtn = document.getElementById('decrease-week');
    if (decreaseWeekBtn) {
        decreaseWeekBtn.onclick = function() {
            console.log('Decrease button clicked');
            decreaseWeek();
        };
    } else {
        console.error('Decrease week button not found');
    }
    
    const increaseWeekBtn = document.getElementById('increase-week');
    if (increaseWeekBtn) {
        increaseWeekBtn.onclick = function() {
            console.log('Increase button clicked');
            increaseWeek();
        };
    } else {
        console.error('Increase week button not found');
    }
    
    // Load saved values
    loadSavedValues();
    
    // Add this to your DOMContentLoaded event listener
    document.getElementById('manage-saved-data').addEventListener('click', function() {
        manageSavedData();
    });

    // Make sure this is added with your other initialization code
    const manageSavedDataBtn = document.getElementById('manage-saved-data');
    if (manageSavedDataBtn) {
        manageSavedDataBtn.addEventListener('click', manageSavedData);
    }
    
    // Rest of your existing code...
});

// Add this at the bottom of your admin.js file

// Define the manageSavedData function
function manageSavedData() {
    console.log('manageSavedData function called');
    
    const uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
    const uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
    const uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
    
    let coursesList = uniqueCourses.map(course => `<li>${course} <button class="delete-saved-data" data-type="course" data-value="${course}">Delete</button></li>`).join('');
    let teachersList = uniqueTeachers.map(teacher => `<li>${teacher} <button class="delete-saved-data" data-type="teacher" data-value="${teacher}">Delete</button></li>`).join('');
    let venuesList = uniqueVenues.map(venue => `<li>${venue} <button class="delete-saved-data" data-type="venue" data-value="${venue}">Delete</button></li>`).join('');
    
    const modalContent = `
        <div class="saved-data-modal">
            <h3>Saved Courses</h3>
            <ul>${coursesList || '<li>No saved courses</li>'}</ul>
            <button class="clear-category-btn" data-type="courses">Clear All Courses</button>
            
            <h3>Saved Teachers</h3>
            <ul>${teachersList || '<li>No saved teachers</li>'}</ul>
            <button class="clear-category-btn" data-type="teachers">Clear All Teachers</button>
            
            <h3>Saved Venues</h3>
            <ul>${venuesList || '<li>No saved venues</li>'}</ul>
            <button class="clear-category-btn" data-type="venues">Clear All Venues</button>
            
            <div class="modal-actions">
                <button class="clear-all-data-btn">Clear All Saved Data</button>
                <button id="close-saved-data-modal">Close</button>
            </div>
        </div>
    `;
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-saved-data-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Individual item delete handler
    document.querySelectorAll('.delete-saved-data').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');
            
            if (type === 'course') {
                let uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
                uniqueCourses = uniqueCourses.filter(course => course !== value);
                localStorage.setItem('uniqueCourses', JSON.stringify(uniqueCourses));
            } else if (type === 'teacher') {
                let uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
                uniqueTeachers = uniqueTeachers.filter(teacher => teacher !== value);
                localStorage.setItem('uniqueTeachers', JSON.stringify(uniqueTeachers));
            } else if (type === 'venue') {
                let uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
                uniqueVenues = uniqueVenues.filter(venue => venue !== value);
                localStorage.setItem('uniqueVenues', JSON.stringify(uniqueVenues));
            }
            
            // Update UI
            document.body.removeChild(modal);
            manageSavedData();
            loadSavedValues();
        });
    });
    
    // Category clear button handler
    document.querySelectorAll('.clear-category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            if (confirm(`Are you sure you want to clear all saved ${type}?`)) {
                if (type === 'courses') {
                    localStorage.removeItem('uniqueCourses');
                } else if (type === 'teachers') {
                    localStorage.removeItem('uniqueTeachers');
                } else if (type === 'venues') {
                    localStorage.removeItem('uniqueVenues');
                }
                
                // Update UI
                document.body.removeChild(modal);
                manageSavedData();
                loadSavedValues();
            }
        });
    });
    
    // Clear all data button
    document.querySelector('.clear-all-data-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear ALL saved courses, teachers, and venues?')) {
            localStorage.removeItem('uniqueCourses');
            localStorage.removeItem('uniqueTeachers');
            localStorage.removeItem('uniqueVenues');
            
            // Update UI
            document.body.removeChild(modal);
            manageSavedData();
            loadSavedValues();
        }
    });
}

// Make sure to add this direct event handler attachment
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Check if button exists
    const manageSavedDataBtn = document.getElementById('manage-saved-data');
    console.log('Manage saved data button found:', !!manageSavedDataBtn);
    
    if (manageSavedDataBtn) {
        // Direct onclick assignment (more reliable than addEventListener)
        manageSavedDataBtn.onclick = manageSavedData;
        console.log('Onclick handler attached to manage-saved-data button');
    }
    
    // Rest of your initialization code...
});

// Also add a direct global click handler as a fallback
window.onload = function() {
    console.log('Window loaded');
    
    const manageSavedDataBtn = document.getElementById('manage-saved-data');
    if (manageSavedDataBtn) {
        manageSavedDataBtn.onclick = manageSavedData;
        console.log('Additional onclick handler attached on window load');
    }
};

// Add or update this code for the Clear All Entries button

// Make sure this is called when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up admin page event handlers');
    
    // Existing initialization code...
    updateTimetable();
    updateAnnouncements();
    updateNotices();
    loadSavedValues();
    
    // Clear all entries button
    const clearAllBtn = document.getElementById('clear-all');
    console.log('Clear all button found:', !!clearAllBtn);
    
    if (clearAllBtn) {
        clearAllBtn.onclick = function() {
            console.log('Clear all button clicked');
            if (confirm('Are you sure you want to clear ALL timetable entries, announcements, and notices? This cannot be undone.')) {
                // Clear timetable entries
                localStorage.removeItem('timetableEntries');
                
                // Clear announcements
                localStorage.removeItem('announcements');
                
                // Clear notices
                localStorage.removeItem('notices');
                
                // Update UI
                updateTimetable();
                updateAnnouncements();
                updateNotices();
                
                alert('All entries have been cleared successfully.');
            }
        };
    }
    
    // Other initialization...
});

// Make sure the updateTimetable, updateAnnouncements, and updateNotices functions properly handle empty arrays
function updateTimetable() {
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(timetableEntries => {
            const tbody = document.querySelector('#admin-timetable tbody');
            
            if (!tbody) {
                console.error('Timetable tbody not found');
                return;
            }
            
            tbody.innerHTML = '';

            if (timetableEntries.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 7;
                cell.textContent = 'No timetable entries available';
                cell.style.textAlign = 'center';
                cell.style.padding = '20px';
                row.appendChild(cell);
                tbody.appendChild(row);
                return;
            }

            timetableEntries.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.week}</td>
                    <td>${entry.course || ''}</td>
                    <td>${entry.days ? entry.days.split(',').join(', ') : ''}</td>
                    <td>${entry.startTime} - ${entry.endTime}</td>
                    <td>${entry.teacher || ''}</td>
                    <td>${entry.venue || ''}</td>
                    <td>
                        <button class="delete-btn" data-id="${entry.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteTimetableEntry(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching timetable entries:', error);
            const tbody = document.querySelector('#admin-timetable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="7">Error loading timetable.</td></tr>';
            }
        });
}

function updateAnnouncements() {
    fetch(`${API_BASE_URL}/announcements`)
        .then(response => response.json())
        .then(announcements => {
            const container = document.getElementById('admin-announcements');
            
            if (!container) {
                console.error('Announcements container not found');
                return;
            }
            
            container.innerHTML = '';
            
            if (announcements.length === 0) {
                container.innerHTML = '<p>No announcements available</p>';
                return;
            }
            
            announcements.forEach((announcement, index) => {
                const div = document.createElement('div');
                div.className = 'announcement-item';
                div.innerHTML = `
                    <p><strong>Announcement:</strong> ${announcement.announcement}</p>
                    <p><strong>Date:</strong> ${new Date(announcement.date).toLocaleDateString()}</p>
                    <p><strong>Expires:</strong> ${new Date(announcement.expiryDate).toLocaleDateString()}</p>
                    <button class="delete-btn" data-type="announcement" data-id="${announcement.id}">Delete</button>
                    <hr>
                `;
                container.appendChild(div);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn[data-type="announcement"]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteAnnouncement(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
            document.getElementById('admin-announcements').innerHTML = '<p>Error loading announcements.</p>';
        });
}

function updateNotices() {
    fetch(`${API_BASE_URL}/notices`)
        .then(response => response.json())
        .then(notices => {
            const container = document.getElementById('admin-notices');
            
            if (!container) {
                console.error('Notices container not found');
                return;
            }
            
            container.innerHTML = '';
            
            if (notices.length === 0) {
                container.innerHTML = '<p>No notices available</p>';
                return;
            }
            
            notices.forEach((notice, index) => {
                const div = document.createElement('div');
                div.className = 'notice-item';
                div.innerHTML = `
                    <p><strong>Notice:</strong> ${notice.notice}</p>
                    <p><strong>Date:</strong> ${new Date(notice.date).toLocaleDateString()}</p>
                    <button class="delete-btn" data-type="notice" data-id="${notice.id}">Delete</button>
                    <hr>
                `;
                container.appendChild(div);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn[data-type="notice"]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    deleteNotice(id);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching notices:', error);
            document.getElementById('admin-notices').innerHTML = '<p>Error loading notices.</p>';
        });
}