var User = require('../models/user')
var router = require('express').Router()
var statusMessage = require('../config/statusMessage')
var passport = require('passport')
var auth = require('../config/auth')
var chalk = require('chalk')

/**
* POST /user/signup.  => create a new user
* @method POST
* REQUIRED email, firstName, lastName, password
*/
router.post('/signup', function(req, res){
	console.log("POST user/signup")
	console.log(req.body)
	// If any of mandatory fields are missing, return the 422 error with a readable error message
	if(!req.body.email || req.body.email == ''){
		return res.status(422).json({result : false, status : {message : 'email is not provided'}})
	}
	if(!req.body.firstName || req.body.firstName == ''){
		return res.status(422).json({result : false, status : {message : 'First Name is not provided'}})
	}
	if(!req.body.lastName || req.body.lastName == ''){
		return res.status(422).json({result : false, status : {message : 'Last Name is not provided'}})
	}
	if(!req.body.password || req.body.password == ''){
		return res.status(422).json({result : false, status : {message : 'Password is not provided'}})
	}

	// Create new user account
	var user = new User({
		email : req.body.email,
		firstName : req.body.firstName,
		lastName : req.body.lastName,
		gender : req.body.gender == null ? '' : req.body.gender,
		phoneNo : req.body.phoneNo == null ? '' : req.body.phoneNo,
		address : req.body.address == null ? '' : req.body.address
	})
	user.setPassword(req.body.password)
	user.save().then((usr) =>{
		console.log("Saved successfully")
		return res.status(201).json({result : true, status :{message : statusMessage.SUCCESS}})
	}).catch((error)=>{
		console.log(chalk.red(error.errmsg))
		if(error.errmsg == "E11000 duplicate key error collection: blockchainbackapp.users index: email_1 dup key: { : \""+user.email.toLowerCase() +"\" }"){
			return res.status(409).json({result : false, status : {message : statusMessage.EMAIL_EXISTS}})
		}
		return res.status(500).json({result : false, status : {messgae : 'database error'}})
	})
})




/**
* POST /user/login.  => login existing user
* @method POST
* REQUIRED email, password
* RETURNS User object
*/
router.post('/login', function(req, res){
	console.log("POST user/login")
	console.log(req.body)
	console.log(config.secret)
	if(!req.body.email){
		return res.status(422).json({result : false, status : {message : statusMessage.MISSING_EMAIL}})
	}
	if(!req.body.password){
		return res.status(422).json({result : false, statuss : {message : statusMessage.MISSING_PASSWORD}})
	}
	passport.authenticate('local', {session : false}, function(error, user, info){
		if(error){
			console.log("THIS ERROR")
			console.log(error.message)
			return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})}
		if(user){
			user.token = user.generateJWT()
			return res.json({user : user.toAuthJSON()})
		}
		else{
			return res.status(422).json({result: false, status: {message: statusMessage.INVALID_LOGIN}})
		}
	})(req,res)
})


/**
* PUT /user/contactSeller => Send a connect request to the owner of a property (marked for sale)
* @method PUT
* RETURNS updated user object
*/
router.put('/contactSeller', auth.required, function(req, res){
	console.log(chalk.green("PUT /user/contactSeller"))
	// Notify the owner
	User.update(
	    { _id: mongoose.Types.ObjectId(req.body.owner), 'owns.property': mongoose.Types.ObjectId(req.body.propertyId) }, 
	    {$push: {'owns.$.contactedBy': {'intendedBuyer': mongoose.Types.ObjectId(req.payload.id)}}})
	    .then((data)=>{
	    	console.log(chalk.green("Owner notified"))
	    	// mark as contacted to the current user
	    	User.update({ _id: mongoose.Types.ObjectId(req.payload.id)}, 
	    				{$push: {'contactedOwner': {'propertyId': mongoose.Types.ObjectId(req.body.propertyId)}}})
	    				.then((data)=>{
	    					return res.status(201).json({result : true, status :{message : statusMessage.SUCCESS}})
	    				}).catch((error)=>{
	    					return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
	    				})
		}).catch((error)=>{
			console.log(chalk.red(error))
			return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
		})
})



