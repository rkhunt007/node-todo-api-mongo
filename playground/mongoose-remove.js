const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


Todo.findByIdAndRemove('596374ef80288511f33adcd9')
	.then((todo) => {
	
	})

Todo.findOneAndRemove({_id: '596374ef80288511f33adcd9'})
	.then((todo) => {

	})