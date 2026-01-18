const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];

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

const playlists = [
    { name: "Trending", q: "Latest Hindi Songs", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { name: "Lofi", q: "Hindi Lofi", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300" }
];

function initHome() {
    document.getElementById('home-grid').innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}"><span>${p.name}</span>
        </div>`).join('');
    updateLibUI();
}

async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
        const data = await res.json();
        if(data.items) { currentList = data.items; renderSongs(currentList, 'search-results-container'); }
    }, 500);
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
    const data = await res.json();
    if(data.items) { currentList = data.items; renderSongs(currentList, 'song-list-container'); }
}

function renderSongs(list, targetId) {
    document.getElementById(targetId).innerHTML = list.map((s, i) => `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div style="flex:1" onclick="playSong(${i})"><h4>${s.snippet.title}</h4></div>
            <i class="fa-solid fa-heart" onclick="toggleFav(${i})"></i>
        </div>`).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    const vId = s.id.videoId || s.id;
    player.loadVideoById(vId);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
    document.getElementById('f-title').innerText = s.snippet.title;
}

// SPEED & VIDEO LOGIC
function setSpeed(val, e) {
    e.stopPropagation();
    player.setPlaybackRate(val);
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
}

function switchToVideo(e) {
    e.stopPropagation();
    const yt = document.getElementById('yt-player-container');
    if(!yt.classList.contains('video-mode')) {
        yt.classList.add('video-mode');
        yt.style.display = 'block';
        player.setSize(window.innerWidth * 0.9, 200);
    } else {
        yt.classList.remove('video-mode');
        yt.style.display = 'none';
        player.setSize(0, 0);
    }
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

function toggleMiniMenu(e) { e.stopPropagation(); document.getElementById('mini-popup-menu').classList.toggle('hidden'); }

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
function nextSong() { if(currentIndex < currentList.length-1) playSong(currentIndex+1); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1); }

function onPlayerStateChange(e) {
    let icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-icon').className = 'fa-solid ' + icon;
    document.getElementById('f-play-icon').className = 'fa-solid ' + icon;
    if(e.data === 0) nextSong();
}

function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}
function openFullPlayer() { document.getElementById('full-player').style.top = '0'; }
function closeFullPlayer() { document.getElementById('full-player').style.top = '100%'; }
function closePlaylist() { document.getElementById('home-grid').classList.remove('hidden'); document.getElementById('playlist-view').classList.add('hidden'); }
function updateLibUI() { document.getElementById('fav-count').innerText = favorites.length; }

document.addEventListener('click', () => document.getElementById('mini-popup-menu').classList.add('hidden'));
