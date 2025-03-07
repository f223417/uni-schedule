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

function startDisplayCycle() {
    let currentWeekIndex = 0;
    const displayDuration = [20000, 10000]; // 20 seconds for current week, 10 seconds for next week

    function cycleTimetable() {
        displayTimetable();
        setTimeout(() => {
            currentWeekIndex = (currentWeekIndex + 1) % 2; // Toggle between current and next week
            displayTimetable();
            setTimeout(cycleTimetable, displayDuration[currentWeekIndex]);
        }, displayDuration[currentWeekIndex]);
    }

    cycleTimetable();
}

document.addEventListener('DOMContentLoaded', () => {
    displayTimetable();
    displayAnnouncements();
    startDisplayCycle();
});