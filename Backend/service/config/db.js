var config = require('./config')

mongoose = require('mongoose')
// dbURI = process.env.MONGODB_URI
// console.log("Connection to Mongodb - " + dbURI)
dbURI = config['dbURI']
console.log("Connecting to mongo db")
mongoose.connect(dbURI, {useNewUrlParser: true})

// On successful connection
mongoose.connection.on('connected', function(){
	console.log("Connected to database at - ", dbURI)
})

mongoose.connection.on("error", function(err){
	console.log("Default database connection error ", err)
})

process.on('SIGINT', function(){
	mongoose.connection.close()
		console.log("Database connection terminated due to app termination")
		process.exit(0)
})

mongoose.connection.on("disconnected", function(){
	console.log("default database connection terminated")
})