const { MongoClient, ObjectID } = require('mongodb');	// require the mongodb driver

/**
 * Uses mongodb v3.6+ - [API Documentation](http://mongodb.github.io/node-mongodb-native/3.6/api/)
 */
function Database(mongoUrl, dbName){
	if (!(this instanceof Database)) return new Database(mongoUrl, dbName);
	this.connected = new Promise((resolve, reject) => {
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) reject(err);
				else {
					console.log('[MongoClient] Connected to ' + mongoUrl + '/' + dbName);
					resolve(client.db(dbName));
				}
			}
		)
	});
	this.status = () => this.connected.then(
		db => ({ error: null, url: mongoUrl, db: dbName }),
		err => ({ error: err })
	);
} 

Database.prototype.getRooms = function(){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatrooms from `db`
			 * and resolve an array of chatrooms */

			db.collection("chatrooms").find({}).toArray()
				.then((result) => {
					resolve(result);
					console.log(result);
				})
				.catch((error) => {
					reject(error);
				})
		})
	)
}

Database.prototype.getRoom = function(room_id){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatroom from `db`
			 * and resolve the result */
			let room = {};
			let id;

			try{
				id = ObjectID(room_id)
			} catch(error){
				id = room_id;
			}

			console.log('------------------- INSIDE db.getRoom ----------------');

			console.log('room_id:');
			console.log(room_id);

			db.collection("chatrooms").find({"_id": id}).toArray()
			  .then((result) => {
				  console.log('Result:');
				  console.log(result);

				  result.forEach((res) => {
					  console.log('Res:');
					  console.log(res);
					  resolve(res);
					  
				  })

				resolve(null);
			  })
			  .catch(() => {
				  resolve(null);
			  })

		})
	)
}

Database.prototype.addRoom = function(room){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			/* TODO: insert a room in the "chatrooms" collection in `db`
			 * and resolve the newly added room */

			 if(room.name){
				db.collection("chatrooms").insertOne(room);

				db.collection("chatrooms").find({"name": room.name}).toArray()
					.then((result) => {
						resolve(result[0]);
					})
					.catch((err) => {
						reject(err);
					})
			 } else{
				 reject(err);
			 }
		})
	)
}

Database.prototype.getLastConversation = function(room_id, before){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read a conversation from `db` based on the given arguments
			 * and resolve if found */

			var bef;
			var diff;
			var minDiff = {
				diff: 1000000,
				timestamp: null,
				id: null,
			}
			

			if(!before){
				bef = Date.now();
			} else{
				bef = before;
			}

			db.collection("conversations")
					.find({"room_id": room_id})
					.toArray()
					.then((result) => {		

						result.forEach((res) => {
							diff = bef - res.timestamp;

							if(diff > 0){
								if(diff < minDiff.diff){									
										minDiff.diff = diff;
										minDiff.timestamp = res.timestamp;
										minDiff.id = res._id;
									}
							}
						});

						result.forEach((res) => {
							if((res._id == minDiff.id)){
								resolve(res);
							}
						})

						resolve(null);
						
					})
					.catch((err) => {
						reject(err);
					})

		})
	)
}

Database.prototype.addConversation = function(conversation){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: insert a conversation in the "conversations" collection in `db`
			 * and resolve the newly added conversation */

			var roomId = conversation.room_id;
			var timeSt = conversation.timestamp;
			var msg = conversation.messages

			if(roomId && timeSt && msg){
				db.collection("conversations").insertOne(conversation);	

				db.collection("conversations")
					.find({"room_id": roomId})
					.toArray()
					.then((result) => {		
						
						result.forEach((res) => {
							if(res.timestamp == timeSt){
								resolve(res);
							}
						})

						resolve(null);
						
					})
					.catch((err) => {
						reject(err);
					})
			 } else{
				 reject(err);
			 }

					

		})
	)
}

module.exports = Database;