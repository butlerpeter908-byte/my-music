const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// --- Tab Switching ---
const homeTab = document.getElementById('home-tab');
const searchTab = document.getElementById('search-tab');
const homeSection = document.getElementById('home-section');
const searchSection = document.getElementById('search-section');

homeTab.onclick = () => {
    homeSection.classList.remove('hidden'); searchSection.classList.add('hidden');
    homeTab.classList.add('active'); searchTab.classList.remove('active');
};
searchTab.onclick = () => {
    searchSection.classList.remove('hidden'); homeSection.classList.add('hidden');
    searchTab.classList.add('active'); homeTab.classList.remove('active');
};

// --- YouTube Player Setup ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

// --- Load Home Playlists ---
async function fetchPlaylists(query, rowId) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&type=video&key=${API_KEY}`);
    const data = await res.json();
    const row = document.getElementById(rowId);
    data.items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><h4>${item.snippet.title}</h4>`;
        card.onclick = () => { currentPlaylist = data.items; playSong(i); };
        row.appendChild(card);
    });
}
fetchPlaylists("Bollywood Hitlist 2025", "hits-row");
fetchPlaylists("Hindi Rainy Day Songs", "monsoon-row");
fetchPlaylists("Trending Music India", "trending-row");

// --- Play Song Logic ---
function playSong(index) {
    if(index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const item = currentPlaylist[index];
    player.loadVideoById(item.id.videoId);
    
    // UI Update
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('full-title').innerText = item.snippet.title;
    document.getElementById('artist').innerText = item.snippet.channelTitle;
    document.getElementById('full-artist').innerText = item.snippet.channelTitle;
    const img = item.snippet.thumbnails.high.url;
    document.getElementById('disk').style.backgroundImage = `url('${img}')`;
    document.getElementById('large-disk').src = img;

    // Next Song Preview
    if(index + 1 < currentPlaylist.length) {
        const next = currentPlaylist[index+1];
        document.getElementById('next-song-title').innerText = next.snippet.title;
        document.getElementById('next-song-artist').innerText = next.snippet.channelTitle;
        document.getElementById('next-song-img').src = next.snippet.thumbnails.default.url;
    }
}

// --- Search Logic ---
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    if(!q) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentPlaylist = data.items;
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    data.items.forEach((item, i) => {
        const div = document.createElement('div');
        div.style.display="flex"; div.style.padding="10px"; div.style.cursor="pointer";
        div.innerHTML = `<img src="${item.snippet.thumbnails.default.url}" style="width:50px; border-radius:4px; margin-right:12px;"><div><h4>${item.snippet.title}</h4></div>`;
        div.onclick = () => playSong(i);
        list.appendChild(div);
    });
};

// --- Controls & Overlays ---
const togglePlay = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
document.getElementById('play-btn').onclick = togglePlay;
document.getElementById('full-play-btn').onclick = togglePlay;
document.getElementById('next-btn').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn').onclick = () => playSong(currentIndex - 1);

document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full-player').onclick = () => document.getElementById('full-player').classList.remove('active');

// Settings & Theme
document.getElementById('settings-btn').onclick = () => document.getElementById('settings-modal').classList.add('show');
document.getElementById('close-settings').onclick = () => document.getElementById('settings-modal').classList.remove('show');
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-menu').onclick = () => document.getElementById('options-menu').classList.remove('show');

document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-theme');
    document.getElementById('settings-modal').classList.remove('show');
};

// Progress Bar Update
setInterval(() => {
    if (player && player.getPlayerState() === 1) {
        let cur = player.getCurrentTime(), dur = player.getDuration();
        document.getElementById('progress-fill').style.width = (cur/dur*100) + "%";
        document.getElementById('current-time').innerText = formatTime(cur);
        document.getElementById('duration-time').innerText = formatTime(dur);
    }
}, 1000);

function formatTime(s) { return Math.floor(s/60) + ":" + (Math.floor(s%60)<10?'0':'') + Math.floor(s%60); }

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) playSong(currentIndex + 1); // Auto-play next
}
