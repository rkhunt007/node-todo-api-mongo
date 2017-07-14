/* 
	For this we install crypto-js npm package
	Ref: https://www.npmjs.com/package/crypto-js
*/
const {SHA256} = require('crypto-js');

var msg = "I am user 1";
var hash = SHA256(msg).toString();

console.log(`Message: ${msg}`);
console.log(`Hash: ${hash}`);

var data = {
	id: 4
};
var token = {
	data,
	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
};

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
if (resultHash === token.hash) {
	console.log('Data was not changed');
} else {
	console.log('Data was changed');
}
/* 
	The above proces is a standard know as JSON Web Token (JWT)
*/
