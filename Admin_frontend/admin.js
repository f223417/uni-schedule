// admin.js

// Add to the beginning of admin.js
function startPolling() {
    console.log("Starting data polling");
    
    // Initial fetch
    loadAllData();
    
    // Set up interval for periodic updates
    window.pollingInterval = setInterval(() => {
        console.log("Polling for updates...");
        loadAllData();
    }, 5000); // 5 seconds
    
    // Also refresh when user comes back to tab
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log("Tab became visible, fetching latest data");
            loadAllData();
        }
    });
}

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
    console.log('Form submitted');
    
    const week = document.getElementById('week').value;
    const course = document.getElementById('course').value;
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(el => el.value);
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const teacher = document.getElementById('teacher').value;
    const venue = document.getElementById('venue').value;

    // Validation
    if (days.length === 0) {
        alert('Please select at least one day');
        return;
    }

    if (startTime >= endTime) {
        alert('Start time must be before end time');
        return;
    }

    // Store unique values for autocomplete
    if (course) storeUniqueCourse(course);
    if (teacher) storeUniqueTeacher(teacher);
    if (venue) storeUniqueVenue(venue);

    const timetableEntry = {
        week,
        course,
        days: days.join(','),
        startTime,
        endTime,
        teacher,
        venue
    };

    // Debug log
    console.log('Submitting entry:', timetableEntry);

    fetch(`${API_BASE_URL}/timetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(timetableEntry)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Timetable entry added successfully!');
        document.getElementById('timetable-form').reset();
        updateTimetable();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding timetable entry. Please check the console for details.');
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

// Find your submitTimetableEntry function and update it:
function submitTimetableEntry(event) {
  event.preventDefault();
  
  // Get form values
  const course = document.getElementById('course').value;
  const teacher = document.getElementById('teacher').value;
  const venue = document.getElementById('venue').value;
  const week = document.getElementById('week').value;
  // Get other form values...
  
  const entry = {
    id: Date.now().toString(), // Add unique ID
    course,
    teacher,
    venue,
    week,
    // Add other properties...
  };
  
  // Send to API with better error handling
  fetch('/api/timetable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Error adding entry');
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
    alert('Entry added successfully!');
    // Reset form or refresh data
  })
  .catch(error => {
    console.error('Error:', error);
    alert(`Failed to add entry: ${error.message}`);
  });
}

// Global variables to store data
let timetableEntries = [];
let announcements = [];
let notices = [];



// Function to load all data when the admin page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load all data types
    loadAllData();
    
    // Set up form submission handlers
    setupFormHandlers();
});

function loadAllData() {
    console.log("Loading all data for admin view...");
    loadTimetableEntries();
    loadAnnouncements();
    loadNotices();
}

// Function to load timetable entries
function loadTimetableEntries() {
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(data => {
            console.log('Timetable entries loaded:', data);
            timetableEntries = data;
            displayTimetableEntries(data);
        })
        .catch(error => {
            console.error('Error loading timetable entries:', error);
            alert('Failed to load timetable entries. See console for details.');
        });
}

// Function to load announcements
function loadAnnouncements() {
    fetch(`${API_BASE_URL}/announcements`)
        .then(response => response.json())
        .then(data => {
            console.log('Announcements loaded:', data);
            announcements = data;
            displayAnnouncements(data);
        })
        .catch(error => {
            console.error('Error loading announcements:', error);
            alert('Failed to load announcements. See console for details.');
        });
}

// Function to load notices
function loadNotices() {
    fetch(`${API_BASE_URL}/notices`)
        .then(response => response.json())
        .then(data => {
            console.log('Notices loaded:', data);
            notices = data;
            displayNotices(data);
        })
        .catch(error => {
            console.error('Error loading notices:', error);
            alert('Failed to load notices. See console for details.');
        });
}

// Function to set up form submission handlers
function setupFormHandlers() {
    // Timetable form
    const timetableForm = document.getElementById('timetable-form');
    if (timetableForm) {
        timetableForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitTimetableEntry();
        });
    }
    
    // Announcement form
    const announcementForm = document.getElementById('announcement-form');
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAnnouncement();
        });
    }
    
    // Notice form
    const noticeForm = document.getElementById('notice-form');
    if (noticeForm) {
        noticeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNotice();
        });
    }
}

// Function to display timetable entries
function displayTimetableEntries(entries) {
  const container = document.getElementById('timetable-entries');
  if (!container) return;
  
  container.innerHTML = entries.length === 0 ? 
      '<tr><td colspan="7">No timetable entries found</td></tr>' : '';
  
  entries.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${entry.week || ''}</td>
          <td>${Array.isArray(entry.days) ? entry.days.join(', ') : entry.days || ''}</td>
          <td>${entry.course || ''}</td>
          <td>${entry.venue || ''}</td>
          <td>${entry.teacher || ''}</td>
          <td>${entry.startTime || ''} - ${entry.endTime || ''}</td>
          <td>
              <button class="delete-btn" data-id="${entry.id}" data-type="timetable">Delete</button>
          </td>
      `;
      container.appendChild(row);
  });
}

