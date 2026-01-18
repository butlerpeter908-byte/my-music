const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];
let downloads = JSON.parse(localStorage.getItem('dls')) || [];

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
    { name: "Trending", q: "Latest Hindi Songs 2026", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { name: "Lofi", q: "Hindi Chill Lofi", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300" },
    { name: "90s Mix", q: "90s Bollywood Romantic", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300" }
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
    document.getElementById(targetId).innerHTML = list.map((s, i) => {
        const vId = s.id.videoId || s.id;
        const isFav = favorites.find(f => f.id === vId) ? 'active' : '';
        return `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div style="flex:1; overflow:hidden;" onclick="playSong(${i})">
                <h4 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.snippet.title}</h4>
            </div>
            <i class="fa-solid fa-heart fav-btn ${isFav}" onclick="toggleFav(${i})" style="font-size:20px; padding:10px;"></i>
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

// SPEED, LYRICS, MENU
function setSpeed(val, e) {
    e.stopPropagation();
    player.setPlaybackRate(val);
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
}

function showLyrics(e) {
    e.stopPropagation();
    if(currentIndex === -1) return alert("Play a song first!");
    const title = currentList[currentIndex].snippet.title;
    document.getElementById('lyrics-overlay').style.display = 'flex';
    document.getElementById('lyric-title').innerText = title;
    document.getElementById('lyric-content').innerText = "Lyrics not available for this track. Please check back later.";
    document.getElementById('mini-popup-menu').classList.add('hidden');
}

function toggleMiniMenu(e) { e.stopPropagation(); document.getElementById('mini-popup-menu').classList.toggle('hidden'); }

// PROGRESS & SEEK
function updateProgress() {
    if(player && player.getDuration && player.getPlayerState() === 1) {
        let curr = player.getCurrentTime(), dur = player.getDuration();
        let perc = (curr / dur) * 100 || 0;
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

// LIBRARY
function toggleFav(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = favorites.findIndex(f => f.id === vId);
    if(index > -1) favorites.splice(index, 1);
    else favorites.push({id: vId, snippet: s.snippet});
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateLibUI();
    renderSongs(currentList, document.querySelector('.tab-content:not(.hidden) div[id$="container"]').id);
}

function showFavorites() {
    if(favorites.length === 0) return alert("No Favorites!");
    currentList = [...favorites];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function showDownloads() {
    alert("Download feature coming soon!");
}

function updateLibUI() {
    document.getElementById('fav-count').innerText = favorites.length;
}

// CONTROLS
function togglePlay(e) { 
    if(e) e.stopPropagation(); 
    player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); 
}
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
    closePlaylist();
}
function openFullPlayer() { document.getElementById('full-player').style.top = '0'; }
function closeFullPlayer() { document.getElementById('full-player').style.top = '100%'; }
function closePlaylist() { document.getElementById('home-grid').classList.remove('hidden'); document.getElementById('playlist-view').classList.add('hidden'); }

document.addEventListener('click', () => { if(document.getElementById('mini-popup-menu')) document.getElementById('mini-popup-menu').classList.add('hidden'); });
