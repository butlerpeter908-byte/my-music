const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// YT API Loader
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

// 1. Play Song Logic
function playSong(idx) {
    if(!currentPlaylist[idx]) return;
    currentIndex = idx;
    const s = currentPlaylist[idx];
    player.loadVideoById(s.id.videoId);
    
    document.getElementById('title').innerText = s.snippet.title.substring(0,25);
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${s.snippet.thumbnails.default.url}')`;
    document.getElementById('large-disk').src = s.snippet.thumbnails.high.url;
}

// 2. Play/Pause Button Fix
function togglePlay(e) {
    if(e) e.stopPropagation();
    if(!player) return;
    const state = player.getPlayerState();
    if(state === 1) player.pauseVideo();
    else player.playVideo();
}
document.getElementById('play-btn').onclick = togglePlay;
document.getElementById('full-play-btn').onclick = togglePlay;

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) playSong(currentIndex + 1);
}

// 3. Search Logic Fix
document.getElementById('search-btn-trigger').onclick = async () => {
    const q = document.getElementById('search-input').value;
    if(!q) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    currentPlaylist = data.items;
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    currentPlaylist.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = (e) => { e.stopPropagation(); playSong(i); };
        list.appendChild(d);
    });
};

// 4. Home Categories (90s Fix)
async function fetchHome(q, id) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    const row = document.getElementById(id);
    const songs = data.items;
    songs.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = (e) => { e.stopPropagation(); currentPlaylist = songs; playSong(i); };
        row.appendChild(d);
    });
}

// Next/Prev Buttons
document.getElementById('next-btn-trigger').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn-trigger').onclick = () => playSong(currentIndex - 1);

// UI Controls
function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.remove('hidden');
    btn.classList.add('active');
}
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
document.getElementById('dots-menu-btn').onclick = (e) => { e.stopPropagation(); document.getElementById('options-menu').classList.add('show'); };
function hideMenu() { document.getElementById('options-menu').classList.remove('show'); }
document.getElementById('dl-btn-trigger').onclick = () => {
    window.open(`https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${currentPlaylist[currentIndex].id.videoId}`, '_blank');
};

// Start
fetchHome("Latest Hindi Songs 2025 Hits", "best-2025");
fetchHome("Trending Bollywood Music India", "trending-row");
fetchHome("90s Kumar Sanu Udit Narayan Hits", "bollywood-90s"); // 90s Special fix
