var mongoose = require('mongoose')
var crypto = require('crypto')
var secret = require('../config/config').secret
var jwt = require('jsonwebtoken')
schema = mongoose.Schema
userSchema = new schema({
	email: {
		type : String,
		unique : true,
		lowercase : true,
		required : true,
		match : /\S+@\S+\.\S+/,
		index : true,
		trim : true
	},
	firstName : {
		type : String,
		required : true,
		trim : true
	},
	lastName : {
		type : String,
		required : true,
		trim : true
	},

	// List of Properties the user Owns
	owns : [{
		property : {
			type : mongoose.Schema.Types.ObjectId,
			ref : 'Property'
		},
		contactedBy : [
			{
				intendedBuyer : {
					type : mongoose.Schema.Types.ObjectId,
					ref : 'User'
				}, 
				responded : {
					type : Boolean,
					default :false
				},
				repliedWith : {
					type : Boolean,
					default :false
				}
			}
		]
		
	}],

	favorite : [{
		propertyId : {
			type : mongoose.Schema.Types.ObjectId,
			ref : 'Property'
		}
	}],

	// If a person is interested in a property, he could mark it for later evaluation
	contactedOwner : [{
		propertyId : {
			type : mongoose.Schema.Types.ObjectId,
			ref : 'Property'
		},
		ownerResponded : {
			type :Boolean,
			default : false
		},
		ownerApproved : {
			type :Boolean,
			default : false
		},
		ownersContact : {
			type : String,
			default : null
		}
	}],
	gender : String,
	phoneNo : String,
	address : String, 
	salt : String,
	hash : String
})

userSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex')
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
}

userSchema.methods.validatePassword = function(password){
	const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex')
	return this.hash == hash
}

userSchema.methods.generateJWT = function(){
    // return jwt.sign({id: this._id, email: this.email, exp: 86400}, secret)
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 1); //expiry set to 1 day for now-> to test if expiry works

    return jwt.sign({
        id: this._id,
        email: this.email,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
}

userSchema.methods.toAuthJSON = function(){
	return {
		_id : this.id,
		email : this.email,
		firstName : this.firstName,
		lastName : this.lastName,
		gender : this.gender,
		phoneNo : this.phoneNo,
		address : this.address,
		token : this.generateJWT()
	}
}

User = mongoose.model('User', userSchema)
module.exports = User