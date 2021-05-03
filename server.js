const path = require('path');
const fs = require('fs');
const express = require('express');
const cpen400a = require('./cpen400a-tester.js');
const WebSocket = require("ws");
const Database = require('./Database.js');

var broker = new WebSocket.Server({ port: 8000});

var db = new Database("mongodb://localhost:27017", "cpen400a-messenger");

var messageBlockSize = 10;

//Initialize messages object from db.getRooms
initMsg =  () => {
	var tempMsg = {};
	db.getRooms().then((rooms) => {
		rooms.forEach((room) => {
				let idnum = room._id;
				tempMsg[idnum] = [];
		},
		(error) => console.log(error));
	});
	return(tempMsg);
}

var messages = initMsg();


//Just for testing
async function checkRooms(){
	console.log('Checking the rooms')
	await db.getRooms().then((rooms) => {
		console.log(rooms);
	})
}

/*REFERENCE FOR OBJECT

Room = {
    "_id": String | ObjectId(String),
    "name": String,
    "image" : String
}

Message = {
    "username": String,
    "text": String
}

Conversation = {
    "_id": ObjectId(String),
    "room_id": String,
    "timestamp": Number,
    "messages": [ Message, Message, Message, ... ]
}
*/


broker.on('connection', (ws, client) => {
	ws.on("message", data => {
		var msgInfo = JSON.parse(data);
		var msgRoomId;

		msgRoomId = msgInfo.roomId;
		
		messages[msgRoomId].push({
			username: msgInfo.username,
			text: msgInfo.text
		});

		//If array is full, create a new conversation
		if(messages[msgRoomId].length == messageBlockSize){
			var convo = {
				"room_id": msgRoomId,
				"timestamp": Date.now(),
				"messages": messages[msgRoomId]
			}

			db.addConversation(convo).then((result) => {
				console.log('FROM ADD CONVERSATION');
				console.log(result)
			});

			messages[msgRoomId] = [];
		}
		

		console.log('CLIENT detected!'); 
		broker.clients.forEach((client) => {
			if(client !== ws && client.readyState === WebSocket.OPEN){
				client.send(data);
			}
		})		

		// ws.send(JSON.stringify(msgInfo));
	})
});

function logRequest(req, res, next){
	console.log(`${new Date()}  ${req.ip} : ${req.method} ${req.path}`);
	next();
}

const host = 'localhost';
const port = 3000;
const clientApp = path.join(__dirname, 'client');




// express app
let app = express();

app.use(express.json()) 						// to parse application/json
app.use(express.urlencoded({ extended: true })) // to parse application/x-www-form-urlencoded
app.use(logRequest);							// logging for debug

// serve static files (client-side)
app.use('/', express.static(clientApp, { extensions: ['html'] }));
app.route('/chat')
	.get((req, res, next) => {
		var returnRoom = []
		db.getRooms().then((result) => {
			result.forEach((room) => {
				returnRoom.push({
					"_id": room._id,
					"name": room.name,
					"image": room.image,
					"messages": messages[room._id]
				});
			});
			res.status(200).send(JSON.stringify(returnRoom));
		}, 
		(error) => console.log(error));
	})
	.post((req, res, next) => {
		roomBod = req.body;
		
		if(!roomBod.name){
			res.status(400).send('Error!');
		} else{
			var newRoom = {
				_id: `${(Math.random())}`,
				name: roomBod.name,
				image: roomBod.image
			}
			console.log('Inside POST for addRoom:');
			db.addRoom(newRoom).then((res) => {
				// console.log('Res from db.addRoom:');
				// console.log(res);
			});

			messages[newRoom._id] = [];
			
			res.status(200).send(JSON.stringify(newRoom));
		}	
	});
app.route('/chat/:room_id')
	.get((req, res, next) => {
		var room_id = req.params.room_id;

		db.getRoom(room_id).then((room) => {
			// console.log('getRoom from database:');
			// console.log(room);
			if(room != undefined){
				res.status(200).send(room);
			} else{
				res.status(404).send(`Room ${room_id} was not found`);
			}
		})

		}, 
		(error) => {
			console.log(error)
		});

app.route('/chat/:room_id/messages')
		.get((req, res, next) => {
			// console.log("in get room_id/messages");
			// console.log(req.params);
			var room_id = req.params.room_id;
			var before = req.query.before;
			
			db.getLastConversation(room_id, before).then((convo) => {
				if(convo != undefined){
					res.status(200).send(JSON.stringify(convo));
					console.log('========== route(/messages): convo ==========');
					console.log(convo);
				} else{
					res.status(404).send('Conversation not found');
				}
		     })			
			}, 
			(error) => {
				console.log(error)
			});

app.listen(port, () => {
	console.log(`${new Date()}  App Started. Listening on ${host}:${port}, serving ${clientApp}`);
	
	var fakeConv = {
		room_id: 'room-5',
		timestamp: Date.now(),
		messages: [{
			username: 'Sofia',
			text: 'hello'
		}]
	}

	db.addConversation(fakeConv).then((result) => console.log(result));

});

cpen400a.connect('http://35.183.65.155/cpen400a/test-a4-server.js');
cpen400a.export(__filename, { app, db, messages, messageBlockSize });



/*
{username: 'Sofia', text: "Hello"}, {username:'Husna', text: "Ola"}
{username: 'Sofia2', text: "Hello2"}, {username:'Husna2', text: "Ola2"}

var chatrooms = [
	{id: 'id1', name: 'Everyone in CPEN400A', image: "assets/everyone-icon.png"},
	{id: 'id2', name: 'Foodies Only', image: "assets/bibimbap.jpg"},
	{id: 'id3', name: 'Gamers Unite', image: "assets/minecraft.jpg"},
	{id: 'id4', name: 'Canucks Fan', image: "assets/canucks.png"}
];



*/