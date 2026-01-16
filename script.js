const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// Tabs
const switchTab = (btn, sid) => {
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    btn.classList.add('active'); document.getElementById(sid).classList.remove('hidden');
};
document.getElementById('home-tab').onclick = (e) => switchTab(e.target, 'home-section');
document.getElementById('search-tab').onclick = (e) => switchTab(e.target, 'search-section');

// YouTube IFrame
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

// Fetch with SHORTS BLOCK
async function loadSongs(q, id = null) {
    // Logic: videoDuration=medium ensures videos are 4-20 mins (No Shorts)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoDuration=medium&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // Extra filter for title
    const filtered = data.items.filter(v => !v.snippet.title.toLowerCase().includes('shorts'));
    
    if(id) {
        const row = document.getElementById(id);
        filtered.forEach((item, i) => {
            const card = document.createElement('div'); card.className = 'playlist-card';
            card.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><h4>${item.snippet.title}</h4>`;
            card.onclick = () => { currentPlaylist = filtered; playSong(i); };
            row.appendChild(card);
        });
    } else {
        return filtered;
    }
}

loadSongs("Bollywood Hits 2026", "hits-row");
loadSongs("Arijit Singh Romantic", "monsoon-row");
loadSongs("Trending India", "trending-row");

function playSong(index) {
    if(index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const item = currentPlaylist[index];
    player.loadVideoById(item.id.videoId);
    
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('full-title').innerText = item.snippet.title;
    document.getElementById('artist').innerText = item.snippet.channelTitle;
    document.getElementById('full-artist').innerText = item.snippet.channelTitle;
    const img = item.snippet.thumbnails.high.url;
    document.getElementById('disk').style.backgroundImage = `url('${img}')`;
    document.getElementById('large-disk').src = img;
}

// Search with Shorts Block
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    const results = await loadSongs(q);
    currentPlaylist = results;
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    results.forEach((item, i) => {
        const div = document.createElement('div'); div.className = 'playlist-card'; div.style.display="flex"; div.style.minWidth="100%";
        div.innerHTML = `<img src="${item.snippet.thumbnails.default.url}" style="width:50px; margin-right:15px;"><h4>${item.snippet.title}</h4>`;
        div.onclick = () => playSong(i);
        list.appendChild(div);
    });
};

// Controls & Modals
const toggle = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
document.getElementById('play-btn').onclick = toggle;
document.getElementById('full-play-btn').onclick = toggle;
document.getElementById('next-btn').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn').onclick = () => playSong(currentIndex - 1);

document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full-player').onclick = () => document.getElementById('full-player').classList.remove('active');
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-menu').onclick = () => document.getElementById('options-menu').classList.remove('show');
document.getElementById('settings-btn').onclick = () => document.getElementById('settings-modal').classList.add('show');
document.getElementById('close-settings').onclick = () => document.getElementById('settings-modal').classList.remove('show');

document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-theme');

// Download & Favorite
document.getElementById('download-trigger').onclick = () => {
    const vid = currentPlaylist[currentIndex].id.videoId;
    window.open(`https://www.youtube.com/watch?v=${vid}`, '_blank');
};
document.getElementById('fav-trigger').onclick = () => {
    alert("Song added to your Favorites!");
    document.getElementById('options-menu').classList.remove('show');
};

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
    const ic = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = ic;
    document.getElementById('full-play-btn').innerHTML = ic;
    if(e.data === 0) playSong(currentIndex + 1);
}
