const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../db');

console.log('Users routes loaded successfully!');

// GET: View all users (without passwords)
router.get('/', (req, res) => {
    const sql = `
        SELECT user_id, name, membership_id, role
        FROM users
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Error retrieving users'
            });
        }

        res.json(results);
    });
});

// POST: Register a new user
router.post('/', async (req, res) => {
    const { name, membership_id, role, password } = req.body;

    if (!name || !membership_id || !role || !password) {
        return res.status(400).json({
            message: 'Please fill in all required fields.'
        });
    }

    if (!['Admin', 'Student'].includes(role)) {
        return res.status(400).json({
            message: 'Invalid user role.'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, membership_id, role, password_hash)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, membership_id, role, hashedPassword],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Error registering user. Check membership ID.'
                    });
                }

                res.status(201).json({
                    message: 'User registered successfully!',
                    userId: result.insertId
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            message: 'Password processing failed.'
        });
    }
});

// PUT: Update a user
router.put('/:id', async (req, res) => {
    const { name, membership_id, role, password } = req.body;
    const { id } = req.params;

    if (!name || !membership_id || !role ||
        !['Admin', 'Student'].includes(role)) {
        return res.status(400).json({
            message: 'Please provide valid user details.'
        });
    }

    try {
        let sql;
        let values;

        if (password && password.trim()) {
            const hashedPassword = await bcrypt.hash(password, 10);

            sql = `
                UPDATE users
                SET name = ?, membership_id = ?, role = ?, password_hash = ?
                WHERE user_id = ?
            `;

            values = [name, membership_id, role, hashedPassword, id];
        } else {
            sql = `
                UPDATE users
                SET name = ?, membership_id = ?, role = ?
                WHERE user_id = ?
            `;

            values = [name, membership_id, role, id];
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error updating user.'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            res.json({
                message: 'User updated successfully!'
            });
        });
    } catch (error) {
        res.status(500).json({
            message: 'Password processing failed.'
        });
    }
});

// POST: Login a user
router.post('/login', (req, res) => {
    const { membership_id, password } = req.body;

    if (!membership_id || !password) {
        return res.status(400).json({
            message: 'Please enter your membership ID and password.'
        });
    }

    const sql = `
        SELECT * FROM users
        WHERE membership_id = ?
    `;

    db.query(sql, [membership_id], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Login failed. Please try again.'
            });
        }

        if (results.length === 0 || !results[0].password_hash) {
            return res.status(401).json({
                message: 'Invalid membership ID or password.'
            });
        }

        try {
            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: 'Invalid membership ID or password.'
                });
            }

            res.json({
                message: 'Login successful!',
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    membership_id: user.membership_id,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({
                message: 'An error occurred during login.'
            });
        }
    });
});

// DELETE: Delete a user
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM users WHERE user_id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Error deleting user'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User deleted successfully!'
        });
    });
});

module.exports = router;