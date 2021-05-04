var lobbyView;
var chatView;
var profileView;
var lobby;
var profile = {
    username: "Sofia"
};

//Service = stores functions to call for different requests to the server
var Service = {
        origin: window.location.origin, //store URL of the server as a string

        /*
        getAllRooms: fetch the list of rooms, then render it in the view dynamically
        - asynchronous function (returned list will be available as the 1st argument in callback pass to)
        */
        getAllRooms: () => {   
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                var name = Service.origin+"/chat";

                xhr.open("GET", name); 
                
                xhr.onload = (error) => {
                    if(xhr.status == 200){
                        resolve(JSON.parse(xhr.responseText));
                    } 
                    else if(xhr.status >= 400 && xhr.status < 500){
                        reject(new Error(error.target.response));
                    }
                    else if(xhr.status >= 500){
                        reject(new Error(error.target.response));
                    }
                }

                xhr.onerror = (error) => {
                    reject(new Error(error.target.response));
                }

                xhr.onabort = (error) => {
                    reject(new Error(error.target.response));
                }

                xhr.send();
            });
        },
        addRoom: (data) => {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                var name = Service.origin+"/chat";

                xhr.open("POST", name); 
                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.onload = (error) => {
                    if(xhr.status == 200){
                        resolve(JSON.parse(xhr.responseText));
                    } 
                    else if(xhr.status >= 400 && xhr.status < 500){
                        reject(new Error(error.target.response));
                    }
                    else if(xhr.status >= 500){
                        reject(new Error(error.target.response));
                    }                    
                }

                xhr.onerror = (error) => {
                    reject(new Error(error.target.response));
                }

                xhr.onabort = (error) => {
                    reject(new Error(error.target.response));
                }

                xhr.send(JSON.stringify(data));
            })
        },
        getLastConversation: (roomId, before) => {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                var name = Service.origin+`/chat/${roomId}/messages?before=${before}`;

                xhr.open("GET", name); 

                xhr.onload = (error) => {
                    if(xhr.status == 200){
                        resolve(JSON.parse(xhr.responseText));
                    } 
                    else if(xhr.status >= 400 && xhr.status < 500){
                        reject(new Error(error.target.response));
                    }
                    else if(xhr.status >= 500){
                        reject(new Error(error.target.response));
                    }                    
                }

                xhr.onerror = (error) => {
                    reject(new Error(error.target.response));
                }

                xhr.onabort = (error) => {
                    reject(new Error(error.target.response));
                }

                xhr.send();
            })
        }
};


window.addEventListener('load', main); //call main function once the page is loaded

function main(){
    lobby = new Lobby();
    lobbyView = new LobbyView(lobby);
    profileView = new ProfileView();
    socket = new WebSocket('ws://localhost:8000');
    socket.addEventListener('message', (event) => {
        //{"roomId", "username", "text"}
        var msgRoom = JSON.parse(event.data); //data = roomId, username, text
        console.log('FROM SERVER:')
        console.log(msgRoom);

        var room1 = lobby.getRoom(msgRoom.roomId);
        console.log('Get room: ');
        console.log(room1);
        room1.addMessage(msgRoom.username, msgRoom.text);
    
    });
    chatView = new ChatView(socket);


    //refreshLobby = call getAllRooms function to make an AJAX request to the server
    refreshLobby = () => {
        Service.getAllRooms().then(
            (result) => {
                var objTemp = [];
                for(let obj of result){
                    objTemp.push(obj);
                };

                for(let obj of objTemp){
                    obj.r = false;
                }

                //update lobby.rooms object with array of rooms from server
                for(let i = 0; i < objTemp.length; i++){
                    for(room in lobby.rooms){
                        if(objTemp[i]._id == room){
                            lobby.rooms[room].name = objTemp[i].name;
                            lobby.rooms[room].image = objTemp[i].image;
                            lobby.rooms[room].messages = objTemp[i].messages;
                            objTemp[i].r = true;
                        };
                    }
                }

                for(let obj of objTemp){
                    if(!obj.r){
                        lobby.addRoom(obj._id, obj.name, obj.image, obj.messages);
                    }
                }
            } , 
            (error) => console.log(error)  
        )
    }

    refreshLobby();
    // setInterval(refreshLobby, 50000); //periodically refresh the list of chat rooms
    renderRoute(); //read the URL from address bar and perform actions
    window.addEventListener('popstate', renderRoute); //popstate event is fired when URL changes (eg: when back button is clicked)
}


