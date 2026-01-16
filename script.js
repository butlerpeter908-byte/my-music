const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;
let favorites = JSON.parse(localStorage.getItem('favSongs')) || [];
let downloads = JSON.parse(localStorage.getItem('dlSongs')) || [];

// --- Tab System ---
function switchTab(btn, sid) {
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    btn.classList.add('active'); document.getElementById(sid).classList.remove('hidden');
    if(sid === 'library-section') updateLibraryUI();
}
document.getElementById('home-tab').onclick = (e) => switchTab(e.target, 'home-section');
document.getElementById('search-tab').onclick = (e) => switchTab(e.target, 'search-section');
document.getElementById('library-tab').onclick = (e) => switchTab(e.target, 'library-section');

// --- YouTube API ---
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

// --- Fetch & Play (SHORTS BLOCKED) ---
async function loadSongs(q, id = null) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoDuration=medium&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const filtered = data.items.filter(v => !v.snippet.title.toLowerCase().includes('shorts'));
    if(id) {
        const row = document.getElementById(id);
        filtered.forEach((item, i) => {
            const card = document.createElement('div'); card.className = 'playlist-card';
            card.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><h4>${item.snippet.title}</h4>`;
            card.onclick = () => { currentPlaylist = filtered; playSong(i); };
            row.appendChild(card);
        });
    } else { return filtered; }
}

function playSong(index) {
    if(index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const item = currentPlaylist[index];
    player.loadVideoById(item.id.videoId);
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('full-title').innerText = item.snippet.title;
    document.getElementById('artist').innerText = item.snippet.channelTitle;
    document.getElementById('full-artist').innerText = item.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${item.snippet.thumbnails.high.url}')`;
    document.getElementById('large-disk').src = item.snippet.thumbnails.high.url;
}

// --- Search & Library Logic ---
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    currentPlaylist = await loadSongs(q);
    const list = document.getElementById('results-list'); list.innerHTML = "";
    currentPlaylist.forEach((item, i) => {
        const div = document.createElement('div'); div.className = 'folder-card'; div.style.marginBottom="8px";
        div.innerHTML = `<img src="${item.snippet.thumbnails.default.url}" style="width:50px; margin-right:15px;"><h4>${item.snippet.title}</h4>`;
        div.onclick = () => playSong(i);
        list.appendChild(div);
    });
};

function updateLibraryUI() {
    document.getElementById('fav-count').innerText = `${favorites.length} songs`;
    document.getElementById('dl-count').innerText = `${downloads.length} songs`;
}

document.getElementById('fav-folder-btn').onclick = () => renderLib(favorites, "Favorites");
document.getElementById('dl-folder-btn').onclick = () => renderLib(downloads, "Downloads");

function renderLib(songs, title) {
    const list = document.getElementById('library-list');
    list.innerHTML = `<h3 style="margin: 15px 0; color:#1DB954;">${title}</h3>`;
    songs.forEach((item, i) => {
        const div = document.createElement('div'); div.className = 'folder-card'; div.style.marginBottom="8px";
        div.innerHTML = `<img src="${item.snippet.thumbnails.default.url}" style="width:45px; margin-right:12px;"><h4>${item.snippet.title}</h4>`;
        div.onclick = () => { currentPlaylist = songs; playSong(i); };
        list.appendChild(div);
    });
}

// --- Fav & Download Triggers ---
document.getElementById('fav-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    if(!favorites.find(x => x.id.videoId === s.id.videoId)) {
        favorites.push(s); localStorage.setItem('favSongs', JSON.stringify(favorites));
        alert("Added to Favorites!");
    }
    document.getElementById('options-menu').classList.remove('show');
};

document.getElementById('download-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    if(!downloads.find(x => x.id.videoId === s.id.videoId)) {
        downloads.push(s); localStorage.setItem('dlSongs', JSON.stringify(downloads));
    }
    window.open(`https://www.youtube.com/watch?v=${s.id.videoId}`, '_blank');
};

// --- Player Controls ---
document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full-player').onclick = () => document.getElementById('full-player').classList.remove('active');
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-menu').onclick = () => document.getElementById('options-menu').classList.remove('show');

const toggle = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
document.getElementById('play-btn').onclick = toggle;
document.getElementById('full-play-btn').onclick = toggle;
document.getElementById('next-btn').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn').onclick = () => playSong(currentIndex - 1);

function onPlayerStateChange(e) {
    const ic = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = ic;
    document.getElementById('full-play-btn').innerHTML = ic;
    if(e.data === 0) playSong(currentIndex + 1);
}

loadSongs("New Hindi Songs 2026", "hits-row");
loadSongs("Relaxing Music", "monsoon-row");
loadSongs("Global Top Hits", "trending-row");
updateLibraryUI();
