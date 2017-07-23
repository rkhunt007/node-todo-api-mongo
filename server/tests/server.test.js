const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectID} = require('mongodb');
var {User} = require('./../models/user');
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

describe('GET /users/me', () => {
	it('shoud return user if authenticated', (done) => {
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

describe('POST /users', () => {
	it('shoud create a user', (done) => {
		var email = "tom@test.com";
		var password = "123abcd";
		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if (err) {
					return done(err);
				}

				User.findOne({email}).then((user) => {
					expect(user).toExist();
					expect(user.password).toNotBe(password);
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
	it('shoud login a user and return valid auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toExist();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens[0]).toInclude({
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
				expect(res.headers['x-auth']).toNotExist();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens.length).toBe(0);
					done();
				}).catch((e) => done(e));
			});
	});

});

describe('DELETE /users/me/token', () => {
	it('shoud remove auth token on logout', (done) => {
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
