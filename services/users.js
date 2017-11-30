var moment = require('moment');

var encrypt = require('../resources/encrypt');
var jwt = require('../resources/jwt');
var users = require('../resources/db')('users');
var sessions = require('./sessions');

exports.authenticateUser = function (username, password){

	return sessions.getSession(username).then((session) => {
		if(session && session.sessionexp >= moment().unix()) {
			sessions.bumpSessionTimeout(username);
			return {status:200, success:true, message:'Authenticated.', token:session.token};
		}
		else {
			sessions.removeSession(username);
			return users.findOne({username:username}, {}).then((user,err) => {
				if (err) return { status: 500, success:false, message: "Server Error."};
				if (!user) {
			      return { status: 401, success: false, message: 'Authentication failed.' };
			    } else {
			    	if (encrypt.checkPass(password,user.password) && !user.removed) {

				        var tokenJson = {
				      		id:user._id,
				      		username:user.username,
				      		firstname:user.firstname,
				      		lastname:user.lastname,
				      		email:user.email,
				      		roles:user.roles,
				      		lastLogin:user.lastLogin
				      	}
				      	var token = jwt.issueToken(tokenJson);
				      	sessions.setSession(username, token);
				      	setLastLogin(username);

				        return {
				        		status: 200,
					          success: true,
					          message: 'Authenticated.',
					          token: token
					        };
				      } else {
				      	return { status: 401, success: false, message: 'Authentication failed.' };
				      }
			    }
			});
		}
	});
}

exports.createUser = function(user){
	return users.find({username:user.username},{}).then((userlist, err) => {
		if (err) return { status: 500, success:false, message: "Server Error."};
		else {
			if (userlist.length > 0) return { status: 400, success:false, message: "Username already in use."};
			else {
				user.password = encrypt.hashPass(user.password);
				return users.insert(user).then((user, err) => {
					delete user.password;
					if (err) return { status: 500, success:false, message: "Server Error."};
					else return {status:201, success:true, user:user};
				});
			}
		}
	});
}

exports.saveUser = function(id, user){
	delete user.username;
	if(user.password) user.password = encrypt.hashPass(user.password);
	return users.findAndModify({_id:id}, {'$set':user}, {new: true}).then((user, err) => {
		if (err) return { status: 500, success:false, message: "Server Error."};
		else {
			delete user.password;
			return {status:200, success:true, user:user}
		};
	});
}

exports.getUser = function(id){
	return users.findOne({_id:id},{fields : { password:0}}).then((user, err) => {
		if (err) return { status: 500, success:false, message: "Server Error."};
		else {
			return {status: 200, success:true, user:user};
		}
	});
}

exports.getUserList = function(query){
	return users.find(query,{fields : { _id:1, username:1}}).then((userlist, err) => {
		if (err) return { status: 500, success:false, message: "Server Error."};
		else {
			return {status: 200, success:true, userlist:userlist};
		}
	});
}

exports.setLastLogin = function(id){
	users.update({_id:id},{
		 $set: {
        'removed': true
     }
	});
}


function setLastLogin(username){
	users.update({username:username},{
		 $set: {
        'lastLogin': moment().unix()
     }
	});
}