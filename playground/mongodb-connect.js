const MongoClient = require('mongodb').MongoClient;
// ABove line can be replaced with below line
// const {MongoClient, ObjectID} = require('mongodb');


const {ObjectID} = require('mongodb');
var obj = new ObjectID();
console.log(obj);

// Connection URL 
var url = 'mongodb://localhost:27017/myproject';
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
	if (err) {
		return console.log("Error connecting to server");
	}
	console.log("Connected correctly to server");

	// insertDocument(db);
	// insertDocuments(db);
	findDocuments(db);
	// findDocumentsCount(db)
	// deleteDocument(db);
	// findOneAndDeleteDocument(db);
	// updateDocument(db);
	findOneAndUpdateDocument(db);
 
  db.close();
});

var insertDocument = function(db) {
  // Get the documents collection 
  var collection = db.collection('myproject');
  // Insert some documents 
  collection.insertOne({
  	name: "Rahul",
  	age: 17
  }, function(err, result) {
  	if (err) {
		return console.log("Error Inserting document");
	}
    console.log("Inserted document into the document myproject");
  });
}

var insertDocuments = function(db) {
  // Get the documents collection 
  var collection = db.collection('myproject');
  // Insert some documents 
  collection.insertMany([
    {
  	name: "Rahul",
  	age: 17
  }, {
  	name: "Tom",
  	age: 17
  }, {
  	name: "Bob",
  	age: 17
  }
  ], function(err, result) {
  	if (err) {
		return console.log("Error Inserting documents");
	}
    console.log("Inserted 3 documents into the document collection");
  });
}

var findDocuments = function(db) {
  var collection = db.collection('myproject');
  collection.find({}).toArray(function(err, docs) {
  	if(err) {
  		return console.log("Error finding documents");
  	}
    console.log("Found the following records");
    console.log(JSON.stringify(docs, undefined, 2));
  });
}

var findDocumentsCount = function(db) {
  var collection = db.collection('myproject');
  collection.find({}).count(function(err, count) {
  	if(err) {
  		return console.log("Error finding documents count");
  	}
    console.log("Found the following records count");
    console.log(count);
  });
}

var deleteDocument = function(db) {
  var collection = db.collection('myproject');
  collection.deleteOne({ name: "Tom"}, function(err, result) {
  	if(err) {
  		return console.log("Error deleting documents");
  	}
    console.log("Removed the document with specified name");
  });
}

var findOneAndDeleteDocument = function(db) {
  var collection = db.collection('myproject');
  collection.findOneAndDelete({ name: "Rahul"}, function(err, result) {
  	if(err) {
  		return console.log("Error deleting documents");
  	}
    console.log(result);
  });
}

var updateDocument = function(db) {
  var collection = db.collection('myproject');
  collection.updateOne({ name: "Rahul"}
    , { $set: { age : 18 } }, function(err, result) {
	if(err) {
  		return console.log("Error deleting documents");
  	}
    console.log("Updated the document");
  });  
}

var findOneAndUpdateDocument = function(db) {
  var collection = db.collection('myproject');
  collection.findOneAndUpdate({ name: "Rahul"}
    , { $inc: { age : 2 } }, {returnOriginal: false}, function(err, result) {
	if(err) {
  		return console.log("Error updating documents");
  	}
    console.log("Updated the document" + result);
  });  
}