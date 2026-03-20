let title = document.getElementById("title")
let pdpimg = document.getElementById("pdpimga");
let usernameel = document.getElementById("username");
let cstatus = document.getElementById("cstatus");
let albumart = document.getElementById("albumart");
let songtitle = document.getElementById("songtitle");
let songartist = document.getElementById("songartist");
let progress = document.getElementById("progress");
let songtime = document.getElementById("songtime");
let songtime2 = document.getElementById("songtime2");
let spoli = document.getElementById("spoli");
let progressbarfill = document.getElementById("progressbarfill");
let loadinganim = document.getElementById("loadinganim");
let tag = document.getElementById("tag");
let tagimg = document.getElementById("tagimg");
let tagdiv = document.getElementsByClassName("tagdiv")[0];
let emote = document.getElementById("emote");
let avatarDecoration = document.getElementById("avatarDecoration");
let userid = "221273966457782283"
let upprog = null
let hasStartedReveal = false
isLanLoaded = false
isPageLoaded = false
let effectsEnabled = true;
let autoDetectFPS = true;
let lowFpsFrames = 0;
let lastFrameTime = performance.now();

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.matchMedia("(pointer: coarse)").matches && window.matchMedia("(max-width: 768px)").matches);
}

function toggleEffects(manual = false) {
    if (manual) autoDetectFPS = false;
    effectsEnabled = !effectsEnabled;
    document.body.classList.toggle('effects-disabled', !effectsEnabled);
    
    let btn = document.getElementById("toggleEffectsBtn");
    if(btn) {
        btn.innerHTML = effectsEnabled ? '<i class="fa-solid fa-wand-magic-sparkles"></i>' : '<i class="fa-solid fa-power-off"></i>';
    }
}

function monitorPerformance(time) {
    if (!effectsEnabled || !autoDetectFPS) {
        lastFrameTime = time;
    } else {
        let delta = time - lastFrameTime;
        lastFrameTime = time;
        if (delta > 45) { // < 22 FPS threshold
            lowFpsFrames++;
        } else {
            lowFpsFrames = Math.max(0, lowFpsFrames - 1);
        }
        if (lowFpsFrames > 60) {
            console.log("High lag detected. Auto-disabling background effects for performance.");
            toggleEffects();
        }
    }
    requestAnimationFrame(monitorPerformance);
}
requestAnimationFrame(monitorPerformance);

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
    if (isPageLoaded && isLanLoaded && !hasStartedReveal) {
        hasStartedReveal = true;
        loadinganim.style.opacity = "0";
        // wait 1s
        setTimeout(() => {
        loadinganim.style.display = "none";
        document.body.classList.add("site-ready");
        }, 1050);
    }
}

window.addEventListener("load", function(){ 
    isPageLoaded = true;
    disableLoading();
    
    // Auto-disable effects on mobile devices
    if (isMobileDevice()) {
        toggleEffects();
        console.log("Mobile device detected. Background effects disabled automatically.");
    }
    
    initDots();
    initRain();
});

// Really Light Rain Animation
function initRain() {
    const canvas = document.getElementById("rainCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let raindrops = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createRaindrops() {
        raindrops = [];
        const numDrops = Math.floor((window.innerWidth * window.innerHeight) / 10000); // Light rain
        for (let i = 0; i < numDrops; i++) {
            raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 10 + 10,
                vy: Math.random() * 4 + 4, // Falls down
                alpha: Math.random() * 0.2 + 0.1 // Very light
            });
        }
    }

    function animate() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            requestAnimationFrame(animate);
        }

        ctx.clearRect(0, 0, width, height);

        if (!effectsEnabled) return;

        for (let i = 0; i < raindrops.length; i++) {
            let drop = raindrops[i];

            if (!prefersReducedMotion) {
                drop.y += drop.vy;

                if (drop.y > height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * width;
                }
            }

            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.strokeStyle = `rgba(200, 220, 255, ${drop.alpha + 0.15})`; // Slight blueish-white tint, moderate opacity
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    window.addEventListener("resize", () => {
        resize();
        createRaindrops();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animate();
        }
    });

    resize();
    createRaindrops();
    animate();
}

