var lobbyView;
var chatView;
var profileView;
var lobby;
var profile = {
    username: "Sofia"
};

// import LobbyView from './LobbyView';

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
    socket.addEventListener("message", (event) => {
        //{"roomId", "username", "text"}
        console.log('Inside socket.addEventListener(message)');
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





