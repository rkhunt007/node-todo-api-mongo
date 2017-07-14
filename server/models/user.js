const mongoose = require('mongoose');
/* 
	For this we install validor npm package
	Ref: https://www.npmjs.com/package/validator
*/
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

/*
	For more Mongoose validation go to http://mongoosejs.com/docs/validation.html
*/

// To create custom model methods
var UserSchema = new mongoose.Schema({
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

UserSchema.methods.toJSON = function () {
	var user = this;
	var userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'secret').toString();
	
	user.tokens.push({access, token});

	return user.save().then(() => {
		return token;
	})
};

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};