/**
* PUT /user/respondToContacter => Send a connect request to the owner of a property (marked for sale)
* @method PUT
* RETURNS updated user object
*/


router.put('/respondToContacter', auth.required, function(req, res){
	console.log(chalk.green("PUT /user/respondToContacter"))
	// send response to the contacter with responding status (approved/not)
	var ownersContact = null
	User.find({_id : req.payload.id}, {email : 1}).then((user)=>{
		if(req.body.approved){
			ownersContact = user[0].email
		}
		console.log("CONSENT ", req.body.approved)
		console.log(ownersContact)
		User.update({'_id' : mongoose.Types.ObjectId(req.body.contacter), 'contactedOwner.propertyId' : mongoose.Types.ObjectId(req.body.propertyId)},
				 {$set : {'contactedOwner.$.ownerApproved' : req.body.approved, 'contactedOwner.$.ownerResponded' : true, 'contactedOwner.$.ownersContact' : ownersContact}})
		.then((data)=>{
			console.log(chalk.green("Successfully notified the contacter"))
			// mark for current user as responded with respnding status (approved/not)
			User.update({'_id' : mongoose.Types.ObjectId(req.payload.id)},
						{$set : {'owns.$[i].contactedBy.$[j].responded' : true, 'owns.$[i].contactedBy.$[j].repliedWith' : req.body.approved}},
						{arrayFilters : [{'i.property': mongoose.Types.ObjectId(req.body.propertyId)},{'j.intendedBuyer' : mongoose.Types.ObjectId(req.body.contacter)}]})
			.then((data)=>{
				console.log(chalk.green("Successfully marked as notified"))
				return res.status(201).json({result : true, status :{message : statusMessage.SUCCESS}})
			}).catch((error)=>{
				console.log(chalk.red(error))
				// undo above query
				return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
			})
		}).catch((error)=>{
			console.log(chalk.red(error))
			return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
		})

	}).catch((error)=>{
		console.log(chalk.red(error))
		return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
	})
})

function initialize(){
	var user = User.find({_id : req.payload.id})
}
// router.put('/respondToContacter', auth.required, function(req, res){
// 	console.log(chalk.green("PUT /user/respondToContacter"))
// 	// send response to the contacter with responding status (approved/not)
// 	User.update({'_id' : mongoose.Types.ObjectId(req.body.contacter), 'contactedOwner.propertyId' : mongoose.Types.ObjectId(req.body.propertyId)},
// 				 {$set : {'contactedOwner.$.ownerApproved' : req.body.approved, 'contactedOwner.$.ownerResponded' : true}})
// 	.then((data)=>{
// 		console.log(chalk.green("Successfully notified the contacter"))
// 		// mark for current user as responded with respnding status (approved/not)
// 		User.update({'_id' : mongoose.Types.ObjectId(req.payload.id)},
// 					{$set : {'owns.$[i].contactedBy.$[j].responded' : true, 'owns.$[i].contactedBy.$[j].repliedWith' : req.body.approved}},
// 					{arrayFilters : [{'i.property': mongoose.Types.ObjectId(req.body.propertyId)},{'j.intendedBuyer' : mongoose.Types.ObjectId(req.body.contacter)}]})
// 		.then((data)=>{
// 			console.log(chalk.green("Successfully marked as notified"))
// 			return res.status(201).json({result : true, status :{message : statusMessage.SUCCESS}})
// 		}).catch((error)=>{
// 			console.log(chalk.red(error))
// 			// undo above query
// 			return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
// 		})
// 	}).catch((error)=>{
// 		console.log(chalk.red(error))
// 		return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
// 	})
// })



module.exports = router