//this file doesnt need to be in paths bc it's automatically bc it's named index.js

const express = require('express');
const router = express.Router();

//the different route files
router.use(require('./candidateRoutes'));
router.use(require('./partyRoutes'));
router.use(require('./voterRoutes'));

module.exports = router;