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
        // Check if the value actually changed
        const oldValue = weekInput.value;
        weekInput.value = weekValue;
        
        // If week changed, reload the timetable entries for this week
        if (oldValue !== weekValue) {
            console.log(`Week changed from ${oldValue} to ${weekValue}, reloading data`);
            
            // Short delay to ensure UI updates first
            setTimeout(() => {
                // Get data filtered for this week only
                loadTimetableEntries(false);
            }, 100);
        }
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
  
  // Get the current week filter value if available
  const weekFilter = document.getElementById('week') ? 
    document.getElementById('week').value : null;
  
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
    
    // If we have a week filter, apply it
    if (weekFilter) {
      console.log(`Filtering entries for week: ${weekFilter}`);
      const filteredData = data.filter(entry => entry.week === weekFilter);
      console.log(`Found ${filteredData.length} entries for ${weekFilter}`);
      displayTimetableEntries(filteredData);
    } else {
      displayTimetableEntries(data);
    }
  })
  .catch(error => {
    console.error('Error loading timetable entries:', error);
    if (showAlerts) {
      alert('Failed to load timetable entries. See console for details.');
    }
    // Don't clear the display on error to prevent flashing
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
  
  // Get the current week filter
  const weekFilter = document.getElementById('week') ? 
    document.getElementById('week').value : null;
  
  // Only filter if we have both a filter and entries
  let displayEntries = entries;
  if (weekFilter && entries && entries.length > 0) {
    // Make a defensive copy to avoid modifying the original data
    displayEntries = [...entries].filter(entry => entry.week === weekFilter);
    console.log(`Displaying ${displayEntries.length} entries for ${weekFilter} (filtered from ${entries.length} total)`);
  }
  
  // Keep the previous content until we have new content ready
  const newTbody = document.createElement('tbody');
  
  if (!displayEntries || displayEntries.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.textContent = weekFilter ? 
      `No timetable entries available for ${weekFilter}` : 
      'No timetable entries available';
    cell.style.textAlign = 'center';
    cell.style.padding = '20px';
    row.appendChild(cell);
    newTbody.appendChild(row);
  } else {
    displayEntries.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.week || ''}</td>
        <td>${entry.course || ''}</td>
        <td>${entry.days ? (typeof entry.days === 'string' ? entry.days : entry.days.join(', ')) : ''}</td>
        <td>${formatTimeForDisplay(`${entry.startTime || ''} - ${entry.endTime || ''}`)}</td>
        <td>${entry.teacher || ''}</td>
        <td>${entry.venue || ''}</td>
        <td>
          <button class="delete-btn" data-type="timetable" data-id="${entry.id}">Delete</button>
        </td>
      `;
      newTbody.appendChild(row);
    });
  }
  
  // Replace the tbody with the new content
  tbody.parentNode.replaceChild(newTbody, tbody);
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
function clearAllEntries(event) { 
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

  console.log('Starting individual deletion of all entries...');
  
  // Clear displays immediately for better user feedback
  displayTimetableEntries([]);
  displayAnnouncements([]);
  displayNotices([]);
  
  // Temporarily disable polling if it's active
  const pollingInterval = window.pollingInterval;
  if (pollingInterval) {
    console.log('Temporarily disabling data polling during deletion');
    clearInterval(pollingInterval);
  }
  
  // Get all current items and delete them individually
  Promise.all([
    fetch(`${API_BASE_URL}/timetable`).then(r => r.json()).catch(() => []),
    fetch(`${API_BASE_URL}/announcements`).then(r => r.json()).catch(() => []),
    fetch(`${API_BASE_URL}/notices`).then(r => r.json()).catch(() => [])
  ])
  .then(([timetableEntries, announcements, notices]) => {
    console.log(`Found ${timetableEntries.length} timetable entries, ${announcements.length} announcements, ${notices.length} notices to delete`);
    
    // Create deletion promises for each item
    const deletionPromises = [];
    
    // Delete timetable entries one by one
    timetableEntries.forEach(entry => {
      if (entry.id) {
        deletionPromises.push(
          new Promise((resolve) => {
            // Add small delay between requests to prevent overwhelming server
            setTimeout(() => {
              fetch(`${API_BASE_URL}/timetable/${entry.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(() => resolve())
              .catch(e => {
                console.error(`Failed to delete timetable entry ${entry.id}:`, e);
                resolve(); // Continue with next deletion even if this one fails
              });
            }, 50); // 50ms delay between requests
          })
        );
      }
    });
    
    // Delete announcements one by one
    announcements.forEach(announcement => {
      if (announcement.id) {
        deletionPromises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              fetch(`${API_BASE_URL}/announcements/${announcement.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(() => resolve())
              .catch(() => resolve());
            }, 50);
          })
        );
      }
    });
    
    // Delete notices one by one
    notices.forEach(notice => {
      if (notice.id) {
        deletionPromises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              fetch(`${API_BASE_URL}/notices/${notice.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(() => resolve())
              .catch(() => resolve());
            }, 50);
          })
        );
      }
    });
    
    // Execute all individual deletions
    return Promise.all(deletionPromises).then(() => {
      return { timetableCount: timetableEntries.length, announcementCount: announcements.length, noticeCount: notices.length };
    });
  })
  .then((counts) => {
    console.log('Individual item deletion completed');
    
    // Clear localStorage to ensure clean state
    localStorage.removeItem('timetableEntries');
    localStorage.removeItem('cachedTimetableData');
    localStorage.removeItem('announcements');
    localStorage.removeItem('notices');
    localStorage.removeItem('timetableCache');
    localStorage.removeItem('announcementsCache');
    localStorage.removeItem('noticesCache');
    
    // Set markers for other pages to know data was cleared
    const timestamp = Date.now().toString();
    localStorage.setItem('forceDataReload', timestamp);
    localStorage.setItem('clearCache', 'true');
    localStorage.setItem('timetableUpdated', timestamp);
    localStorage.setItem('announcementsUpdated', timestamp);
    localStorage.setItem('noticesUpdated', timestamp);
    
    // Notify other tabs/windows
    try {
      const bc = new BroadcastChannel('uni_schedule_updates');
      bc.postMessage({ 
        type: 'all-data-cleared',
        timestamp: timestamp
      });
      bc.close();
    } catch(e) {
      console.log('BroadcastChannel not supported');
    }
    
    // Show success message with count of deleted items
    alert(`All entries cleared successfully! Deleted ${counts.timetableCount} timetable entries, ${counts.announcementCount} announcements, and ${counts.noticeCount} notices.`);
    
    // Wait a bit longer before reloading data to ensure server has processed all deletions
    setTimeout(() => {
      console.log('Reloading data after deletion');
      loadAllData();
      
      // Restart polling if it was active
      if (pollingInterval) {
        console.log('Re-enabling data polling');
        window.pollingInterval = setInterval(() => {
          console.log("Polling for updates...");
          loadAllData();
        }, 5000);
      }
    }, 2000); // 2 second delay before reloading
  })
  .catch(error => {
    console.error('Error in clear all process:', error);
    alert('There was an error clearing some entries. Please check the console for details.');
    
    // Attempt to reload data anyway
    setTimeout(() => loadAllData(), 1000);
    
    // Restart polling if it was active
    if (pollingInterval) {
      window.pollingInterval = setInterval(() => {
        console.log("Polling for updates...");
        loadAllData();
      }, 5000);
    }
  })
  .finally(() => {
    if (button) {
      button.textContent = originalText;
      button.disabled = false;
    }
  });
}
function clearAndReloadTimetable() {
  console.log("FORCE RELOADING TIMETABLE WITH CACHE BYPASS");
  
  // Clear cached data
  localStorage.removeItem('timetableCache');
  localStorage.removeItem('cachedTimetableData');
  localStorage.removeItem('timetableEntries');
  
  // First directly clear the display to provide immediate feedback
  displayTimetableEntries([]);
  
  // Then try to fetch fresh data from API
  fetch(`${API_BASE_URL}/timetable?_nocache=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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
    // Keep the empty display if there's an error
    displayTimetableEntries([]);
  });
}
function clearAndReloadAnnouncements() {
  console.log("FORCE RELOADING ANNOUNCEMENTS WITH CACHE BYPASS");
  
  // Clear cached data
  localStorage.removeItem('announcementsCache');
  localStorage.removeItem('announcements');
  
  // First directly clear the display
  displayAnnouncements([]);
  
  // Then try to fetch fresh data
  fetch(`${API_BASE_URL}/announcements?_nocache=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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
function clearAndReloadNotices() {
  console.log("FORCE RELOADING NOTICES WITH CACHE BYPASS");
  
  // Clear cached data
  localStorage.removeItem('noticesCache');
  localStorage.removeItem('notices');
  
  // First directly clear the display
  displayNotices([]);
  
  // Then try to fetch fresh data
  fetch(`${API_BASE_URL}/notices?_nocache=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
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
// Add this function for individual item deletion as fallback
function forceDeleteAllItemsIndividually() {
  console.log('Attempting individual item deletion as fallback...');
  
  // Get all current items
  Promise.all([
    fetch(`${API_BASE_URL}/timetable`).then(r => r.json()).catch(() => []),
    fetch(`${API_BASE_URL}/announcements`).then(r => r.json()).catch(() => []),
    fetch(`${API_BASE_URL}/notices`).then(r => r.json()).catch(() => [])
  ])
  .then(([timetableEntries, announcements, notices]) => {
    console.log(`Found ${timetableEntries.length} timetable entries, ${announcements.length} announcements, ${notices.length} notices to delete`);
    
    // Create deletion promises for each item
    const deletionPromises = [];
    
    // Delete timetable entries one by one
    timetableEntries.forEach(entry => {
      if (entry.id) {
        deletionPromises.push(
          fetch(`${API_BASE_URL}/timetable/${entry.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          }).catch(e => console.error(`Failed to delete timetable entry ${entry.id}:`, e))
        );
      }
    });
    
    // Delete announcements one by one
    announcements.forEach(announcement => {
      if (announcement.id) {
        deletionPromises.push(
          fetch(`${API_BASE_URL}/announcements/${announcement.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          }).catch(e => console.error(`Failed to delete announcement ${announcement.id}:`, e))
        );
      }
    });
    
    // Delete notices one by one
    notices.forEach(notice => {
      if (notice.id) {
        deletionPromises.push(
          fetch(`${API_BASE_URL}/notices/${notice.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          }).catch(e => console.error(`Failed to delete notice ${notice.id}:`, e))
        );
      }
    });
    
    // Execute all individual deletions
    return Promise.all(deletionPromises);
  })
  .then(() => {
    console.log('Individual item deletion completed');
    // Clear local storage and update UI
    localStorage.removeItem('timetableEntries');
    localStorage.removeItem('announcements');
    localStorage.removeItem('notices');
    
    // Clear displays
    displayTimetableEntries([]);
    displayAnnouncements([]);
    displayNotices([]);
    
    alert('All entries have been cleared.');
  })
  .catch(error => {
    console.error('Error in individual deletion:', error);
    alert('Some items may not have been deleted. Please refresh and try again.');
  });
}

