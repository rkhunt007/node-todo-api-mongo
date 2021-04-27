const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { ObjectID } = require('mongodb');
var { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = "test todo text";
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({ text })
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find({ text }).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});

	it('should not create with invalid data', (done) => {
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
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
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return a todo', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	xit('should not return a todo created by other user', (done) => {
		request(app)
			.get(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});

	xit('should return 404 if todo not found', (done) => {
		var id = new ObjectID();
		request(app)
			.get(`/todos/${id}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.text).toBe("No todo found");
			})
			.end(done);
	});

	xit('should return 404 for non object ids', (done) => {
		request(app)
			.get(`/todos/123`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.text).toBe("Invalid Id");
			})
			.end(done);
	});
});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		request(app)
			.delete(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(todos[1]._id.toHexString());
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(todos[1]._id.toHexString()).then((todos) => {
					expect(todos).toBeFalsy()
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});

	it('should not remove a todo', (done) => {
		request(app)
			.delete(`/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findById(todos[0]._id.toHexString()).then((todo) => {
					expect(todo).toBeTruthy();
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = "tom@test.com";
		var password = "123abcd";
		request(app)
			.post('/users')
			.send({ email, password })
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body.body._id).toBeTruthy();
				expect(res.body.body.email).toBe(email);
			})
			.end((err) => {
				if (err) {
					return done(err);
				}
				User.findOne({ email }).then((user) => {
					expect(user).toBeTruthy();
					expect(user.password).not.toBe(password);
					done();
				}).catch((e) => done(e));
			});
	});

	it('should return validation errors if request invalid', (done) => {
		var email = "tomtest.com";
		var password = "bcd";
		request(app)
			.post('/users')
			.expect(400)
			.end(done);
	});

	it('should not create user if email in use', (done) => {
		var email = users[0].email;
		var password = "123abcd";
		request(app)
			.post('/users')
			.expect(400)
			.end(done);
	});

});

describe('POST /users/login', () => {
	it('should login a user and return valid auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens[1]).toMatchObject({
						access: 'auth',
						token: res.headers['x-auth']
					});
					done();
				}).catch((e) => done(e));
			});
	});

	it('should reject invalid login', (done) => {
		// var email = users[0].email;
		// var password = "123abcd";
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: 'test'
			})
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens.length).toBe(1);
					done();
				}).catch((e) => done(e));
			});
	});

});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[0]._id.toHexString()).then((user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch((e) => {
					done(e);
				})
			});
	});
});
