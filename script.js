const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; // Alert: Key Public hai, Restrict zaroor karein
let player, currentPlaylist = [], currentIndex = -1;
let favorites = JSON.parse(localStorage.getItem('favSongs')) || [];
let downloads = JSON.parse(localStorage.getItem('dlSongs')) || [];

// Tab System
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

// YT Player
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

// Load Songs (Shorts Filter)
async function loadSongs(q, rowId = null) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoDuration=medium&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const filtered = data.items.filter(v => !v.snippet.title.toLowerCase().includes('shorts'));
    
    if(rowId) {
        const row = document.getElementById(rowId);
        filtered.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><h4>${item.snippet.title.substring(0,20)}...</h4>`;
            card.onclick = () => { currentPlaylist = filtered; playSong(i); };
            row.appendChild(card);
        });
    } else return filtered;
}

function playSong(idx) {
    if(idx < 0 || idx >= currentPlaylist.length) return;
    currentIndex = idx;
    const item = currentPlaylist[idx];
    player.loadVideoById(item.id.videoId);
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('full-title').innerText = item.snippet.title;
    document.getElementById('artist').innerText = item.snippet.channelTitle;
    document.getElementById('full-artist').innerText = item.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${item.snippet.thumbnails.medium.url}')`;
    document.getElementById('large-disk').src = item.snippet.thumbnails.high.url;
}

// Search
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    currentPlaylist = await loadSongs(q);
    const list = document.getElementById('results-list'); list.innerHTML = "";
    currentPlaylist.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'folder-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.default.url}" style="width:50px; margin-right:10px;"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => playSong(i);
        list.appendChild(d);
    });
};

// Library
function updateLibCounts() {
    document.getElementById('fav-count').innerText = `${favorites.length} songs`;
    document.getElementById('dl-count').innerText = `${downloads.length} songs`;
}

document.getElementById('fav-folder-btn').onclick = () => renderLib(favorites, "Favorites");
document.getElementById('dl-folder-btn').onclick = () => renderLib(downloads, "Downloads");

function renderLib(songs, title) {
    const list = document.getElementById('library-list');
    list.innerHTML = `<h3 style="margin:10px 0; color:#1DB954;">${title}</h3>`;
    songs.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'folder-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.default.url}" style="width:45px; margin-right:10px;"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => { currentPlaylist = songs; playSong(i); };
        list.appendChild(d);
    });
}

// Overlay & Menu
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
    if(!downloads.find(x => x.id.videoId === s.id.videoId)) {
        downloads.push(s); localStorage.setItem('dlSongs', JSON.stringify(downloads));
    }
    window.open(`https://www.youtube.com/watch?v=${s.id.videoId}`, '_blank');
    updateLibCounts();
};

// Controls
const toggle = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
document.getElementById('play-btn').onclick = toggle;
document.getElementById('full-play-btn').onclick = toggle;
document.getElementById('next-btn').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn').onclick = () => playSong(currentIndex - 1);

function onPlayerStateChange(e) {
    const i = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = i;
    document.getElementById('full-play-btn').innerHTML = i;
    if(e.data === 0) playSong(currentIndex + 1);
}

// Initial Load
loadSongs("Arijit Singh Hits", "hits-row");
loadSongs("Trending Songs India", "trending-row");
updateLibCounts();