function renderRoute(){
    //Read the URL from address bar
    var readHash = window.location.hash;

    var elem = document.getElementById("page-view");

    //empty contents of #page-view + populate with content index.html
    if(readHash == "#/"){
        emptyDOM(elem);
        elem.appendChild(lobbyView.elem);
    } else if(readHash.includes("#/chat")) {
        emptyDOM(elem);
        elem.appendChild(chatView.elem);
        var roomid = readHash.slice(7);
        console.log(`renderRoute(){ getRoom: ${roomid} }`);
        var room = lobby.getRoom(roomid);
        chatView.setRoom(room);
    } else if(readHash == "#/profile"){
        emptyDOM(elem);
        elem.appendChild(profileView.elem);
    }

}

/*
makeConversationLoader: generator function
    "remember" last conversation being fetched and 
    incrementally fetch the conversation as the user
    scrolls up to the top of the chat view
*/
function* makeConversationLoader(room){
    //to keep track of last conversation block fetched
    var lastTimeStamp = room.timeCreated;
    
    //fetching conversation block from server
    while(room.canLoadConversation == true){
        room.canLoadConversation = false;
         yield Service.getLastConversation(room.id, lastTimeStamp).then((result) => {
            // console.log('==== Inside makeConversationLoader ======');
            // console.log('RESULT:');
            // console.log(result);
            // console.log('LAST TIME STAMP:');
            // console.log(lastTimeStamp);
            
            if(result !== null && result !== undefined){
                // console.log('=== Inside if(result != null) statement ===')
                lastTimeStamp = result.timestamp;
                room.canLoadConversation = true;
                room.addConversation(result);
                result;
            } else{
                null;
            }

        }, (error) => {
            console.log(error);
        });
    }
}


class LobbyView{
    constructor(lobby){
        this.lobby = lobby;
        this.elem = createDOM(lobbyPage);
        this.listElem = this.elem.querySelector("ul.room-list");
        this.inputElem = this.elem.querySelector("input");
        this.buttonElem = this.elem.querySelector("button");
        this.redrawList();
        this.buttonElem.addEventListener("click", () => {
            var text = this.inputElem.value;
            // this.lobby.addRoom(Object.keys(this.lobby.rooms).length+1, text);
            Service.addRoom({'name': text, 'image':"assets/everyone-icon.png"}).then(
                                (res) => {
                                    this.lobby.addRoom(res._id, res.name, res.image);
                                }, 
                                (err) => {
                                    console.log('ERROR:');
                                    console.log(err);
                                }
                            );
            this.inputElem.value = "";
        });    
        this.lobby.onNewRoom = (room) => {
            var lobList2 = 
            `<li>
                <a href="#/chat/${room.id}">
                     <div class="chat-class">
                        <img src=${room.image}>
                        <p> ${room.name}</p>
                    </div>
                </a>
             </li>`
            this.listElem.appendChild(createDOM(lobList2));  
        };
    }

    redrawList(){
        emptyDOM(this.listElem);
        var rooms = this.lobby.rooms;
        for(var room of Object.values(rooms)){
            var roomId = room.id;
            var roomImage = room.image;
            var roomName = room.name;

            var lobList = 
            `<li>
                <a href="#/chat/${roomId}">
                     <div class="chat-class">
                        <img src=${roomImage}>
                        <p> ${roomName}</p>
                    </div>
                </a>
             </li>`
             this.listElem.appendChild(createDOM(lobList));           
        } 
    }   

}


class ChatView{
    constructor(socket){
        this.elem = createDOM(chatPage);
        this.titleElem = this.elem.querySelector("h4");
        this.chatElem = this.elem.querySelector("div.message-list");
        this.inputElem = this.elem.querySelector("textarea");
        this.buttonElem = this.elem.querySelector("button");
        this.room = null;
        this.buttonElem.addEventListener("click", () => {
            this.sendMessage();
        });  
        this.inputElem.addEventListener("keyup", (event) => {
            if(event.keyCode == 13 && !event.shiftKey){
                this.sendMessage();
            }
        }); 
        this.chatElem.addEventListener('wheel', (event) => {
            var topView = this.chatElem.scrollTop;
            var scrollUp = event.deltaY;
            if((scrollUp < 0) && (topView == 0) && (this.room.canLoadConversation)){
                this.room.getLastConversation.next();
                topView += 10;
            } else{
                console.log('No more conversation')
            }
            
        })
        this.socket = socket;                                                              
    }

