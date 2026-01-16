// APNI API KEY EK BAAR PHIR CHECK KARO (Koi space nahi hona chahiye)
const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 

let player, currentList = [], currentIndex = -1, searchTimer;

// Load YouTube API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '0', width: '0',
        events: { 
            'onStateChange': onPlayerStateChange,
            'onReady': () => {
                setInterval(updateProgress, 1000);
                init(); 
            }
        }
    });
}

// Home thumbnails fix: Agar YT image block hai toh placeholder dikhega
const initialPlaylists = [
    { name: "Bollywood 2026", q: "New Bollywood Songs 2026", img: "https://img.youtube.com/vi/ApnaBanaLe/0.jpg" },
    { name: "Trending Now", q: "Popular Hindi Music", img: "https://img.youtube.com/vi/Kesariya/0.jpg" },
    { name: "90s Gold", q: "90s Bollywood Hits", img: "https://img.youtube.com/vi/KumarSanu/0.jpg" }
];

function init() {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = initialPlaylists.map(p => `
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
    listDiv.innerHTML = "<p style='text-align:center; padding:20px; color:#9cd67d;'>Loading songs...</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${q}&type=video&key=${API_KEY}`);
        const data = await res.json();
        
        if (data.error) {
            listDiv.innerHTML = `<p style='color:red; padding:20px;'>API Error: ${data.error.message}</p>`;
            return;
        }

        currentList = data.items;
        listDiv.innerHTML = data.items.map((s, i) => `
            <div class="song-item" onclick="playSong(${i})">
                <img src="${s.snippet.thumbnails.default.url}">
                <div class="song-info-text">
                    <h4>${s.snippet.title}</h4>
                    <p>${s.snippet.channelTitle}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        listDiv.innerHTML = "<p>Network Error. Check Internet.</p>";
    }
}

// Search Function Fix
async function searchMusic() {
    const q = document.getElementById('search-input').value;
    const resultsDiv = document.getElementById('search-results');
    
    if(q.length < 2) return;
    
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        try {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${API_KEY}`);
            const data = await res.json();
            
            if (data.error) {
                resultsDiv.innerHTML = `<p style='color:red; grid-column: 1/3;'>${data.error.message}</p>`;
                return;
            }

            currentList = data.items;
            resultsDiv.innerHTML = data.items.map((s, i) => `
                <div class="card" onclick="playSong(${i})">
                    <img src="${s.snippet.thumbnails.medium.url}">
                    <h4>${s.snippet.title.substring(0,30)}</h4>
                </div>
            `).join('');
        } catch (e) {
            resultsDiv.innerHTML = "<p>Search failed.</p>";
        }
    }, 600);
}

// Player controls remains same... (Copy the rest of playSong, togglePlay etc. from previous response)
