const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY';
let player, currentPlaylist = [], currentIndex = -1;

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', { height: '0', width: '0', events: { 'onStateChange': onPlayerStateChange }});
}

function playSong(index) {
    if(index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const item = currentPlaylist[index];
    player.loadVideoById(item.id.videoId);
    
    // UI Update
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('full-title').innerText = item.snippet.title;
    document.getElementById('artist').innerText = item.snippet.channelTitle;
    document.getElementById('full-artist').innerText = item.snippet.channelTitle;
    document.getElementById('disk').style.backgroundImage = `url('${item.snippet.thumbnails.high.url}')`;
    document.getElementById('large-disk').src = item.snippet.thumbnails.high.url;

    // Upcoming Song Update
    if(index + 1 < currentPlaylist.length) {
        const next = currentPlaylist[index + 1];
        document.getElementById('next-song-title').innerText = next.snippet.title;
        document.getElementById('next-song-artist').innerText = next.snippet.channelTitle;
        document.getElementById('next-song-img').src = next.snippet.thumbnails.default.url;
    }
}

// Progress Bar
setInterval(() => {
    if (player && player.getPlayerState() === 1) {
        let cur = player.getCurrentTime(), dur = player.getDuration();
        document.getElementById('progress-fill').style.width = (cur/dur*100) + "%";
        document.getElementById('current-time').innerText = formatTime(cur);
        document.getElementById('duration-time').innerText = formatTime(dur);
    }
}, 1000);

function formatTime(s) { return Math.floor(s/60) + ":" + (Math.floor(s%60)<10?'0':'') + Math.floor(s%60); }

// Search & List
document.getElementById('search-btn').onclick = async () => {
    const q = document.getElementById('search-input').value;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${q+" music"}&type=video&key=${API_KEY}`);
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

// Controls
document.getElementById('mini-player-trigger').onclick = () => document.getElementById('full-player').classList.add('active');
document.getElementById('close-full-player').onclick = () => document.getElementById('full-player').classList.remove('active');

// Menu Controls
document.getElementById('menu-dots-btn').onclick = () => document.getElementById('options-menu').classList.add('show');
document.getElementById('close-menu').onclick = () => document.getElementById('options-menu').classList.remove('show');

const toggle = () => player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
document.getElementById('play-btn').onclick = toggle;
document.getElementById('full-play-btn').onclick = toggle;
document.getElementById('next-btn').onclick = () => playSong(currentIndex + 1);
document.getElementById('prev-btn').onclick = () => playSong(currentIndex - 1);

function onPlayerStateChange(e) {
    const icon = e.data === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    document.getElementById('play-btn').innerHTML = icon;
    document.getElementById('full-play-btn').innerHTML = icon;
}
