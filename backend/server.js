const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const booksRoutes = require('./routes/books');

const usersRoutes = require('./routes/users');

const transactionsRoutes = require('./routes/transactions');
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log('Request received:', req.method, req.url);
    next();
});

app.use('/books', booksRoutes);

app.use('/users', usersRoutes);

app.use('/transactions', transactionsRoutes);
// Test the backend server
app.get('/', (req, res) => {
    res.send('Library Management System API is running!');
});

// Test the database connection
app.get('/test-db', (req, res) => {
    db.query('SELECT 1', (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Database connection failed'
            });
        }

        res.json({
            message: 'Database connected successfully!'
        });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});