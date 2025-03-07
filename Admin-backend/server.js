const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Admin_frontend')));

// Path to our data file
const DATA_FILE = path.join(__dirname, 'timetable_data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = { 
    timetable: [], 
    announcements: [], 
    notices: [] 
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Read data helper function
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { timetable: [], announcements: [], notices: [] };
  }
}

// Write data helper function
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

// API Endpoints
app.get('/api/timetable', (req, res) => {
  const data = readData();
  res.json(data.timetable);
});

app.post('/api/timetable', (req, res) => {
  const data = readData();
  const newEntry = req.body;
  data.timetable.push(newEntry);
  
  if (writeData(data)) {
    res.json({ success: true, entry: newEntry });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save entry' });
  }
});

// Delete endpoint for timetable entries
app.delete('/api/timetable/:id', (req, res) => {
  const data = readData();
  const id = req.params.id;
  const initialLength = data.timetable.length;
  
  data.timetable = data.timetable.filter(entry => entry.id !== id);
  
  if (data.timetable.length < initialLength && writeData(data)) {
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Entry not found or could not delete' });
  }
});

app.get('/api/announcements', (req, res) => {
  const data = readData();
  res.json(data.announcements);
});

app.post('/api/announcements', (req, res) => {
  const data = readData();
  const newAnnouncement = req.body;
  data.announcements.push(newAnnouncement);
  
  if (writeData(data)) {
    res.json({ success: true, announcement: newAnnouncement });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save announcement' });
  }
});

app.get('/api/notices', (req, res) => {
  const data = readData();
  res.json(data.notices);
});

app.post('/api/notices', (req, res) => {
  const data = readData();
  const newNotice = req.body;
  data.notices.push(newNotice);
  
  if (writeData(data)) {
    res.json({ success: true, notice: newNotice });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save notice' });
  }
});

// Routes for admin and login pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../Admin_frontend/admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../Admin_frontend/login.html'));
});

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Admin_frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For Vercel