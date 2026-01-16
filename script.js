const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1, searchTimer;

// Pre-load YouTube API
var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', 
        events: { 'onStateChange': onPlayerStateChange, 'onReady': () => {
            console.log("Player Ready");
            setInterval(updateProgress, 1000);
        }}
    });
}

const playlistsData = [
    { id: 'p1', name: 'Bollywood 2026', q: 'New Bollywood Songs 2026', img: 'https://i.ytimg.com/vi/ApnaBanaLe/maxresdefault.jpg' },
    { id: 'p2', name: 'Trending Now', q: 'Popular Hindi Music 2025', img: 'https://i.ytimg.com/vi/Kesariya/maxresdefault.jpg' },
    { id: 'p3', name: '90s Gold Hits', q: '90s Bollywood Romantic Songs', img: 'https://i.ytimg.com/vi/KumarSanu/maxresdefault.jpg' }
];

// Optimized Home Load
async function loadHome() {
    const row = document.getElementById('main-playlists');
    row.innerHTML = "Loading..."; 
    
    // Immediate display of playlists from data
    row.innerHTML = "";
    playlistsData.forEach(p => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${p.img}"><h4>${p.name}</h4>`;
        d.onclick = () => openPlaylist(p);
        row.appendChild(d);
    });
}

// Fixed Instant Search
function instantSearch() {
    const q = document.getElementById('search-input').value;
    if (q.length < 2) return;
    
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&videoDuration=medium&videoCategoryId=10&key=${API_KEY}`);
            const data = await res.json();
            const list = document.getElementById('results-list');
            list.innerHTML = "";
            if(data.items) {
                data.items.forEach((s, i) => {
                    const d = document.createElement('div'); d.className = 'playlist-card';
                    d.innerHTML = `<img src="${s.snippet.thumbnails.medium.url}"><h4>${s.snippet.title.substring(0,30)}...</h4>`;
                    d.onclick = () => playSong(i, data.items);
                    list.appendChild(d);
                });
            }
        } catch(e) { console.error("Search Error"); }
    }, 300); // 300ms is standard for instant feel
}

async function openPlaylist(p) {
    document.getElementById('home-default').classList.add('hidden');
    const view = document.getElementById('playlist-view');
    view.classList.remove('hidden');
    document.getElementById('playlist-cover').src = p.img;
    document.getElementById('playlist-name').innerText = p.name;
    
    const listDiv = document.getElementById('playlist-songs-list');
    listDiv.innerHTML = "<p style='padding:20px'>Loading songs...</p>";

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${p.q}&type=video&videoDuration=medium&key=${API_KEY}`);
    const data = await res.json();
    
    listDiv.innerHTML = "";
    data.items.forEach((s, i) => {
        const item = document.createElement('div'); item.className = 'song-item';
        item.innerHTML = `<img src="${s.snippet.thumbnails.default.url}"><div><h4>${s.snippet.title.substring(0,50)}</h4><p>${s.snippet.channelTitle}</p></div>`;
        item.onclick = () => playSong(i, data.items);
        listDiv.appendChild(item);
    });
}

function playSong(idx, list) {
    if(!list || !list[idx]) return;
    currentPlaylist = list; currentIndex = idx;
    const s = currentPlaylist[idx];
    
    const vidId = s.id.videoId || s.id;
    player.loadVideoById(vidId);
    
    document.getElementById('title').innerText = s.snippet.title.substring(0,25);
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${s.snippet.thumbnails.default.url}')`;
    document.getElementById('large-disk').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) { if(e) e.stopPropagation(); const state = player.getPlayerState(); state === 1 ? player.pauseVideo() : player.playVideo(); }
function nextSong(e) { if(e) e.stopPropagation(); if(currentIndex < currentPlaylist.length-1) playSong(currentIndex+1, currentPlaylist); }
function prevSong(e) { if(e) e.stopPropagation(); if(currentIndex > 0) playSong(currentIndex-1, currentPlaylist); }

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) nextSong();
}

function seek(e) {
    const rect = document.getElementById('seek-bar').getBoundingClientRect();
    player.seekTo(((e.clientX - rect.left) / rect.width) * player.getDuration());
}

function updateProgress() {
    if (player && player.getDuration && player.getPlayerState() === 1) {
        const curr = player.getCurrentTime(), dur = player.getDuration();
        if (dur > 0) {
            document.getElementById('progress-fill').style.width = (curr / dur * 100) + "%";
            document.getElementById('current-time').innerText = formatTime(curr);
            document.getElementById('total-duration').innerText = formatTime(dur);
        }
    }
}

function formatTime(s) { let m = Math.floor(s/60), sec = Math.floor(s%60); return m + ":" + (sec < 10 ? '0' + sec : sec); }

function startDownload() {
    const s = currentPlaylist[currentIndex];
    let offline = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    if(!offline.find(x => x.id.videoId === s.id.videoId)) {
        offline.push(s); localStorage.setItem('offlineSongs', JSON.stringify(offline));
        alert("Added to Library!");
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
    list.innerHTML = offline.length ? "" : "<h4 style='padding:20px'>Library Empty</h4>";
    offline.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => playSong(i, offline);
        list.appendChild(d);
    });
}

function backToHome() { document.getElementById('home-default').classList.remove('hidden'); document.getElementById('playlist-view').classList.add('hidden'); }
function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function showMenu() { document.getElementById('options-menu').classList.add('show'); }
function hideMenu() { document.getElementById('options-menu').classList.remove('show'); }
function playAll() { const first = document.querySelector('.song-item'); if(first) first.click(); }

loadHome();
