var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
require('./config/passport')

var app = express()


app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))

app.use(passport.initialize())


app.use('/', require('./routes'))
module.exports = app