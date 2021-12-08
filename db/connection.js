const mysql = require('mysql2'); //connect to mysql database

//connect to database (this was first in server.js)
const db = mysql.createConnection(
    {
        host: 'localhost',
        // your mysql username,
        user: 'root',
        // your mysql password
        password: 'NEW_USER_PASSWORD',
        database: 'election'
    },
    console.log('Connected to the election database.')
);

module.exports = db;