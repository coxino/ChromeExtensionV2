
getServerStatus();

var _token = "";

let Games;

loadGames();
var AllGamesAuto = document.getElementById('all-games');



function getServerStatus() {
    chrome.storage.sync.get(["token"], function (syncItems) {
        var token = syncItems["token"];
        var isLoggedIn = false;
        if (token != null && token.length > 0) {
            isLoggedIn = true;
            sendToken(token);
            _token = token;
            document.getElementById("tab-changer").classList.remove("hidden");
            document.getElementById("login-box").classList.add("hidden");
            chrome.storage.local.get(["serverStatus"], function (localItems) {
                if (localItems["serverStatus"] == "on") {
                    document.getElementById("message").innerHTML = "Active";
                    document.getElementById("message").classList.remove("hold");
                    document.getElementById("message").classList.remove("error");
                    document.getElementById("message").classList.add("success");

                    document.getElementById("dot").classList.add("green");
                }
                else if (localItems["serverStatus"] == "off") {
                    document.getElementById("message").innerHTML = "Disconected";
                    document.getElementById("message").classList.remove("hold");
                    document.getElementById("message").classList.remove("success");
                    document.getElementById("message").classList.add("error");

                    document.getElementById("dot").classList.add("red");
                }
                else {
                    document.getElementById("message").innerHTML = "Waiting Casino Page";
                    document.getElementById("message").classList.remove("error");
                    document.getElementById("message").classList.remove("success");
                    document.getElementById("message").classList.add("hold");

                    document.getElementById("dot").classList.add("hidden");
                }
            });
        }
        else {
            document.getElementById("login-box").classList.remove("hidden");
            document.getElementById("update-box").classList.add("hidden");
            document.getElementById("tab-changer").classList.add("hidden");
        }

        refreshGame(isLoggedIn);
    });
}

function setServerAccessToken() {
    var token = document.getElementById("token").value;
    document.getElementById("login-box").classList.add("hidden");
    document.getElementById("update-box").classList.remove("hidden");
    document.getElementById("tab-changer").classList.remove("hidden");
    chrome.storage.sync.set({ "token": token }, function () {
        sendNotification("Token Saved", token);
    });
}

function sendNotification(_title, _message) {
    var id = "CasinoBroadcastHelper";
    var opt = {
        type: 'list',
        title: 'CasinoBroadcastHelper',
        message: '',
        priority: 1,
        items: [{ title: _title, message: _message }],
        iconUrl: "./images/icon.png"
    };
    chrome.notifications.create(id, opt, function (id) { });
}

function sendToken(token) {
    chrome.runtime.sendMessage(token, (response) => {
        console.log("Sent Token");
        return;
    });
}