// Function to display announcements
function displayAnnouncements(announcements) {
  const container = document.getElementById('announcement-entries');
  if (!container) {
      console.error('Announcement container not found');
      return;
  }
  
  container.innerHTML = '';
  
  if (announcements.length === 0) {
      container.innerHTML = '<p>No announcements found</p>';
      return;
  }
  
  announcements.forEach(announcement => {
      const div = document.createElement('div');
      div.className = 'announcement-item';
      
      div.innerHTML = `
          <p><strong>${announcement.announcement}</strong></p>
          <p>Posted: ${new Date(announcement.date).toLocaleDateString()}</p>
          <p>Expires: ${new Date(announcement.expiryDate).toLocaleDateString()}</p>
          <button class="delete-btn" data-id="${announcement.id}" data-type="announcement">Delete</button>
          <hr>
      `;
      
      container.appendChild(div);
  });
  
  // Add delete button event listeners
  document.querySelectorAll('button[data-type="announcement"]').forEach(button => {
      button.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          deleteAnnouncement(id);
      });
  });
}

// Function to display notices
function displayNotices(notices) {
  const container = document.getElementById('notice-entries');
  if (!container) {
      console.error('Notice container not found');
      return;
  }
  
  container.innerHTML = '';
  
  if (notices.length === 0) {
      container.innerHTML = '<p>No notices found</p>';
      return;
  }
  
  notices.forEach(notice => {
      const div = document.createElement('div');
      div.className = 'notice-item';
      
      div.innerHTML = `
          <p><strong>${notice.notice}</strong></p>
          <p>Posted: ${new Date(notice.date).toLocaleDateString()}</p>
          <button class="delete-btn" data-id="${notice.id}" data-type="notice">Delete</button>
          <hr>
      `;
      
      container.appendChild(div);
  });
  
  // Add delete button event listeners
  document.querySelectorAll('button[data-type="notice"]').forEach(button => {
      button.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          deleteNotice(id);
      });
  });
}

// Function to submit timetable entry
function submitTimetableEntry() {
    // Get form values
    const course = document.getElementById('course').value;
    const teacher = document.getElementById('teacher').value;
    const venue = document.getElementById('venue').value;
    const week = document.getElementById('week').value;
    
    // Get selected days
    const days = [];
    document.querySelectorAll('input[name="day"]:checked').forEach(checkbox => {
        days.push(checkbox.value);
    });
    
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    // Create entry object
    const entry = {
        course,
        teacher,
        venue,
        week,
        days,
        startTime,
        endTime
    };
    
    // Send to API
    fetch(`${API_BASE_URL}/timetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Entry added successfully!');
            // Reset form
            document.getElementById('timetable-form').reset();
            
            // Reload ALL data to ensure everything is displayed
            loadAllData();
        } else {
            alert(`Failed to add entry: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Error adding entry: ${error.message}`);
    });
}

// Function to submit announcement
function submitAnnouncement() {
    // Get form values
    const announcement = document.getElementById('announcement').value;
    const expiryDate = document.getElementById('expiry-date').value;
    
    // Create entry object
    const entry = {
        announcement,
        date: new Date().toISOString(),
        expiryDate: new Date(expiryDate).toISOString()
    };
    
    // Send to API
    fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Announcement added successfully!');
            // Reset form
            document.getElementById('announcement-form').reset();
            
            // Reload ALL data to ensure everything is displayed
            loadAllData();
        } else {
            alert(`Failed to add announcement: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Error adding announcement: ${error.message}`);
    });
}

// Function to submit notice
function submitNotice() {
    // Get form values
    const notice = document.getElementById('notice').value;
    
    // Create entry object
    const entry = {
        notice,
        date: new Date().toISOString()
    };
    
    // Send to API
    fetch(`${API_BASE_URL}/notices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Notice added successfully!');
            // Reset form
            document.getElementById('notice-form').reset();
            
            // Reload ALL data to ensure everything is displayed
            loadAllData();
        } else {
            alert(`Failed to add notice: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Error adding notice: ${error.message}`);
    });
}

