var moment = require('moment');

var sessions = require('../resources/db')('sessions');
var jwt = require('../resources/jwt');

const SESSION_EXPIRE_TIME = '80';


exports.getSession = function(username){
	return sessions.findOne({username:username}, {}).then((session, err) => {
		if (err) return false;
		else {
			if(!session) return false;
			else {
				return session;
			}
		}
	});
}

exports.setSession = function(username, token){
	var session = {
		username:username,
		token:token,
		authtime:moment().unix(),
		sessionexp:moment().add(SESSION_EXPIRE_TIME, 'minutes').unix()
	}
	sessions.insert(session);
}

exports.removeSession = function(username){
	sessions.remove({username:username});
}

exports.removeToken = function(token){
	sessions.remove({token:token});
}

exports.bumpSessionTimeout = function(username){
	sessions.update({username:username},{
		 $set: {
        'sessionexp': moment().add(SESSION_EXPIRE_TIME, 'minutes').unix()
     }
	});
}

exports.validateSession = function(token){
	return sessions.findOne({token:token},{}).then((session, err) => {
		if (err) return false;
		if (session) {
			if(session.sessionexp >= moment().unix()) return true;
			else {
				exports.removeToken(token);
				return false;
			}
		}
		else return false;
	});
}