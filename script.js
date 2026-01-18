const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];
let downloads = JSON.parse(localStorage.getItem('dls')) || [];

// YouTube Iframe API Load
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        playerVars: { 'playsinline': 1 },
        events: { 
            'onReady': () => { initHome(); setInterval(updateProgress, 1000); }, 
            'onStateChange': onPlayerStateChange 
        }
    });
}

const playlists = [
    { name: "Trending", q: "Latest Hindi Songs 2026", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { name: "Lofi Mix", q: "Hindi Chill Lofi", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300" },
    { name: "Old Classics", q: "90s Bollywood Romantic", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300" },
    { name: "Party Hits", q: "Hindi Party Songs", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300" }
];

function initHome() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}">
            <span>${p.name}</span>
        </div>`).join('');
    updateLibUI();
}

// Search Logic
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
        const data = await res.json();
        if(data.items) {
            currentList = data.items;
            renderSongs(currentList, 'search-results-container');
        }
    }, 500);
}

// Playlist Logic
async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
    const data = await res.json();
    if(data.items) {
        currentList = data.items;
        renderSongs(currentList, 'song-list-container');
    }
}

function renderSongs(list, targetId) {
    const container = document.getElementById(targetId);
    container.innerHTML = list.map((s, i) => {
        const vId = s.id.videoId || s.id;
        const isFav = favorites.find(f => f.id === vId) ? 'active' : '';
        return `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div style="flex:1; overflow:hidden;" onclick="playSong(${i})">
                <h4 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.snippet.title}</h4>
            </div>
            <div style="display:flex; gap:15px; font-size:18px;">
                <i class="fa-solid fa-heart fav-btn ${isFav}" onclick="toggleFav(${i})"></i>
                <i class="fa-solid fa-circle-down" onclick="toggleDownload(${i})"></i>
            </div>
        </div>`;
    }).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    const vId = s.id.videoId || s.id;
    player.loadVideoById(vId);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high ? s.snippet.thumbnails.high.url : s.snippet.thumbnails.default.url;
    document.getElementById('f-title').innerText = s.snippet.title;
}

// SEEKBAR LOGIC
function manualSeek(e, id) {
    const bar = document.getElementById(id);
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if(player && player.getDuration) {
        player.seekTo(pos * player.getDuration());
    }
}

function updateProgress() {
    if(player && player.getDuration && player.getPlayerState() === 1) {
        let curr = player.getCurrentTime(), dur = player.getDuration();
        let perc = (curr / dur) * 100 || 0;
        document.getElementById('mini-progress').style.width = perc + "%";
        document.getElementById('progress-fill').style.width = perc + "%";
        document.getElementById('m-time').innerText = formatTime(curr) + " / " + formatTime(dur);
    }
}

function formatTime(t) {
    let m = Math.floor(t/60), s = Math.floor(t%60);
    return m + ":" + (s < 10 ? '0'+s : s);
}

// MINI MENU FUNCTIONS
function toggleMiniMenu(e) {
    e.stopPropagation();
    document.getElementById('mini-popup-menu').classList.toggle('hidden');
}

function menuFav(e) {
    e.stopPropagation();
    if(currentIndex !== -1) toggleFav(currentIndex);
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

function changeSpeed(e) {
    e.stopPropagation();
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    let curr = player.getPlaybackRate();
    let next = speeds[(speeds.indexOf(curr) + 1) % speeds.length];
    player.setPlaybackRate(next);
    alert("Speed set to: " + next + "x");
}

function switchToVideo(e) {
    e.stopPropagation();
    const yt = document.getElementById('yt-player-container');
    yt.classList.toggle('video-mode');
    if(yt.classList.contains('video-mode')) {
        yt.style.display = 'block';
    } else {
        yt.style.display = 'none';
    }
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

function changeQuality(e) {
    e.stopPropagation();
    player.setPlaybackQuality('hd720');
    alert("Setting high quality...");
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

// LIBRARY SYSTEM
function toggleFav(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = favorites.findIndex(f => f.id === vId);
    if(index > -1) favorites.splice(index, 1);
    else favorites.push({id: vId, snippet: s.snippet});
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateLibUI();
    // Update color immediately
    event.target.classList.toggle('active');
}

function toggleDownload(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = downloads.findIndex(d => d.id === vId);
    if(index > -1) downloads.splice(index, 1);
    else downloads.push({id: vId, snippet: s.snippet});
    localStorage.setItem('dls', JSON.stringify(downloads));
    updateLibUI();
    alert("Song added to Downloads");
}

function showFavorites() {
    if(favorites.length === 0) return alert("No Favorites yet!");
    currentList = [...favorites];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function showDownloads() {
    if(downloads.length === 0) return alert("No Downloads yet!");
    currentList = [...downloads];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function updateLibUI() {
    document.getElementById('fav-count').innerText = favorites.length;
    document.getElementById('dl-count').innerText = downloads.length;
}

// PLAYER CONTROLS
function togglePlay(e) { 
    if(e) e.stopPropagation(); 
    if(player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
}
function nextSong() { if(currentIndex < currentList.length-1) playSong(currentIndex+1); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1); }

function onPlayerStateChange(e) {
    let icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-icon').className = 'fa-solid ' + icon;
    document.getElementById('f-play-icon').className = 'fa-solid ' + icon;
    if(e.data === 0) nextSong(); // Auto-next
}

// TAB SWITCHING
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
    closePlaylist();
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { 
    document.getElementById('home-grid').classList.remove('hidden'); 
    document.getElementById('playlist-view').classList.add('hidden'); 
}

// Close menu on click outside
document.addEventListener('click', () => {
    const menu = document.getElementById('mini-popup-menu');
    if(menu) menu.classList.add('hidden');
});
