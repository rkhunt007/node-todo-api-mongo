const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
// 	console.log(result);
// })

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()


Todo.findByIdAndRemove('596374ef80288511f33adcd9')
	.then((todo) => {
		console.log(todo);	
	})

Todo.findOneAndRemove({_id: '596374ef80288511f33adcd9'})
	.then((todo) => {
		console.log(todo);	
	})