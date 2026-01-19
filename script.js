const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer, sleepTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];

// 1. YouTube Setup
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        playerVars: { 'playsinline': 1, 'controls': 0, 'rel': 0 },
        events: { 
            'onReady': () => { initHome(); setInterval(updateProgress, 1000); }, 
            'onStateChange': onPlayerStateChange 
        }
    });
}

// 2. Fixed Images & Playlists
const playlists = [
    { name: "Global Hits", q: "Billboard Hot 100 Official", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=400" },
    { name: "Trending Hindi", q: "Latest Hindi Songs 2026", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400" },
    { name: "Hollywood Pop", q: "Hollywood Pop Hits 2026", img: "https://images.unsplash.com/photo-1514525253361-bee87184919a?auto=format&fit=crop&w=400" },
    { name: "Punjabi Beats", q: "Latest Punjabi Songs 2026", img: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&w=400" }
];

function initHome() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="fetchPlaylist('${p.q}')">
            <img src="${p.img}" loading="lazy">
            <span>${p.name}</span>
        </div>
    `).join('');
    updateFavCount();
}

// 3. Global Search Fix (Serena Safari Original)
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 3) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const cleanQuery = encodeURIComponent(q + " official audio -remix -cover -shorts");
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${cleanQuery}&type=video&videoEmbeddable=true&relevanceLanguage=en&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.items) {
            currentList = data.items;
            renderSongs(currentList, 'search-results-container');
        }
    }, 600);
}

// 4. Lyrics Fetcher
async function showLyrics() {
    if(currentIndex === -1) return;
    const songTitle = currentList[currentIndex].snippet.title;
    const cleanTitle = songTitle.replace(/\[.*?\]|\(.*?\)|Official|Video|Audio|Lyrics/gi, '').trim();
    
    document.getElementById('l-title').innerText = cleanTitle;
    document.getElementById('l-content').innerText = "Fetching lyrics from database...";
    toggleOverlay('lyrics-overlay');

    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanTitle)}`);
        const data = await response.json();
        document.getElementById('l-content').innerText = data.lyrics || "Lyrics not found for this track. Try searching with artist name.";
    } catch (e) {
        document.getElementById('l-content').innerText = "Could not load lyrics.";
    }
}

// 5. Shared Core Logic
async function fetchPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(q + " -shorts")}&type=video&videoDuration=medium&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    currentList = data.items;
    renderSongs(currentList, 'song-list-container');
}

function renderSongs(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = list.map((s, i) => {
        const vid = s.id.videoId || s.id;
        const isF = favorites.some(f => (f.id.videoId || f.id) === vid);
        return `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div style="flex:1" onclick="playSong(${i})">
                <div style="font-size:14px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.snippet.title}</div>
                <div style="font-size:11px; color:#888;">${s.snippet.channelTitle}</div>
            </div>
            <i class="fa-solid fa-heart ${isF ? 'fav-active' : ''}" onclick="toggleFav(${i})" style="padding:10px; font-size:20px;"></i>
        </div>`;
    }).join('');
}

function openLibraryFolder() {
    if(favorites.length === 0) return alert("Library Empty!");
    currentList = [...favorites];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId || s.id);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('f-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
}

function toggleFav(i) {
    const s = currentList[i];
    const vid = s.id.videoId || s.id;
    const idx = favorites.findIndex(f => (f.id.videoId || f.id) === vid);
    if(idx > -1) favorites.splice(idx, 1);
    else favorites.push(s);
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateFavCount();
    const target = document.querySelector('.tab-content:not(.hidden) div[id$="container"]');
    if(target) renderSongs(currentList, target.id);
}

function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}

function backToHome() {
    document.getElementById('home-grid').classList.remove('hidden');
    document.getElementById('playlist-view').classList.add('hidden');
}

function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-btn').className = 'fa-solid ' + icon;
    document.getElementById('f-play-btn').className = 'fa-solid ' + icon;
    if(e.data === 0) nextSong();
}

function updateProgress() {
    if(player && player.getDuration && player.getPlayerState() === 1) {
        let curr = player.getCurrentTime(), dur = player.getDuration();
        let perc = (curr / dur) * 100;
        document.getElementById('mini-progress').style.width = perc + "%";
        document.getElementById('f-progress').style.width = perc + "%";
        document.getElementById('m-time').innerText = formatTime(curr) + " / " + formatTime(dur);
    }
}

function formatTime(t) { let m = Math.floor(t/60), s = Math.floor(t%60); return m + ":" + (s < 10 ? '0'+s : s); }
function updateFavCount() { document.getElementById('fav-count').innerText = favorites.length; }
function toggleMenu(e) { e.stopPropagation(); document.getElementById('mini-popup-menu').classList.toggle('hidden'); }
function toggleOverlay(id) { const el = document.getElementById(id); el.style.display = (el.style.display === 'flex') ? 'none' : 'flex'; }
function openFullPlayer() { document.getElementById('full-player').style.top = '0'; }
function closeFullPlayer() { document.getElementById('full-player').style.top = '100%'; }
function nextSong() { if(currentIndex < currentList.length-1) playSong(currentIndex+1); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1); }
function changeSpeed() { const s = prompt("Speed (0.5 to 2):", "1"); if(s) player.setPlaybackRate(parseFloat(s)); }
function setTimer(m) { 
    if(sleepTimer) clearTimeout(sleepTimer);
    if(m > 0) {
        sleepTimer = setTimeout(() => { player.pauseVideo(); alert("Timer Done"); }, m * 60000);
        alert("Timer set for " + m + " mins");
    }
    toggleOverlay('timer-menu');
}

function manualSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}

document.addEventListener('click', () => document.getElementById('mini-popup-menu').classList.add('hidden'));
