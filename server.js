const mysql = require('mysql2'); //connect to mysql database
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const inputCheck = require('./utils/inputCheck');

//express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//connect to database
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


//get all candidates
app.get('/api/candidates', (request, response) => { //create endpoint
    const sql = `SELECT candidates.*, parties.name 
        AS party_name 
        FROM candidates 
        LEFT JOIN parties 
        ON candidates.party_id = parties.id`;

    db.query(sql, (err, rows) => { //db query
        if (err) {
            response.status(500).json({ errorr: err.message });
            return;
        }
        response.json({
            message: 'Success!',
            data: rows
        });
    });
});

// GET a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
        AS party_name 
        FROM candidates 
        LEFT JOIN parties 
        ON candidates.party_id = parties.id 
        WHERE candidates.id = ?`;

    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json( {error: err.message} );
            return;
        }
        res.json({
            message: 'Success!',
            data: row
        });
    });
});
// Delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: 'Candidate not found'
      });
    } else {
      res.json({
        message: 'Deleted!',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});
// Create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
    VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'Success!',
            data: body
        });
    });
  });

//Update a candidate's party with PUT
app.put('/api/candidate/:id', (req, res) => {

    const errors = inputCheck(req.body, 'party_id'); //from module

    if (errors) {//forced PUT request to include a party_id property
        res.status(400).json({error: errors});
        return;
    }

    const sql = `UPDATE candidates SET party_id = ?
        WHERE id =?`;
    const params = [req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({error: err.message});
            //check if a record was found
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message:'Success!',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

  //get all parties
app.get('/api/parties', (req, res) => {
  const sql = `SELECT * FROM parties`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

//get a single party by id
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: row
      });
    });
  });

//delete a party
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({error: res.message});
            //checks if anything was deleted
        } else if (!result.affectedRows) {
            res.json({
                message: 'Party not found'
            });
        } else {
            res.json({
                message: 'Party deleted!',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// Default response for any other request (Not Found) MUST BE LAST
app.use((req, res) => {
    res.status(404).end();
  });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});