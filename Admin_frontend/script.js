function displayTimetable() {
    fetch('timetable.json')
        .then(response => response.json())
        .then(data => {
            const timetable = data.timetable;
            const tbody = document.querySelector('#timetable tbody');
            tbody.innerHTML = ''; // Clear existing entries
            timetable.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${entry.day}</td><td>${entry.time}</td><td>${entry.teacher}</td><td>${entry.venue}</td>`;
                tbody.appendChild(row);
            });
        });
}

function displayAnnouncements() {
    fetch('timetable.json')
        .then(response => response.json())
        .then(data => {
            const announcements = data.announcements;
            const announcementDiv = document.getElementById('announcement');
            announcementDiv.innerHTML = ''; // Clear existing announcements
            announcements.forEach(announcement => {
                const p = document.createElement('p');
                p.textContent = announcement;
                announcementDiv.appendChild(p);
            });
        });
}

// Modified function to remove cycling behavior
function startDisplayCycle() {
    // Just display current timetable once without any cycling
    displayTimetable();
    // No timers or cycling logic
}

document.addEventListener('DOMContentLoaded', () => {
    displayTimetable();
    displayAnnouncements();
    // We still call startDisplayCycle but it won't actually cycle
    startDisplayCycle();
});