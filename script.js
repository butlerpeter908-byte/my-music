const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;
let favorites = JSON.parse(localStorage.getItem('favSongs')) || [];
let downloads = JSON.parse(localStorage.getItem('dlSongs')) || [];

// Tabs
function switchTab(btn, sid) {
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    btn.classList.add('active'); 
    document.getElementById(sid).classList.remove('hidden');
    if(sid === 'library-section') updateLibCounts();
}
document.getElementById('home-tab').onclick = (e) => switchTab(e.target, 'home-section');
document.getElementById('search-tab').onclick = (e) => switchTab(e.target, 'search-section');
document.getElementById('library-tab').onclick = (e) => switchTab(e.target, 'library-section');

// Music Fetch (Locks Category 10 for Music)
async function fetchMusic(q, rowId = null) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoCategoryId=10&videoDuration=medium&key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const filtered = data.items.filter(v => !v.snippet.title.toLowerCase().includes('shorts'));
        
        if(rowId) {
            const row = document.getElementById(rowId);
            row.innerHTML = "";
            filtered.forEach((item, i) => {
                const card = document.createElement('div'); card.className = 'playlist-card';
                card.innerHTML = `<img src="${item.snippet.thumbnails.high.url}"><h4>${item.snippet.title.substring(0,25)}...</h4>`;
                card.onclick = () => { currentPlaylist = filtered; playSong(i); };
                row.appendChild(card);
            });
        } else return filtered;
    } catch(e) { console.error("Error fetching", e); }
}

// YT API
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

function playSong(idx) {
    if(idx < 0 || idx >= currentPlaylist.length) return;
    currentIndex = idx;
    const s = currentPlaylist[idx];
    player.loadVideoById(s.id.videoId);
    document.getElementById('title').innerText = s.snippet.title;
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${s.snippet.thumbnails.medium.url}')`;
    document.getElementById('large-disk').src = s.snippet.thumbnails.high.url;
}

// Controls & Menu
document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full-player').onclick = () => document.getElementById('full-player').classList.remove('active');
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-menu').onclick = () => document.getElementById('options-menu').classList.remove('show');

document.getElementById('fav-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    if(!favorites.find(x => x.id.videoId === s.id.videoId)) {
        favorites.push(s); localStorage.setItem('favSongs', JSON.stringify(favorites));
        alert("Saved to Favorites!");
    }
    document.getElementById('options-menu').classList.remove('show');
    updateLibCounts();
};

document.getElementById('download-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    const toast = document.getElementById('download-toast');
    toast.classList.remove('hidden');
    if(!downloads.find(x => x.id.videoId === s.id.videoId)) {
        downloads.push(s); localStorage.setItem('dlSongs', JSON.stringify(downloads));
    }
    window.open(`https://www.y2mate.com/youtube/${s.id.videoId}`, '_blank');
    setTimeout(() => { toast.classList.add('hidden'); updateLibCounts(); }, 2000);
    document.getElementById('options-menu').classList.remove('show');
};

function updateLibCounts() {
    document.getElementById('fav-count').innerText = `${favorites.length} songs`;
    document.getElementById('dl-count').innerText = `${downloads.length} songs`;
}

document.getElementById('fav-folder-btn').onclick = () => renderLib(favorites, "Favorites");
document.getElementById('dl-folder-btn').onclick = () => renderLib(downloads, "Downloads");

function renderLib(songs, title) {
    const list = document.getElementById('library-list');
    list.innerHTML = `<h3 style="grid-column:1/3; color:#1DB954; margin:10px 0;">${title}</h3>`;
    songs.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => { currentPlaylist = songs; playSong(i); };
        list.appendChild(d);
    });
}

function onPlayerStateChange(e) {
    const i = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = i;
    document.getElementById('full-play-btn').innerHTML = i;
    if(e.data === 0) playSong(currentIndex + 1);
}

// Init Home Screen
async function init() {
    await fetchMusic("Best Bollywood Songs 2025", "best-2025");
    await fetchMusic("Latest Bollywood Trending", "bollywood-trending");
    await fetchMusic("Bollywood Top Hits", "bollywood-hits");
    await fetchMusic("90s Bollywood Hits", "bollywood-90s");
    await fetchMusic("Old Bollywood Gold", "bollywood-old");
}

init();
updateLibCounts();