// Moving Dots Animation
function initDots() {
    const canvas = document.getElementById("dotsCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let dots = [];
    let mouse = {
        x: null,
        y: null,
        radius: 135
    };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    function createDots() {
        dots = [];
        const numDots = Math.floor((window.innerWidth * window.innerHeight) / 6000);
        for (let i = 0; i < numDots; i++) {
            dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.1
            });
        }
    }

    function animate() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            requestAnimationFrame(animate);
        }

        ctx.clearRect(0, 0, width, height);

        if (!effectsEnabled) return;

        for (let i = 0; i < dots.length; i++) {
            let dot = dots[i];
            
            if (!prefersReducedMotion) {
                dot.x += dot.vx;
                dot.y += dot.vy;

                // Mouse interaction
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - dot.x;
                    let dy = mouse.y - dot.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        let forceDirX = dx / distance;
                        let forceDirY = dy / distance;
                        let maxDistance = mouse.radius;
                        let force = (maxDistance - distance) / maxDistance;
                        let pushStr = 2.5;

                        dot.x -= forceDirX * force * pushStr;
                        dot.y -= forceDirY * force * pushStr;

                        // Connect dot to mouse
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        let lineAlpha = (1 - distance / mouse.radius) * 0.3;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                if (dot.x < 0) dot.x = width;
                if (dot.x > width) dot.x = 0;
                if (dot.y < 0) dot.y = height;
                if (dot.y > height) dot.y = 0;
            }

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${dot.alpha})`;
            ctx.fill();

            for (let j = i + 1; j < dots.length; j++) {
                let dot2 = dots[j];
                let dx = dot.x - dot2.x;
                let dy = dot.y - dot2.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(dot2.x, dot2.y);
                    let lineAlpha = (1 - distance / 100) * 0.3;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener("resize", () => {
        resize();
        createDots();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animate(); // Call once to draw static dots
        }
    });

    resize();
    createDots();
    animate();
}

function update(datas) {
    let username = datas.d.discord_user.display_name;
    title.innerHTML = username;
    usernameel.innerHTML = username;
    if (datas.d.discord_user.primary_guild && datas.d.discord_user.primary_guild.tag) {
        tagdiv.style.display = "flex";
        tagdiv.style.opacity = "1";
        tag.innerHTML = datas.d.discord_user.primary_guild.tag;
        tagimg.src = `https://cdn.discordapp.com/clan-badges/${datas.d.discord_user.primary_guild.identity_guild_id}/${datas.d.discord_user.primary_guild.badge}.png?size=32`;
    } else {
        tagdiv.style.display = "none";
        tagdiv.style.opacity = "0";
    }
    if ( pdpimg.src !== "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar) {
        pdpimg.src = "https://cdn.discordapp.com/avatars/"+userid+"/"+datas.d.discord_user.avatar;
    }

    let avatarDecorationData = datas.d.discord_user.avatar_decoration_data;
    if (avatarDecorationData && avatarDecorationData.asset) {
        let ext = avatarDecorationData.asset.startsWith("a_") ? "gif" : "png";
        let decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${avatarDecorationData.asset}.${ext}?size=240&passthrough=true`;
        if (avatarDecoration.src !== decorationUrl) {
            avatarDecoration.src = decorationUrl;
            avatarDecoration.onerror = () => {
                avatarDecoration.src = `https://cdn.discordapp.com/avatar-decoration-presets/${avatarDecorationData.asset}.png?size=240&passthrough=true`;
            };
        }
        avatarDecoration.hidden = false;
    } else {
        avatarDecoration.hidden = true;
        avatarDecoration.src = "";
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
        cstatus.innerHTML = "";
        emote.style.display = "none";
    } else {
        if (datas.d.spotify) {
            if (datas.d.activities["0"].state == datas.d.spotify.artist) {
                cstatus.innerHTML = ""
            }
        }
        if (datas.d.activities["0"].id == "custom") {
            if (datas.d.activities["0"].emoji) {
                if (!datas.d.activities["0"].emoji.id) {
                    cstatusd = `${datas.d.activities["0"].emoji.name} ${datas.d.activities["0"].state}` || "";
                    emote.style.display = "none";
                } else {
                    emote.style.display = "block";
                    emote.src = `https://cdn.discordapp.com/emojis/${datas.d.activities["0"].emoji.id}.${datas.d.activities["0"].emoji.animated ? "gif" : "png"}`;
                    cstatusd = datas.d.activities["0"].state || "";
                }
            } else {
                cstatusd = datas.d.activities["0"].state || "";
                emote.style.display = "none";
            }
            cstatus.innerHTML = cstatusd
            if (cstatusd.startsWith("http") || cstatusd.startsWith("https")) {
                cstatus.innerHTML = "<a href='"+datas.d.activities["0"].state+"'>"+datas.d.activities["0"].state+"</a>";
            }
        } else {
            cstatusd = datas.d.activities["0"].state;
            emote.style.display = "none";
        }
    }

    if (datas.d.spotify) {
        clearInterval(upprog);
        albumart.hidden = false;
        songartist.hidden = false;
        progress.hidden = false;
        songtime.hidden = false;
        songtime2.hidden = false;
        spoli.href = "https://open.spotify.com/track/"+datas.d.spotify.track_id;
        albumart.src = datas.d.spotify.album_art_url;
        getAverageBorderColor(datas.d.spotify.album_art_url, 0.1).then((averageColor) => {
            albumart.style.boxShadow = "0 0 10px 10px "+averageColor
            console.log(averageColor)});
        songtitle.innerHTML = datas.d.spotify.song;
        songartist.innerHTML = datas.d.spotify.artist;
        songtime2.innerHTML = parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000/60)+"m"+formatnum(parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000%60))+"s";
        upprog = setInterval(() => {
            now = new Date().getTime();
            duration = datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start;
            wherenow = now - datas.d.spotify.timestamps.start;
            prcnt = (wherenow/duration) * 100;
            songtime.innerHTML = parseInt((Date.now() - datas.d.spotify.timestamps.start)/1000/60)+"m"+formatnum(parseInt((Date.now() - datas.d.spotify.timestamps.start)/1000%60))+"s";
            progressbarfill.style.width = prcnt+"%";
        }, 100);
    } else {
        albumart.hidden = true;
        songartist.hidden = true;
        progress.hidden = true;
        songtime.hidden = true;
        songtime2.hidden = true;
        spoli.href = "";
        if (upprog !== null) {
            clearInterval(upprog);
        }
        songtitle.innerHTML = "I don't listen to anything now";
    }
    if (!isLanLoaded) {
        isLanLoaded = true;
        disableLoading();
    }
}

let lanyard = new WebSocket("wss://api.lanyard.rest/socket");

lanyard.onmessage = function(event) {
    jsonData = JSON.parse(event.data);
    console.log(jsonData);
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
