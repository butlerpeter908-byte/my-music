const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;
let favorites = JSON.parse(localStorage.getItem('favSongs')) || [];
let downloads = JSON.parse(localStorage.getItem('dlSongs')) || [];

async function fetchMusic(q, rowId) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${q}&type=video&videoCategoryId=10&videoDuration=medium&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const row = document.getElementById(rowId);
    row.innerHTML = "";
    
    data.items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `<img src="${item.snippet.thumbnails.high.url}"><h4>${item.snippet.title.substring(0,30)}...</h4>`;
        card.onclick = () => { currentPlaylist = data.items; playSong(i); };
        row.appendChild(card);
    });
}

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

// Fixed Download Redirect
document.getElementById('download-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    const dlUrl = `https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${s.id.videoId}`;
    window.open(dlUrl, '_blank');
    if(!downloads.find(x => x.id.videoId === s.id.videoId)) {
        downloads.push(s); localStorage.setItem('dlSongs', JSON.stringify(downloads));
    }
    document.getElementById('options-menu').classList.remove('show');
};

document.getElementById('fav-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    if(!favorites.find(x => x.id.videoId === s.id.videoId)) {
        favorites.push(s); localStorage.setItem('favSongs', JSON.stringify(favorites));
        alert("Saved to Favorites!");
    }
    document.getElementById('options-menu').classList.remove('show');
};

// UI Handlers
document.getElementById('home-tab').onclick = () => switchTab('home-section', 'home-tab');
document.getElementById('search-tab').onclick = () => switchTab('search-section', 'search-tab');
document.getElementById('library-tab').onclick = () => switchTab('library-section', 'library-tab');

function switchTab(secId, btnId) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.getElementById(secId).classList.remove('hidden');
    document.getElementById(btnId).classList.add('active');
}

document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full').onclick = () => document.getElementById('full-player').classList.remove('active');
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-modal').onclick = () => document.getElementById('options-menu').classList.remove('show');

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) playSong(currentIndex + 1);
}

// Init Albums
async function init() {
    await fetchMusic("New Hindi Songs 2025 Hits", "best-2025");
    await fetchMusic("Bollywood Trending Songs", "bollywood-trending");
    await fetchMusic("Top Bollywood Hitlist", "bollywood-hits");
    await fetchMusic("90s Bollywood Romantic Songs", "bollywood-90s");
    await fetchMusic("Old Bollywood Hits 60s 70s", "bollywood-old");
}
init();
