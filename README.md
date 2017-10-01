# node-todo-api-mongo
 
 This is CRUD APIs using todos samples. Also contains login/signup JWT authentication APIs.
 
 Technology stack:
 Node.js
 Express.js
 MongoDB
 
 Deployed on heroku on below URL.
 
 https://marvelous-kenai-fjords-86013.herokuapp.com

 Following are the APIs.
 
 There will be 2 collections: users and todos

 POST /users : will create a user with email and password and return auth token.
 GET /users/me : will verify if user logged in (for dev only).
 POST /users/login : will login with email and password and return auth token.
 DELETE /users/me/token: delete auth token for logging out.

GET /todos : will return the todos created by specific user. need to send auth token.
POST /todos : will save todo in the database for the specific user. need to send auth token and todo text.
GET /todos/id : will return a todo by id. need to send auth token.
DELETE /todos/id : will delete a todo by id. need to send auth token.
PATCH /todos/id: will update a todo by id. need to send auth token and todo text to be updated.
