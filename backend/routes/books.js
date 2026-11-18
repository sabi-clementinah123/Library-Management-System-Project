const express = require('express');
const router = express.Router();

console.log('Books routes loaded successfully!');
const db = require('../db');

// GET: View all books
router.get('/', (req, res) => {
    console.log('GET BOOKS ROUTE ACCESSED!');
    const sql = 'SELECT * FROM books';
    

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving books' });
        }

        res.json(results);
    });
});

// POST: Add a new book
router.post('/', (req, res) => {
    const { title, author, genre, isbn, quantity } = req.body;

    if (!title || !author || !isbn || quantity === undefined || quantity === '') {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const sql = 'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [title, author, genre, isbn, quantity], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding book' });
        }

        res.status(201).json({
            message: 'Book added successfully!',
            bookId: result.insertId
        });
    });
});

// PUT: Update a book
router.put('/:id', (req, res) => {
    const { title, author, genre, isbn, quantity } = req.body;
    const { id } = req.params;

    const sql = 'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE book_id = ?';

    db.query(sql, [title, author, genre, isbn, quantity, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating book' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book updated successfully!' });
    });
});

// DELETE: Delete a book
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM books WHERE book_id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting book' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully!' });
    });
});

module.exports = router;