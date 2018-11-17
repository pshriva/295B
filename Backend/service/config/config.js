var env = process.env.NODE_ENV || 'development'
config = {}
console.log("******* CONFIF FILE******")
if (env === 'development') {
    //local env
    config = {
    	'port' : 3000,
    	'host' : "localhost",
    	'dbURI' : 'mongodb://localhost:27017/blockchainbackapp',
    	'secret' : 'blockchainbackapp'
    }
    
}
module.exports = config