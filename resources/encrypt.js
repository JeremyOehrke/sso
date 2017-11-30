var bcrypt = require('bcryptjs');

exports.hashPass = function(pass){
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(pass, salt);
	console.log('Hash: ' + hash);
	return hash;
}

exports.checkPass = function(pass, hash){
	return bcrypt.compareSync(pass, hash);
}