    sendMessage(){
        var input = this.inputElem.value;
        this.room.addMessage(profile.username, input);
        this.inputElem.value = "";
        var msgInfo = {
            roomId : this.room.id,
            username: profile.username,
            text: input
        }
        this.socket.send(JSON.stringify(msgInfo));
        console.log('This is in sendMessage:');
        console.log(msgInfo);
    }

    setRoom(room){
        this.room = room;
        emptyDOM(this.titleElem);
        this.titleElem.appendChild(createDOM(`<h4 class="room-name">${this.room.name}</h4>`));
        emptyDOM(this.chatElem);
        
        var messages = this.room.messages;

        for(var message of Object.values(messages)){
            if(message.username == profile.username){
                var chatElemProp = `
                <div class="message my-message">
                    <div>
                        <span class="message-user">
                            ${message.username}
                        </span>
                        <span class="message-text">
                            ${message.text}
                        </span>
                    </div>    
                 </div> `

                 this.chatElem.appendChild(createDOM(chatElemProp));  
            }
            else {
                var chatElemProp = `
                    <div class="message">
                        <div>
                            <span class="message-user">
                                ${message.username}
                            </span>
                            <span class="message-text">
                                ${message.text}
                            </span>
                        </div>                       
                    </div> `

                this.chatElem.appendChild(createDOM(chatElemProp));
            }
        }

        this.room.onNewMessage = (message) => {
            if(message.username == profile.username){
                var chatElemProp = `
                <div class="message my-message">
                    <div>
                        <span class="message-user">
                            ${message.username}
                        </span>
                        <span class="message-text">
                            ${message.text}
                        </span>
                    </div>    
                 </div> `

                 this.chatElem.appendChild(createDOM(chatElemProp));  
            }
            else {
                var chatElemProp = `
                    <div class="message">
                        <div>
                            <span class="message-user">
                                ${message.username}
                            </span>
                            <span class="message-text">
                                ${message.text}
                            </span>
                        </div>                       
                    </div> `

                this.chatElem.appendChild(createDOM(chatElemProp));
            }
        }

        this.room.onFetchConversation = (arrayMessage) => {
            var messages = arrayMessage.messages;

            for(let i = messages.length - 1; i > 0; i--){
                if(messages[i].username == profile.username){
                    var chatElemProp = `
                    <div class="message my-message">
                        <div>
                            <span class="message-user">
                                ${messages[i].username}
                            </span>
                            <span class="message-text">
                                ${messages[i].text}
                            </span>
                        </div>    
                     </div> `
    
                    //  this.chatElem.insertBefore(firstNode, createDOM(chatElemProp));  
                     this.chatElem.prepend(createDOM(chatElemProp));
                }
                else {
                    var chatElemProp = `
                        <div class="message">
                            <div>
                                <span class="message-user">
                                    ${messages[i].username}
                                </span>
                                <span class="message-text">
                                    ${messages[i].text}
                                </span>
                            </div>                       
                        </div> `
    
                        this.chatElem.prepend(createDOM(chatElemProp));  
                }
            }

           
        }
    }


}

class ProfileView{
    constructor(){
        this.elem = createDOM(profilePage);
    }
}

class Room{
    constructor(id, name, image ="assets/everyone-icon.png", messages = []){
        this.id = id;
        this.name = name;
        this.image = image;
        this.messages = messages;
        this.getLastConversation = makeConversationLoader(this);
        this.canLoadConversation = true;
        this.timeCreated = Date.now();
    }

    addMessage(username, text){
        if(text == null || text.trim() === ''){
            return;
        } else{
            const msg = {
                username: username,
                text: text
            };
            this.messages.push(msg);

            if(this.onNewMessage){
                this.onNewMessage(msg);
            };
        } 
    }

