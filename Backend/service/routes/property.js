var Property = require('../models/property')
var User = require('../models/user')
var router = require('express').Router()
var statusMessage = require('../config/statusMessage')
var auth = require('../config/auth')
var chalk = require('chalk')
// TO convert incoming request type from original to the one set in the header
// router.use((req,res,next)=>{
// 	console.log(req.headers)
//         if(req.headers['x-http-method-override']){
//         	console.log("Change found")
//             req.method = req.headers['x-http-method-override'];
//         }
//         next()
//     })

/**
* Get /property/getProperties.  => return the properties owned by the requested user
* @method GET
* REQUIRED user id
* RETURNS Properties details
*/
router.get('/getProperties', auth.required, function(req, res){
	console.log(chalk.green("Get /property/getProperties"))
	console.log(chalk.green(req.payload.id))
	User.aggregate([{$match : {'_id' : mongoose.Types.ObjectId(req.payload.id)}},{
		$lookup : {
			from : 'properties',
			localField : '_id',
			foreignField : 'owner',
			as :'ownsProperties'
		}
	}]).then((data) =>{
		console.log(data[0].ownsProperties)
		return res.status(200).json({result : true, properties : data[0].ownsProperties})
	}).catch((error)=>{
		console.log(chalk.red(error))
		return res.status(500).json({result : false, status: {message : statusMessage.SERVER_SIDE_ERROR}})
	})
})


/**
 * GET /property/forSale ->Returns all the properties that are marked for sale and are not owned by the current user
 * @method GET
 * @returns Property[]
 */
router.get('/forSale', auth.required, function(req, res){
	console.log(chalk.green("Get /property/forSale"))
	console.log(chalk.green(req.payload.id))
	Property.find({forSale : true, owner : {$ne : req.payload.id}}).then((property)=>{
		console.log(chalk.green("Start : Response"))
		console.log(property)
		console.log(chalk.green("End : Response"))
		return res.status(200).json({result : true, properties : property})
	}).catch((error)=>{
		console.log(chalk.red("Start : Error"))
		console.log(error)
		console.log("End : Error")
		return res.status(500).json({result : false, status : {messsage : statusMessage.SERVER_SIDE_ERROR}})
	})
})


/**
 * GET /property/forSale/city/:city ->Returns all the properties that are marked for sale,
 * have given city and are not owned by the current user
 * @method GET
 * @returns Property[]
 */
router.get('/forSale/city/:city', auth.required,function(req, res){
	console.log(chalk.green("Get /property/forSale/city/"))
	console.log(chalk.green(req.params.city))
	Property.find({forSale : true, owner : {$ne : req.payload.id}, "address.city" : req.params.city}).then((property)=>{
		console.log(chalk.green("Start : Response"))
		console.log(property)
		console.log(chalk.green("End : Response"))
		return res.status(200).json({result : true, properties : property})
	}).catch((error)=>{
		console.log(chalk.red("Start : Error"))
		console.log(error)
		console.log("End : Error")
		return res.status(500).json({result : false, status : {messsage : statusMessage.SERVER_SIDE_ERROR}})
	})
})



/**
 * GET /property/forSale/<Zipcode> ->Returns all the properties that are marked for sale,
 * have given zipcode and are not owned by the current user
 * @method GET
 * @returns Property[]
 */
router.get('/forSale/zip/:zipcode', auth.required,function(req, res){
	console.log(chalk.green("Get /property/forSale/zip/"))
	console.log(chalk.green(req.params.zipcode))
	Property.find({forSale : true, owner : {$ne : req.payload.id}, "address.zip" : req.params.zipcode}).then((property)=>{
		console.log(chalk.green("Start : Response"))
		console.log(property)
		console.log(chalk.green("End : Response"))
		return res.status(200).json({result : true, properties : property})
	}).catch((error)=>{
		console.log(chalk.red("Start : Error"))
		console.log(error)
		console.log("End : Error")
		return res.status(500).json({result : false, status : {messsage : statusMessage.SERVER_SIDE_ERROR}})
	})
})


