// var User = require('../models/user')
// var router = require('express').Router()
// var statusMessage = require('../config/statusMessage')
// var passport = require('passport')



// /**
// * POST /user/signup.  => create a new user
// * @method POST
// * REQUIRED email, firstName, lastName, password
// */
// router.post('/signup', function(req, res){
// 	console.log("POST user/signup")
// 	console.log(req.body)

// 	// If any of mandatory fields are missing, return the 422 error with a readable error message
// 	if(!req.body.email || req.body.email == ''){
// 		return res.status(422).json({result : false, status : {message : 'email is not provided'}})
// 	}
// 	if(!req.body.firstName || req.body.firstName == ''){
// 		return res.status(422).json({result : false, status : {message : 'First Name is not provided'}})
// 	}
// 	if(!req.body.lastName || req.body.lastName == ''){
// 		return res.status(422).json({result : false, status : {message : 'Last Name is not provided'}})
// 	}
// 	if(!req.body.password || req.body.password == ''){
// 		return res.status(422).json({result : false, status : {message : 'Password is not provided'}})
// 	}

// 	// Create new user account
// 	var user = new User({
// 		email : req.body.email,
// 		firstName : req.body.firstName,
// 		lastName : req.body.lastName,
// 		gender : req.body.gender == null ? '' : req.body.gender,
// 		phoneNo : req.body.phoneNo == null ? '' : req.body.phoneNo,
// 		address : req.body.address == null ? '' : req.body.address
// 	})
// 	user.setPassword(req.body.password)
// 	user.save().then((usr) =>{
// 		console.log("Saved successfully")
// 		return res.status(201).json({result : true, status :{message : statusMessage.SUCCESS}})
// 	}).catch((error)=>{
// 		console.log("CONNECTION ERROR")
// 		if(error.errmsg == "E11000 duplicate key error collection: blockchainbackapp.users index: email_1 dup key: { : \""+user.email.toLowerCase() +"\" }"){
// 			return res.status(409).json({result : false, status : {message : statusMessage.EMAIL_EXISTS}})
// 		}
// 		return res.status(500).json({result : false, status : {messgae : 'database error'}})
// 	})
// })




// /**
// * POST /user/login.  => login existing user
// * @method POST
// * REQUIRED email, password
// * RETURNS User object
// */

// router.post('/login', function(req, res){
// 	console.log("POST user/login")
// 	console.log(req.body)
// 	if(!req.body.email){
// 		return res.status(422).json({result : false, status : {message : statusMessage.MISSING_EMAIL}})
// 	}
// 	if(!req.body.password){
// 		return res.status(422).json({result : false, statuss : {message : statusMessage.MISSING_PASSWORD}})
// 	}
// 	passport.authenticate('local', {session : false}, function(error, user, info){
// 		if(error){return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})}
// 		if(user){return res.json({user : user.toAuthJSON()})}
// 		else{return res.status(422).json({result: false, status: {message: statusMessage.INVALID_LOGIN}})}
// 	})(req,res)
// })




// // router.post('/sample', function(req, res){
// // 	User.find({_id : req.body.id}).then((user)=>{
// // 		console.log("USESR FOUND as ")
// // 		console.log(user)
// // 		res.send("Found")
// // 	}).catch((error)=>{
// // 		console.log("ERROR HAPPENED")
// // 		console.log(error.message)
// // 		res.send("ERROR")
// // 	})
// // })

// module.exports = router