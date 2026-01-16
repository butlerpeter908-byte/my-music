const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;
let favorites = JSON.parse(localStorage.getItem('favSongs')) || [];
let downloadedSongs = JSON.parse(localStorage.getItem('dlSongs')) || [];

var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

// 1. Seek Function (Aage-Piche Karne ke liye)
function seekSong(event) {
    if(!player || !player.getDuration) return;
    const bar = document.getElementById('seek-bar-container');
    const rect = bar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * player.getDuration();
    player.seekTo(newTime, true);
}

setInterval(() => {
    if (player && player.getCurrentTime && player.getPlayerState() === 1) {
        let curr = player.getCurrentTime();
        let dur = player.getDuration();
        if (dur > 0) {
            document.getElementById('progress-fill').style.width = (curr / dur * 100) + "%";
            document.getElementById('current-time').innerText = formatTime(curr);
            document.getElementById('total-duration').innerText = formatTime(dur);
        }
    }
}, 1000);

function formatTime(s) {
    let m = Math.floor(s / 60);
    let sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" + sec : sec);
}

async function instantSearch() {
    const q = document.getElementById('search-input').value;
    if (q.length < 2) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    currentPlaylist = data.items;
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    currentPlaylist.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = () => playSong(i);
        list.appendChild(d);
    });
}

function playSong(idx) {
    if(idx < 0 || idx >= currentPlaylist.length) return;
    currentIndex = idx;
    const s = currentPlaylist[idx];
    player.loadVideoById(s.id.videoId);
    
    document.getElementById('title').innerText = s.snippet.title.substring(0,25);
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${s.snippet.thumbnails.default.url}')`;
    document.getElementById('large-disk').src = s.snippet.thumbnails.high.url;
    
    const nextS = currentPlaylist[idx + 1];
    document.getElementById('next-song-name').innerText = nextS ? nextS.snippet.title : "End of Playlist";
}

function togglePlay(e) {
    if(e) e.stopPropagation();
    if(player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
}

function nextSong() { playSong(currentIndex + 1); }
function prevSong() { playSong(currentIndex - 1); }

// 3. Download & Store Logic
document.getElementById('dl-btn-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    // Storing in library
    if(!downloadedSongs.find(d => d.id.videoId === s.id.videoId)) {
        downloadedSongs.push(s);
        localStorage.setItem('dlSongs', JSON.stringify(downloadedSongs));
    }
    // New Stable External Downloader
    window.open(`https://www.y2meta.app/youtube/${s.id.videoId}`, '_blank');
    hideMenu();
};

document.getElementById('fav-btn-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    if(!favorites.find(f => f.id.videoId === s.id.videoId)) {
        favorites.push(s);
        localStorage.setItem('favSongs', JSON.stringify(favorites));
        alert("Added to Library!");
    }
    hideMenu();
};

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) nextSong();
}

function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.remove('hidden');
    btn.classList.add('active');

    if(id === 'library-section') {
        const list = document.getElementById('library-list');
        list.innerHTML = "<h4>Your Music</h4>";
        let combined = [...favorites, ...downloadedSongs];
        combined = Array.from(new Set(combined.map(a => a.id.videoId))).map(id => combined.find(a => a.id.videoId === id));
        combined.forEach((s, i) => {
            const d = document.createElement('div'); d.className = 'playlist-card';
            d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
            d.onclick = () => { currentPlaylist = combined; playSong(i); };
            list.appendChild(d);
        });
    }
}

async function fetchHome(q, id) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    const row = document.getElementById(id);
    const songs = data.items;
    songs.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title.substring(0,20)}...</h4>`;
        d.onclick = () => { currentPlaylist = songs; playSong(i); };
        row.appendChild(d);
    });
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
document.getElementById('dots-menu-btn').onclick = (e) => { e.stopPropagation(); document.getElementById('options-menu').classList.add('show'); };
function hideMenu() { document.getElementById('options-menu').classList.remove('show'); }
function openSettings() { alert("Pro Settings Enabled."); }

fetchHome("Hindi Songs 2025", "best-2025");
fetchHome("Trending Bollywood", "trending-row");
fetchHome("90s Kumar Sanu Hits", "bollywood-90s");
