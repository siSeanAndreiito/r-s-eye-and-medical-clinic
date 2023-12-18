const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dbConn = require('./db.js');

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

router.post('/book/:day', verifyToken, (req, res, next) => {
    const role = req.decoded.role;

    if (role !== 'user') {
        return res.status(403).json({ success: false, message: 'Forbidden: Only users can book appointments' });
    }

    try {
        const userId = req.decoded.id;

        if (!userId) {
            console.log('Decoded Token:', req.decoded);
            return res.status(500).json({ success: false, message: 'User ID not available in the token' });
        }

        const dayToBook = req.params.day;

        const checkAvailabilityQuery = 'SELECT * FROM appointments WHERE day = ?';
        dbConn.query(checkAvailabilityQuery, [dayToBook], function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            if (results.length === 0) {
                const bookAppointmentQuery = 'INSERT INTO appointments (day, id) VALUES (?, ?)';
                dbConn.query(bookAppointmentQuery, [dayToBook, userId], function (error) {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ success: false, message: 'Internal server error' });
                    }

                    res.status(200).json({ success: true, message: 'Appointment booked successfully' });
                });
            } else {
                res.status(400).json({ success: false, message: 'Appointment slot not available for the specified day' });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/availability', verifyToken, (req, res, next) => {
    try {
        const isAdmin = req.decoded.role === 'admin';

        const checkAvailabilityQuery = 'SELECT a.day, a.id, ac.username FROM appointments a LEFT JOIN account_credentials ac ON a.id = ac.id';
        dbConn.query(checkAvailabilityQuery, function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            const availability = Array.from({ length: 31 }, (_, index) => {
                const day = index + 1;
                const bookedDay = results.find(result => result.day === day);

                if (bookedDay) {
                    const isBookedByAdmin = isAdmin && bookedDay.id !== null;
                    const clientUsername = isBookedByAdmin ? bookedDay.username : null;

                    return {
                        day: day,
                        available: false,
                        client: clientUsername,
                    };
                } else {
                    return {
                        day: day,
                        available: true,
                    };
                }
            });

            res.status(200).json({ success: true, availability: availability });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/cancel/:day', verifyToken, (req, res, next) => {
    const role = req.decoded.role;
    const userId = req.decoded.id;
    const dayToCancel = req.params.day;

    const checkBookingQuery = 'SELECT * FROM appointments WHERE day = ? AND id = ?';
    dbConn.query(checkBookingQuery, [dayToCancel, userId], function (error, results) {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length > 0 || role === 'admin') {
            const cancelAppointmentQuery = 'DELETE FROM appointments WHERE day = ?';
            dbConn.query(cancelAppointmentQuery, [dayToCancel], function (error) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                res.status(200).json({ success: true, message: 'Appointment canceled successfully' });
            });
        } else {
            const checkDayQuery = 'SELECT * FROM appointments WHERE day = ?';
            dbConn.query(checkDayQuery, [dayToCancel], function (error, dayResults) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                if (dayResults.length > 0) {
                    res.status(400).json({ success: false, message: 'Cant cancel the appointment.' });
                } else {
                    res.status(400).json({ success: false, message: 'No booking found for the specified day' });
                }
            });
        }
    });
});

module.exports = router;