/**
*POST /property/interested -> Marks the property as interested to the User for future reference for purchasing options
*@method POST
*returns operation status
*/
// Also saving the properties that do not even exist - check it later
router.put('/interested', auth.required, function(req, res){
	console.log(chalk.green("Post /property/interested"))
	console.log(req.body)
	console.log("User id ", req.payload.id)
	User.update({_id : req.payload.id}, {$push : {favorite : {propertyId : req.body.propertyId}}}).then((user)=>{
		console.log(chalk.green("Successfully marked as interested"))
		return res.status(200).json({result : true, status : {message : statusMessage.SUCCESS}})
	}).catch((error)=>{
		console.log(chalk.red("Error occured as"))
		console.log(chalk.red(error))
		return res.status(500).json({result : false, status : {message : statusMessage.SERVER_SIDE_ERROR}})
	})
})

/**
*POST /property/notInterested -> Marks the property as interested to the User for future reference for purchasing options
*@method POST
*returns operation status
*/
router.put('/notInterested', auth.required, function(req, res){
	console.log(chalk.green("Post /property/notInterested"))
	console.log(req.body)
	User.update({_id : req.payload.id}, {$pull : {favorite : {propertyId : req.body.propertyId}}}).then((user)=>{
		console.log(chalk.green("Successfully marked as uninterested"))
		return res.status(200).json({result : true, status : {message : statusMessage.SUCCESS}})
	}).catch((error)=>{
		console.log(chalk.red("Error occured as"))
		console.log(chalk.red(error))
		return res.status(500).json({result : false, status : {message : statusMessage.SERVER_SIDE_ERROR}})
	})
})


/**
*GET /property/:id -> Returns the deatails of a Property provided its id
*@method POST
*returns operation status
*/
router.get('/:id', auth.required, function(req, res){
	console.log(chalk.green("GET /property/:id"))
	console.log(chalk.green(req.params.id))
	Property.find({_id : req.params.id}).then((property)=>{
		console.log(chalk.green("Successfully found the property details"))
		if(property == null || property == ''){
			return res.status(200).json({result : false, status : {message : statusMessage.NOT_FOUND}})
		}
		return res.status(200).json({result : true, property : property[0]})
	}).catch((error)=>{
		console.log(chalk.red("Error"))
		console.log(chalk.red(error))
		if(error.name == 'CastError'){
			return res.status(200).json({result : false, status : {message : statusMessage.NOT_FOUND}})
		}
		return res.status(500).json({result : false, status : {message : statusMessage.SERVER_SIDE_ERROR}})
	})
})


//  This api is only for the development purpose to add the property data to the database and corresponding owner information
router.post('/save', function(req, res){
	var property = new Property({
		owner : req.body.owner,
		transactionHash : req.body.transactionHash,
		description : req.body.description,
		forSale : req.body.forSale,
		sellingPrice : req.body.sellingPrice,
		measurement : {
			length : req.body.measurement.length,
			breadth : req.body.measurement.breadth
		},
		address : {
			street : req.body.address.street,
			city : req.body.address.city,
			state : req.body.address.state,
			zip : req.body.address.zip,
			country : req.body.address.country
		}
	})
	property.save(function(error, property){
		if(error){
			console.log("Could not save")
			console.log(error.message)
			res.send("Error while saving the property")
		}
		console.log(chalk.green("Property is "))
		console.log(property)
		console.log(property._id)
		User.update({_id : mongoose.Types.ObjectId(req.body.owner)}, {$push : {owns : {property : mongoose.Types.ObjectId(property._id)}}}, function(err, info){
			if(err){
				res.send("Cannot update to user")
			}
			else{
				res.send("Property saved and user updated") 
			}
		})
	})
})

// router.post('/updateUser', function(req, res){
// 	console.log(req.body)

// })

module.exports = router