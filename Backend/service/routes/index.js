// express = require('express')
// User = require('../models/user');
// router = express.Router()
// router.use('/user', require('./user'))

// module.exports = router

var router = require('express').Router()
router.use('/user', require('./user'))
router.use('/property', require('./property'))

module.exports = router