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
        console.log('This is in sendMessage():');
        console.log(JSON.stringify(msgInfo));
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