var jwt = require('jsonwebtoken');
var _ = require('lodash');

const SECRET = process.env.SECRET || 'DatSuperDevSecret';

exports.validateToken = function(token){
	try {
	  jwt.verify(token, SECRET);
	} catch(err) {
	  return false
	}
	return true;
}

exports.issueToken = function(payload){
	return jwt.sign(JSON.stringify(payload), SECRET);
}

exports.getPayload = function(token){
	return jwt.decode(token);
}

exports.getRoles = function(token){
	return jwt.decode(token).roles;	
}