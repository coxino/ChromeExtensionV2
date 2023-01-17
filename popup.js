var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VybmFtZSI6ImNveGlubyAgICAiLCJQYXNzd29yZCI6IlczeU12SHlUNzQ1YVpuYUMiLCJVc2VySWQiOiI3OTYzZmYwOC04OGU2LTRjZTUtOGI0Zi1mN2MwYmNiOWU3ODMiLCJuYmYiOjE2NzM5NjY1NzYsImV4cCI6MTY3NDU3MTM3NiwiaWF0IjoxNjczOTY2NTc2LCJpc3MiOiJodHRwOi8vbXlzaXRlLmNvbSIsImF1ZCI6Imh0dHA6Ly9teWF1ZGllbmNlLmNvbSJ9.iYiFTFpeYmEinDL3pGjiNuojMzXCtFaMfUiuJCXQljk";

testConnection();

function testConnection(){  
  const req = new XMLHttpRequest();
  const baseUrl = "https://coxino.go.ro:5000/api/player/loginstatus/" + token;   

  req.open("GET", baseUrl, true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.send();

  req.onreadystatechange = function() { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          console.log("Got response 200!" + this.response);
          document.getElementById("green-dot").classList.remove("hidden");
          document.getElementById("message").innerHTML = "Active";
          document.getElementById("message").classList.remove("error");
          document.getElementById("message").classList.add("success");
      }else{
          document.getElementById("green-dot").classList.add("hidden");
          document.getElementById("message").innerHTML = "Disconected";
          document.getElementById("message").classList.remove("success");
          document.getElementById("message").classList.add("error");
      }
  }
}