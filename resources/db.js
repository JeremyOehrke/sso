var db = require('monk')('localhost/userdb');

module.exports = function(collection){
	return db.get(collection);
}

