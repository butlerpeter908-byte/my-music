const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player;
let currentPlaylist = [];
let currentIndex = -1;

// YouTube API Setup
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 
            'onStateChange': onPlayerStateChange 
        }
    });
}

// Function to play song by index
function playSongAtIndex(index) {
    if (index >= 0 && index < currentPlaylist.length) {
        currentIndex = index;
        const item = currentPlaylist[currentIndex];
        player.loadVideoById(item.id.videoId);
        document.getElementById('title').innerText = item.snippet.title;
        document.getElementById('artist').innerText = item.snippet.channelTitle;
        document.getElementById('disk').style.backgroundImage = `url('${item.snippet.thumbnails.high.url}')`;
    }
}

// Search Logic
document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if(!query) return;

    // "music" keyword jodne se Shorts kam aate hain aur -short filter use kiya hai
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query + " music -shorts")}&type=video&videoDuration=medium&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = ""; 
        currentPlaylist = data.items; // Playlist save kar li

        if(data.items) {
            data.items.forEach((item, index) => {
                const div = document.createElement('div');
                div.classList.add('result-item');
                div.innerHTML = `
                    <img src="${item.snippet.thumbnails.default.url}">
                    <div class="result-info">
                        <h4>${item.snippet.title}</h4>
                        <p>${item.snippet.channelTitle}</p>
                    </div>
                `;
                div.onclick = () => playSongAtIndex(index);
                resultsList.appendChild(div);
            });
        }
    } catch (err) { console.log("Error fetching songs"); }
});

// Control Buttons Logic
document.querySelector('.fa-backward-step').parentElement.onclick = () => {
    if (currentIndex > 0) playSongAtIndex(currentIndex - 1);
};

document.querySelector('.fa-forward-step').parentElement.onclick = () => {
    if (currentIndex < currentPlaylist.length - 1) playSongAtIndex(currentIndex + 1);
};

document.getElementById('play-btn').onclick = () => {
    if (player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
};

function onPlayerStateChange(event) {
    const btn = document.getElementById('play-btn');
    if (event.data === 1) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    else btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    
    // Gaana khatam hone par auto-next
    if (event.data === 0) {
        if (currentIndex < currentPlaylist.length - 1) playSongAtIndex(currentIndex + 1);
    }
}
