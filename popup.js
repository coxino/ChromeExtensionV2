
getServerStatus();
refreshGame();

function getServerStatus()
{ 
    chrome.storage.sync.get(["token"], function(syncItems){     
        var token = syncItems["token"];       
        if(token != null && token.length > 0){  
            sendToken(token);
            document.getElementById("login-box").classList.add("hidden");       
            chrome.storage.local.get(["serverStatus"], function(localItems){  
                if(localItems["serverStatus"] == "on"){        
                    document.getElementById("message").innerHTML = "Active";
                    document.getElementById("message").classList.remove("hold");
                    document.getElementById("message").classList.remove("error");
                    document.getElementById("message").classList.add("success");
                }
                else if(localItems["serverStatus"] == "off"){      
                    document.getElementById("message").innerHTML = "Disconected";
                    document.getElementById("message").classList.remove("hold");
                    document.getElementById("message").classList.remove("success");
                    document.getElementById("message").classList.add("error");
                }
                else{
                    document.getElementById("message").innerHTML = "Waiting Casino Page";        
                    document.getElementById("message").classList.remove("error");
                    document.getElementById("message").classList.remove("success");
                    document.getElementById("message").classList.add("hold");
                }
            });
        }
        else{
            document.getElementById("update-box").classList.add("hidden");
        }
    });
}

function setServerAccessToken(){
    var token = document.getElementById("token").value;
    document.getElementById("login-box").classList.add("hidden");
    
    chrome.storage.sync.set({ "token": token }, function(){
        sendNotification("Token Saved", token);
    });
}

function sendNotification(_title, _message){
    id = "CasinoBroadcastHelper";
    var opt = {
        type: 'list',
        title: 'CasinoBroadcastHelper',
        message: '',
        priority: 1,
        items: [{ title: _title, message: _message}],
        iconUrl: "./images/icon.png"
    };
    chrome.notifications.create(id, opt, function(id) {});
}

function sendToken(token){
    chrome.runtime.sendMessage(token, (response) => { 
        console.log("Sent Token");
        return;
    });
}

function refreshGame(){
    chrome.storage.local.get(["currentGameName","currentGameIcon","currentGameProvider","currentGameRecord"],localStorage=>{
        document.getElementById("currentGameName").innerText = localStorage["currentGameName"];
        document.getElementById("currentGameIcon").src = localStorage["currentGameIcon"];
        document.getElementById("currentGameProvider").innerText = localStorage["currentGameProvider"];
        document.getElementById("currentGameRecord").innerText = "Record " + localStorage["currentGameRecord"];
    });
}

function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

//EVENTS

document.getElementById("save-btn").addEventListener('click',(event)=>{
    setServerAccessToken();
})

document.getElementById("gamerecord-button").addEventListener('click',(event)=>{
     openCity(event, 'gamerecord')
})

document.getElementById("bonushunt-button").addEventListener('click',(event)=>{
    openCity(event, 'bonushunt')
})