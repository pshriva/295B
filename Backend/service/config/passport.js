var mongoose = require('mongoose')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var user = require('../models/user')
var User = mongoose.model('User')

passport.use(new LocalStrategy({
	usernameField : 'email',
	passwordField : 'password'
}, function(email, password, done){
	User.findOne({email : email}).then(function(user){
		console.log("Verifying user from inside of passport")
		if(!user || !user.validatePassword(password)){
			return done(null, false, {errors: {'email or pasword' : 'is invalid'}})
		}
		return done(null,user)
	}).catch(done)
}))