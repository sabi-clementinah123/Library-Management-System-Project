const express = require('express');
const router = express.Router();

const db = require('../db');

// GET: View all transactions
router.get('/', (req, res) => {
    const sql = `
        SELECT transactions.*, books.title, users.name, users.membership_id
        FROM transactions
        JOIN books ON transactions.book_id = books.book_id
        JOIN users ON transactions.user_id = users.user_id
        ORDER BY transactions.transaction_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Error retrieving transactions'
            });
        }

        res.json(results);
    });
});

// POST: Record a new transaction
router.post('/', (req, res) => {
    const { book_id, user_id, transaction_type, quantity } = req.body;

    if (!book_id || !user_id || !transaction_type || !quantity ||
        !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        return res.status(400).json({
            message: 'Please provide valid transaction details.'
        });
    }

    if (!['Borrow', 'Return'].includes(transaction_type)) {
        return res.status(400).json({
            message: 'Transaction type must be Borrow or Return.'
        });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: 'Could not start transaction.'
            });
        }

        const sql = 'SELECT quantity FROM books WHERE book_id = ? FOR UPDATE';

        db.query(sql, [book_id], (err, results) => {
            if (err || results.length === 0) {
                return db.rollback(() => {
                    res.status(err ? 500 : 404).json({
                        message: err ? 'Error checking book.' : 'Book not found.'
                    });
                });
            }

            const currentQuantity = results[0].quantity;
            const amount = Number(quantity);

            if (transaction_type === 'Borrow' && currentQuantity < amount) {
                return db.rollback(() => {
                    res.status(400).json({
                        message: 'Not enough books available.'
                    });
                });
            }

            const change = transaction_type === 'Borrow' ? -amount : amount;
            const newQuantity = currentQuantity + change;

            db.query(
                'UPDATE books SET quantity = ? WHERE book_id = ?',
                [newQuantity, book_id],
                (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({
                                message: 'Error updating book quantity.'
                            });
                        });
                    }

                    const insertSql = `
                        INSERT INTO transactions
                        (book_id, user_id, transaction_type, quantity)
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(
                        insertSql,
                        [book_id, user_id, transaction_type, amount],
                        (err, result) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({
                                        message: 'Error saving transaction.'
                                    });
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: 'Could not complete transaction.'
                                        });
                                    });
                                }

                                res.status(201).json({
                                    message: 'Transaction recorded successfully!',
                                    transactionId: result.insertId,
                                    remainingQuantity: newQuantity
                                });
                            });
                        }
                    );
                }
            );
        });
    });
});

module.exports = router;