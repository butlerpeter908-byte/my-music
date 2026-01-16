const API_KEY = 'YAHA_APNI_NEW_KEY_DALO'; 
let player, currentList = [], currentIndex = -1;

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
    { name: "Top Hits", q: "New Bollywood Songs 2026", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" },
    { name: "Lofi Mix", q: "Hindi Lofi 2026", img: "https://img.youtube.com/vi/Kesariya/0.jpg" }
];

function init() {
    document.getElementById('home-grid').innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}">
            <h4>${p.name}</h4>
        </div>
    `).join('');
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentList = data.items;
    document.getElementById('song-list').innerHTML = data.items.map((s, i) => `
        <div style="display:flex; align-items:center; gap:15px; padding:10px 0;" onclick="playSong(${i})">
            <img src="${s.snippet.thumbnails.default.url}" style="width:50px; border-radius:5px;">
            <div><h4>${s.snippet.title.substring(0,30)}</h4></div>
        </div>
    `).join('');
}

function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId);
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('f-title').innerText = s.snippet.title;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) { if(e) e.stopPropagation(); player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo(); }
function nextSong() { if(currentIndex < currentList.length-1) playSong(currentIndex+1); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1); }
function onPlayerStateChange(e) {
    const icon = e.data === 1 ? 'fa-pause' : 'fa-play';
    document.getElementById('m-play-icon').className = 'fa-solid ' + icon;
    document.getElementById('f-play-icon').className = 'fa-solid ' + icon;
}
function updateProgress() { if(player && player.getDuration) document.getElementById('progress-fill').style.width = (player.getCurrentTime()/player.getDuration()*100) + "%"; }
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
}
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { document.getElementById('home-grid').classList.remove('hidden'); document.getElementById('playlist-view').classList.add('hidden'); }
