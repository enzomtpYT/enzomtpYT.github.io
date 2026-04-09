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
let isLanLoaded = false
let isPageLoaded = false
let effectsEnabled = true;
let autoDetectFPS = true;
let lowFpsFrames = 0;
let lastFrameTime = performance.now();
let monitorRafId = null;
let rainRafId = null;
let dotsRafId = null;

// Cache media query — listen for changes instead of polling every frame
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
});

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

    // Stop or restart animation loops
    if (effectsEnabled) {
        startAnimations();
    } else {
        stopAnimations();
    }
}

let drawRain = null;
let drawDots = null;
let lastDrawTime = 0;

function stopAnimations() {
    if (monitorRafId) { cancelAnimationFrame(monitorRafId); monitorRafId = null; }
    // Clear both canvases so they don't leave stale frames
    let rc = document.getElementById("rainCanvas");
    let dc = document.getElementById("dotsCanvas");
    if (rc) rc.getContext("2d").clearRect(0, 0, rc.width, rc.height);
    if (dc) dc.getContext("2d").clearRect(0, 0, dc.width, dc.height);
}

function startAnimations() {
    if (!monitorRafId && document.getElementById("rainCanvas") && document.getElementById("dotsCanvas")) {
        lastFrameTime = performance.now();
        lastDrawTime = performance.now();
        monitorRafId = requestAnimationFrame(mainAnimationLoop);
    }
}

function mainAnimationLoop(time) {
    if (!effectsEnabled) return;

    monitorRafId = requestAnimationFrame(mainAnimationLoop);

    if (autoDetectFPS) {
        let delta = time - lastFrameTime;
        lastFrameTime = time;
        if (delta > 45) {
            lowFpsFrames++;
        } else {
            lowFpsFrames = Math.max(0, lowFpsFrames - 1);
        }
        if (lowFpsFrames > 60) {
            console.log("High lag detected. Auto-disabling background effects for performance.");
            toggleEffects();
            return;
        }
    } else {
        lastFrameTime = time;
    }

    if (document.hidden) return;

    if (time - lastDrawTime < 33) return;
    lastDrawTime = time;

    if (drawRain) drawRain();
    if (drawDots) drawDots();
}

// Start loop
monitorRafId = requestAnimationFrame(mainAnimationLoop);

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
        
        const targetSize = 64;
        canvas.width = targetSize;
        canvas.height = targetSize;
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
  
        const scaledBorder = Math.max(1, Math.round((borderWidth / img.width) * targetSize));

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const pixelIndex = (y * canvas.width + x) * 4;
            if (x < scaledBorder || x >= canvas.width - scaledBorder ||
                y < scaledBorder || y >= canvas.height - scaledBorder) {
              totalR += data[pixelIndex];
              totalG += data[pixelIndex + 1];
              totalB += data[pixelIndex + 2];
              count++;
            }
          }
        }
  
        if (count === 0) {
            resolve("var(--accent)");
        } else {
            const avgR = Math.round(totalR / count);
            const avgG = Math.round(totalG / count);
            const avgB = Math.round(totalB / count);
            resolve(`rgb(${avgR}, ${avgG}, ${avgB})`);
        }
      };
      img.onerror = () => resolve("var(--accent)");
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
        effectsEnabled = false;
        document.body.classList.add('effects-disabled');
        let btn = document.getElementById("toggleEffectsBtn");
        if(btn) btn.innerHTML = '<i class="fa-solid fa-power-off"></i>';
        console.log("Mobile device detected. Background effects disabled automatically.");
        return; // Don't init canvas animations at all
    }
    
    if (!prefersReducedMotion) {
        initDots();
        initRain();
    }
});

