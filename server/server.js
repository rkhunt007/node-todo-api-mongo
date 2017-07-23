var env = process.env.NODE_ENV || 'development';
console.log('::env ', env);
if (env === 'development') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

var express = require('express');
var bodyParser = require('body-parser');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

const {ObjectID} = require('mongodb');

const port = process.env.PORT;

var app = express();
app.use(bodyParser.json())

app.post('/todos', authenticate, (req, res) => {
	var newTodo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	newTodo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', authenticate, (req, res) => {
	Todo.find({
		_creator: req.user._id
	}).then((todos) => {
		res.send({
			todos
		})
	}, (e) => {
		res.status(400).send(e);
	})
});

// GET /todos/12345 
app.get('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Invalid Id");
	}
	Todo.findOne({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
		if (!todo) {
			res.status(404).send("No todo found");
		}
		res.send({
			todo
		})
	}, (e) => {
		res.status(400).send("Error while finding todo");
	})
});

app.delete('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Invalid Id");
	}
	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id
	})
	.then((todo) => {
		if (!todo) {
			res.status(404).send("No todo found");
		}
		res.send({todo});
	}).catch( (e) => {
		res.status(400).send("Error while finding todo");
	});
})


app.patch('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	var body =  _.pick(req.body, ['text', 'completed']);
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Invalid Id");
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate(
	{
		_id: id,
		_creator: req.user._id
	}, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
});

/* 
	Add user object to users collection (email, password)
*/
app.post('/users', (req, res) => {
	var body =  _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then((user) => {
		return user.generateAuthToken()
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(res.user);
});

/* 
	Login route
*/
app.post('/users/login', (req, res) => {
	var body =  _.pick(req.body, ['email', 'password']);
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send();
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	})
});

app.listen(port, () => {
	console.log(`started on port ${port}`);
});

var newTodo = new Todo({
	text: ""
});

var newUser = new User({
	email: "  rkhunt007@test.com"
});

module.exports = {
	app
};