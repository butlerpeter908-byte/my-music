const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer, sleepTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];

// YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        playerVars: { 'playsinline': 1, 'controls': 0 },
        events: { 
            'onReady': () => { initHome(); setInterval(updateProgress, 1000); }, 
            'onStateChange': onPlayerStateChange 
        }
    });
}

// SHORTS FILTERED SEARCH
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        // videoDuration: 'medium' filter will skip short videos (< 4 mins and > 20 mins approx)
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&videoDuration=medium&key=${API_KEY}`);
        const data = await res.json();
        if(data.items) { currentList = data.items; renderSongs(currentList, 'search-results-container'); }
    }, 500);
}

function renderSongs(list, targetId) {
    document.getElementById(targetId).innerHTML = list.map((s, i) => `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div style="flex:1" onclick="playSong(${i})">
                <h4 style="font-size:14px;">${s.snippet.title.substring(0, 50)}...</h4>
            </div>
            <i class="fa-solid fa-heart" onclick="toggleFav(${i})" style="color:${isFav(s)?'#ff4d4d':'#555'}"></i>
        </div>`).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId || s.id);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
    document.getElementById('f-title').innerText = s.snippet.title;
}

// SLEEP TIMER
function setTimer(mins) {
    if(sleepTimer) clearTimeout(sleepTimer);
    if(mins === 0) {
        document.getElementById('timer-status').innerText = "Timer Off";
        return;
    }
    document.getElementById('timer-status').innerText = `App will stop in ${mins} minutes`;
    sleepTimer = setTimeout(() => {
        player.pauseVideo();
        alert("Sleep timer active: Music stopped.");
    }, mins * 60000);
    setTimeout(() => toggleTimerMenu(), 1500);
}

// LYRICS (Auto-fetch Mockup)
async function showLyrics() {
    if(currentIndex === -1) return;
    const title = currentList[currentIndex].snippet.title;
    document.getElementById('lyrics-screen').style.display = 'flex';
    document.getElementById('lyric-title').innerText = title;
    document.getElementById('lyric-content').innerHTML = `
        <p>Hum tere bin ab reh nahi sakte...</p>
        <p>Tere bina kya wajood mera...</p>
        <p>Tujhse juda agar ho jayenge...</p>
        <p>Toh khud se hi ho jayenge juda...</p>
        <br><br>
        <p style="font-size:14px; color:#555;">(Full lyrics coming soon from Genius API integration)</p>
    `;
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

// VISUALIZER (Fake but looks cool)
function drawVisualizer() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    function animate() {
        if(player.getPlayerState() === 1) {
            ctx.clearRect(0,0,canvas.width, canvas.height);
            ctx.fillStyle = '#9cd67d';
            for(let i=0; i<30; i++) {
                let h = Math.random() * 50;
                ctx.fillRect(i*12, 100-h, 8, h);
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// BASIC UTILS
function updateProgress() {
    if(player && player.getDuration && player.getPlayerState() === 1) {
        let curr = player.getCurrentTime(), dur = player.getDuration();
        let perc = (curr / dur) * 100;
        document.getElementById('mini-progress').style.width = perc + "%";
        document.getElementById('progress-fill').style.width = perc + "%";
        document.getElementById('m-time').innerText = formatTime(curr) + " / " + formatTime(dur);
    }
}
function formatTime(t) { let m = Math.floor(t/60), s = Math.floor(t%60); return m + ":" + (s < 10 ? '0'+s : s); }
function manualSeek(e, id) {
    const bar = document.getElementById(id);
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}
function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }
function onPlayerStateChange(e) {
    document.getElementById('m-play-icon').className = 'fa-solid ' + (e.data === 1 ? 'fa-pause' : 'fa-play');
    if(e.data === 1) drawVisualizer();
}
function toggleMiniMenu(e) { e.stopPropagation(); document.getElementById('mini-popup-menu').classList.toggle('hidden'); }
function toggleTimerMenu() { 
    const m = document.getElementById('timer-menu');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}
function openFullPlayer() { document.getElementById('full-player').style.top = '0'; }
function closeFullPlayer() { document.getElementById('full-player').style.top = '100%'; }
function initHome() { 
    // Initial home items...
    document.getElementById('home-grid').innerHTML = '<p style="padding:20px;">Search for your favorite songs to start!</p>';
}
function isFav(s) { return favorites.some(f => f.id === (s.id.videoId || s.id)); }
