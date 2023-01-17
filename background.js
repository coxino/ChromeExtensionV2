chrome.tabs.onUpdated.addListener(function(info) {
    chrome.tabs.query({}).then(logTabs, onError);
});

var currentGameUrl = "";

//TODO:Add all websites
const CasinoSites = [    
    "superbet.ro/joc/",
    "mrbit.ro/en/games/",
    "betano.com/casino/games/"]
    
    function logTabs(tabs) {
        for (const tab of tabs) {   
            if(CasinoSites.some(v => tab.url.includes(v))){   
                //Avoid double change   
                if(tab.url != currentGameUrl){
                    sendRequest(tab.url);
                    currentGameUrl = tab.url;
                    console.log("CurrentGameUrl changed:" + currentGameUrl);
                }
            }
        }
    }
    
    function onError(error) {
        console.error(`Error: ${error}`);
    }
    
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VybmFtZSI6ImNveGlubyAgICAiLCJQYXNzd29yZCI6IlczeU12SHlUNzQ1YVpuYUMiLCJVc2VySWQiOiI3OTYzZmYwOC04OGU2LTRjZTUtOGI0Zi1mN2MwYmNiOWU3ODMiLCJuYmYiOjE2NzM5NjY1NzYsImV4cCI6MTY3NDU3MTM3NiwiaWF0IjoxNjczOTY2NTc2LCJpc3MiOiJodHRwOi8vbXlzaXRlLmNvbSIsImF1ZCI6Imh0dHA6Ly9teWF1ZGllbmNlLmNvbSJ9.iYiFTFpeYmEinDL3pGjiNuojMzXCtFaMfUiuJCXQljk";
    
    function sendRequest(url){  
        fetch("https://coxino.go.ro:5000/api/player/login?token=" + token + "&url=" + url)
        .then(
            function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                    return;
                }
                
                response.json().then(function(data) {
                    console.log(data);
                });
            }
            )        
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });   
        }
        
        