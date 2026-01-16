const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// YouTube API
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 
            'onStateChange': onPlayerStateChange,
            'onReady': () => setInterval(updateProgress, 1000)
        }
    });
}

// 1. Home Playlist Data (Image Style)
const playlistsData = [
    { id: 'p1', name: 'Bollywood Hits 2026', q: 'New Bollywood Songs 2026 Nonstop', img: 'https://i.ytimg.com/vi/ApnaBanaLe/maxresdefault.jpg' },
    { id: 'p2', name: 'Trending Now', q: 'Trending Hindi Songs 2025 Nonstop', img: 'https://i.ytimg.com/vi/Kesariya/maxresdefault.jpg' },
    { id: 'p3', name: '90s Super Hits', q: '90s Superhit Bollywood Songs Jukebox', img: 'https://i.ytimg.com/vi/KumarSanu/maxresdefault.jpg' },
    { id: 'p4', name: 'Lofi Vibes', q: 'Lofi Bollywood Songs Nonstop', img: 'https://i.ytimg.com/vi/LofiHindi/maxresdefault.jpg' }
];

async function loadHome() {
    const row = document.getElementById('main-playlists');
    row.innerHTML = "";
    playlistsData.forEach(p => {
        const d = document.createElement('div');
        d.className = 'playlist-card';
        d.innerHTML = `<img src="${p.img}"><h4>${p.name}</h4>`;
        d.onclick = () => openPlaylist(p);
        row.appendChild(d);
    });
}

async function openPlaylist(p) {
    document.getElementById('home-default').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    document.getElementById('playlist-cover').src = p.img;
    document.getElementById('playlist-name').innerText = p.name;
    
    // Fetch 50 songs for 5+ hours of play
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${p.q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    const songs = data.items;
    
    const listDiv = document.getElementById('playlist-songs-list');
    listDiv.innerHTML = "";
    songs.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'song-item';
        item.innerHTML = `
            <img src="${s.snippet.thumbnails.default.url}">
            <div class="song-item-info">
                <h4>${s.snippet.title.substring(0,40)}...</h4>
                <p>${s.snippet.channelTitle}</p>
            </div>
        `;
        item.onclick = () => playSong(i, songs);
        listDiv.appendChild(item);
    });
}

function playAll() {
    const songItems = document.querySelectorAll('.song-item');
    if(songItems.length > 0) songItems[0].click();
}

function backToHome() {
    document.getElementById('home-default').classList.remove('hidden');
    document.getElementById('playlist-view').classList.add('hidden');
}

// 2. Search & Play Logic
async function instantSearch() {
    const q = document.getElementById('search-input').value;
    if (q.length < 2) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    data.items.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title.substring(0,25)}</h4>`;
        d.onclick = () => playSong(i, data.items);
        list.appendChild(d);
    });
}

function playSong(idx, list) {
    if(!list || !list[idx]) return;
    currentPlaylist = list;
    currentIndex = idx;
    const s = currentPlaylist[idx];
    player.loadVideoById(s.id.videoId);
    
    document.getElementById('title').innerText = s.snippet.title.substring(0,20);
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${s.snippet.thumbnails.default.url}')`;
    document.getElementById('large-disk').src = s.snippet.thumbnails.high.url;
}

// 3. Controls & Progress
function togglePlay(e) {
    if(e) e.stopPropagation();
    const state = player.getPlayerState();
    state === 1 ? player.pauseVideo() : player.playVideo();
}

function nextSong() { if(currentIndex < currentPlaylist.length - 1) playSong(currentIndex + 1, currentPlaylist); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex - 1, currentPlaylist); }

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) nextSong(); // Auto play next
}

function seek(e) {
    const rect = document.getElementById('seek-bar').getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}

function updateProgress() {
    if (player && player.getDuration) {
        const curr = player.getCurrentTime();
        const dur = player.getDuration();
        if (dur > 0) {
            document.getElementById('progress-fill').style.width = (curr / dur * 100) + "%";
            document.getElementById('current-time').innerText = formatTime(curr);
            document.getElementById('total-duration').innerText = formatTime(dur);
        }
    }
}

function formatTime(s) {
    let m = Math.floor(s/60), sec = Math.floor(s%60);
    return m + ":" + (sec < 10 ? '0' + sec : sec);
}

// 4. Offline & Storage
function startDownload() {
    const s = currentPlaylist[currentIndex];
    let offline = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    if(!offline.find(x => x.id.videoId === s.id.videoId)) {
        offline.push(s);
        localStorage.setItem('offlineSongs', JSON.stringify(offline));
        alert("Saved Offline!");
    }
    hideMenu();
}

function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if(id === 'library-section') loadLibrary();
}

function loadLibrary() {
    const list = document.getElementById('library-list');
    const offline = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    list.innerHTML = offline.length ? "" : "<h4>No saved songs yet</h4>";
    offline.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => playSong(i, offline);
        list.appendChild(d);
    });
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function showMenu() { document.getElementById('options-menu').classList.add('show'); }
function hideMenu() { document.getElementById('options-menu').classList.remove('show'); }

loadHome();
