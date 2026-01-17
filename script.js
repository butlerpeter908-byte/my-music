const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentList = [], currentIndex = -1, searchTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];
let downloads = JSON.parse(localStorage.getItem('dls')) || [];

// YouTube API Setup
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 
            'onReady': () => { initHome(); setInterval(updateProgress, 1000); }, 
            'onStateChange': onPlayerStateChange 
        }
    });
}

const playlists = [
    { name: "Trending", q: "Latest Hindi Songs" },
    { name: "Lofi Mix", q: "Hindi Lofi Chill" },
    { name: "90s Hits", q: "90s Bollywood Romantic" },
    { name: "Global Top", q: "Top International Hits" }
];

function initHome() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')" style="background: #1a1a1a; padding: 20px; border-radius: 15px; text-align: center; cursor: pointer;">
            <div style="font-size: 40px; margin-bottom: 10px;">🎵</div>
            <span style="font-weight: bold;">${p.name}</span>
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
        if(data.items) {
            currentList = data.items;
            renderSongs(currentList, 'search-results-container');
        }
    }, 500);
}

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
        const isDl = downloads.find(d => d.id === vId) ? 'active' : '';
        return `
        <div class="list-item" style="display: flex; align-items: center; gap: 15px; padding: 10px; border-bottom: 1px solid #111;">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})" style="width: 50px; border-radius: 5px;">
            <div style="flex: 1;" onclick="playSong(${i})">
                <h4 style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${s.snippet.title}</h4>
            </div>
            <div style="display: flex; gap: 15px; font-size: 18px;">
                <i class="fa-solid fa-heart fav-btn ${isFav}" onclick="toggleFav(${i})"></i>
                <i class="fa-solid fa-circle-down dl-btn ${isDl}" onclick="toggleDownload(${i})"></i>
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

function manualSeek(e, id) {
    const bar = document.getElementById(id);
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
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

function toggleFav(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = favorites.findIndex(f => f.id === vId);
    if(index > -1) favorites.splice(index, 1);
    else favorites.push({id: vId, snippet: s.snippet});
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateLibUI();
    renderSongs(currentList, document.getElementById('song-list-container').innerHTML ? 'song-list-container' : 'search-results-container');
}

function toggleDownload(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = downloads.findIndex(d => d.id === vId);
    if(index > -1) downloads.splice(index, 1);
    else downloads.push({id: vId, snippet: s.snippet});
    localStorage.setItem('dls', JSON.stringify(downloads));
    updateLibUI();
    renderSongs(currentList, document.getElementById('song-list-container').innerHTML ? 'song-list-container' : 'search-results-container');
}

function showFavorites() {
    if(favorites.length === 0) return alert("Favorites Empty");
    currentList = [...favorites];
    switchTab('home-section', document.querySelectorAll('.nav-item')[0]);
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongs(currentList, 'song-list-container');
}

function showDownloads() {
    if(downloads.length === 0) return alert("Downloads Empty");
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

function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }
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
    if(el) el.classList.add('active');
    closePlaylist();
}
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { 
    document.getElementById('home-grid').classList.remove('hidden'); 
    document.getElementById('playlist-view').classList.add('hidden'); 
}
