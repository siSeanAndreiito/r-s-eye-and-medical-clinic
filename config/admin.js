const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dbConn = require('./db.js');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (typeof token !== 'undefined') {
        jwt.verify(token.replace('Bearer ', ''), 'your_secret_key', (err, decoded) => {
            if (err) {
                console.log('JWT verification error:', err);
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            req.decoded = decoded;
            next();
        });
    } else {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

// Admin-specific route to retrieve a list of patients
router.get('/patients', verifyToken, (req, res, next) => {
    const role = req.decoded.role;

    // Check if the authenticated user is an admin
    if (role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Only admins can access this information' });
    }

    try {
        // Query the database to get the list of usernames
        const sqlQuery = 'SELECT username FROM account_credentials';
        dbConn.query(sqlQuery, function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            res.status(200).json({ success: true, usernames: results });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
