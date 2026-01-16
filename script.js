const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 

let player;

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
const disk = document.getElementById('disk');

searchBtn.addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if(!query) return alert("Gaane ka naam likho!");

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if(data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            const title = data.items[0].snippet.title;
            const thumbnailUrl = data.items[0].snippet.thumbnails.high.url; // IMAGE URL

            document.getElementById('title').innerText = title;
            
            // DISK PAR IMAGE LAGANA
            disk.style.backgroundImage = `url('${thumbnailUrl}')`;
            
            player.loadVideoById(videoId);
            playBtn.innerText = 'PAUSE';
        } else {
            alert("Gaana nahi mila!");
        }
    } catch (err) {
        alert("Error fetching data!");
    }
});

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
