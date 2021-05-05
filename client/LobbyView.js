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
