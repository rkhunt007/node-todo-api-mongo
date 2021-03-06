/*jshint esversion: 6 */

const mongoose = require('mongoose');
/* 
	For this we install validor npm package
	Ref: https://www.npmjs.com/package/validator
*/
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

/*
	For more Mongoose validation go to http://mongoosejs.com/docs/validation.html
*/

// To create custom model methods
var UserSchema = new mongoose.Schema(
	{
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
	}, { usePushEach: true }
);

UserSchema.methods.toJSON = function () {
	var user = this;
	var userObject = user.toObject();

	return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({ _id: user._id.toHexString(), access: access }, process.env.JWT_SECRET).toString();
	user.tokens.push({ access, token });
	return user.save().then(() => {
		return token;
	});
};

UserSchema.methods.removeToken = function (token) {
	var user = this;
	return user.updateOne({
		$pull: {
			tokens: { token }
		}
	});
};

// This is a model method
UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (e) {
		return Promise.reject();
	}
	return User.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.statics.findByCredentials = function (email, password) {
	var User = this;
	return User.findOne({ email }).then((user) => {
		if (!user) {
			return Promise.reject();
		}
		return new Promise((resove, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					resove(user);
				} else {
					reject();
				}
			});
		});
	});
};

/*
	Here we are using mongoose middleware to perform some operation
	before saving the data to database.
	Ref. http://mongoosejs.com/docs/middleware.html
*/
UserSchema.pre('save', function (next) {
	var user = this;
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	} else {
		next();
	}
});

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};
