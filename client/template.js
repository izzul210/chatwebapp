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