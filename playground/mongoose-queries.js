const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


var id = "59522a2f38f8966233af21a2111";

if (!ObjectID.isValid(id)) {

}


var userId = "595115fe480f6a3b30ad4708";

User.findById(userId).then((user) => {
	if (!user) {
		return console.log('User not found');
	}

}).catch((e) => {

});