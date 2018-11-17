var jwt = require('express-jwt')
var secret = require('./config').secret

function getTokenFromHeader(req){
	console.log()
	if(req.headers.authorization && req.headers.authorization.split(' ')[0] == 'Bearer'){
		return req.headers.authorization.split(' ')[1]
	}
	return null
}
var auth = {
	required : jwt({
		secret : secret,
		userProperty : 'payload',
		getToken : getTokenFromHeader
	}),
	ok : "ok",
	optional : jwt({
		secret : secret,
		userProperty : 'payload',
		credentialsRequired : false,
		getToken : getTokenFromHeader
	})
} 
module.exports = auth
