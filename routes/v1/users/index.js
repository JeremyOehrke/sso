var router = require('express').Router();

var jwt = require('../../../resources/jwt');
var users = require('../../../services/users');

router.get('/', function(req, res){
	if(req.query.username){
		var query = {username:req.query.username};
		users.getUserList(query).then((resp) => {
			res.status(resp.status);
			if (resp.success) res.json(resp.userlist);
			else res.json({message:resp.message});
		});
	} else {
		users.getUserList({}).then((resp) => {
			res.status(resp.status);
			if (resp.success) res.json(resp.userlist);
			else res.json({message:resp.message});
		});
	}
});

router.get('/:id', function(req, res){
	users.getUser(req.params.id).then((resp) => {
		res.status(resp.status)
		if (resp.status != 200) res.json();
		else {
			res.json(resp.user);
		}
	})
});

router.use('/:id', function(req, res, next){
	if(req.token.roles.super || req.params.id == req.token.id) next();
	else {
		if (!req.token.roles.admin) res.status(404).json();
		else {
			users.getUser(req.params.id).then((resp) => {
				if (resp.user.roles.super) res.status(404).json();
				else next();
			});
		}
	}
});

router.post('/:id', function(req, res){
	users.saveUser(req.params.id, req.body).then((resp) => {
		res.status(resp.status);
		if (resp.success) res.json(resp.user);
		else res.json();
	});
});

router.use(function(req, res, next){
	if(req.token.roles.super || req.token.roles.admin) next();
	else res.status(404).json();
});

router.put('/', function(req, res){
	users.createUser(req.body).then((resp) => {
		res.status(resp.status);
		if (resp.success) res.json(resp.user);
		else res.json({message:resp.message});
	});
});


module.exports = router;
