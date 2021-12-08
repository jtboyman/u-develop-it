const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

//we moved the cand. routes here, we took off /api from the URLs
//and changed "app" object to "router"

//get all candidates
router.get('/candidates', (request, response) => { //create endpoint
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
router.get('/candidate/:id', (req, res) => {
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
router.delete('/candidate/:id', (req, res) => {
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
router.post('/candidate', ({ body }, res) => {
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
router.put('/candidate/:id', (req, res) => {

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

module.exports = router;