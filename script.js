const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer, sleepTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];

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

const playlists = [
    { name: "Global Hits", q: "Billboard Hot 100 Official", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400" },
    { name: "Trending Hindi", q: "Latest Hindi Songs 2026", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400" },
    { name: "Chill Lofi", q: "Lofi Hip Hop Chill Mix 2026", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400" },
    { name: "English Pop", q: "Top Hollywood Pop Hits", img: "https://images.unsplash.com/photo-1514525253361-bee87184919a?w=400" }
];

function initHome() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="fetchPlaylist('${p.q}')">
            <img src="${p.img}">
            <span>${p.name}</span>
        </div>
    `).join('');
    updateFavCount();
}

// ------------------------------------------------------------------
// GLOBAL SEARCH FIX: Safari Serena ab Original aayega
// ------------------------------------------------------------------
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 3) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        // Query mein -remix -cover aur -shorts add kiya hai taaki ORIGINAL pehle aaye
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
                <div style="font-size:14px; font-weight:bold;">${s.snippet.title.substring(0, 50)}</div>
                <div style="font-size:11px; color:#888;">${s.snippet.channelTitle}</div>
            </div>
            <i class="fa-solid fa-heart ${isF ? 'fav-active' : ''}" onclick="toggleFav(${i})" style="padding:10px; font-size:20px; cursor:pointer;"></i>
        </div>`;
    }).join('');
}

function openLibraryFolder() {
    if(favorites.length === 0) return alert("Library empty!");
    currentList = [...favorites];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    const vid = s.id.videoId || s.id;
    player.loadVideoById(vid);
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
function manualSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}
document.addEventListener('click', () => document.getElementById('mini-popup-menu').classList.add('hidden'));
