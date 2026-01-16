const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1, searchTimer;

// API Pre-loading
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', 
        events: { 'onStateChange': onPlayerStateChange, 'onReady': () => setInterval(updateProgress, 1000) }
    });
}

const playlists = [
    { id: 'p1', name: 'Chill Mix', q: 'Hindi Lofi Songs 2026', img: 'https://i.ytimg.com/vi/ApnaBanaLe/maxresdefault.jpg' },
    { id: 'p2', name: 'Pop Trending', q: 'Trending Bollywood Songs', img: 'https://i.ytimg.com/vi/Kesariya/maxresdefault.jpg' }
];

function loadHome() {
    const grid = document.getElementById('home-playlists');
    grid.innerHTML = playlists.map(p => `
        <div class="playlist-card" onclick="openPlaylist('${p.q}', '${p.img}', '${p.name}')">
            <img src="${p.img}">
            <h4>${p.name}</h4>
        </div>
    `).join('');
}

async function openPlaylist(query, img, name) {
    document.getElementById('home-playlists').classList.add('hidden');
    document.getElementById('playlist-detail').classList.remove('hidden');
    document.getElementById('detail-img').src = img;
    document.getElementById('detail-name').innerText = name;
    
    // VideoDuration: medium filtering (4 to 20 mins approx)
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&type=video&videoDuration=medium&key=${API_KEY}`);
    const data = await res.json();
    
    const container = document.getElementById('song-list-container');
    container.innerHTML = data.items.map((s, i) => `
        <div class="song-item" onclick="playSong(${i}, ${JSON.stringify(data.items).replace(/"/g, '&quot;')})">
            <img src="${s.snippet.thumbnails.default.url}">
            <div class="song-meta"><h4>${s.snippet.title}</h4><p>${s.snippet.channelTitle}</p></div>
        </div>
    `).join('');
}

function instantSearch() {
    const q = document.getElementById('search-input').value;
    if (q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&videoDuration=medium&key=${API_KEY}`);
        const data = await res.json();
        document.getElementById('search-results').innerHTML = data.items.map((s, i) => `
            <div class="playlist-card" onclick="playSong(${i}, ${JSON.stringify(data.items).replace(/"/g, '&quot;')})">
                <img src="${s.snippet.thumbnails.medium.url}">
                <h4>${s.snippet.title}</h4>
            </div>
        `).join('');
    }, 400);
}

function playSong(idx, list) {
    currentPlaylist = list; currentIndex = idx;
    const s = list[idx];
    player.loadVideoById(s.id.videoId);
    
    document.getElementById('mini-title').innerText = s.snippet.title;
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('mini-artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('mini-cover').src = s.snippet.thumbnails.default.url;
    document.getElementById('full-cover').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) { if(e) e.stopPropagation(); const s = player.getPlayerState(); s === 1 ? player.pauseVideo() : player.playVideo(); }
function nextSong(e) { if(e) e.stopPropagation(); if(currentIndex < currentPlaylist.length-1) playSong(currentIndex+1, currentPlaylist); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1, currentPlaylist); }

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('mini-play-btn').innerHTML = `<i class="fa-solid ${icon}"></i>`;
    document.getElementById('big-play-icon').className = `fa-solid ${icon}`;
    if(e.data === 0) nextSong();
}

function updateProgress() {
    if(player && player.getDuration) {
        const curr = player.getCurrentTime(), dur = player.getDuration();
        document.getElementById('progress-bar').style.width = (curr/dur*100) + "%";
        document.getElementById('curr-time').innerText = formatTime(curr);
        document.getElementById('total-time').innerText = formatTime(dur);
    }
}
function formatTime(s) { let m=Math.floor(s/60), sc=Math.floor(s%60); return m+":"+(sc<10?'0':'')+sc; }
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
    document.getElementById('app-title').innerText = id.split('-')[0].toUpperCase();
}
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function backToHome() { document.getElementById('home-playlists').classList.remove('hidden'); document.getElementById('playlist-detail').classList.add('hidden'); }

loadHome();
