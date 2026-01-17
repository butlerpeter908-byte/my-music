const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player, currentList = [], currentIndex = -1, searchTimer;
let favorites = JSON.parse(localStorage.getItem('favs')) || [];

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 'onReady': () => { init(); setInterval(updateProgress, 1000); }, 'onStateChange': onPlayerStateChange }
    });
}

const playlists = [
    { name: "Trending", q: "Latest Hindi Hits", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300" },
    { name: "Lofi Mix", q: "Hindi Lofi Chill", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300" },
    { name: "Old is Gold", q: "Kishore Kumar Hits", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300" },
    { name: "90s Bollywood", q: "90s Romantic Hits", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300" },
    { name: "Monsoon", q: "Bollywood Rain Songs", img: "https://images.pexels.com/photos/110874/pexels-photo-110874.jpeg?auto=compress&cs=tinysrgb&w=300" },
    { name: "Summer", q: "Bollywood Summer Mix", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <div class="banner-box"><img src="${p.img}"><span>${p.name}</span></div>
        </div>`).join('');
    updateLibUI();
}

function renderSongItem(s, i) {
    const isFav = favorites.find(f => f.id === s.id.videoId) ? 'active' : '';
    return `
        <div class="list-item">
            <img src="${s.snippet.thumbnails.default.url}" onclick="playSong(${i})">
            <div class="info" onclick="playSong(${i})"><h4>${s.snippet.title}</h4></div>
            <div class="action-icons">
                <i class="fa-solid fa-heart fav-btn ${isFav}" onclick="toggleFav('${s.id.videoId}', ${i})"></i>
                <i class="fa-solid fa-circle-down"></i>
            </div>
        </div>`;
}

async function searchMusic() {
    const q = document.getElementById('search-input').value;
    if(q.length < 2) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
        const data = await res.json();
        currentList = data.items;
        document.getElementById('search-results').innerHTML = data.items.map((s, i) => renderSongItem(s, i)).join('');
    }, 600);
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    document.getElementById('song-list').innerHTML = data.items.map((s, i) => renderSongItem(s, i)).join('');
}

function toggleFav(id, idx) {
    const s = currentList[idx];
    const index = favorites.findIndex(f => f.id === id);
    if(index > -1) favorites.splice(index, 1);
    else favorites.push({id: s.id.videoId, title: s.snippet.title, img: s.snippet.thumbnails.default.url});
    localStorage.setItem('favs', JSON.stringify(favorites));
    updateLibUI();
    // Refresh UI to show red heart
    if(!document.getElementById('search-section').classList.contains('hidden')) searchMusic();
}

function updateLibUI() {
    document.getElementById('fav-count').innerText = favorites.length + " songs";
}

function showFavorites() {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    currentList = favorites.map(f => ({ id: {videoId: f.id}, snippet: {title: f.title, thumbnails: {default: {url: f.img}}}}));
    document.getElementById('song-list').innerHTML = currentList.map((s, i) => renderSongItem(s, i)).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high ? s.snippet.thumbnails.high.url : s.snippet.thumbnails.default.url;
    document.getElementById('f-title').innerText = s.snippet.title;
}

function updateProgress() {
    if(player && player.getDuration) {
        let curr = player.getCurrentTime(), dur = player.getDuration();
        let perc = (curr / dur) * 100 || 0;
        document.getElementById('mini-progress').style.width = perc + "%";
        document.getElementById('progress-fill').style.width = perc + "%";
        if(dur > 0) document.getElementById('m-time').innerText = formatTime(curr) + " / " + formatTime(dur);
    }
}

function handleSeek(e, containerClass) {
    let rect = document.querySelector('.' + containerClass).getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}

function formatTime(t) {
    let m = Math.floor(t/60), s = Math.floor(t%60);
    return m + ":" + (s < 10 ? '0'+s : s);
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
}
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { document.getElementById('home-grid').classList.remove('hidden'); document.getElementById('playlist-view').classList.add('hidden'); }