// Really Light Rain Animation
function initRain() {
    const canvas = document.getElementById("rainCanvas");
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let raindrops = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createRaindrops() {
        raindrops = [];
        const numDrops = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 100);
        for (let i = 0; i < numDrops; i++) {
            raindrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 10 + 10,
                vy: Math.random() * 4 + 4,
                alpha: Math.random() * 0.2 + 0.1
            });
        }
    }

    drawRain = function() {
        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < raindrops.length; i++) {
            let drop = raindrops[i];
            drop.y += drop.vy * 2; 
            if (drop.y > height) {
                drop.y = -drop.length;
                drop.x = Math.random() * width;
            }
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
        }
        ctx.strokeStyle = "rgba(200, 220, 255, 0.28)";
        ctx.stroke();
    };

    window.addEventListener("resize", () => {
        resize();
        createRaindrops();
    });

    resize();
    createRaindrops();
}

// Moving Dots Animation
function initDots() {
    const canvas = document.getElementById("dotsCanvas");
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let dots = [];
    const CONNECTION_DIST = 100;
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST; // avoid sqrt
    const MOUSE_RADIUS_SQ = 135 * 135;
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
        const numDots = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 9000), 160);
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

    drawDots = function() {
        ctx.clearRect(0, 0, width, height);

        const hasMouse = mouse.x != null && mouse.y != null;
        const len = dots.length;

        // 1) Update positions
        for (let i = 0; i < len; i++) {
            let dot = dots[i];
            dot.x += dot.vx * 2;
            dot.y += dot.vy * 2;

            if (dot.x < 0) dot.x = width;
            if (dot.x > width) dot.x = 0;
            if (dot.y < 0) dot.y = height;
            if (dot.y > height) dot.y = 0;

            // Mouse push
            if (hasMouse) {
                let dx = mouse.x - dot.x;
                let dy = mouse.y - dot.y;
                let distSq = dx * dx + dy * dy;
                if (distSq < MOUSE_RADIUS_SQ && distSq > 0) {
                    let distance = Math.sqrt(distSq);
                    let force = (mouse.radius - distance) / mouse.radius;
                    dot.x -= (dx / distance) * force * 5.0;
                    dot.y -= (dy / distance) * force * 5.0;
                }
            }
        }

        dots.sort((a, b) => a.x - b.x);

        // 2) Draw dots
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
            let dot = dots[i];
            ctx.moveTo(dot.x + dot.radius, dot.y);
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        // 3) Draw connection lines — batch into single path
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
            let dot = dots[i];
            for (let j = i + 1; j < len; j++) {
                let dot2 = dots[j];
                if (dot2.x - dot.x > CONNECTION_DIST) break;

                let dy = dot.y - dot2.y;
                if (Math.abs(dy) > CONNECTION_DIST) continue;

                let dx = dot.x - dot2.x;
                if (dx * dx + dy * dy < CONNECTION_DIST_SQ) {
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(dot2.x, dot2.y);
                }
            }
        }
        ctx.stroke();

        // 4) Draw mouse connection lines separately
        if (hasMouse) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.beginPath();
            for (let i = 0; i < len; i++) {
                let dot = dots[i];
                let dx = mouse.x - dot.x;
                let dy = mouse.y - dot.y;
                if (dx * dx + dy * dy < MOUSE_RADIUS_SQ) {
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouse.x, mouse.y);
                }
            }
            ctx.stroke();
        }
    };

    window.addEventListener("resize", () => {
        resize();
        createDots();
    });

    resize();
    createDots();
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
        getAverageBorderColor(datas.d.spotify.album_art_url, 4).then((averageColor) => {
            albumart.style.boxShadow = "0 0 10px 4px "+averageColor;
        });
        songtitle.innerHTML = datas.d.spotify.song;
        songartist.innerHTML = datas.d.spotify.artist;
        songtime2.innerHTML = parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000/60)+"m"+formatnum(parseInt((datas.d.spotify.timestamps.end - datas.d.spotify.timestamps.start)/1000%60))+"s";
        let spotStart = datas.d.spotify.timestamps.start;
        let spotDuration = datas.d.spotify.timestamps.end - spotStart;
        upprog = setInterval(() => {
            let elapsed = Date.now() - spotStart;
            let prcnt = (elapsed / spotDuration) * 100;
            songtime.textContent = parseInt(elapsed/1000/60)+"m"+formatnum(parseInt(elapsed/1000%60))+"s";
            progressbarfill.style.width = prcnt+"%";
        }, 500);
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
