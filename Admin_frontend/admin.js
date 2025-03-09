// ======================================================
// CONSTANTS AND CONFIG
// ======================================================
const API_BASE_URL = '/api';
const defaultTimeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Authentication check at the beginning
(function() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true' || 
                     localStorage.getItem('adminLoggedIn') === 'true';
  
  if (!isLoggedIn) {
      //window.location.href = 'login.html';
      return;
  }
  
  // Show user info when DOM is ready - this will be handled in the main DOMContentLoaded
})();
// ======================================================
// HELPER FUNCTIONS 
// ======================================================
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
function formatTimeToAMPM(time) { /* your implementation */ 
  if (!time) return '';
    
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // Convert hour '0' to '12'
  return `${hour}:${minutes} ${ampm}`;
}
function decreaseWeek() { /* your implementation */ 
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
function increaseWeek() { /* your implementation */ 
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
function updateWeekLabel() { /* your implementation */ 
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


// ======================================================
// DATA MANAGEMENT FUNCTIONS
// ======================================================
function storeUniqueCourse(courseName) { /* your implementation */ 
  if (!courseName) return;
  
  let uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
  if (!uniqueCourses.includes(courseName)) {
      uniqueCourses.push(courseName);
      localStorage.setItem('uniqueCourses', JSON.stringify(uniqueCourses));
  }
}
function storeUniqueTeacher(teacherName) { /* your implementation */
  if (!teacherName) return;
  
  let uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
  if (!uniqueTeachers.includes(teacherName)) {
      uniqueTeachers.push(teacherName);
      localStorage.setItem('uniqueTeachers', JSON.stringify(uniqueTeachers));
  }
 }
function storeUniqueVenue(venueName) { /* your implementation */
  if (!venueName) return;
  
  let uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
  if (!uniqueVenues.includes(venueName)) {
      uniqueVenues.push(venueName);
      localStorage.setItem('uniqueVenues', JSON.stringify(uniqueVenues));
  }
 }
function loadSavedValues() { /* your implementation */
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

// ======================================================
// API FUNCTIONS
// ======================================================
function loadAllData() { /* SINGLE implementation */
  console.log('Loading all data from API with cache busting...');
    const cacheBuster = Date.now();
    
    // Load all three data types
    loadTimetableEntries(false);
    loadAnnouncements(false);
    loadNotices(false);
    
    // Signal update to other tabs/windows
    localStorage.setItem('dataUpdated', cacheBuster.toString());
 }
function loadTimetableEntries(showAlerts = true) { /* SINGLE implementation */ 
  console.log('Loading timetable entries from API...');
    fetch(`${API_BASE_URL}/timetable?_nocache=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
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
function loadAnnouncements(showAlerts = true) { /* SINGLE implementation */ 
  console.log('Loading announcements from API...');
  fetch(`${API_BASE_URL}/announcements?_nocache=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
  })
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
function loadNotices(showAlerts = true) { /* SINGLE implementation */
  console.log('Loading notices from API...');
    fetch(`${API_BASE_URL}/notices?_nocache=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
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

// ======================================================
// DISPLAY FUNCTIONS
// ======================================================
function displayTimetableEntries(entries) { /* SINGLE implementation */ 
  const tbody = document.querySelector('#admin-timetable tbody');
    
    if (!tbody) {
        console.error('Timetable tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!entries || entries.length === 0) {
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
    
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.week || ''}</td>
            <td>${entry.course || ''}</td>
            <td>${entry.days ? (typeof entry.days === 'string' ? entry.days : entry.days.join(', ')) : ''}</td>
            <td>${entry.startTime || ''} - ${entry.endTime || ''}</td>
            <td>${entry.teacher || ''}</td>
            <td>${entry.venue || ''}</td>
            <td>
                <button class="delete-btn" data-type="timetable" data-id="${entry.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
function displayAnnouncements(announcements) { /* SINGLE implementation */ 
  const container = document.getElementById('admin-announcements');
    if (!container) {
        console.error('Announcement container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (!announcements || announcements.length === 0) {
        container.innerHTML = '<p>No announcements available</p>';
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
}
function displayNotices(notices) { /* SINGLE implementation */
  const container = document.getElementById('notice-entries');
    if (!container) {
        console.error('Notice container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (!notices || notices.length === 0) {
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
 }

// ======================================================
// DELETE/MODIFY FUNCTIONS
// ======================================================
function deleteEntry(type, id, event) { /* SINGLE implementation */
  const button = event ? event.target : document.querySelector(`button[data-id="${id}"][data-type="${type}"]`);
    if (!id) {
        console.error('Missing ID for delete operation');
        return;
    }

    if (confirm(`Are you sure you want to delete this item?`)) {
        // Show loading state
        if (button) {
            button.textContent = 'Deleting...';
            button.disabled = true;
        }
        
        // Build endpoint URL
        let endpoint = `${API_BASE_URL}/${type === 'timetable' ? 'timetable' : type === 'announcement' ? 'announcements' : 'notices'}/${id}`;
        
        console.log(`DELETING: Sending request to ${endpoint}`);
        
        // Add cache busting
        const noCache = Date.now();
        endpoint = endpoint + `?_nocache=${noCache}`;
        
        // Make delete request
        fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
        .then(response => {
            console.log(`DELETING: Status code: ${response.status}`);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server error: ${text || response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(`DELETING: Success response:`, data);
            
            // Force index page to reload 
            localStorage.setItem('forceDataReload', Date.now().toString());
            
            try {
                const bc = new BroadcastChannel('uni_schedule_updates');
                bc.postMessage({ 
                    type: 'entry-deleted', 
                    entryType: type,
                    entryId: id,
                    timestamp: Date.now()
                });
                bc.close();
            } catch(e) {
                console.log('BroadcastChannel not supported');
            }
            
            // Hard refresh if it's the last item
            const isLastItem = document.querySelectorAll(`[data-type="${type}"]`).length <= 1;
            if (isLastItem) {
                console.log("DELETING LAST ITEM - FORCING COMPLETE REFRESH");
                localStorage.setItem('clearCache', 'true');
                
                if (type === 'timetable') {
                    clearAndReloadTimetable();
                } else if (type === 'announcement') {
                    clearAndReloadAnnouncements();
                } else if (type === 'notice') {
                    clearAndReloadNotices();
                }
            } else {
                if (type === 'timetable') {
                    loadTimetableEntries(false);
                } else if (type === 'announcement') {
                    loadAnnouncements(false);
                } else if (type === 'notice') {
                    loadNotices(false);
                }
            }
        })
        .catch(error => {
            console.error(`DELETING: Error:`, error);
            alert(`Delete failed. ${error.message}`);
        })
        .finally(() => {
            if (button) {
                button.textContent = 'Delete';
                button.disabled = false;
            }
        });
    }
 }
function clearAllEntries(event) { /* SINGLE implementation */ 
  if (!confirm('Are you sure you want to clear ALL entries? This cannot be undone.')) {
    return;
}

// Update button state
const button = event ? event.target : document.getElementById('clear-all');
const originalText = button ? button.textContent : 'Clear All Entries';

if (button) {
    button.textContent = 'Clearing...';
    button.disabled = true;
}

console.log('Clearing all entries via API...');

// Try multiple endpoint patterns for each data type
const clearTimetable = () => {
    return fetch(`${API_BASE_URL}/timetable/clear?_nocache=${Date.now()}`, { 
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache, no-store' }
    })
    .catch(() => fetch(`${API_BASE_URL}/timetable/all?_nocache=${Date.now()}`, { method: 'DELETE' }))
    .catch(() => fetch(`${API_BASE_URL}/timetable?_nocache=${Date.now()}`, { method: 'DELETE' }));
};

const clearAnnouncements = () => {
    return fetch(`${API_BASE_URL}/announcements/clear?_nocache=${Date.now()}`, { 
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache, no-store' }
    })
    .catch(() => fetch(`${API_BASE_URL}/announcements/all?_nocache=${Date.now()}`, { method: 'DELETE' }))
    .catch(() => fetch(`${API_BASE_URL}/announcements?_nocache=${Date.now()}`, { method: 'DELETE' }));
};

const clearNotices = () => {
    return fetch(`${API_BASE_URL}/notices/clear?_nocache=${Date.now()}`, { 
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache, no-store' }
    })
    .catch(() => fetch(`${API_BASE_URL}/notices/all?_nocache=${Date.now()}`, { method: 'DELETE' }))
    .catch(() => fetch(`${API_BASE_URL}/notices?_nocache=${Date.now()}`, { method: 'DELETE' }));
};

// Execute all clear operations in sequence
clearTimetable()
    .then(() => clearAnnouncements())
    .then(() => clearNotices())
    .then(() => {
        console.log('All entries cleared successfully');
        
        // Force cache invalidation for index pages
        localStorage.setItem('forceDataReload', Date.now().toString());
        localStorage.setItem('clearCache', 'true');
        
        // Reload all data with cache bypass
        clearAndReloadTimetable();
        clearAndReloadAnnouncements();
        clearAndReloadNotices();
        
        alert('All entries cleared successfully!');
    })
    .catch(error => {
        console.error('Error clearing entries:', error);
        alert('Error clearing entries. Please try again.');
    })
    .finally(() => {
        // Reset button state
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
        }
    });
}
function clearAndReloadTimetable() { /* your implementation */ 
  console.log("FORCE RELOADING TIMETABLE WITH CACHE BYPASS");
    
    // Clear any cached data
    localStorage.removeItem('timetableCache');
    
    fetch(`${API_BASE_URL}/timetable?_nocache=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log(`RELOADED ${data.length} timetable entries`);
        displayTimetableEntries(data);
    })
    .catch(error => {
        console.error('Error loading timetable entries:', error);
        displayTimetableEntries([]);
    });
}
function clearAndReloadAnnouncements() { /* your implementation */ 
  console.log("FORCE RELOADING ANNOUNCEMENTS WITH CACHE BYPASS");
    
    // Clear any cached data
    localStorage.removeItem('announcementsCache');
    
    fetch(`${API_BASE_URL}/announcements?_nocache=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log(`RELOADED ${data.length} announcements`);
        displayAnnouncements(data);
    })
    .catch(error => {
        console.error('Error loading announcements:', error);
        displayAnnouncements([]);
    });
}
function clearAndReloadNotices() { /* your implementation */ 
  console.log("FORCE RELOADING NOTICES WITH CACHE BYPASS");
    
    // Clear any cached data
    localStorage.removeItem('noticesCache');
    
    fetch(`${API_BASE_URL}/notices?_nocache=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log(`RELOADED ${data.length} notices`);
        displayNotices(data);
    })
    .catch(error => {
        console.error('Error loading notices:', error);
        displayNotices([]);
    });
}

// ======================================================
// PDF GENERATION FUNCTIONS
// ======================================================
function generatePDF() { /* your implementation */
  console.log('Generating PDF...');
  
  const container = document.createElement('div');
  container.className = 'pdf-container';
  container.style.width = '210mm'; // A4 width
  container.style.padding = '10mm';
  container.style.backgroundColor = 'white';
  
  // Add title
  const title = document.createElement('h1');
  title.textContent = 'University Timetable';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  container.appendChild(title);
  
  // Fetch timetable data for PDF
  fetch(`${API_BASE_URL}/timetable`)
    .then(response => response.json())
    .then(data => {
      if (!data || data.length === 0) {
        const noData = document.createElement('p');
        noData.textContent = 'No timetable entries available.';
        noData.style.textAlign = 'center';
        container.appendChild(noData);
        finalizePDF(container);
        return;
      }
      
      // Group entries by week
      const weekGroups = {};
      data.forEach(entry => {
        if (!weekGroups[entry.week]) {
          weekGroups[entry.week] = [];
        }
        weekGroups[entry.week].push(entry);
      });
      
      // Create a table for each week
      Object.keys(weekGroups).sort().forEach(week => {
        const weekTitle = document.createElement('h2');
        weekTitle.textContent = week;
        weekTitle.style.marginTop = '20px';
        container.appendChild(weekTitle);
        
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Add table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Course', 'Day', 'Time', 'Teacher', 'Venue'].forEach(heading => {
          const th = document.createElement('th');
          th.textContent = heading;
          th.style.border = '1px solid #ddd';
          th.style.padding = '8px';
          th.style.backgroundColor = '#f2f2f2';
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Add table body with data
        const tbody = document.createElement('tbody');
        weekGroups[week].forEach(entry => {
          const row = document.createElement('tr');
          
          const courseTd = document.createElement('td');
          courseTd.textContent = entry.course || '';
          courseTd.style.border = '1px solid #ddd';
          courseTd.style.padding = '8px';
          row.appendChild(courseTd);
          
          const daysTd = document.createElement('td');
          daysTd.textContent = entry.days ? (typeof entry.days === 'string' ? entry.days : entry.days.join(', ')) : '';
          daysTd.style.border = '1px solid #ddd';
          daysTd.style.padding = '8px';
          row.appendChild(daysTd);
          
          const timeTd = document.createElement('td');
          timeTd.textContent = `${entry.startTime || ''} - ${entry.endTime || ''}`;
          timeTd.style.border = '1px solid #ddd';
          timeTd.style.padding = '8px';
          row.appendChild(timeTd);
          
          const teacherTd = document.createElement('td');
          teacherTd.textContent = entry.teacher || '';
          teacherTd.style.border = '1px solid #ddd';
          teacherTd.style.padding = '8px';
          row.appendChild(teacherTd);
          
          const venueTd = document.createElement('td');
          venueTd.textContent = entry.venue || '';
          venueTd.style.border = '1px solid #ddd';
          venueTd.style.padding = '8px';
          row.appendChild(venueTd);
          
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);
      });
      
      finalizePDF(container);
    })
    .catch(error => {
      console.error('Error fetching data for PDF:', error);
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error generating PDF. Please try again.';
      errorMsg.style.color = 'red';
      container.appendChild(errorMsg);
      finalizePDF(container);
    });
 }
function finalizePDF(container) { /* your implementation */ 
   // Add container to document temporarily
   document.body.appendChild(container);
  
   // Use html2pdf library if available
   if (typeof html2pdf !== 'undefined') {
     const opt = {
       margin: 10,
       filename: 'university_timetable.pdf',
       image: { type: 'jpeg', quality: 0.98 },
       html2canvas: { scale: 2 },
       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
     };
     
     html2pdf().from(container).set(opt).save()
       .then(() => {
         document.body.removeChild(container);
       });
   } else {
     // Fallback if html2pdf is not available
     window.print();
     document.body.removeChild(container);
   }
}
function formatTimeForDisplay(timeSlot) { /* your implementation */
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

// ======================================================
// SETUP FUNCTIONS
// ======================================================
function setupUserInfo() { /* your implementation */ 
  console.log('Setting up user info...');
  
  const adminUsername = sessionStorage.getItem('adminUsername') || 
                        localStorage.getItem('adminUsername');
  
  const userDisplay = document.getElementById('admin-username');
  if (userDisplay && adminUsername) {
    userDisplay.textContent = `Admin: ${adminUsername}`;
  }
  
  // Setup logout button if it exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Clear authentication data
      sessionStorage.removeItem('adminLoggedIn');
      sessionStorage.removeItem('adminUsername');
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUsername');
      
      // Redirect to login page
      window.location.href = 'login.html';
    });
  }
}
function setupClearAllButton() { /* your implementation */ 
  console.log('Setting up Clear All button...');
  
  const clearAllBtn = document.getElementById('clear-all');
  if (clearAllBtn) {
    // Remove any existing handlers by cloning
    const newBtn = clearAllBtn.cloneNode(true);
    if (clearAllBtn.parentNode) {
      clearAllBtn.parentNode.replaceChild(newBtn, clearAllBtn);
    }
    
    // Add event listener to the new button
    newBtn.addEventListener('click', clearAllEntries);
    
    // Remove inline onclick attribute if it exists
    newBtn.removeAttribute('onclick');
    
    console.log('Clear All button handler attached');
  } else {
    console.log('Clear All button not found');
  }
}
function setupManageDataButton() { /* your implementation */ 
  console.log('Setting up Manage Data button...');
  
  const manageDataBtn = document.getElementById('manage-data-btn');
  if (manageDataBtn) {
    manageDataBtn.addEventListener('click', function(event) {
      event.preventDefault();
      manageSavedData();
    });
  }
}
function setupOtherButtons() { /* your implementation */ 
  console.log('Setting up other buttons...');
  
  // Setup PDF generation button
  const pdfBtn = document.getElementById('generate-pdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', function(event) {
      event.preventDefault();
      generatePDF();
    });
  }
  
  // Setup tab buttons if they exist
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Hide all tab contents
        tabContents.forEach(content => {
          content.style.display = 'none';
        });
        
        // Remove active class from all buttons
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Show the selected tab content
        const tabId = this.getAttribute('data-tab');
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.style.display = 'block';
        }
        
        // Add active class to clicked button
        this.classList.add('active');
      });
    });
    
    // Activate the first tab by default
    if (tabButtons[0]) {
      tabButtons[0].click();
    }
  }
  
  // Set up global event delegation for delete buttons
  document.body.addEventListener('click', function(event) {
    const target = event.target;
    
    if (target.classList.contains('delete-btn')) {
      const id = target.getAttribute('data-id');
      const type = target.getAttribute('data-type') || 'timetable';
      
      if (id) {
        event.preventDefault();
        event.stopPropagation();
        deleteEntry(type, id, event);
      }
    }
  });
}
function setupFormHandlers() { /* your implementation */
  console.log('Setting up form handlers...');
  
  // Set up timetable form
  const timetableForm = document.getElementById('timetable-form');
  if (timetableForm) {
    timetableForm.addEventListener('submit', function(event) {
      event.preventDefault();
      submitTimetableEntry();
    });
    
    // Set up week number inputs
    const decreaseBtn = document.getElementById('decrease-week');
    const increaseBtn = document.getElementById('increase-week');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', decreaseWeek);
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', increaseWeek);
    }
    
    // Initialize week label
    updateWeekLabel();
  }
  
  // Set up announcement form
  const announcementForm = document.getElementById('announcement-form');
  if (announcementForm) {
    announcementForm.addEventListener('submit', function(event) {
      event.preventDefault();
      submitAnnouncement();
    });
  }
  
  // Set up notice form
  const noticeForm = document.getElementById('notice-form');
  if (noticeForm) {
    noticeForm.addEventListener('submit', function(event) {
      event.preventDefault();
      submitNotice();
    });
  }
  
  // Load saved values for autocomplete
  loadSavedValues();
}
// ======================================================
// SUBMISSION HANDLERS
// ======================================================
// Complete fixed submitTimetableEntry function
// Fixed submitTimetableEntry function
function submitTimetableEntry() {
  console.log('Submitting timetable entry...');
  
  // Get form elements
  const weekInput = document.getElementById('week');
  const courseInput = document.getElementById('course');
  const dayCheckboxes = document.querySelectorAll('input[name="days[]"]');
  const startTimeInput = document.getElementById('start-time');
  const endTimeInput = document.getElementById('end-time');
  const teacherInput = document.getElementById('teacher');
  const venueInput = document.getElementById('venue');
  const submitBtn = document.querySelector('#timetable-form button[type="submit"]');
  
  // Debug form elements to see what's found
  console.log('Form elements:');
  console.log('Week:', weekInput);
  console.log('Course:', courseInput);
  console.log('Day checkboxes:', dayCheckboxes.length);
  console.log('Start Time:', startTimeInput);
  console.log('End Time:', endTimeInput);
  console.log('Teacher:', teacherInput);
  console.log('Venue:', venueInput);
  
  // Check for missing fields
  const missingFields = [];
  if (!weekInput) missingFields.push('week');
  if (!courseInput) missingFields.push('course');
  if (dayCheckboxes.length === 0) missingFields.push('days');
  if (!startTimeInput) missingFields.push('start-time');
  if (!endTimeInput) missingFields.push('end-time');
  if (!venueInput) missingFields.push('venue');
  
  if (missingFields.length > 0) {
    console.error('Form fields not found:', missingFields);
    alert(`Form fields not found: ${missingFields.join(', ')}. Please check HTML IDs.`);
    return;
  }
  
  // Get form values
  const week = weekInput.value;
  const course = courseInput.value;
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  const teacher = teacherInput ? teacherInput.value : '';
  const venue = venueInput.value;
  
  // Get selected days from checkboxes
  const days = [];
  dayCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      days.push(checkbox.value);
    }
  });
  
  // Validate required fields
  if (!week || !course || days.length === 0 || !startTime || !endTime || !venue) {
    alert('Please fill all required fields. Make sure to select at least one day.');
    return;
  }
  
  // Validate time (start time should be before end time)
  if (startTime >= endTime) {
    alert('Start time must be before end time.');
    return;
  }
  
  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }
  
  // Save values for future autocomplete
  storeUniqueCourse(course);
  if (teacher) storeUniqueTeacher(teacher);
  storeUniqueVenue(venue);
  
  // Create entry object
  const entry = {
    week,
    course,
    days,
    startTime,
    endTime,
    teacher,
    venue
  };
  
  console.log('Submitting entry:', entry);
  
  // Send to API
  fetch(`${API_BASE_URL}/timetable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Server error: ${text || response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Timetable entry added successfully:', data);
    alert('Timetable entry added successfully!');
    
    // Clear form
    courseInput.value = '';
    dayCheckboxes.forEach(checkbox => checkbox.checked = false);
    startTimeInput.value = '';
    endTimeInput.value = '';
    if (teacherInput) teacherInput.value = '';
    venueInput.value = '';
    
    // Reload timetable entries
    loadTimetableEntries();
    
    // Force index page to reload
    localStorage.setItem('forceDataReload', Date.now().toString());
  })
  .catch(error => {
    console.error('Error adding timetable entry:', error);
    alert(`Failed to add timetable entry: ${error.message}`);
  })
  .finally(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Entry';
    }
  });
}
// Fix submitAnnouncement function
function submitAnnouncement() {
  console.log('Submitting announcement...');
  
  // Get form elements with corrected IDs
  const announcementInput = document.getElementById('announcement'); // Changed from announcement-text
  const durationInput = document.getElementById('duration'); // Changed from expiry-date
  const submitBtn = document.querySelector('#announcement-form button[type="submit"]');
  
  // Debug which elements weren't found
  const missingFields = [];
  if (!announcementInput) missingFields.push('announcement');
  if (!durationInput) missingFields.push('duration');
  
  if (missingFields.length > 0) {
    console.error('Announcement form fields not found:', missingFields);
    alert(`Announcement form fields not found: ${missingFields.join(', ')}. Please check HTML IDs.`);
    return;
  }
  
  // Get values
  const announcement = announcementInput.value;
  const duration = parseInt(durationInput.value, 10);
  
  if (!announcement || isNaN(duration) || duration < 1) {
    alert('Please fill all required fields with valid values');
    return;
  }
  
  // Calculate expiry date from duration
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(now.getDate() + duration);
  
  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }
  
  // Create announcement object
  const announcementObj = {
    announcement,
    date: now.toISOString(),
    expiryDate: expiryDate.toISOString()
  };
  
  // Rest of your function remains the same
  // ...
}
function submitNotice() {
  console.log('Submitting notice...');
  
 
  // Get form elements with corrected IDs
  const noticeInput = document.getElementById('notice'); // Changed from notice-text
  const submitBtn = document.querySelector('#notice-form button[type="submit"]');
  
  if (!noticeInput) {
    console.error('Notice form field not found. Looking for ID: "notice"');
    alert('Notice form field not found. Please check HTML IDs.');
    return;
  }
  
  // Get value
  const notice = noticeInput.value;
  
  if (!notice) {
    alert('Please enter a notice');
    return;
  }
  
  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }
  
  // Create notice object
  const noticeObj = {
    notice,
    date: new Date().toISOString()
  };
  
  console.log('Submitting notice:', noticeObj);
  
  // Send to API
  fetch(`${API_BASE_URL}/notices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(noticeObj)
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Server error: ${text || response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Notice added successfully:', data);
    alert('Notice added successfully!');
    
    // Clear form
    noticeInput.value = '';
    
    // Reload notices
    loadNotices();
    
    // Force index page to reload
    localStorage.setItem('forceDataReload', Date.now().toString());
  })
  .catch(error => {
    console.error('Error adding notice:', error);
    alert(`Failed to add notice: ${error.message}`);
  })
  .finally(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Notice';
    }
  });
}
// Helper function to debug form elements
function debugFormElements() {
  console.log('Debugging form elements:');
  console.log('week:', document.getElementById('week'));
  console.log('course:', document.getElementById('course'));
  console.log('days:', document.getElementById('days'));
  console.log('start-time:', document.getElementById('start-time'));
  console.log('end-time:', document.getElementById('end-time'));
  console.log('teacher:', document.getElementById('teacher'));
  console.log('venue:', document.getElementById('venue'));
  console.log('announcement:', document.getElementById('announcement'));
  console.log('duration:', document.getElementById('duration'));
  console.log('notice:', document.getElementById('notice'));
  
  // List all form elements for reference
  console.log('All form elements:');
  document.querySelectorAll('input, select, textarea').forEach(el => {
    console.log(`${el.tagName} id="${el.id}" name="${el.name}"`);
  });
}

// Add to initialization
document.addEventListener('DOMContentLoaded', function() {
  debugFormElements();
  initializeAdminPanel();
});
// ======================================================
// INITIALIZATION
// ======================================================
function initializeAdminPanel() {
  console.log('Initializing admin panel...');
  
  // 1. Set up authentication/user info
  setupUserInfo();
  
  // 2. Load all data
  loadAllData();
  
  // 3. Set up form handlers
  setupFormHandlers();
  
  // 4. Set up clear all button
  setupClearAllButton();
  
  // 5. Set up manage data button
  setupManageDataButton();
  
  // 6. Set up any other buttons
  setupOtherButtons();
  
  console.log('Admin panel initialization complete');
}

// ======================================================
// MAIN EXECUTION
// ======================================================
// Single DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready, initializing admin panel...');
  initializeAdminPanel();
});