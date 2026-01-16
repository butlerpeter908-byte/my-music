const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 

let player;

// YouTube API load karna
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

const searchBtn = document.getElementById('search-btn');
const playBtn = document.getElementById('play-btn');

// Search Logic with Correct Backticks
searchBtn.addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if(!query) return alert("Gaane ka naam likho!");

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if(data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            const title = data.items[0].snippet.title;
            
            document.getElementById('title').innerText = title;
            player.loadVideoById(videoId);
            playBtn.innerText = 'PAUSE';
        } else {
            alert("Gaana nahi mila!");
        }
    } catch (err) {
        alert("API Error! Quota ya Key check karein.");
    }
});

// Play/Pause Button toggle
playBtn.addEventListener('click', () => {
    if (player.getPlayerState() === 1) {
        player.pauseVideo();
        playBtn.innerText = 'PLAY';
    } else {
        player.playVideo();
        playBtn.innerText = 'PAUSE';
    }
});

function onPlayerStateChange(event) {
    if (event.data === 0) playBtn.innerText = 'PLAY';
}