// Delete functions
function deleteTimetableEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        fetch(`${API_BASE_URL}/timetable/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Entry deleted successfully!');
                loadAllData(); // Reload everything
            } else {
                alert(`Failed to delete entry: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error deleting entry: ${error.message}`);
        });
    }
}

function deleteAnnouncement(id) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        fetch(`${API_BASE_URL}/announcements/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Announcement deleted successfully!');
                loadAllData(); // Reload everything
            } else {
                alert(`Failed to delete announcement: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error deleting announcement: ${error.message}`);
        });
    }
}

function deleteNotice(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
        fetch(`${API_BASE_URL}/notices/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Notice deleted successfully!');
                loadAllData(); // Reload everything
            } else {
                alert(`Failed to delete notice: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error deleting notice: ${error.message}`);
        });
    }
}

// Add this at the top of your file
document.addEventListener('DOMContentLoaded', function() {
    // Load all data when page loads
    console.log('Admin page loaded - fetching all data');
    loadAllData();
    
    // Set up event listeners for tab switching
    setupTabNavigation();
    
    // Set up form event listeners
    setupFormEventListeners();
});

// Add this function to load everything
function loadAllData() {
    // Load timetable entries
    fetch('/api/timetable')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded timetable entries:', data);
            displayTimetableEntries(data);
        })
        .catch(error => {
            console.error('Error loading timetable entries:', error);
        });
        
    // Load announcements
    fetch('/api/announcements')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded announcements:', data);
            displayAnnouncements(data);
        })
        .catch(error => {
            console.error('Error loading announcements:', error);
        });
        
    // Load notices
    fetch('/api/notices')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded notices:', data);
            displayNotices(data);
        })
        .catch(error => {
            console.error('Error loading notices:', error);
        });
}

// Ensure the download button has the correct event listener
document.addEventListener('DOMContentLoaded', function() {
    const downloadPdfBtn = document.getElementById('download-pdf');
    
    if (downloadPdfBtn) {
        // IMPORTANT: Remove any existing event listeners
        const newBtn = downloadPdfBtn.cloneNode(true);
        downloadPdfBtn.parentNode.replaceChild(newBtn, downloadPdfBtn);
        
        // Add single event listener to the new button
        newBtn.addEventListener('click', generatePDF);
    }
});

// Ensure the generatePDF function is correctly defined
function generatePDF() {
    // Get current week from the admin display
    const currentWeek = document.getElementById('week').value || 'Week 1';
    
    // Create container for PDF content
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';
    container.style.width = '800px';
    
    // Create header
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    header.innerHTML = `
        <h2 style="margin: 0 0 5px 0; color: #3558d4; font-size: 22px;">University Timetable</h2>
        <h3 style="margin: 5px 0; color: #666;">${currentWeek}</h3>
        <p style="margin: 5px 0; color: #666;">Generated: ${new Date().toLocaleDateString()}</p>
    `;
    container.appendChild(header);
    
    // Create table for PDF
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '20px';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.style.backgroundColor = '#4a90e2';
    thead.style.color = 'white';
    
    // Create header row
    const headerRow = document.createElement('tr');
    
    // Add Time column header
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time';
    timeHeader.style.padding = '10px';
    timeHeader.style.border = '1px solid #ddd';
    timeHeader.style.textAlign = 'center';
    headerRow.appendChild(timeHeader);
    
    // Add weekday columns (Monday - Friday only)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = day;
        dayHeader.style.padding = '10px';
        dayHeader.style.border = '1px solid #ddd';
        dayHeader.style.textAlign = 'center';
        headerRow.appendChild(dayHeader);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Extract week number from currentWeek
    const weekMatch = currentWeek.match(/Week (\d+)/i);
    const weekNum = weekMatch ? weekMatch[1] : '1';
    
    // Fetch timetable data
    fetch(`${API_BASE_URL}/timetable`)
        .then(response => response.json())
        .then(allEntries => {
            // Filter for current week
            const entries = allEntries.filter(entry => {
                if (typeof entry.week === 'string' && entry.week.includes(weekNum)) {
                    return true;
                }
                return entry.week === `Week ${weekNum}` || entry.week === weekNum;
            });
            
            console.log(`Found ${entries.length} entries for week ${weekNum}`);
            
            // Get all unique time slots
            const timeSlots = [];
            entries.forEach(entry => {
                if (entry.startTime && entry.endTime) {
                    const timeString = `${entry.startTime} - ${entry.endTime}`;
                    if (!timeSlots.includes(timeString)) {
                        timeSlots.push(timeString);
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
                timeSlots.push(...defaultSlots);
            }
            
            // Create rows for each time slot
            timeSlots.forEach(timeSlot => {
                const row = document.createElement('tr');
                
                // Add time cell
                const timeCell = document.createElement('td');
                timeCell.textContent = formatTimeForDisplay(timeSlot);
                timeCell.style.padding = '10px';
                timeCell.style.border = '1px solid #ddd';
                timeCell.style.backgroundColor = '#f5f5f5';
                timeCell.style.fontWeight = 'bold';
                row.appendChild(timeCell);
                
                // Add cells for each day
                days.forEach(day => {
                    const cell = document.createElement('td');
                    cell.style.padding = '10px';
                    cell.style.border = '1px solid #ddd';
                    cell.style.verticalAlign = 'top';
                    
                    // Find entries for this day and time slot
                    const cellEntries = entries.filter(entry => {
                        const entryTimeSlot = `${entry.startTime} - ${entry.endTime}`;
                        const entryDays = entry.days ? entry.days.split(',').map(d => d.trim()) : [];
                        return entryTimeSlot === timeSlot && entryDays.includes(day);
                    });
                    
                    // Add entries to the cell
                    if (cellEntries.length > 0) {
                        cellEntries.forEach(entry => {
                            const entryDiv = document.createElement('div');
                            entryDiv.style.marginBottom = '8px';
                            entryDiv.style.padding = '5px';
                            entryDiv.style.borderLeft = '3px solid #4a90e2';
                            entryDiv.style.backgroundColor = '#f9f9f9';
                            
                            entryDiv.innerHTML = `
                                <div style="font-weight: bold; color: #333;">${entry.course || 'Course'}</div>
                                <div style="color: #4a90e2;">${entry.venue || ''}</div>
                                ${entry.teacher ? `<div style="color: #666; font-style: italic;">${entry.teacher}</div>` : ''}
                            `;
                            
                            cell.appendChild(entryDiv);
                        });
                    }
                    
                    row.appendChild(cell);
                });
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            container.appendChild(table);
            
            // Generate PDF with the created content
            finalizePDF(container);
        })
        .catch(error => {
            console.error('Error fetching timetable data for PDF:', error);
            alert('Error generating PDF. Please try again.');
        });
}

// Helper function to format time for display
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

// Add this helper function for PDF generation
function finalizePDF(container) {
    // Add container to the document temporarily
    document.body.appendChild(container);
    
    // Generate PDF using html2pdf
    window.html2pdf()
        .from(container)
        .set({
            margin: 10,
            filename: 'university-timetable.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        })
        .save()
        .then(() => {
            // Remove the temporary container after PDF is generated
            document.body.removeChild(container);
        });
}

// Ensure the loadAllData function is called on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded - initializing...');
    loadAllData();
    startPolling();
});

// Ensure the loadAllData function is correctly defined
function loadAllData() {
    console.log("Loading all data for admin view...");
    loadTimetableEntries();
    loadAnnouncements();
    loadNotices();
}

// Function to load timetable entries
function loadTimetableEntries(showAlerts = true) {
  console.log('Loading timetable entries from API...');
  fetch(`${API_BASE_URL}/timetable`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded ${data.length} timetable entries`);
      displayTimetableEntries(data);
    })
    .catch(error => {
      console.error('Error loading timetable entries:', error);
      displayTimetableEntries([]);
      if (showAlerts) {
        alert('Failed to load timetable entries. See console for details.');
      }
    });
}

