const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

// YouTube IFrame API Load
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function playSong(index) {
    if(index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const item = currentPlaylist[index];
    player.loadVideoById(item.id.videoId);
    
    // Update UI Elements
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('full-title').innerText = item.snippet.title;
    document.getElementById('artist').innerText = item.snippet.channelTitle;
    document.getElementById('full-artist').innerText = item.snippet.channelTitle;
    const imgUrl = item.snippet.thumbnails.high.url;
    document.getElementById('disk').style.backgroundImage = `url('${imgUrl}')`;
    document.getElementById('large-disk').src = imgUrl;
}

// Search Function
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    if(!q) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q + " music"}&type=video&key=${API_KEY}`);
    const data = await res.json();
    currentPlaylist = data.items;
    
    const list = document.getElementById('results-list');
    list.innerHTML = "";
    data.items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<img src="${item.snippet.thumbnails.default.url}"><div><h4>${item.snippet.title}</h4></div>`;
        div.onclick = () => playSong(i);
        list.appendChild(div);
    });
};

// --- FIX: OPEN FULL PLAYER LOGIC ---
document.getElementById('mini-player-trigger').onclick = function() {
    document.getElementById('full-player').classList.add('active');
};

document.getElementById('close-full-player').onclick = function() {
    document.getElementById('full-player').classList.remove('active');
};

// Play/Pause Control
const togglePlay = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
document.getElementById('play-btn').onclick = togglePlay;
document.getElementById('full-play-btn').onclick = togglePlay;

// Next/Prev Control
const nextSong = () => playSong(currentIndex + 1);
const prevSong = () => playSong(currentIndex - 1);
document.getElementById('next-btn-mini').onclick = nextSong;
document.getElementById('next-btn-full').onclick = nextSong;
document.getElementById('prev-btn-mini').onclick = prevSong;
document.getElementById('prev-btn-full').onclick = prevSong;

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
    if(e.data === 0) playSong(currentIndex + 1); // Auto-next
}

// Favorite Toggle
document.getElementById('fav-btn').onclick = function() {
    this.classList.toggle('fa-regular');
    this.classList.toggle('fa-solid');
    this.style.color = this.classList.contains('fa-solid') ? '#1DB954' : 'white';
};
