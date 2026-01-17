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
        events: { 
            'onReady': () => { init(); setInterval(updateProgress, 1000); }, 
            'onStateChange': onPlayerStateChange 
        }
    });
}

const playlists = [
    { name: "Trending", q: "Latest Hindi Songs 2025", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { name: "Lofi Mix", q: "Hindi Lofi Chill", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300" },
    { name: "Old is Gold", q: "Kishore Kumar Hits", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300" },
    { name: "Bollywood 90s", q: "90s Romantic Hits", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300" },
    { name: "Monsoon", q: "Bollywood Rain Songs", img: "https://images.pexels.com/photos/110874/pexels-photo-110874.jpeg?auto=compress&cs=tinysrgb&w=300" },
    { name: "Party Hits", q: "Bollywood Party Songs", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <div class="banner-box"><img src="${p.img}"><span>${p.name}</span></div>
        </div>`).join('');
    updateLibUI();
}

async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q + " song")}&type=video&key=${API_KEY}`);
        const data = await res.json();
        if(data.items) {
            currentList = data.items; // Nayi list update karega
            renderSongList(currentList, 'search-results');
        }
    }, 500);
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    document.getElementById('song-list').innerHTML = "<p style='padding:20px;'>Loading online songs...</p>";
    
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
    const data = await res.json();
    if(data.items) {
        currentList = data.items; // Online list update
        renderSongList(currentList, 'song-list');
    }
}

function renderSongList(list, targetId) {
    const container = document.getElementById(targetId) || document.getElementById('song-list');
    if(!container) return;
    container.innerHTML = list.map((s, i) => {
        const vId = s.id.videoId || s.id;
        const isFav = favorites.find(f => f.id === vId) ? 'active' : '';
        const isDl = downloads.find(d => d.id === vId) ? 'active' : '';
        return `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div class="info" onclick="playSong(${i})">
                <h4>${s.snippet.title}</h4>
            </div>
            <div class="action-icons">
                <i class="fa-solid fa-heart fav-btn ${isFav}" onclick="toggleFav(${i})"></i>
                <i class="fa-solid fa-circle-down dl-btn ${isDl}" onclick="toggleDownload(${i})"></i>
            </div>
        </div>`;
    }).join('');
}

function toggleFav(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = favorites.findIndex(f => f.id === vId);
    if(index > -1) favorites.splice(index, 1);
    else favorites.push({id: vId, snippet: s.snippet});
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateLibUI();
    // Isse dil ka rang turant badlega
    const icons = document.querySelectorAll('.fav-btn');
    if(icons[idx]) icons[idx].classList.toggle('active');
}

function toggleDownload(idx) {
    const s = currentList[idx];
    const vId = s.id.videoId || s.id;
    const index = downloads.findIndex(d => d.id === vId);
    if(index > -1) downloads.splice(index, 1);
    else downloads.push({id: vId, snippet: s.snippet});
    localStorage.setItem('dls', JSON.stringify(downloads));
    updateLibUI();
    const icons = document.querySelectorAll('.dl-btn');
    if(icons[idx]) icons[idx].classList.toggle('active');
}

function showFavorites() {
    if(favorites.length === 0) { alert("Favorites empty!"); return; }
    currentList = [...favorites]; // Local copy
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongList(currentList, 'song-list');
}

function showDownloads() {
    if(downloads.length === 0) { alert("Downloads empty!"); return; }
    currentList = [...downloads];
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderSongList(currentList, 'song-list');
}

function manualSeek(e, id) {
    const bar = document.getElementById(id);
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if(player && player.getDuration) {
        player.seekTo(pos * player.getDuration());
    }
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

function updateLibUI() {
    document.getElementById('fav-count').innerText = favorites.length + " songs";
    document.getElementById('dl-count').innerText = downloads.length + " songs";
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
    el.classList.add('active');
    closePlaylist();
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { 
    document.getElementById('home-grid').classList.remove('hidden'); 
    document.getElementById('playlist-view').classList.add('hidden'); 
}
