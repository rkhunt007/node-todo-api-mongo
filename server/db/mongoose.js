var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/TodoApp';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;
mongoose.connect(
    process.env.MONGODB_URI || url, { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('DB connected')
    });

module.exports = {
	mongoose
};