title = document.getElementById("title")
pdpimg = document.getElementById("pdpimga");
usernameel = document.getElementById("username");
cstatus = document.getElementById("cstatus");
albumart = document.getElementById("albumart");
songtitle = document.getElementById("songtitle");
songartist = document.getElementById("songartist");
progress = document.getElementById("progress");
songtime = document.getElementById("songtime");
songtime2 = document.getElementById("songtime2");
userid = "221273966457782283"
upprog = null
datasend = {
    op: 2,
    d: {
      subscribe_to_id: userid
    }
  }

function update(datas) {
    username = datas.d.discord_user.username;
    title.innerHTML = username;
    usernameel.innerHTML = username+"#"+datas.d.discord_user.discriminator;
    pdpimg.src = "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar;
    if (datas.d.discord_status == "dnd") {
        document.getElementById("status").style.backgroundColor = "#c63e40";
    } else if (datas.d.discord_status == "online") {
        document.getElementById("status").style.backgroundColor = "#00ff00";
    } else if (datas.d.discord_status == "idle") {
        document.getElementById("status").style.backgroundColor = "#ffff00";
    } else if (datas.d.discord_status == "offline") {
        document.getElementById("status").style.backgroundColor = "#ff0000";
    }

    cstatus.innerHTML = datas.d.activities["0"].state;
    cstatusd = datas.d.activities["0"].state;
    if (cstatusd.startsWith("http") || cstatusd.startsWith("https")) {
        cstatus.innerHTML = "<a href='"+datas.d.activities["0"].state+"'>"+datas.d.activities["0"].state+"</a>";
    }

    if (datas.d.spotify) {
        albumart.hidden = false;
        songartist.hidden = false;
        progress.hidden = false;
        songtime.hidden = false;
        songtime2.hidden = false;
        albumart.src = datas.d.spotify.album_art_url;
        songtitle.innerHTML = datas.d.spotify.song;
        songartist.innerHTML = datas.d.spotify.artist;
        progress.max = datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start;
        songtime2.innerHTML = parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000/60)+"m"+parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000%60)+"s";
        upprog = setInterval(() => {
            progress.value = Date.now() - datas.d.spotify.timestamps.start;
            songtime.innerHTML = parseInt((Date.now() - datas.d.spotify.timestamps.start)/1000/60)+"m"+parseInt((Date.now() - datas.d.spotify.timestamps.start)/1000%60)+"s";
        }, 10);
    } else {
        albumart.hidden = true;
        songartist.hidden = true;
        progress.hidden = true;
        songtime.hidden = true;
        songtime2.hidden = true;
        if (upprog !== null) {
            clearInterval(upprog);
        }
        songtitle.innerHTML = "I actually don't listen to anything.";
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