    addConversation(conversation){
        var newArray = this.messages.concat(conversation);
        this.messages = newArray;

        if(this.onFetchConversation){
            this.onFetchConversation(conversation);
        }
    }


}

class Lobby{
    constructor(){
        var room1 = new Room('room-1', 'Everyone in CPEN400A', "assets/everyone-icon.png", [{username: 'Bob', text: 'hello'},{username: 'Sofia', text: 'hi'},{username: 'Bob', text: 'huhu'}]);
        var room2 = new Room('room-2', 'Foodies Only', "assets/bibimbap.jpg", [{username: 'Man', text: 'ola'},{username: 'Sofia', text: 'ola como estas'},{username: 'Man 2', text: 'como se lama'}]);
        var room3 = new Room('room-3', 'Gamers Unite', "assets/minecraft.jpg", [{username: 'Kim', text: 'hiho'},{username: 'Kim', text: 'u sux'},{username: 'Sofia', text: 'err'}]);
        var room4 = new Room('room-4', 'Canucks Fan', "assets/canucks.png", [{username: 'Sofia', text: 'mayday2!'},{username: 'Sofia', text: 'halp'},{username: 'Bib', text: 'what do you want'}]);
        this.rooms = {};
    }

    addRoom(id, name, image, messages){
        var newRoom = new Room(id, name, image, messages);
        this.rooms[id] = newRoom;

        if(this.onNewRoom){
            this.onNewRoom(this.rooms[id]);
        }
    }

    getRoom(roomId){
       for(let room in this.rooms){
            if(room == roomId){
                return this.rooms[room];
            }
        }
    }

    
    
}


// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM (elem){
	while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
	let template = document.createElement('template');
	template.innerHTML = htmlString.trim();
	return template.content.firstChild;
}


var lobbyPage =  `<div class="content">
    <ul class="room-list">
        <li>
            <a href="#/chat">
                <div class="chat-class">
                    <img src="/assets/everyone-icon.png">
                    <p> Everyone in CPEN400A</p>
                </div>
            </a>
        </li>
        <li>
            <a href="#/chat">
                <div class="chat-class">
                    <img src="/assets/bibimbap.jpg">
                    <p> Foodies only</p>
                </div>
            </a>
        </li>
        <li>
            <a href="#/chat">
                <div class="chat-class">
                    <img src="/assets/minecraft.jpg">
                    <p> Gamers unite</p>
                </div>
            </a>
        </li>
        <li>
            <a href="#/chat">
                <div class="chat-class">
                    <img src="/assets/canucks.png">
                    <p> Canucks Fans</p>
                </div>
            </a>
        </li>
    </ul>

    <div class="page-control">
        <div class="main-control">
            <input type="text">
            <button>Create Room</button>
        </div>    
    </div>

</div>`


var chatPage =  `  <div class="content">
        <h4 class="room-name">
            Everyone in CPEN400A
        </h4>

        <div class="message-list">
            
            <div class="message my-message">
                <div>
                    <span class="message-user">
                        Alice
                    </span>
                    <span class="message-text">
                        Hi guys!
                    </span>
                </div>    
            </div>
            
            <div class="message">
                <div>
                    <span class="message-user">
                        Bob
                    </span>
                    <span class="message-text">
                        How is everyone doing today?
                    </span>
                </div>                       
            </div>

            <div class="message my-message">
                <div>
                    <span class="message-user">
                        Alice
                    </span>
                    <span class="message-text">
                        I am doing great! I just finished my project
                    </span>
                </div>
            </div>
            
        </div>

        <div class="page-control">
            <div class="chat-control">
                <textarea></textarea>
                <button>Send</button>
            </div>
        </div>
    </div>`


var profilePage = `  <div class="content">
            <div class="profile-form">
                <div class="form-field">
                    <label> Username </label>
                    <input type="text">
                </div>
                <div class="form-field">
                    <label> Password </label>
                    <input type="password">
                </div>
                <div class="form-field">
                    <label> Avatar Image </label>
                    <div>
                        <img src="/assets/profile-icon.png">
                        <input type="file">
                    </div> 
                </div>
                <div class="form-field">
                    <label> About </label>
                    <textarea></textarea>
                </div>
            </div>
            <div class="page-control">
                <div class="profile-control">
                    <button>Save!</button>
                </div>
            </div>
        </div> `

