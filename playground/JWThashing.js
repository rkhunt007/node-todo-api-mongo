/* 
	For this we install jsonwebtoken npm package
	Ref: https://www.npmjs.com/package/jsonwebtoken
*/
const jwt = require('jsonwebtoken');

var data = {
	id: 10
};

var token = jwt.sign(data, '123abc');

console.log(`Token: ${token}`);
/* 
	To know more about this token, copy it and go to jwt.io and paste this token
*/

var decoded = jwt.verify(token, '123abc');
console.log('Decoded: ', decoded);
