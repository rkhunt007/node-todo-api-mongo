var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/TodoApp';

mongoose.promise = global.promise;
mongoose.connect(process.env.MONGODB_URI || url);

module.exports = {
	mongoose
};