// Function to load announcements
function loadAnnouncements(showAlerts = true) {
  console.log('Loading announcements from API...');
  fetch(`${API_BASE_URL}/announcements`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded ${data.length} announcements`);
      displayAnnouncements(data);
    })
    .catch(error => {
      console.error('Error loading announcements:', error);
      displayAnnouncements([]);
      if (showAlerts) {
        alert('Failed to load announcements. See console for details.');
      }
    });
}

// Function to load notices
function loadNotices(showAlerts = true) {
  console.log('Loading notices from API...');
  fetch(`${API_BASE_URL}/notices`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded ${data.length} notices`);
      displayNotices(data);
    })
    .catch(error => {
      console.error('Error loading notices:', error);
      displayNotices([]);
      if (showAlerts) {
        alert('Failed to load notices. See console for details.');
      }
    });
}

// Function to display timetable entries
function displayTimetableEntries(entries) {
  const container = document.getElementById('timetable-entries');
  if (!container) return;
  
  container.innerHTML = entries.length === 0 ? 
      '<tr><td colspan="7">No timetable entries found</td></tr>' : '';
  
  entries.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${entry.week || ''}</td>
          <td>${Array.isArray(entry.days) ? entry.days.join(', ') : entry.days || ''}</td>
          <td>${entry.course || ''}</td>
          <td>${entry.venue || ''}</td>
          <td>${entry.teacher || ''}</td>
          <td>${entry.startTime || ''} - ${entry.endTime || ''}</td>
          <td>
              <button class="delete-btn" data-id="${entry.id}" data-type="timetable">Delete</button>
          </td>
      `;
      container.appendChild(row);
  });
}

// Function to display announcements
function displayAnnouncements(announcements) {
  const container = document.getElementById('announcement-entries');
  if (!container) {
      console.error('Announcement container not found');
      return;
  }
  
  container.innerHTML = '';
  
  if (announcements.length === 0) {
      container.innerHTML = '<p>No announcements found</p>';
      return;
  }
  
  announcements.forEach(announcement => {
      const div = document.createElement('div');
      div.className = 'announcement-item';
      
      div.innerHTML = `
          <p><strong>${announcement.announcement}</strong></p>
          <p>Posted: ${new Date(announcement.date).toLocaleDateString()}</p>
          <p>Expires: ${new Date(announcement.expiryDate).toLocaleDateString()}</p>
          <button class="delete-btn" data-id="${announcement.id}" data-type="announcement">Delete</button>
          <hr>
      `;
      
      container.appendChild(div);
  });
  
  // Add delete button event listeners
  document.querySelectorAll('button[data-type="announcement"]').forEach(button => {
      button.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          deleteAnnouncement(id);
      });
  });
}

// Function to display notices
function displayNotices(notices) {
  const container = document.getElementById('notice-entries');
  if (!container) {
      console.error('Notice container not found');
      return;
  }
  
  container.innerHTML = '';
  
  if (notices.length === 0) {
      container.innerHTML = '<p>No notices found</p>';
      return;
  }
  
  notices.forEach(notice => {
      const div = document.createElement('div');
      div.className = 'notice-item';
      
      div.innerHTML = `
          <p><strong>${notice.notice}</strong></p>
          <p>Posted: ${new Date(notice.date).toLocaleDateString()}</p>
          <button class="delete-btn" data-id="${notice.id}" data-type="notice">Delete</button>
          <hr>
      `;
      
      container.appendChild(div);
  });
  
  // Add delete button event listeners
  document.querySelectorAll('button[data-type="notice"]').forEach(button => {
      button.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          deleteNotice(id);
      });
  });
}

/**
 * Displays and manages saved courses, teachers, and venues from the API
 * This function creates a modal dialog to view and manage all saved autocomplete data
 */
function manageSavedData() {
    console.log('Managing saved data from API...');
    
    // Create modal container immediately to show loading state
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    
    // Initial loading state
    modal.innerHTML = `
        <div class="saved-data-modal" style="background-color: #fff; padding: 20px; border-radius: 5px; max-width: 600px; width: 90%;">
            <h3>Loading Saved Data...</h3>
            <p>Please wait...</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fetch all data types from API
    Promise.all([
        fetch(`${API_BASE_URL}/courses`).then(res => res.json()).catch(() => []),
        fetch(`${API_BASE_URL}/teachers`).then(res => res.json()).catch(() => []),
        fetch(`${API_BASE_URL}/venues`).then(res => res.json()).catch(() => [])
    ])
    .then(([courses, teachers, venues]) => {
        console.log('Data loaded:', {courses, teachers, venues});
        
        // Handle possible data structure issues
        const processCourses = Array.isArray(courses) ? courses : [];
        const processTeachers = Array.isArray(teachers) ? teachers : [];
        const processVenues = Array.isArray(venues) ? venues : [];
        
        // Process each item to handle different API response formats
        const formatItem = (item) => {
            if (typeof item === 'string') return { name: item, id: item };
            if (typeof item === 'object' && item !== null) {
                return {
                    name: item.name || item.course || item.teacher || item.venue || 'Unnamed',
                    id: item.id || item._id || String(Math.random()).slice(2)
                };
            }
            return { name: 'Unknown', id: String(Math.random()).slice(2) };
        };
        
        // Format and create lists
        const formattedCourses = processCourses.map(formatItem);
        const formattedTeachers = processTeachers.map(formatItem);
        const formattedVenues = processVenues.map(formatItem);
        
        // Create lists with delete buttons for each item
        let coursesList = formattedCourses.map(course => 
            `<li class="saved-data-item">${course.name} <button class="delete-saved-data" data-type="course" data-id="${course.id}">Delete</button></li>`).join('');
        
        let teachersList = formattedTeachers.map(teacher => 
            `<li class="saved-data-item">${teacher.name} <button class="delete-saved-data" data-type="teacher" data-id="${teacher.id}">Delete</button></li>`).join('');
        
        let venuesList = formattedVenues.map(venue => 
            `<li class="saved-data-item">${venue.name} <button class="delete-saved-data" data-type="venue" data-id="${venue.id}">Delete</button></li>`).join('');
        
        // Create modal content
        const modalContent = `
            <div class="saved-data-modal" style="background-color: #fff; padding: 20px; border-radius: 5px; max-width: 600px; width: 90%; max-height: 80vh; overflow: auto;">
                <h3>Manage Saved Data</h3>
                
                <div class="saved-data-section" style="margin-bottom: 20px;">
                    <h4>Saved Courses (${formattedCourses.length})</h4>
                    <ul class="saved-data-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
                        ${coursesList || '<li class="empty-list" style="color: #999; font-style: italic;">No saved courses</li>'}
                    </ul>
                    <button class="clear-category-btn" data-type="courses" style="background-color: #ff9800; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Clear All Courses</button>
                </div>
                
                <div class="saved-data-section" style="margin-bottom: 20px;">
                    <h4>Saved Teachers (${formattedTeachers.length})</h4>
                    <ul class="saved-data-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
                        ${teachersList || '<li class="empty-list" style="color: #999; font-style: italic;">No saved teachers</li>'}
                    </ul>
                    <button class="clear-category-btn" data-type="teachers" style="background-color: #ff9800; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Clear All Teachers</button>
                </div>
                
                <div class="saved-data-section" style="margin-bottom: 20px;">
                    <h4>Saved Venues (${formattedVenues.length})</h4>
                    <ul class="saved-data-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 10px;">
                        ${venuesList || '<li class="empty-list" style="color: #999; font-style: italic;">No saved venues</li>'}
                    </ul>
                    <button class="clear-category-btn" data-type="venues" style="background-color: #ff9800; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Clear All Venues</button>
                </div>
                
                <div class="modal-actions" style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <button class="clear-all-data-btn" style="background-color: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer;">Clear All Saved Data</button>
                    <button id="close-saved-data-modal" style="background-color: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        
        // Update the modal content
        modal.innerHTML = modalContent;
        
        // Close button handler
        document.getElementById('close-saved-data-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Individual item delete handler
        document.querySelectorAll('.delete-saved-data').forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const id = this.getAttribute('data-id');
                
                if (confirm(`Are you sure you want to delete this ${type}?`)) {
                    // Delete the item via API
                    fetch(`${API_BASE_URL}/${type}s/${id}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to delete ${type}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Refresh the modal
                        document.body.removeChild(modal);
                        manageSavedData();
                        
                        // Reload saved values for autocomplete
                        loadSavedValues();
                    })
                    .catch(error => {
                        console.error(`Error deleting ${type}:`, error);
                        alert(`Failed to delete ${type}. Please try again.`);
                    });
                }
            });
        });
        
        // Clear category button handler
        document.querySelectorAll('.clear-category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                
                if (confirm(`Are you sure you want to clear all saved ${type}?`)) {
                    // Clear all items of this type via API
                    fetch(`${API_BASE_URL}/${type}/clear`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to clear ${type}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Refresh the modal
                        document.body.removeChild(modal);
                        manageSavedData();
                        
                        // Reload saved values for autocomplete
                        loadSavedValues();
                    })
                    .catch(error => {
                        console.error(`Error clearing ${type}:`, error);
                        alert(`Failed to clear ${type}. Please try again.`);
                    });
                }
            });
        });
        
        // Clear all data button handler
        const clearAllBtn = document.querySelector('.clear-all-data-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear ALL saved data?')) {
                    // Make separate requests to clear all data types
                    Promise.all([
                        fetch(`${API_BASE_URL}/courses/clear`, { method: 'DELETE' }),
                        fetch(`${API_BASE_URL}/teachers/clear`, { method: 'DELETE' }),
                        fetch(`${API_BASE_URL}/venues/clear`, { method: 'DELETE' })
                    ])
                    .then(() => {
                        alert('All saved data has been cleared successfully!');
                        document.body.removeChild(modal);
                        loadSavedValues();
                    })
                    .catch(error => {
                        console.error('Error clearing all data:', error);
                        alert('Failed to clear all data. Please try again.');
                    });
                }
            });
        }
    })
    .catch(error => {
        console.error('Error fetching saved data:', error);
        modal.innerHTML = `
            <div class="saved-data-modal" style="background-color: #fff; padding: 20px; border-radius: 5px; max-width: 600px; width: 90%;">
                <h3>Error Loading Data</h3>
                <p>There was a problem loading the saved data. Please try again.</p>
                <button id="close-error-modal" style="background-color: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer; margin-top: 15px;">Close</button>
            </div>
        `;
        
        document.getElementById('close-error-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
    });
}

