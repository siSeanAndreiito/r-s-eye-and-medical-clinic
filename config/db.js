// db.js

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',  // Use 'localhost' or '127.0.0.1' for the XAMPP MySQL server
    user: 'root',
    password: '',  // Provide your MySQL password here
    database: 'cpe202_lab7_demo',
});

connection.connect(function (error) {
    if (!!error) {
        console.log(error);
    } else {
        console.log('MySQL Database Connected..!');
    }
});

module.exports = connection;
