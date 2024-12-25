let title = document.getElementById("title")
let pdpimg = document.getElementById("pdpimga");
let usernameel = document.getElementById("username");
let cstatus = document.getElementById("cstatus");
let loadinganim = document.getElementById("loadinganim");
let tag = document.getElementById("tag");
let tagimg = document.getElementById("tagimg");
let userid = "1208033802539114590"
let upprog = null
isLanLoaded = false
isPageLoaded = false

datasend = {
    op: 2,
    d: {
      subscribe_to_id: userid
    }
  }

function formatnum(word) {
    word = word.toString();
    if (word.length == 1) {
        return "0"+word;
    } else {
        return word;
    }
}

function getAverageBorderColor(imageUrl, borderWidth) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Allow cross-origin image loading
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
  
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            if (x < borderWidth || x >= canvas.width - borderWidth ||
                y < borderWidth || y >= canvas.height - borderWidth) {
              totalR += data[pixelIndex];
              totalG += data[pixelIndex + 1];
              totalB += data[pixelIndex + 2];
              count++;
            }
          }
        }
  
        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);
  
        resolve(`rgb(${avgR}, ${avgG}, ${avgB})`);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

function disableLoading() {
    if (isPageLoaded && isLanLoaded) {
        loadinganim.style.opacity = "0";
        // wait 1s
        setTimeout(() => {
        loadinganim.style.display = "none";
        }, 1050);
    }
}

window.addEventListener("load", function(){ 
    isPageLoaded = true;
    disableLoading();
});

function update(datas) {
    let username = datas.d.discord_user.display_name;
    title.innerHTML = username;
    usernameel.innerHTML = username;
    if (datas.d.discord_user.clan) {
        tag.innerHTML = datas.d.discord_user.clan.tag;
        tagimg.src = `https://cdn.discordapp.com/clan-badges/${datas.d.discord_user.clan.identity_guild_id}/${datas.d.discord_user.clan.badge}.png?size=16`;
    } else {
        tag.innerHTML = "";
        tagimg.src = "";
    }
    if ( pdpimg.src !== "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar) {
        pdpimg.src = "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar;
    }
    if (datas.d.discord_status == "dnd") {
        document.getElementById("status").style.backgroundColor = "#c63e40";
        document.getElementById("status").title = "Discord Status : Do Not Disturb";
    } else if (datas.d.discord_status == "online") {
        document.getElementById("status").style.backgroundColor = "#00ff00";
        document.getElementById("status").title = "Discord Status : Online";
    } else if (datas.d.discord_status == "idle") {
        document.getElementById("status").style.backgroundColor = "#ffff00";
        document.getElementById("status").title = "Discord Status : Idle";
    } else if (datas.d.discord_status == "offline") {
        document.getElementById("status").style.backgroundColor = "#747f8d";
        document.getElementById("status").title = "Discord Status : Offline";
    }

    if (datas.d.activities.length == 0) {
        cstatus.innerHTML = ""
    } else {
        if (datas.d.spotify) {
            if (datas.d.activities["0"].state == datas.d.spotify.artist) {
                cstatus.innerHTML = ""
            }
        }
        if (datas.d.activities["0"].id == "custom") {
            if (!datas.d.activities["0"].emoji.id) {
                cstatusd = `${datas.d.activities["0"].emoji.name} ${datas.d.activities["0"].state}`;
            } else {
                cstatusd = datas.d.activities["0"].state;
            }
            cstatus.innerHTML = cstatusd
            if (cstatusd.startsWith("http") || cstatusd.startsWith("https")) {
                cstatus.innerHTML = "<a href='"+datas.d.activities["0"].state+"'>"+datas.d.activities["0"].state+"</a>";
            }
        }
    }

    if (!isLanLoaded) {
        isLanLoaded = true;
        disableLoading();
    }
}

let lanyard = new WebSocket("wss://api.lanyard.rest/socket");

lanyard.onmessage = function(event) {
    jsonData = JSON.parse(event.data);
    if (jsonData.op == 1) {
        lanyard.send(JSON.stringify(datasend));
        ITer = setInterval(() => {
            lanyard.send(JSON.stringify({op: 3}));
        }, jsonData.d.heartbeat_interval);
    }
    if (jsonData.op == 0) {
        console.log(jsonData);
        update(jsonData);
    }
  };

lanyard.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };

lanyard.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    console.log('[close] Connection died');
  }
  clearInterval(ITer);
  clearInterval(upprog);
};