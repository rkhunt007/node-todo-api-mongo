var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

const {ObjectID} = require('mongodb');

const port = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json())

app.post('/todos', (req, res) => {
	var newTodo = new Todo({
		text: req.body.text
	});

	newTodo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});



app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({
			todos
		})
	}, (e) => {
		res.status(400).send(e);
	})
});

// GET /todos/12345 
app.get('/todos/:id', (req, res) => {
	var id = req.params.id
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Invalid Id");
	}
	Todo.findById(id).then((todo) => {
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

app.delete('/todos/:id', (req, res) => {
	var id = req.params.id
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Invalid Id");
	}
	Todo.findByIdAndRemove(id)
	.then((todo) => {
		if (!todo) {
			res.status(404).send("No todo found");
		}
		res.send({todo});
	}).catch( (e) => {
		res.status(400).send("Error while finding todo");
	});
})

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