// Make sure the function is attached to the button when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const manageSavedDataBtn = document.getElementById('manage-saved-data');
    if (manageSavedDataBtn) {
        // Remove any existing event handlers
        const newBtn = manageSavedDataBtn.cloneNode(true);
        manageSavedDataBtn.parentNode.replaceChild(newBtn, manageSavedDataBtn);
        
        // Add new event handler
        newBtn.addEventListener('click', manageSavedData);
        
        // Remove inline onclick attribute if it exists
        newBtn.removeAttribute('onclick');
    }
});

// Consolidated delete function for all entry types
function deleteEntry(type, id, event) {
  const button = event ? event.target : document.querySelector(`button[data-id="${id}"][data-type="${type}"]`);
  if (!id || !button) {
    console.error('Missing ID or button element for delete operation');
    return;
  }

  const itemTypes = {
    'timetable': 'entry',
    'announcement': 'announcement',
    'notice': 'notice'
  };
  const itemName = itemTypes[type] || 'item';

  if (confirm(`Are you sure you want to delete this ${itemName}?`)) {
    const originalText = button.textContent;
    button.textContent = 'Deleting...';
    button.disabled = true;

    let endpoint = `${API_BASE_URL}/${type}/${id}`;

    fetch(endpoint, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Server error (${response.status}): ${text || 'No error message'}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log(`Successfully deleted ${itemName}:`, data);
        if (type === 'timetable') {
          loadTimetableEntries(false);
        } else if (type === 'announcement') {
          loadAnnouncements(false);
        } else if (type === 'notice') {
          loadNotices(false);
        }
      })
      .catch(error => {
        console.error(`Error deleting ${itemName}:`, error);
        alert(`Failed to delete ${itemName}. ${error.message}`);
      })
      .finally(() => {
        button.textContent = originalText;
        button.disabled = false;
      });
  }
}

