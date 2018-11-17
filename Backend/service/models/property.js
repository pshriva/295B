var mongoose = require('mongoose')
schema = mongoose.Schema
propertySchema = new schema({
	owner : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'User',
		required : true
	},
	transactionHash : {
		type : String,
		index : true,
		unique : true,
		required : true
	},
	description : String,
	images : [{url : String}],
	forSale : {
		type : Boolean,
		default : false
	},
	SellingPrice : String,
	measurement : {
		length : {
			type : Number,
			required : true
		},
		breadth : {
			type : Number,
			required : true
		},
		measuredIn :{
			type : String,
			default : 'feet'
		}
	},
	address : {
		street : {
			type : String,
			required : true
		},
		city : {
			type : String,
			required : true
		},
		state : {
			type : String,
			required : true
		},
		country : {
			type : String,
			required : true
		},
		zip : {
			type : Number,
			required : true
		}
	}
})

Property = mongoose.model('Property', propertySchema)
module.exports = Property