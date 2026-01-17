// ==========================================
// 1. CONFIGURATION (Tumhari API Key Paste Kar Di Hai)
// ==========================================
const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 

let player, currentList = [], currentIndex = -1, searchTimer;

// YouTube IFrame API Load Karo
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0',
        width: '0',
        playerVars: { 'autoplay': 0, 'controls': 0 },
        events: { 
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
    init(); // Home screen playlists dikhao
    setInterval(updateProgress, 1000); 
}

// ==========================================
// 2. HOME SCREEN & PLAYLIST LOGIC
// ==========================================
const playlists = [
    { name: "Top Hits 2026", q: "Latest Bollywood Songs 2026", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" },
    { name: "Lofi Hindi Mix", q: "Hindi Lofi 2026", img: "https://img.youtube.com/vi/Kesariya/0.jpg" },
    { name: "90s Romantic", q: "90s Bollywood Evergreen", img: "https://img.youtube.com/vi/KumarSanu/0.jpg" },
    { name: "Trending Indie", q: "New Indian Indie Music", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" }
];

function init() {
    const grid = document.getElementById('home-grid');
    if (!grid) return;
    
    grid.innerHTML = playlists.map(p => `
        <div class="card" onclick="openPlaylist('${p.q}')">
            <img src="${p.img}" onerror="this.src='https://via.placeholder.com/150?text=Music'">
            <h4>${p.name}</h4>
        </div>
    `).join('');
}

async function openPlaylist(q) {
    document.getElementById('home-grid').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    const listDiv = document.getElementById('song-list');
    listDiv.innerHTML = "<p style='text-align:center; padding:20px; color:#9cd67d;'>Loading Spotify Mix...</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
        const data = await res.json();
        
        if (data.error) {
            listDiv.innerHTML = `<p style='color:red; padding:20px; text-align:center;'>
                <strong>API Issue:</strong> ${data.error.message}<br>
                <small>Reason: ${data.error.errors[0].reason}</small>
            </p>`;
            return;
        }

        currentList = data.items;
        listDiv.innerHTML = data.items.map((s, i) => `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #111;" onclick="playSong(${i})">
                <img src="${s.snippet.thumbnails.default.url}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                <div style="overflow:hidden; flex:1;">
                    <h4 style="font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px;">${s.snippet.title}</h4>
                    <p style="font-size:12px; color:#b3b3b3;">${s.snippet.channelTitle}</p>
                </div>
                <i class="fa-solid fa-play" style="color:#9cd67d; font-size:14px;"></i>
            </div>
        `).join('');
    } catch(e) {
        listDiv.innerHTML = "<p style='text-align:center; color:red;'>Network Connection Failed.</p>";
    }
}

// ==========================================
// 3. SEARCH LOGIC (PROBLEM 3 FIX)
// ==========================================
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    const resultsDiv = document.getElementById('search-results');
    
    if(q.length < 2) {
        resultsDiv.innerHTML = "";
        return;
    }

    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`);
            const data = await res.json();
            
            if (data.error) {
                resultsDiv.innerHTML = `<p style='color:red; grid-column: 1/3;'>${data.error.message}</p>`;
                return;
            }

            currentList = data.items;
            resultsDiv.innerHTML = data.items.map((s, i) => `
                <div class="card" onclick="playSong(${i})">
                    <img src="${s.snippet.thumbnails.medium.url}">
                    <h4>${s.snippet.title}</h4>
                </div>
            `).join('');
        } catch(e) {
            resultsDiv.innerHTML = "<p>Search failed.</p>";
        }
    }, 600);
}

// ==========================================
// 4. PLAYER CONTROLS (PROBLEM 1 FIX)
// ==========================================
function playSong(i) {
    currentIndex = i;
    const s = currentList[i];
    player.loadVideoById(s.id.videoId);
    
    // Mini Player Sync
    document.getElementById('m-title').innerText = s.snippet.title;
    document.getElementById('m-artist').innerText = s.snippet.channelTitle;
    document.getElementById('m-img').src = s.snippet.thumbnails.default.url;
    
    // Full Player Sync
    document.getElementById('f-title').innerText = s.snippet.title;
    document.getElementById('f-artist').innerText = s.snippet.channelTitle;
    document.getElementById('f-img').src = s.snippet.thumbnails.high.url;
}

function togglePlay(e) {
    if(e) e.stopPropagation();
    const state = player.getPlayerState();
    state === 1 ? player.pauseVideo() : player.playVideo();
}

function nextSong(e) {
    if(e) e.stopPropagation();
    if(currentIndex < currentList.length - 1) playSong(currentIndex + 1);
}

function prevSong() {
    if(currentIndex > 0) playSong(currentIndex - 1);
}

function onPlayerStateChange(e) {
    const mIcon = document.getElementById('m-play-icon');
    const fIcon = document.getElementById('f-play-icon');
    const iconClass = (e.data === 1) ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    
    mIcon.className = iconClass;
    fIcon.className = iconClass;
    
    if(e.data === 0) nextSong(); // Auto-next
}

function updateProgress() {
    if(player && player.getDuration) {
        const perc = (player.getCurrentTime() / player.getDuration()) * 100;
        if (perc) document.getElementById('progress-fill').style.width = perc + "%";
    }
}

function manualSeek(e) {
    const rect = document.getElementById('seek-bar').getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    player.seekTo(clickPos * player.getDuration());
}

// ==========================================
// 5. UI NAVIGATION
// ==========================================
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('tab-title').innerText = (id === 'home-section') ? 'Home' : 'Search';
}

function openFullPlayer() { document.getElementById('full-player').classList.add('active'); }
function closeFullPlayer() { document.getElementById('full-player').classList.remove('active'); }
function closePlaylist() { 
    document.getElementById('home-grid').classList.remove('hidden'); 
    document.getElementById('playlist-view').classList.add('hidden'); 
}
