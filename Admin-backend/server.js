const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Admin_frontend')));

// Memory storage fallback - ADD THIS HERE
let memoryStorage = { 
  timetable: [], 
  announcements: [], 
  notices: [] 
};

// Path to our data file - use tmp directory which is writable on Vercel
const DATA_FILE = path.join(os.tmpdir(), 'timetable_data.json');
console.log('Data file location:', DATA_FILE);

// Initialize data file if it doesn't exist
try {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = { 
      timetable: [], 
      announcements: [], 
      notices: [] 
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Created new data file');
    // Also initialize memory storage
    memoryStorage = { ...initialData };
  } else {
    console.log('Data file exists');
    // Load existing data into memory
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    memoryStorage = JSON.parse(data);
  }
} catch (error) {
  console.error('Error initializing data file:', error);
}

// Read data helper function with better error handling
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } else {
      console.warn('Data file not found, creating new one');
      const initialData = { 
        timetable: [], 
        announcements: [], 
        notices: [] 
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
  } catch (error) {
    console.error('Error reading data file:', error);
    return { timetable: [], announcements: [], notices: [] };
  }
}

// Write data helper function with better error handling
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Data successfully written');
    return true;
  } catch (error) {
    console.error('Error writing data file:', error.message, error.stack);
    return false;
  }
}

// API Endpoints with better debugging
app.get('/api/timetable', (req, res) => {
  console.log('GET /api/timetable - Reading data');
  const data = readData();
  res.json(data.timetable || []);
});

app.post('/api/timetable', (req, res) => {
  console.log('POST /api/timetable - Adding new entry');
  console.log('Request body:', req.body);
  
  try {
    const data = readData();
    const newEntry = req.body;
    
    // Add ID if not present
    if (!newEntry.id) {
      newEntry.id = Date.now().toString();
    }
    
    data.timetable = data.timetable || [];
    data.timetable.push(newEntry);
    
    if (writeData(data)) {
      console.log('Entry added successfully');
      res.json({ success: true, entry: newEntry });
    } else {
      console.error('Failed to write data');
      res.status(500).json({ success: false, message: 'Failed to save entry' });
    }
  } catch (error) {
    console.error('Error in POST /api/timetable:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error adding entry: ${error.message}`,
      error: error.stack 
    });
  }
});

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