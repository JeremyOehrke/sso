//Mongo Init script
db = connect("localhost:27017/userdb");

if(db.users.find({username:"admin"}).count() == 0 ){
	db.users.insert(
	{ "username" : "admin", 
	"password" : "$2a$10$bfoeKCpdG5gRqEQifJqAo.bILj47Za65tV3QNHUfon/C8f87SAIAi", 
	"email" : "johnsmith@dummy.com", "roles" : {super:true, admin:true, user:true, client:true}, 
	"fullname" : "John Smith"}
	);
} else{
	print('DB Already Initialized.');
}