// ======================================================
// PDF GENERATION FUNCTIONS
// ======================================================

function generatePDF() {
  console.log('Starting PDF generation with calendar layout...');
  
  // Show loading indicator
  const loadingMsg = document.createElement('div');
  loadingMsg.style.position = 'fixed';
  loadingMsg.style.top = '50%';
  loadingMsg.style.left = '50%';
  loadingMsg.style.transform = 'translate(-50%, -50%)';
  loadingMsg.style.padding = '20px';
  loadingMsg.style.background = 'rgba(0,0,0,0.7)';
  loadingMsg.style.color = 'white';
  loadingMsg.style.borderRadius = '5px';
  loadingMsg.style.zIndex = '9999';
  loadingMsg.textContent = 'Preparing PDF...';
  document.body.appendChild(loadingMsg);
  
  // Debug mode - set to false for production
  const DEBUG_MODE = false;
  
  // Step 1: Load libraries
  loadScriptsSequentially([
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
  ])
  .then(() => {
    updateLoadingMessage(loadingMsg, 'Fetching timetable data...');
    return fetch(`${API_BASE_URL}/timetable?_nocache=${Date.now()}`);
  })
  .then(response => {
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log(`Received ${data.length} timetable entries`);
    updateLoadingMessage(loadingMsg, 'Creating calendar layout...');
    
    // Create weekly calendar layout
    const container = createCalendarLayout(data, DEBUG_MODE);
    
    updateLoadingMessage(loadingMsg, 'Rendering content...');
    return waitForRendering(container, loadingMsg);
  })
  .then(container => {
    updateLoadingMessage(loadingMsg, 'Capturing content...');
    
    return html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: DEBUG_MODE
    }).then(canvas => ({ canvas, container }));
  })
  .then(({ canvas, container }) => {
    if (!DEBUG_MODE && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    updateLoadingMessage(loadingMsg, 'Generating PDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate appropriate scaling
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * ratio, imgHeight * ratio);
    pdf.save('university_timetable.pdf');
    
    console.log('PDF successfully generated and saved');
    
    if (loadingMsg.parentNode) {
      loadingMsg.parentNode.removeChild(loadingMsg);
    }
  })
  .catch(error => {
    console.error('Error generating PDF:', error);
    alert(`Error generating PDF: ${error.message}\nCheck console for details.`);
    if (loadingMsg.parentNode) {
      loadingMsg.parentNode.removeChild(loadingMsg);
    }
  });
  
  // Helper functions remain the same
  function loadScriptsSequentially(srcs) {
    // Implementation unchanged
    return srcs.reduce((promise, src) => {
      return promise.then(() => {
        return new Promise((resolve, reject) => {
          if (window[src.split('/').pop().split('.')[0]] || 
              document.querySelector(`script[src="${src}"]`)) {
            console.log(`Script ${src} already loaded`);
            resolve();
            return;
          }
          
          console.log(`Loading script: ${src}`);
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          
          script.onload = () => {
            console.log(`Script ${src} loaded successfully`);
            resolve();
          };
          
          script.onerror = () => {
            reject(new Error(`Failed to load script: ${src}`));
          };
          
          document.head.appendChild(script);
        });
      });
    }, Promise.resolve());
  }
  
  function updateLoadingMessage(element, message) {
    if (element) {
      element.textContent = message;
      console.log(message);
    }
  }
  
  function waitForRendering(container, loadingMsg) {
    return new Promise(resolve => {
      setTimeout(() => {
        updateLoadingMessage(loadingMsg, 'Content ready for capture...');
        resolve(container);
      }, 1000);
    });
  }
  
  // Updated function to create a calendar layout that matches your example
  function createCalendarLayout(data, debugMode) {
    // Create container
    const container = document.createElement('div');
    container.id = 'pdf-calendar-container-' + Date.now();
    container.className = 'pdf-calendar-container';
    container.style.width = '1100px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'Arial, sans-serif';
    
    if (debugMode) {
      container.style.position = 'absolute';
      container.style.top = '20px';
      container.style.left = '20px';
      container.style.zIndex = '9998';
      container.style.border = '2px solid red';
    } else {
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
    }
    
    // Add title and header
    container.innerHTML = `
      <h1 style="text-align:center; color:#3558d4; font-size:28px; margin-bottom:15px;">
        University Timetable
      </h1>
      <p style="text-align:center; font-size:14px; color:#666; margin-bottom:20px;">
        Generated on: ${new Date().toLocaleString()}
      </p>
    `;
    
    if (!data || data.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'No timetable entries available.';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.padding = '30px 0';
      emptyMsg.style.fontSize = '16px';
      emptyMsg.style.color = '#666';
      container.appendChild(emptyMsg);
    } else {
      // Define a single blue color scheme for all entries
      const blueColorScheme = {
        background: '#e3f2fd',  // Light blue background
        border: '#42a5f5'       // Medium blue border
      };
      
      // Group entries by week
      const weekGroups = {};
      data.forEach(entry => {
        const week = entry.week || 'Unspecified Week';
        if (!weekGroups[week]) {
          weekGroups[week] = [];
        }
        weekGroups[week].push(entry);
      });
      
      // Create a weekly calendar for each week
      Object.keys(weekGroups).sort().forEach(week => {
        const weekEntries = weekGroups[week];
        
        // Create weekly container
        const weekContainer = document.createElement('div');
        weekContainer.style.marginBottom = '30px';
        weekContainer.style.pageBreakAfter = 'always'; // Each week on a new page
        
        // Add week title
        const weekTitle = document.createElement('h2');
        weekTitle.textContent = week;
        weekTitle.style.color = '#444';
        weekTitle.style.fontSize = '20px';
        weekTitle.style.borderBottom = '2px solid #4a90e2';
        weekTitle.style.paddingBottom = '5px';
        weekTitle.style.marginBottom = '15px';
        weekContainer.appendChild(weekTitle);
        
        // Create calendar table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '20px';
        table.style.fontSize = '14px';
        table.style.tableLayout = 'fixed';
        
        // Merge time slots from all entries for this week
        let allTimeSlots = {};
        weekEntries.forEach(entry => {
          if (entry.startTime && entry.endTime) {
            const timeSlotKey = `${entry.startTime} - ${entry.endTime}`;
            allTimeSlots[timeSlotKey] = true;
          }
        });
        
        // Convert to array and sort
        let timeSlots = Object.keys(allTimeSlots);
        
        // If no time slots found, use default slots
        if (timeSlots.length === 0) {
          timeSlots = [
            '08:00 - 09:00',
            '09:00 - 10:00',
            '10:00 - 11:00',
            '11:00 - 12:00',
            '12:00 - 13:00',
            '13:00 - 14:00',
            '14:00 - 15:00',
            '15:00 - 16:00',
            '16:00 - 17:00'
          ];
        } else {
          // Sort time slots
          timeSlots.sort((a, b) => {
            const timeA = a.split(' - ')[0];
            const timeB = b.split(' - ')[0];
            return new Date('1/1/2023 ' + timeA) - new Date('1/1/2023 ' + timeB);
          });
        }
        
        // Create table header with days
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#4a90e2';
        headerRow.style.color = 'white';
        
        // Add time header
        const timeHeader = document.createElement('th');
        timeHeader.textContent = 'Time';
        timeHeader.style.padding = '10px';
        timeHeader.style.border = '1px solid #ddd';
        timeHeader.style.fontWeight = 'bold';
        timeHeader.style.textAlign = 'center';
        timeHeader.style.width = '20%';
        headerRow.appendChild(timeHeader);
        
        // Add day headers
        days.forEach(day => {
          const dayHeader = document.createElement('th');
          dayHeader.textContent = day;
          dayHeader.style.padding = '10px';
          dayHeader.style.border = '1px solid #ddd';
          dayHeader.style.fontWeight = 'bold';
          dayHeader.style.textAlign = 'center';
          dayHeader.style.width = '16%';
          headerRow.appendChild(dayHeader);
        });
        
        const thead = document.createElement('thead');
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Create a row for each time slot
        timeSlots.forEach((timeSlot, index) => {
          const row = document.createElement('tr');
          row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
          
          // Add time slot cell with formatted time
          const timeCell = document.createElement('td');
          timeCell.textContent = formatTimeForDisplay(timeSlot);
          timeCell.style.padding = '10px';
          timeCell.style.border = '1px solid #ddd';
          timeCell.style.fontWeight = 'bold';
          timeCell.style.textAlign = 'center';
          timeCell.style.verticalAlign = 'top';
          row.appendChild(timeCell);
          
          // Add cells for each day
          days.forEach(day => {
            const dayCell = document.createElement('td');
            dayCell.style.padding = '10px';
            dayCell.style.border = '1px solid #ddd';
            dayCell.style.verticalAlign = 'top';
            dayCell.style.height = '60px';
            
            // Find entries for this day and time slot
            const entries = weekEntries.filter(entry => {
              // Check if entry day matches (either as string or array)
              const entryDays = Array.isArray(entry.days) ? entry.days : [entry.days];
              const isDayMatch = entryDays.some(d => d === day);
              
              // Check if entry time matches
              const entryTimeSlot = `${entry.startTime} - ${entry.endTime}`;
              // We could format this for comparison, but it's better to keep the original format
              // for comparison purposes and only format for display
              const isTimeMatch = entryTimeSlot === timeSlot;
              
              return isDayMatch && isTimeMatch;
            });
            
            // If entries found, add them to the cell
            if (entries.length > 0) {
              // Add some spacing between multiple entries
              dayCell.style.padding = '5px';
              
              entries.forEach((entry, entryIndex) => {
                // Create a container for this entry with the standard blue styling
                const entryContainer = document.createElement('div');
                entryContainer.style.backgroundColor = blueColorScheme.background;
                entryContainer.style.borderLeft = `4px solid ${blueColorScheme.border}`;
                entryContainer.style.padding = '8px';
                entryContainer.style.marginBottom = entryIndex < entries.length - 1 ? '8px' : '0';
                entryContainer.style.borderRadius = '3px';
                entryContainer.style.textAlign = 'center';
                
                // Course name (bold)
                const courseDiv = document.createElement('div');
                courseDiv.style.fontWeight = 'bold';
                courseDiv.style.marginBottom = '3px';
                courseDiv.textContent = entry.course || '';
                entryContainer.appendChild(courseDiv);
                
                // Teacher name (if available)
                if (entry.teacher) {
                  const teacherDiv = document.createElement('div');
                  teacherDiv.style.fontSize = '12px';
                  teacherDiv.textContent = entry.teacher;
                  entryContainer.appendChild(teacherDiv);
                }
                
                // Venue/room (if available)
                if (entry.venue) {
                  const venueDiv = document.createElement('div');
                  venueDiv.style.fontSize = '12px';
                  venueDiv.textContent = entry.venue;
                  entryContainer.appendChild(venueDiv);
                }
                
                dayCell.appendChild(entryContainer);
              });
            }
            
            row.appendChild(dayCell);
          });
          
          tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        weekContainer.appendChild(table);
        container.appendChild(weekContainer);
      });
    }
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.borderTop = '1px solid #ddd';
    footer.style.paddingTop = '10px';
    footer.style.marginTop = '20px';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.style.textAlign = 'center';
    footer.textContent = 'University Timetable System';
    container.appendChild(footer);
    
    // Add debug controls if in debug mode
    if (debugMode) {
      const debugControls = document.createElement('div');
      debugControls.style.position = 'fixed';
      debugControls.style.top = '10px';
      debugControls.style.right = '10px';
      debugControls.style.zIndex = '10000';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close Preview';
      closeBtn.style.padding = '8px 16px';
      closeBtn.style.backgroundColor = 'red';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '4px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = function() {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        if (debugControls.parentNode) {
          debugControls.parentNode.removeChild(debugControls);
        }
      };
      
      debugControls.appendChild(closeBtn);
      document.body.appendChild(debugControls);
    }
    
    document.body.appendChild(container);
    return container;
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
function setupClearAllButton() {
  console.log('Setting up Clear All button...');
  
  const clearAllBtn = document.getElementById('clear-all');
  if (clearAllBtn) {
    // First remove any existing event listeners by cloning
    const newBtn = clearAllBtn.cloneNode(true);
    if (clearAllBtn.parentNode) {
      clearAllBtn.parentNode.replaceChild(newBtn, clearAllBtn);
    }
    
    // Add our new event listener
    newBtn.addEventListener('click', function(event) {
      event.preventDefault();
      clearAllEntries(event);
    });
    
    // Remove any inline onclick attribute
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
  
  // Normalize week format (add this before sending to API)
  if (entry.week && !entry.week.toLowerCase().startsWith('week')) {
    entry.week = `Week ${entry.week}`;
  }
  
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
    localStorage.setItem('timetableUpdated', Date.now().toString());
    
    // Use BroadcastChannel to notify other tabs/windows
    try {
      const bc = new BroadcastChannel('uni_schedule_updates');
      bc.postMessage({ 
        type: 'data-updated', 
        dataType: 'timetable',
        timestamp: Date.now()
      });
      bc.close();
    } catch(e) {
      console.log('BroadcastChannel not supported');
    }
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
function submitAnnouncement() {
  console.log('Submitting announcement...');
  
  // Get form elements with corrected IDs
  const announcementInput = document.getElementById('announcement');
  const durationInput = document.getElementById('duration');
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
  
  console.log('Submitting announcement:', announcementObj);
  
  // Send to API
  fetch(`${API_BASE_URL}/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(announcementObj)
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
    console.log('Announcement added successfully:', data);
    alert('Announcement added successfully!');
    
    // Clear form
    announcementInput.value = '';
    durationInput.value = '';
    
    // Reload announcements
    loadAnnouncements();
    
    // Force index page to reload
    localStorage.setItem('forceDataReload', Date.now().toString());
    localStorage.setItem('announcementsUpdated', Date.now().toString());
    
    // Use BroadcastChannel to notify other tabs/windows
    try {
      const bc = new BroadcastChannel('uni_schedule_updates');
      bc.postMessage({ 
        type: 'data-updated', 
        dataType: 'announcements',
        timestamp: Date.now()
      });
      bc.close();
    } catch(e) {
      console.log('BroadcastChannel not supported');
    }
  })
  .catch(error => {
    console.error('Error adding announcement:', error);
    alert(`Failed to add announcement: ${error.message}`);
  })
  .finally(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Announcement';
    }
  });
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

// ======================================================
// MANAGE STORED DATA
// ======================================================
function manageSavedData() {
  console.log('Managing saved data...');
  
  // Get saved data from localStorage
  const uniqueCourses = JSON.parse(localStorage.getItem('uniqueCourses')) || [];
  const uniqueTeachers = JSON.parse(localStorage.getItem('uniqueTeachers')) || [];
  const uniqueVenues = JSON.parse(localStorage.getItem('uniqueVenues')) || [];
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100%';
  modalContainer.style.height = '100%';
  modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
  modalContainer.style.zIndex = '1000';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.backgroundColor = 'white';
  modal.style.padding = '20px';
  modal.style.borderRadius = '8px';
  modal.style.width = '80%';
  modal.style.maxHeight = '80%';
  modal.style.overflowY = 'auto';
  
  // Create modal header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  
  const title = document.createElement('h2');
  title.textContent = 'Manage Saved Data';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'CLOSE';
  closeButton.style.padding = '8px 16px';
  closeButton.style.backgroundColor = '#d9534f';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '4px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = function() {
    document.body.removeChild(modalContainer);
  };
  
  header.appendChild(title);
  header.appendChild(closeButton);
  modal.appendChild(header);
  
  // Helper function to create data section
  function createDataSection(title, data, storageKey) {
    const section = document.createElement('div');
    section.style.marginBottom = '20px';
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.marginBottom = '10px';
    section.appendChild(sectionTitle);
    
    const addForm = document.createElement('form');
    addForm.style.display = 'flex';
    addForm.style.marginBottom = '10px';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Add new ${title.toLowerCase()}...`;
    input.style.flex = '1';
    input.style.padding = '8px';
    input.style.marginRight = '10px';
    
    const addButton = document.createElement('button');
    addButton.textContent = 'ADD';
    addButton.style.padding = '8px 16px';
    addButton.style.backgroundColor = '#5bc0de';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.cursor = 'pointer';
    
    // Display existing data
    const dataList = document.createElement('div');
    dataList.className = 'data-list';
    dataList.style.display = 'flex';
    dataList.style.flexDirection = 'column';
    dataList.style.gap = '10px';
    
    // Function for refreshing the data display
    function refreshDataDisplay() {
      dataList.innerHTML = '';
      
      if (data.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = `No ${title.toLowerCase()} saved yet.`;
        emptyMsg.style.fontStyle = 'italic';
        emptyMsg.style.color = '#888';
        dataList.appendChild(emptyMsg);
      } else {
        data.forEach((item, index) => {
          const itemEl = document.createElement('div');
          itemEl.style.display = 'flex';
          itemEl.style.alignItems = 'center';
          itemEl.style.backgroundColor = '#f1f1f1';
          itemEl.style.padding = '5px 10px';
          itemEl.style.borderRadius = '4px';
          
          const itemText = document.createElement('span');
          itemText.textContent = item;
          itemText.style.flex = '1';
          
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'DELETE';
          deleteBtn.style.background = 'none';
          deleteBtn.style.border = 'none';
          deleteBtn.style.color = '#d9534f';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.onclick = function() {
            data.splice(index, 1);
            localStorage.setItem(storageKey, JSON.stringify(data));
            refreshDataDisplay();
          };
          
          itemEl.appendChild(itemText);
          itemEl.appendChild(deleteBtn);
          dataList.appendChild(itemEl);
        });
      }
    }
    
    // Initialize add button functionality
    addButton.onclick = function(event) {
      event.preventDefault();
      if (input.value.trim()) {
        // Add new item if it doesn't exist
        if (!data.includes(input.value.trim())) {
          data.push(input.value.trim());
          localStorage.setItem(storageKey, JSON.stringify(data));
          refreshDataDisplay();
          
          // Also update form datalists
          loadSavedValues();
        }
        input.value = '';
      }
    };
    
    addForm.appendChild(input);
    addForm.appendChild(addButton);
    section.appendChild(addForm);
    section.appendChild(dataList);
    
    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = `CLEAR ${title.toUpperCase()}`;
    clearBtn.style.padding = '5px 10px';
    clearBtn.style.marginTop = '10px';
    clearBtn.style.backgroundColor = '#d9534f';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.onclick = function() {
      if (confirm(`Are you sure you want to clear all ${title.toLowerCase()}?`)) {
        data.length = 0;
        localStorage.setItem(storageKey, JSON.stringify(data));
        refreshDataDisplay();
      }
    };
    
    section.appendChild(clearBtn);
    refreshDataDisplay();
    return section;
  }
  
  // Create sections for each data type
  modal.appendChild(createDataSection('Courses', uniqueCourses, 'uniqueCourses'));
  modal.appendChild(createDataSection('Teachers', uniqueTeachers, 'uniqueTeachers'));
  modal.appendChild(createDataSection('Venues', uniqueVenues, 'uniqueVenues'));
  
  // Add to DOM
  modalContainer.appendChild(modal);
  document.body.appendChild(modalContainer);
  
  // Close when clicking outside
  modalContainer.addEventListener('click', function(e) {
    if (e.target === modalContainer) {
      document.body.removeChild(modalContainer);
    }
  });
}

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

