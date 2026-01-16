const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// API Load
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

// Fetch Songs
async function fetchMusic(q, rowId = null) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const songs = data.items;
        if(rowId) {
            const row = document.getElementById(rowId);
            row.innerHTML = "";
            songs.forEach((s, i) => {
                const card = document.createElement('div'); card.className = 'playlist-card';
                card.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title.substring(0,20)}</h4>`;
                card.onclick = () => { currentPlaylist = songs; playSong(i); };
                row.appendChild(card);
            });
        } else return songs;
    } catch(e) { console.error("Error", e); }
}

function playSong(idx) {
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

// Search
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    const results = await fetchMusic(q);
    const list = document.getElementById('results-list'); list.innerHTML = "";
    currentPlaylist = results;
    results.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => playSong(i);
        list.appendChild(d);
    });
};

// Play/Pause
const togglePlay = () => {
    if(player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
};
document.getElementById('play-btn').onclick = togglePlay;
document.getElementById('full-play-btn').onclick = togglePlay;

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
}

// Tabs & Overlay
document.getElementById('home-tab').onclick = () => { switchTab('home-section', 'home-tab'); };
document.getElementById('search-tab').onclick = () => { switchTab('search-section', 'search-tab'); };
document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full').onclick = () => document.getElementById('full-player').classList.remove('active');
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-modal').onclick = () => document.getElementById('options-menu').classList.remove('show');

function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(btn).classList.add('active');
}

// Download
document.getElementById('download-trigger').onclick = () => {
    window.open(`https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${currentPlaylist[currentIndex].id.videoId}`, '_blank');
};

// Start
fetchMusic("Hindi Songs 2025", "best-2025");
fetchMusic("Trending Music India", "bollywood-trending");
fetchMusic("90s Bollywood Hits", "bollywood-90s");
fetchMusic("Old Hindi Songs", "bollywood-old");
