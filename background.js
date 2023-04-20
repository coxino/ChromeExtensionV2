var token = null;
var currentGameUrl = "";
var isSet = false;


//TODO:Add all websites
const CasinoSites = [
    //
    { site: "superbet.ro/joc/", class: "mycasino-page-title", type: 'super', no: 0 },
    
    //URLS
    { site: "mrbit.ro/en/games/", class: "", type: 'url', no: 0 },
    { site: "conticazino.ro/casino/", class: "", type: 'url', no: 0 },
    { site: "online.getsbet.ro/casino/game/", class: "", type: 'url', no: 0 },
    { site: "winboss.ro/en/casino-games/slots/", class: "", type: 'url', no: 0 },
    { site: "www.cashpot.ro/games", class: "", type: 'url', no: 0 },
    //https://winboss.ro/ro/casino-games
    //https://winboss.ro/ro/casino-games/slots/
    //CLASSES
    { site: "betano.com/casino/games/", class: "game-title", type: 'class', no: 0 },
]

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message != null && message.length > 0)
        token = message;
    console.log("Recieved token " + token);
    sendResponse('done');
    chrome.tabs.query({ active: true, currentWindow: true }).then(logTabs, onError);
});

chrome.tabs.onUpdated.addListener(function (info) {
    console.log("TabChanged" + JSON.stringify(info));
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then(logTabs, onError);
});

const _delay = ms => new Promise(res => setTimeout(res, ms));

async function logTabs(tabs) {
    if (token == null)
        chrome.storage.sync.get(["token"], function (syncItems) {
            token = syncItems["token"];
            console.log("GOTTOKEN" + token);
        });

    for (const tab of tabs) {
        if (CasinoSites.map(x => x.site).some(v => tab.url.includes(v))) {
            //Avoid double change to minimize data exchange
            if (tab.url != currentGameUrl) {
                currentGameUrl = tab.url;
                var classType = CasinoSites.find(x => tab.url.includes(x.site)).type;
                var identifier = CasinoSites.find(x => tab.url.includes(x.site)).class;
                var identifierNo = CasinoSites.find(x => tab.url.includes(x.site)).no;
                switch (classType) {
                    case 'super':
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            args: [identifier],
                            function: extractGameFromSuperbet,
                        });
                        break;
                    case 'class':
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            args: [identifier, identifierNo],
                            function: extractGameFromClass,
                        });
                        break;

                    case 'tag':
                        console.log("TAG" + identifier);
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            args: [identifier,identifierNo],
                            function: extractGameFromTag,
                        });
                        break;

                    case 'url':
                        console.log("TAG" + identifier);
                        await _delay(1000);
                        sendCurrentGameRequest(tab.url);
                        break;

                    default:
                        break;
                }
            }
        }
    }
}


//id
function extractGameFromId(divId) {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const yourFunction = async () => {
        await delay(1000);
        console.log("Waited 1s");
        var gameName = document.getElementById(divId)[0].innerHTML;
        console.log("game: " + gameName);
        chrome.runtime.sendMessage({ type: "sendGame", gameNume: gameName }, (response) => {
            console.log("Sent game");
            return;
        });
    };

    yourFunction();
}


///TAG
function extractGameFromTag(tagName,tagno) {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const yourFunction = async () => {
        await delay(2000);
        console.log("Waited 1s");
        var gameName = document.getElementsByTagName(tagName)[tagno].innerHTML;
        console.log("game: " + gameName);
        chrome.runtime.sendMessage({ type: "sendGame", gameNume: gameName }, (response) => {
            console.log("Sent game");
            return;
        });
    };

    yourFunction();
}

///CLASS
function extractGameFromClass(className, no) {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const yourFunction = async () => {
        await delay(1000);
        console.log("Waited 1s");

        //only superbet
        //document.getElementsByClassName('left-sidebar')[0].style.display = 'none';
        var gameName = document.getElementsByClassName(className)[no].innerHTML;
        console.log("game: " + gameName);
        chrome.runtime.sendMessage({ type: "sendGame", gameNume: gameName }, (response) => {
            console.log("Sent game");
            return;
        });
    };

    yourFunction();
}

function extractGameFromSuperbet(className) {

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const yourFunction = async () => {
        await delay(1000);

        console.log("Waited 1s");

        //only superbet
        document.getElementsByClassName('left-sidebar')[0].style.display = 'none';
        var gameName = document.getElementsByClassName(className)[0].innerHTML;
        chrome.runtime.sendMessage({ type: "sendGame", gameNume: gameName }, (response) => {
            console.log("Sent game" + gameName);
            return;
        });
    };

    yourFunction();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "sendGame")
        sendCurrentGameRequest(request.gameNume);
    sendResponse();
});

function onError(error) {
    //TODO:add log to server
    console.error(`Error: ${error}`);
}



function sendCurrentGameRequest(url) {
    fetch("https://coverlay20230404202215.azurewebsites.net/api/extension/setinplay?token=" + token + "&url=" + url, {
        method: 'GET',
    })
        .then(response => {
            if (response.status !== 200) {

                chrome.storage.local.set({ "serverStatus": "off" }, function () { });
                notify("Erroare", "./images/icon.png");
                return;
            }
            else {
                response.json().then(function (data) {
                    try {
                        chrome.storage.local.set({ "serverStatus": "on" }, function () { });
                        console.log(JSON.stringify(data));
                        notify(data.name + " by " + data.provider, "./images/icon.png");
                        chrome.storage.local.set({
                            "currentGameName": data.name,
                            "currentGameIcon": data.image,
                            "currentGameRecord": getRecord(data.rounds),
                            "currentGameProvider": data.provider
                        }, function () { });
                    }
                    catch (e) { }
                });
            }
        })
        .catch(function (err) {
            chrome.storage.local.set({ "serverStatus": "off" }, function () { });
            notify("Server Off", "./images/icon.png");
        });
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


function getRecord(rounds) {
    if (rounds.length > 0) {
        var best_pay = rounds?.map(x => x.payAmount)?.reduce((a, b) => Math.max(a, b, 0)) ?? 0;
        var best_x = rounds?.map(x => x.multiplier)?.reduce((a, b) => Math.max(a, b, 0)) ?? 0;
    }

    return Intl.NumberFormat('en-US').format(best_pay ?? 0);
}
