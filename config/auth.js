const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dbConn = require('./db.js');

router.post('/signup', (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Use parameterized query to prevent SQL injection
        const sqlQuery = "INSERT INTO account_credentials(username, email, password) VALUES (?, ?, ?)";
        dbConn.query(sqlQuery, [username, email, password], function (error, results) {
            console.log(results);
            if (error) {
                console.log(error);
                return next(error);
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/signin', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const sqlQuery = "SELECT * FROM account_credentials WHERE email = ? AND password = ?";
        dbConn.query(sqlQuery, [email, password], function (error, results) {
            if (error) {
                console.log(error);
                return next(error);
            }

            if (results.length > 0) {
                const user = results[0];
                const username = user.username;

                // Include the username in the token payload
                const token = jwt.sign({ email: email, username: username }, 'your_secret_key', { expiresIn: '1h' });

                // Send the username along with the token in the response
                res.status(200).json({ success: true, token: token, username: username });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        });
    } catch (error) {
        console.log(error);
        return next(error);
    }
});

module.exports = router;
