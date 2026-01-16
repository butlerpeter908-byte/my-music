const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// 4. Library Restore Logic
let favorites = JSON.parse(localStorage.getItem('favSongs')) || [];

var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

// 1. Duration Update System
setInterval(() => {
    if (player && player.getCurrentTime) {
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

// 5. Instant Search (Word by Word)
async function instantSearch() {
    const q = document.getElementById('search-input').value;
    if (q.length < 2) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    displayResults(data.items);
}

function displayResults(songs) {
    currentPlaylist = songs;
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    songs.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
        d.onclick = (e) => { e.stopPropagation(); playSong(i); };
        list.appendChild(d);
    });
}

function playSong(idx) {
    if(!currentPlaylist[idx]) return;
    currentIndex = idx;
    const s = currentPlaylist[idx];
    player.loadVideoById(s.id.videoId);
    
    document.getElementById('title').innerText = s.snippet.title.substring(0,25);
    document.getElementById('full-title').innerText = s.snippet.title;
    document.getElementById('artist').innerText = s.snippet.channelTitle;
    document.getElementById('full-artist').innerText = s.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${s.snippet.thumbnails.default.url}')`;
    document.getElementById('large-disk').src = s.snippet.thumbnails.high.url;
    
    // 7. Update Up Next UI
    const nextS = currentPlaylist[idx + 1];
    document.getElementById('next-song-name').innerText = nextS ? nextS.snippet.title : "End of list";
}

// 2. Favorite Logic
document.getElementById('fav-btn-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    if(!favorites.find(f => f.id.videoId === s.id.videoId)) {
        favorites.push(s);
        localStorage.setItem('favSongs', JSON.stringify(favorites));
        alert("Saved to Favorites!");
    }
    hideMenu();
};

// 3. Download Logic Fix
document.getElementById('dl-btn-trigger').onclick = () => {
    const s = currentPlaylist[currentIndex];
    window.open(`https://9xbuddy.org/process?url=https://www.youtube.com/watch?v=${s.id.videoId}`, '_blank');
};

// 6. Settings Function
function openSettings() {
    alert("Pro Settings: Audio Quality: 320kbps | Buffering: Optimized");
}

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) playSong(currentIndex + 1);
}

function togglePlay(e) {
    if(e) e.stopPropagation();
    if(player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
}
document.getElementById('play-btn').onclick = togglePlay;
document.getElementById('full-play-btn').onclick = togglePlay;

// Tab Switch with Library Display
function switchTab(id, btn) {
    document.querySelectorAll('.content-area').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-left button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.remove('hidden');
    btn.classList.add('active');

    if(id === 'library-section') {
        const list = document.getElementById('library-list');
        list.innerHTML = favorites.length ? "" : "<p>No favorites yet</p>";
        favorites.forEach((s, i) => {
            const d = document.createElement('div'); d.className = 'playlist-card';
            d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title}</h4>`;
            d.onclick = () => { currentPlaylist = favorites; playSong(i); };
            list.appendChild(d);
        });
    }
}

async function fetchHome(q, id) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${q}&type=video&videoCategoryId=10&key=${API_KEY}`);
    const data = await res.json();
    const row = document.getElementById(id);
    data.items.forEach((s, i) => {
        const d = document.createElement('div'); d.className = 'playlist-card';
        d.innerHTML = `<img src="${s.snippet.thumbnails.high.url}"><h4>${s.snippet.title.substring(0,20)}...</h4>`;
        d.onclick = (e) => { e.stopPropagation(); currentPlaylist = data.items; playSong(i); };
        row.appendChild(d);
    });
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
document.getElementById('dots-menu-btn').onclick = (e) => { e.stopPropagation(); document.getElementById('options-menu').classList.add('show'); };
function hideMenu() { document.getElementById('options-menu').classList.remove('show'); }
document.getElementById('next-btn-trigger').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn-trigger').onclick = () => playSong(currentIndex - 1);

fetchHome("Hindi Songs 2025", "best-2025");
fetchHome("Trending Bollywood", "trending-row");
fetchHome("90s Kumar Sanu Hits", "bollywood-90s");
            