function refreshGame(isLoggedIn) {
    if (!isLoggedIn)
        return;
    chrome.storage.local.get(["currentGameName", "currentGameIcon", "currentGameProvider", "currentGameRecord"], localStorage => {
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

function sendNewRecordForCurrentGame() {
    var recordAmmonut = document.getElementById("currGameRecord").value;
    var recordBet = document.getElementById("currRecordBet").value;
    chrome.storage.sync.get(["token"], function (syncItems) {
        var token = syncItems["token"];
        fetch(`https://coverlay20230404202215.azurewebsites.net/api/extension/setrecord?&record=${recordAmmonut}&bet=${recordBet}`, {
            method: 'GET',
            headers: {
                Token: token,
                Accept: 'application/json',
                'Access-Control-Allow-Origin': "*"
            }
        })
            .then(response => {
                response.header("Access-Control-Allow-Origin", "*")
                if (response.status !== 200) {
                    document.getElementById("recordError").innerText = "Error In Saving Record";
                    return;
                }

                response.json().then(function (data) {
                    document.getElementById("recordError").innerText = data;
                });
            })
            .catch(function (err) {
                chrome.storage.local.set({ "serverStatus": "off" }, function () { });
                notify("Server Off", "./images/icon.png");
            });
    });
}


function sendCurrentGameToBonusHunt() {
    var bet = document.getElementById("currBet").value;
    chrome.storage.sync.get(["token"], function (syncItems) {
        var token = syncItems["token"];
        fetch("https://coverlay20230404202215.azurewebsites.net/api/extension/currentgametobh?bet=" + bet, {
            method: 'GET',
            headers: {
                Token: token,
                Accept: 'application/json',
                'Access-Control-Allow-Origin': "*"
            }
        })
            .then(response => {
                response.header("Access-Control-Allow-Origin", "*")
                if (response.status !== 200) {
                    document.getElementById("recordError").innerText = "Error In Saving Record";
                    return;
                }

                response.json().then(function (data) {
                    document.getElementById("recordError").innerText = data;
                });
            })
            .catch(function (err) {
                chrome.storage.local.set({ "serverStatus": "off" }, function () { });
                notify("Server Off", "./images/icon.png");
            });
    });
}

document.getElementById("currBet").addEventListener('input', (event) => {
    var obj = document.getElementById("currBet");
    obj.value = formatNumber(obj.value);
})

document.getElementById("currGameRecord").addEventListener('input', (event) => {
    var obj = document.getElementById("currGameRecord");
    obj.value = formatNumber(obj.value);
})

function formatNumber(num) {
    let str = num.toString().replace(/[^0-9.]/g, ''); // remove all non-numeric characters (including spaces)
    let result = '';
    let decimalPart = '';
    if (str.includes('.')) {
        decimalPart = str.substr(str.indexOf('.'));
        str = str.substr(0, str.indexOf('.'));
    }
    for (let i = 0; i < str.length; i++) {
        result += str[i];
        if ((str.length - i - 1) % 3 === 0 && i !== str.length - 1) {
            result += ',';
        }
    }
    return result + decimalPart;
}

document.getElementById("manualgamesave").addEventListener('click', (event) => {
    var game = document.getElementById("manualgamename").value;
    fetch("https://coverlay20230404202215.azurewebsites.net/api/extension/setinplay?token=" + _token + "&url=" + game, {        
        method: 'GET',
        headers: { 
            Accept: 'application/json',
            'Access-Control-Allow-Origin': "*"
         }
    })
        .then(response => {
            response.header("Access-Control-Allow-Origin", "*")
            if (response.status !== 200) {
                console.log("response" + response);
                chrome.storage.local.set({ "serverStatus": "off" }, function () { });
                notify("Erroare", "./images/icon.png");
                return;
            }

            response.json().then(function (data) {
                chrome.storage.local.set({ "serverStatus": "on" }, function () { });
                chrome.storage.local.set({
                    "currentGameName": data.name,
                    "currentGameIcon": data.image,
                    "currentGameRecord": getRecord(data.rounds),
                    "currentGameProvider": data.provider
                }, function () { });
                refreshGame(true);
                sendNotification(data.name, data.name + " by " + data.provider)
            });
        })
        .catch(function (err) {
            chrome.storage.local.set({ "serverStatus": "off" }, function () { });
            notify("Server Off", "./images/icon.png");
        });
})

document.getElementById("recordsave").addEventListener('click', (event) => {
    sendNewRecordForCurrentGame();
})

document.getElementById("bhsave").addEventListener('click', (event) => {
    sendCurrentGameToBonusHunt();
})

//EVENTS

document.getElementById("save-btn").addEventListener('click', (event) => {
    setServerAccessToken();
})

document.getElementById("gamerecord-button").addEventListener('click', (event) => {
    openCity(event, 'gamerecord')
})

document.getElementById("bonushunt-button").addEventListener('click', (event) => {
    openCity(event, 'bonushunt')
})

document.getElementById("manualgame-button").addEventListener('click', (event) => {
    openCity(event, 'manualgame')
})

function loadGames() {
    fetch("https://coxino.ro/assets/database/AllGames.json", {
        mode: 'no-cors',
        method: 'GET',
        headers: { Accept: 'application/json' }
    }).then(response => {
        if (response.status !== 200) {
            console.log("response" + JSON.stringify(response));
        }
        else {
            response.header("Access-Control-Allow-Origin", "*")
            response.json().then(function (data) {
                console.log(data);
                Games = data.map(x => '<option>' + x.Name + '</option>');
                AllGamesAuto.innerHTML += Games;
            });
        }
    })
        .catch(function (err) {
            console.log("Games Error" + err);
        });
    //https://coxino.ro/assets/database/AllGames.json
    //TODO: FETCH + AUTOCOMPLETE
}

function getRecord(rounds) {
    if (rounds.length > 0) {
        var best_pay = rounds?.map(x => x.payAmount)?.reduce((a, b) => Math.max(a, b, 0)) ?? 0;
        var best_x = rounds?.map(x => x.multiplier)?.reduce((a, b) => Math.max(a, b, 0)) ?? 0;
    }

    return Intl.NumberFormat('en-US').format(best_pay ?? 0);
}

var i = 0;
function notify(_message, _icon) {
    var opt = {
        type: 'list',
        title: 'CasinoBroadcastHelper',
        message: 'New game Detected',
        priority: 1,
        items: [{ title: 'New Game: ', message: _message }],
        iconUrl: _icon
    };
    chrome.notifications.create(i++ + "", opt, function (id) { });
}