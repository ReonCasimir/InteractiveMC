const express = require('express');
const session = require('express-session');
const app = express();

// Session Middleware (In-Memory Storage)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static('public'));

// Route for adding events
app.post('/addEvent', (req, res) => {
  const { eventName, eventTime } = req.body;
  if (!req.session.events) {
    req.session.events = [];
  }
  req.session.events.push({ name: eventName, time: eventTime });
  res.json({ message: 'Event added successfully' });
});

// Route for getting events
app.get('/getEvents', (req, res) => {
  const events = req.session.events || [];
  res.json(events);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});