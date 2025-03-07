# University Timetable Project

## Description
A simple web application for managing university timetables. This project allows an admin to modify the timetable, which is then displayed dynamically for students. The application includes features for announcements and the ability to print the timetable.

## Setup
1. Clone the repository or download the project files.
2. Open `index.html` in a web browser to view the timetable.
3. Open `admin.html` to modify the timetable.

## Features
- Admin can add timetable entries for different weeks.
- The current week's timetable is displayed for 20 seconds, followed by the next week's timetable for 10 seconds in a loop.
- Announcements can be added by the admin, which will display alongside the timetable.
- The admin can specify the duration for holiday announcements.
- Option to print the timetable as a PDF.

## File Structure
```
university-timetable
├── index.html
├── style.css
├── script.js
├── admin.html
├── admin.js
├── timetable.json
└── README.md
```

## Technologies Used
- HTML
- CSS
- JavaScript
- JSON for local data storage

## Local Database
The project uses a JSON file (`timetable.json`) to store timetable data. You can modify this file to add or change timetable entries.

## Deployment
1. **Deploy on Vercel**: Create an account on Vercel and follow their instructions to deploy your project. You can link your GitHub repository or upload your files directly.

## Final Notes
- Make sure to test your application thoroughly.
- You can enhance the project by adding more features like editing and deleting timetable entries.
- Consider using a local server for development (e.g., using Live Server extension in your code editor).