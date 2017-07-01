const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


var id = "59522a2f38f8966233af21a2111";

if (!ObjectID.isValid(id)) {
	// return console.log('Id not valid');
}

// Todo.find({
// 	_id: id
// }).then((todos) => {
// 	console.log('Todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then((todos) => {
// 	console.log('Todos', todos);
// });

// Todo.findById(id).then((todos) => {
// 	if (!todos) {
// 		return console.log('id not found');
// 	}
// 	console.log('Todos', todos);
// }).catch((e) => {
// 	console.log('error', e);
// });


var userId = "595115fe480f6a3b30ad4708";

User.findById(userId).then((user) => {
	if (!user) {
		return console.log('User not found');
	}
	console.log('user', user);
}).catch((e) => {
	console.log('error', e);
});