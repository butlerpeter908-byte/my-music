const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player, currentList = [], currentIndex = -1;

// YT API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 'onReady': init, 'onStateChange': onPlayerStateChange }
    });
}

// Naya Spotify Mix (Only 4 Clean Categories)
const playlists = [
    { name: "Trending", q: "Latest Hindi Songs 2026", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" },
    { name: "Lofi", q: "Hindi Lofi Mix", img: "https://img.youtube.com/vi/Kesariya/0.jpg" },
    { name: "Romantic", q: "Bollywood Romantic Hits", img: "https://img.youtube.com/vi/KumarSanu/0.jpg" },
    { name: "Indie", q: "Indian Indie Pop", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}">
            <h4>${p.name}</h4>
        </div>
    `).join('');
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    
    document.getElementById('song-list').innerHTML = data.items.map((s, i) => `
        <div style="display:flex; align-items:center; gap:15px; padding:12px 0;" onclick="playSong(${i})">
            <img src="${s.snippet.thumbnails.default.url}" style="width:48px; height:48px; border-radius:8px;">
            <div style="flex:1; overflow:hidden;">
                <h4 style="font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.snippet.title}</h4>
                <p style="font-size:12px; color:#666;">${s.snippet.channelTitle}</p>
            </div>
        </div>
    `).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId);
    
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-artist').innerText = s.snippet.channelTitle;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    
    document.getElementById('f-title').innerText = s.snippet.title;
    document.getElementById('f-artist').innerText = s.snippet.channelTitle;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }
function nextSong(e) { if(e) e.stopPropagation(); if(currentIndex < currentList.length-1) playSong(currentIndex+1); }
function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-icon').className = 'fa-solid ' + icon;
    document.getElementById('f-play-icon').className = 'fa-solid ' + icon;
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
