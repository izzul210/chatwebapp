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