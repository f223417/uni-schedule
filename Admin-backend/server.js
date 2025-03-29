const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, push, remove, child } = require('firebase/database');
const firebaseConfig = require('./firebase-config.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Admin_frontend')));

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Timetable Endpoints
app.get('/api/timetable', async (req, res) => {
  try {
    console.log('Fetching timetable entries...');
    const snapshot = await get(ref(database, 'timetable'));
    
    if (snapshot.exists()) {
      // Convert Firebase object to array
      const entries = [];
      snapshot.forEach(childSnapshot => {
        entries.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      console.log(`Found ${entries.length} timetable entries`);
      res.json(entries);
    } else {
      console.log('No timetable entries found');
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/timetable', async (req, res) => {
  try {
    const newEntry = req.body;
    console.log('Adding new timetable entry:', newEntry);
    
    // Generate a unique key
    const newEntryRef = push(ref(database, 'timetable'));
    const entryId = newEntryRef.key;
    const entry = { ...newEntry, id: entryId };
    
    // Save to database
    await set(newEntryRef, entry);
    console.log('Entry added with ID:', entryId);
    
    res.json({ success: true, entry: entry });
  } catch (error) {
    console.error('Error adding timetable entry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/timetable/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Deleting timetable entry:', id);
    
    await remove(ref(database, `timetable/${id}`));
    console.log('Entry deleted');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Announcement Endpoints
app.get('/api/announcements', async (req, res) => {
  try {
    const snapshot = await get(ref(database, 'announcements'));
    
    if (snapshot.exists()) {
      const entries = [];
      snapshot.forEach(childSnapshot => {
        entries.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      res.json(entries);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const newEntry = req.body;
    
    // Generate a unique key
    const newEntryRef = push(ref(database, 'announcements'));
    const entryId = newEntryRef.key;
    const entry = { ...newEntry, id: entryId };
    
    // Save to database
    await set(newEntryRef, entry);
    
    res.json({ success: true, announcement: entry });
  } catch (error) {
    console.error('Error adding announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await remove(ref(database, `announcements/${id}`));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notice Endpoints
app.get('/api/notices', async (req, res) => {
  try {
    const snapshot = await get(ref(database, 'notices'));
    
    if (snapshot.exists()) {
      const entries = [];
      snapshot.forEach(childSnapshot => {
        entries.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      res.json(entries);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/notices', async (req, res) => {
  try {
    const newEntry = req.body;
    
    // Generate a unique key
    const newEntryRef = push(ref(database, 'notices'));
    const entryId = newEntryRef.key;
    const entry = { ...newEntry, id: entryId };
    
    // Save to database
    await set(newEntryRef, entry);
    
    res.json({ success: true, notice: entry });
  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/notices/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await remove(ref(database, `notices/${id}`));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ success: false, message: error.message });
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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Admin_frontend/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Admin_frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For Vercel