const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player, currentPlaylist = [], currentIndex = -1;

// YouTube Setup
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 'onStateChange': (e) => {
            if(e.data === 0 && currentIndex < currentPlaylist.length - 1) playSong(currentIndex + 1);
            updatePlayButton(e.data);
        }}
    });
}

function playSong(index) {
    if(index < 0 || index >= currentPlaylist.length) return;
    currentIndex = index;
    const item = currentPlaylist[index];
    player.loadVideoById(item.id.videoId);
    document.getElementById('title').innerText = item.snippet.title;
    document.getElementById('disk').style.backgroundImage = `url('${item.snippet.thumbnails.high.url}')`;
}

// Search Logic
document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&key=${API_KEY}`);
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
});

// Buttons
document.getElementById('prev-btn').onclick = () => playSong(currentIndex - 1);
document.getElementById('next-btn').onclick = () => playSong(currentIndex + 1);
document.getElementById('play-btn').onclick = () => {
    player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
};

function updatePlayButton(state) {
    document.getElementById('play-btn').innerHTML = state === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}
