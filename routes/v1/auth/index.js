var router = require('express').Router();

var encrypt = require('../../../resources/encrypt');
var users = require('../../../services/users');
var sessions = require('../../../services/sessions');

var jwt = require('../../../resources/jwt');

router.get(['/','/login'], function(req, res, next) {
  res.status(200).json({message:'OK'});
});

router.post(['/','/login'], function(req, res){
	users.authenticateUser(req.body.username,req.body.password).then((msg) => {
		res.status(msg.status).json(msg);
	});
});


router.use(function (req, res, next) {
	if(req.get('x-access-token')){
		if(jwt.validateToken(req.get('x-access-token'))) next();
		else res.status(401).json({message:'Unauthorized.'});
	} else {
		res.status(401).json({authorized:false});
	}
});

router.get('/logout', function(req, res){
	sessions.removeSession(jwt.getPayload(req.get('x-access-token')).username);
	res.status(204).json();
});

router.get('/auth', function(req, res){
	sessions.validateSession(req.get('x-access-token')).then((valid) => {
		if (valid) {
			sessions.bumpSessionTimeout(jwt.getPayload(req.get('x-access-token')).username);
			res.status(200).json({authorized:true});
		} else {
			res.status(401).json({authorized:false});
		}
	});
});

module.exports = router;
