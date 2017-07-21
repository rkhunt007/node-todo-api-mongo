const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('shoud create a new todo', (done) => {
		var text = "test todo text";
		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});

	it('shoud not create with invalid data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find().then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});
});

describe('GET /todos', () => {
	it('shoud get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			}) 
			.end(done);
	});
});



describe('GET /todos/:id', () => {
	it('shoud return a todo', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			}) 
			.end(done);
	});

	it('shoud return 404 if todo not found', (done) => {
		var id = new ObjectID();
		request(app)
			.get(`/todos/${id}`)
			.expect(404)
			.expect((res) => {
				expect(res.text).toBe("No todo found");
			})
			.end(done);
	});

	it('shoud return 404 for non object ids', (done) => {
		request(app)
			.get(`/todos/123`)
			.expect(404)
			.expect((res) => {
				expect(res.text).toBe("Invalid Id");
			})
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('shoud remove a todo', (done) => {
		request(app)
			.delete(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(todos[0]._id.toHexString());
			}) 
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(todos[0]._id.toHexString()).then((todos) => {
					expect(todos).toNotExist()
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});

});