var token = "";
var currentGameUrl = "";   

//TODO:Add all websites
const CasinoSites = [    
    "superbet.ro/joc/",
    "mrbit.ro/en/games/",
    "betano.com/casino/games/"
]

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    token = message;
    console.log("Recieved token " + token);
});

chrome.tabs.onUpdated.addListener(function(info) {  
    console.log("" + info)   
    if(token != null){
        chrome.tabs.query({}).then(logTabs, onError);
    }
});

function logTabs(tabs) { 
    //TODO: ADD ChEcKS FOR MULTIPLE WEBSITES      
    for (const tab of tabs) {   
        if(CasinoSites.some(v => tab.url.includes(v))){   
            //Avoid double change to minimize data exchange
            if(tab.url != currentGameUrl){
                sendRequest(tab.url);
                currentGameUrl = tab.url;                
            }
        }
    }
}

function onError(error) {
    //TODO:add log to server
    console.error(`Error: ${error}`);
}

function sendRequest(url){  
    fetch("https://coxino.go.ro:5000/api/extension/setinplay?token=" + token + "&url=" + url, {
    //mode: 'no-cors',
    method: 'GET',
    headers: { Accept: 'application/json'}})
    .then(response => { 
        if (response.status !== 200) {              
            console.log("response" +response);     
            chrome.storage.local.set({ "serverStatus": "off" }, function(){});
            notify("Erroare","./images/icon.png");
            return;
        }
        
        response.json().then(function(data) {
            chrome.storage.local.set({ "serverStatus": "on" }, function(){});
            console.log(JSON.stringify(data));
            notify(data.name +" by "+ data.provider,"./images/icon.png");
            chrome.storage.local.set({ "currentGameName": data.name,
            "currentGameIcon": data.image,
            "currentGameRecord": getRecord(data.rounds),
            "currentGameProvider": data.provider },function(){});
        });
    })
    .catch(function(err) {
        chrome.storage.local.set({ "serverStatus": "off" }, function(){});
        notify("Server Off","./images/icon.png");
    });
}

var i = 0;        
function notify(_message,_icon){   
    var opt = {
        type: 'list',
        title: 'CasinoBroadcastHelper',
        message: 'New game Detected',
        priority: 1,
        items: [{ title: 'New Game: ', message: _message}],
        iconUrl: _icon
    };
    chrome.notifications.create(i++ + "", opt, function(id) {});
}


function getRecord(rounds)
{
    if(rounds.length > 0){
        var best_pay = rounds?.map(x=>x.payAmount)?.reduce((a,b)=>Math.max(a,b,0)) ?? 0;
        var best_x = rounds?.map(x=>x.multiplier)?.reduce((a,b)=>Math.max(a,b,0)) ?? 0;
    }
    
    return Intl.NumberFormat('en-US').format(best_pay ?? 0);
}
