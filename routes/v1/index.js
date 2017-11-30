var router = require('express').Router();

var auth = require('./auth');
var users = require('./users');

var jwt = require('../../resources/jwt');
var sessions = require('../../services/sessions');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).json({message:'OK'});
});

router.use('/auth', auth);

router.use(function(req, res, next){
	if(req.get('x-access-token')){
		if (jwt.validateToken(req.get('x-access-token'))) {
			req.token = jwt.getPayload(req.get('x-access-token'));
			next();
		}
		else res.status(404).json();
	} 
	else res.status(404).json();
});

router.use(function(req, res, next){
	sessions.validateSession(req.get('x-access-token')).then((status) => {
		if (status) next();
		else res.status(404).json();
	});
});

router.use('/users', users);

module.exports = router;
