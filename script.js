const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// Load YT API
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

// 1. 24-Hour Cache Logic
async function getCachedData(key, query) {
    const cached = localStorage.getItem(key);
    const now = new Date().getTime();
    if (cached) {
        const parsed = JSON.parse(cached);
        if (now - parsed.time < 24 * 60 * 60 * 1000) return parsed.data;
    }
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    localStorage.setItem(key, JSON.stringify({ time: now, data: data.items }));
    return data.items;
}

// 2. Seek Function (Aage-Piche)
function seek(e) {
    const bar = document.getElementById('seek-bar');
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    player.seekTo(pos * player.getDuration());
}

function updateProgress() {
    if (player && player.getCurrentTime) {
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
    let m = Math.floor(s / 60);
    let sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? '0' + sec : sec);
}

function playSong(idx, list) {
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

function togglePlay(e) {
    if(e) e.stopPropagation();
    const state = player.getPlayerState();
    state === 1 ? player.pauseVideo() : player.playVideo();
}

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) nextSong();
}

function nextSong() { if(currentIndex < currentPlaylist.length-1) playSong(currentIndex+1, currentPlaylist); }
function prevSong() { if(currentIndex > 0) playSong(currentIndex-1, currentPlaylist); }

async function loadHome() {
    const cats = [
        { id: 'best-2025', q: 'Latest Hindi Songs 2025' },
        { id: 'trending-row', q: 'Trending Bollywood Songs' },
        { id: 'bollywood-90s', q: '90s Superhit Bollywood' }
    ];
    for (let c of cats) {
        const songs = await getCachedData(c.id, c.q);
        const row = document.getElementById(c.id);
        songs.forEach((s, i) => {
            const d = document.createElement('div');
            d.className = 'playlist-card';
            d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title.substring(0,20)}</h4>`;
            d.onclick = () => playSong(i, songs);
            row.appendChild(d);
        });
    }
}

// 3. New Download Method (Store in App)
function startDownload() {
    const s = currentPlaylist[currentIndex];
    let offline = JSON.parse(localStorage.getItem('offlineSongs')) || [];
    if(!offline.find(x => x.id.videoId === s.id.videoId)) {
        offline.push(s);
        localStorage.setItem('offlineSongs', JSON.stringify(offline));
        alert("Saved to Library!");
    }
    hideMenu();
}

function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if(id === 'library-section') {
        const list = document.getElementById('library-list');
        const offline = JSON.parse(localStorage.getItem('offlineSongs')) || [];
        list.innerHTML = offline.length ? "" : "<h4>No saved songs</h4>";
        offline.forEach((s, i) => {
            const d = document.createElement('div'); d.className = 'playlist-card';
            d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
            d.onclick = () => playSong(i, offline);
            list.appendChild(d);
        });
    }
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function showMenu() { document.getElementById('options-menu').classList.add('show'); }
function hideMenu() { document.getElementById('options-menu').classList.remove('show'); }

loadHome();