// Clear all entries function that properly handles API communication
function clearAllEntries(event) {
  if (confirm('Are you sure you want to clear ALL entries? This cannot be undone.')) {
    const button = event ? event.target : document.getElementById('clear-all');
    let originalText = button ? button.textContent : '';

    if (button) {
      button.textContent = 'Clearing...';
      button.disabled = true;
    }

    console.log('Clearing all entries via API...');

    Promise.all([
      fetch(`${API_BASE_URL}/timetable/clear`, { method: 'DELETE' }).catch(() => fetch(`${API_BASE_URL}/timetable/all`, { method: 'DELETE' })).catch(() => fetch(`${API_BASE_URL}/timetable`, { method: 'DELETE' })),
      fetch(`${API_BASE_URL}/announcements/clear`, { method: 'DELETE' }).catch(() => fetch(`${API_BASE_URL}/announcements/all`, { method: 'DELETE' })).catch(() => fetch(`${API_BASE_URL}/announcements`, { method: 'DELETE' })),
      fetch(`${API_BASE_URL}/notices/clear`, { method: 'DELETE' }).catch(() => fetch(`${API_BASE_URL}/notices/all`, { method: 'DELETE' })).catch(() => fetch(`${API_BASE_URL}/notices`, { method: 'DELETE' }))
    ])
    .then(() => {
      console.log('All entries cleared successfully');
      loadTimetableEntries(false);
      loadAnnouncements(false);
      loadNotices(false);
      alert('All entries cleared successfully!');
    })
    .catch(error => {
      console.error('Error clearing entries:', error);
      alert('Error clearing entries. Please try again.');
    })
    .finally(() => {
      if (button) {
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  }
}

// Modified data loading functions to avoid unnecessary alerts
function loadTimetableEntries(showAlerts = true) {
  console.log('Loading timetable entries from API...');
  fetch(`${API_BASE_URL}/timetable`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded ${data.length} timetable entries`);
      displayTimetableEntries(data);
    })
    .catch(error => {
      console.error('Error loading timetable entries:', error);
      displayTimetableEntries([]);
      if (showAlerts) {
        alert('Failed to load timetable entries. See console for details.');
      }
    });
}

function loadAnnouncements(showAlerts = true) {
  console.log('Loading announcements from API...');
  fetch(`${API_BASE_URL}/announcements`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded ${data.length} announcements`);
      displayAnnouncements(data);
    })
    .catch(error => {
      console.error('Error loading announcements:', error);
      displayAnnouncements([]);
      if (showAlerts) {
        alert('Failed to load announcements. See console for details.');
      }
    });
}

function loadNotices(showAlerts = true) {
  console.log('Loading notices from API...');
  fetch(`${API_BASE_URL}/notices`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Loaded ${data.length} notices`);
      displayNotices(data);
    })
    .catch(error => {
      console.error('Error loading notices:', error);
      displayNotices([]);
      if (showAlerts) {
        alert('Failed to load notices. See console for details.');
      }
    });
}

// Single initialization function for the admin panel
document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin panel initializing...');
  
  // Set up the clear all button with a clean event handler
  const clearAllBtn = document.getElementById('clear-all');
  if (clearAllBtn) {
    // Remove any existing handlers by cloning the button
    const newBtn = clearAllBtn.cloneNode(true);
    if (clearAllBtn.parentNode) {
      clearAllBtn.parentNode.replaceChild(newBtn, clearAllBtn);
    }
    newBtn.addEventListener('click', clearAllEntries);
    console.log('Clear All button initialized');
  }
  
  // Set up global event delegation for delete buttons
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
      const id = event.target.getAttribute('data-id');
      const type = event.target.getAttribute('data-type') || 'timetable';
      
      if (id) {
        deleteEntry(type, id, event);
      }
    }
  });
  
  // Load all data on page init
  loadTimetableEntries();
  loadAnnouncements();
  loadNotices();
  
  console.log('Admin panel initialization complete');
});
