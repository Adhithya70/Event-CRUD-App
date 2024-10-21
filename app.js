const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Set up body parser to handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files (e.g., CSS)

// Set up the MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change as per your MySQL credentials
    password: 'Adhi@2002',  // Add your password here
    database: 'event_manager',
    port:3306
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Home route - Display all events
app.get('/', (req, res) => {
    const query = 'SELECT * FROM events';
    db.query(query, (err, results) => {
        if (err) throw err;
        let html = '<h1>Event List</h1><ul>';
        results.forEach(event => {
            html += `<li>${event.name} - ${event.date} 
                     <a href="/edit/${event.id}">Edit</a> | 
                     <a href="/delete/${event.id}">Delete</a></li>`;
        });
        html += '</ul><a href="/create">Create New Event</a>';
        res.send(html);
    });
});

// Route to show the form to create a new event
app.get('/create', (req, res) => {
    res.sendFile(__dirname + '/views/create.html');
});

// Route to handle the form submission to create a new event
app.post('/create', (req, res) => {
    const { name, description, date } = req.body;
    const query = 'INSERT INTO events (name, description, date) VALUES (?, ?, ?)';
    db.query(query, [name, description, date], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Route to show the edit form
app.get('/edit/:id', (req, res) => {
    const eventId = req.params.id;
    const query = 'SELECT * FROM events WHERE id = ?';
    db.query(query, [eventId], (err, result) => {
        if (err) throw err;
        res.send(`
            <h1>Edit Event</h1>
            <form action="/edit/${eventId}" method="POST">
                <input type="text" name="name" value="${result[0].name}" required><br>
                <textarea name="description" required>${result[0].description}</textarea><br>
                <input type="date" name="date" value="${result[0].date}" required><br>
                <button type="submit">Update Event</button>
            </form>
        `);
    });
});

// Route to handle updating an event
app.post('/edit/:id', (req, res) => {
    const eventId = req.params.id;
    const { name, description, date } = req.body;
    const query = 'UPDATE events SET name = ?, description = ?, date = ? WHERE id = ?';
    db.query(query, [name, description, date, eventId], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Route to delete an event
app.get('/delete/:id', (req, res) => {
    const eventId = req.params.id;
    const query = 'DELETE FROM events WHERE id = ?';
    db.query(query, [eventId], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
