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