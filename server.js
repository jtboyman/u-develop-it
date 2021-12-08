const db = require('./db/connection'); //connect to database
const express = require('express');
const apiRoutes = require('./routes/apiRoutes');

const PORT = process.env.PORT || 3001;
const app = express();

//express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Add after Express middleware (we can remove /api prefix from routes)
app.use('/api', apiRoutes);

// Default response for any other request (Not Found) MUST BE LAST
app.use((req, res) => {
    res.status(404).end();
  });

  //start server after DB connection
db.connect(err => {
    if(err) throw err;
    console.log('Database connected.');

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});