const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer, sleepTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];

// 1. YouTube API Initialization
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

// 2. Home Section Logic
const playlists = [
    { name: "Trending", q: "Latest Hindi Music 2026 -shorts" },
    { name: "Lofi Hindi", q: "Hindi Lofi Chill Mix -shorts" },
    { name: "90s Hits", q: "90s Bollywood Hits -shorts" },
    { name: "Gym Beats", q: "Punjabi Workout Songs -shorts" }
];

function initHome() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="fetchPlaylist('${p.q}')">
            <img src="https://via.placeholder.com/150/1a1a1a/ffffff?text=${p.name}">
            <span>${p.name}</span>
        </div>
    `).join('');
    updateFavCount();
}

async function fetchPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(q)}&type=video&videoDuration=medium&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    renderSongs(currentList, 'song-list-container');
}

// 3. Search & Shorts Filter
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 3) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        // Query mein '-shorts' aur Duration filter dono use kiye hain
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q + " -shorts -video")}&type=video&videoDuration=medium&key=${API_KEY}`);
        const data = await res.json();
        currentList = data.items;
        renderSongs(currentList, 'search-results-container');
    }, 600);
}

function renderSongs(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = list.map((s, i) => `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div style="flex:1" onclick="playSong(${i})">
                <div style="font-size:14px; font-weight:bold;">${s.snippet.title.substring(0, 45)}</div>
            </div>
            <i class="fa-solid fa-heart" onclick="toggleFav(${i})" style="color:${isFav(s)?'#ff4d4d':'#333'}"></i>
        </div>
    `).join('');
}

// 4. Playback Logic
function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId || s.id);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('f-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) {
    if(e) e.stopPropagation();
    const state = player.getPlayerState();
    state === 1 ? player.pauseVideo() : player.playVideo();
}

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-btn').className = 'fa-solid ' + icon;
    document.getElementById('f-play-btn').className = 'fa-solid ' + icon;
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

function formatTime(t) {
    let m = Math.floor(t/60), s = Math.floor(t%60);
    return m + ":" + (s < 10 ? '0'+s : s);
}

// 5. Library & Folders
function openLibraryFolder() {
    if(favorites.length === 0) return alert("No favorites yet!");
    currentList = [...favorites];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function toggleFav(i) {
    const s = currentList[i];
    const vid = s.id.videoId || s.id;
    const idx = favorites.findIndex(f => (f.id.videoId || f.id) === vid);
    if(idx > -1) favorites.splice(idx, 1);
    else favorites.push(s);
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateFavCount();
    alert("Library Updated!");
}

// 6. UI Helpers
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    if(id === 'home-section') backToHome();
}

function toggleMenu(e) {
    e.stopPropagation();
    document.getElementById('mini-popup-menu').classList.toggle('hidden');
}

function toggleOverlay(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

function setTimer(m) {
    if(sleepTimer) clearTimeout(sleepTimer);
    if(m > 0) {
        sleepTimer = setTimeout(() => { player.pauseVideo(); alert("Sleep timer finished!"); }, m * 60000);
        alert(`Timer set for ${m} minutes`);
    } else alert("Timer cancelled");
    toggleOverlay('timer-menu');
}

function changeSpeed() {
    const s = prompt("Enter Speed (0.5, 1, 1.5, 2):", "1");
    if(s) player.setPlaybackRate(parseFloat(s));
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

function showLyrics() {
    if(currentIndex === -1) return;
    document.getElementById('l-title').innerText = currentList[currentIndex].snippet.title;
    toggleOverlay('lyrics-overlay');
}

function backToHome() {
    document.getElementById('home-grid').classList.remove('hidden');
    document.getElementById('playlist-view').classList.add('hidden');
}

function updateFavCount() { document.getElementById('fav-count').innerText = favorites.length; }
function isFav(s) { return favorites.some(f => (f.id.videoId || f.id) === (s.id.videoId || s.id)); }
function openFullPlayer() { document.getElementById('full-player').style.top = '0'; }
function closeFullPlayer() { document.getElementById('full-player').style.top = '100%'; }
function manualSeek(e) {
    const rect = e.target.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}

document.addEventListener('click', () => document.getElementById('mini-popup-menu').classList.add('hidden'));
