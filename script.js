const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player, currentList = [], currentIndex = -1, searchTimer;

// YT API Setup
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 'onReady': init, 'onStateChange': onPlayerStateChange }
    });
}

// Banner Images for Categories
const playlists = [
    { name: "Trending", q: "Latest Hindi Hits 2026", img: "https://t3.ftcdn.net/jpg/04/54/66/12/360_F_454661277_3H7fJuxpxsZp8S9Q9lW6m6Y6nS6n6n6n.jpg" },
    { name: "Lofi Mix", q: "Hindi Lofi Chill", img: "https://img.freepik.com/free-vector/lo-fi-music-concept-illustration_114360-6425.jpg" },
    { name: "Romantic", q: "Arijit Singh Romantic Hits", img: "https://i.pinimg.com/736x/8a/34/06/8a3406f0e38605d3b687f9f7d2f9d6c7.jpg" },
    { name: "Indie", q: "Indian Indie Pop", img: "https://i.ytimg.com/vi/KumarSanu/maxresdefault.jpg" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <div class="banner-box">
                <img src="${p.img}">
                <span>${p.name}</span>
            </div>
        </div>
    `).join('');
}

// Search Function (Live Results)
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    const resultsDiv = document.getElementById('search-results');
    if(q.length < 2) return;

    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
        const data = await res.json();
        currentList = data.items;
        
        resultsDiv.innerHTML = data.items.map((s, i) => `
            <div class="search-card" onclick="playSong(${i})">
                <img src="${s.snippet.thumbnails.medium.url}">
                <div class="info">
                    <h4>${s.snippet.title}</h4>
                    <p>${s.snippet.channelTitle}</p>
                </div>
            </div>
        `).join('');
    }, 600);
}

// Playback Logic
async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${q}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    
    document.getElementById('song-list').innerHTML = data.items.map((s, i) => `
        <div class="list-item" onclick="playSong(${i})">
            <img src="${s.snippet.thumbnails.default.url}">
            <div class="info">
                <h4>${s.snippet.title}</h4>
            </div>
        </div>
    `).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
    document.getElementById('f-title').innerText = s.snippet.title;
}

function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }
function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-icon').className = 'fa-solid ' + icon;
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
