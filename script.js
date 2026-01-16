const API_KEY = 'YOUR_NEW_API_KEY_HERE'; 
let player, currentList = [], currentIndex = -1, searchTimer;

// Load YT API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 
            'onStateChange': onPlayerStateChange,
            'onReady': () => { setInterval(updateProgress, 1000); init(); }
        }
    });
}

const playlists = [
    { name: "Top Hindi 2026", q: "Latest Bollywood Songs 2026", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" },
    { name: "Spotify Chill", q: "Hindi Lofi Mix", img: "https://img.youtube.com/vi/Kesariya/0.jpg" },
    { name: "Indie Pop", q: "New Indian Indie Pop", img: "https://img.youtube.com/vi/KumarSanu/0.jpg" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/150'">
            <h4>${p.name}</h4>
        </div>
    `).join('');
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const listDiv = document.getElementById('song-list');
    listDiv.innerHTML = "<p style='text-align:center; padding:20px; color:#9cd67d;'>Fetching songs...</p>";

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${q}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    
    listDiv.innerHTML = data.items.map((s, i) => `
        <div style="display:flex; align-items:center; gap:15px; padding:12px 0; border-bottom:1px solid #111;" onclick="playSong(${i})">
            <img src="${s.snippet.thumbnails.default.url}" style="width:50px; border-radius:5px;">
            <div style="overflow:hidden;">
                <h4 style="font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.snippet.title}</h4>
                <p style="font-size:12px; color:#b3b3b3;">${s.snippet.channelTitle}</p>
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
                <h4>${s.snippet.title}</h4>
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
function nextSong(e) { if(e) e.stopPropagation(); if(currentIndex < currentList.length-1) playSong(currentIndex+1); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1); }

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-icon').className = 'fa-solid ' + icon;
    document.getElementById('f-play-icon').className = 'fa-solid ' + icon;
    if(e.data === 0) nextSong();
}

function updateProgress() {
    if(player && player.getDuration) {
        document.getElementById('progress-fill').style.width = (player.getCurrentTime() / player.getDuration() * 100) + "%";
    }
}

function manualSeek(e) {
    const rect = document.getElementById('seek-bar').getBoundingClientRect();
    player.seekTo(((e.clientX - rect.left) / rect.width) * player.getDuration());
}

function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { document.getElementById('home-grid').classList.remove('hidden'); document.getElementById('playlist-view').classList.add('hidden'); }
