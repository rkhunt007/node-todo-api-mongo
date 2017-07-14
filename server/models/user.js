const mongoose = require('mongoose');
/* 
	For this we install validor npm package
	Ref: https://www.npmjs.com/package/validator
*/
const validator = require('validator');

/*
	For more Mongoose validation go to http://mongoosejs.com/docs/validation.html
*/
var User = mongoose.model('User', {
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		require: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

module.exports = {
	User
};