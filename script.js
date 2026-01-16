const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer;

// Load YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 
            'onStateChange': onPlayerStateChange,
            'onReady': () => {
                setInterval(updateProgress, 1000);
                init(); // Start after player ready
            }
        }
    });
}

// Same Spotify Playlists you had
const initialPlaylists = [
    { name: "Bollywood Hits", q: "New Bollywood Songs 2026", img: "https://i.ytimg.com/vi/ApnaBanaLe/maxresdefault.jpg" },
    { name: "Trending Now", q: "Popular Hindi Music", img: "https://i.ytimg.com/vi/Kesariya/maxresdefault.jpg" },
    { name: "90s Gold", q: "90s Bollywood Hits", img: "https://i.ytimg.com/vi/KumarSanu/maxresdefault.jpg" },
    { name: "Indie Pop", q: "Indian Indie Pop 2025", img: "https://i.ytimg.com/vi/ApnaBanaLe/maxresdefault.jpg" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = initialPlaylists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}">
            <h4>${p.name}</h4>
        </div>
    `).join('');
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const listDiv = document.getElementById('song-list');
    listDiv.innerHTML = "<p style='text-align:center; padding:20px; color:#9cd67d;'>Loading Spotify Mix...</p>";

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${q}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    
    listDiv.innerHTML = data.items.map((s, i) => `
        <div class="song-item" onclick="playSong(${i})">
            <img src="${s.snippet.thumbnails.default.url}">
            <div class="song-info-text">
                <h4>${s.snippet.title.substring(0,40)}</h4>
                <p>${s.snippet.channelTitle}</p>
            </div>
        </div>
    `).join('');
}

async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${API_KEY}`);
        const data = await res.json();
        currentList = data.items;
        document.getElementById('search-results').innerHTML = data.items.map((s, i) => `
            <div class="card" onclick="playSong(${i})">
                <img src="${s.snippet.thumbnails.medium.url}">
                <h4>${s.snippet.title.substring(0,30)}</h4>
            </div>
        `).join('');
    }, 600);
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('f-title').innerText = s.snippet.title;
    document.getElementById('m-artist').innerText = s.snippet.channelTitle;
    document.getElementById('f-artist').innerText = s.snippet.channelTitle;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }
function nextSong(e) { if(e) e.stopPropagation(); if(currentIndex < currentList.length - 1) playSong(currentIndex + 1); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex - 1); }

function onPlayerStateChange(e) {
    const mIcon = document.getElementById('m-play-icon');
    const fIcon = document.getElementById('f-play-icon');
    const icon = (e.data === 1) ? 'fa-pause' : 'fa-play';
    mIcon.className = 'fa-solid ' + icon;
    fIcon.className = 'fa-solid ' + icon;
    if(e.data === 0) nextSong();
}

function updateProgress() {
    if(player && player.getDuration) {
        const curr = player.getCurrentTime(), dur = player.getDuration();
        if(dur > 0) {
            document.getElementById('progress-fill').style.width = (curr/dur*100) + "%";
            document.getElementById('curr-time').innerText = formatTime(curr);
            document.getElementById('total-time').innerText = formatTime(dur);
        }
    }
}

function manualSeek(e) {
    const rect = document.getElementById('seek-bar').getBoundingClientRect();
    player.seekTo(((e.clientX - rect.left) / rect.width) * player.getDuration());
}

function formatTime(s) { let m=Math.floor(s/60), sc=Math.floor(s%60); return m+":"+(sc<10?'0':'')+sc; }
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('tab-title').innerText = id.replace('-section', '').toUpperCase();
}
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { 
    document.getElementById('home-grid').classList.remove('hidden'); 
    document.getElementById('playlist-view').classList.add('hidden'); 
}
