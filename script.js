const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player;

// YouTube API load karna
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 
            'onStateChange': (e) => { 
                if(e.data === 1) document.getElementById('play-btn').innerHTML = '<i class="fa-solid fa-pause"></i>';
                else document.getElementById('play-btn').innerHTML = '<i class="fa-solid fa-play"></i>';
            } 
        }
    });
}

const searchBtn = document.getElementById('search-btn');
const resultsList = document.getElementById('results-list');
const playBtn = document.getElementById('play-btn');

searchBtn.addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if(!query) return;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        resultsList.innerHTML = ""; 

        if(data.items) {
            data.items.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('result-item');
                div.innerHTML = `
                    <img src="${item.snippet.thumbnails.default.url}">
                    <div class="result-info">
                        <h4>${item.snippet.title}</h4>
                        <p>${item.snippet.channelTitle}</p>
                    </div>
                `;
                div.onclick = () => {
                    player.loadVideoById(item.id.videoId);
                    document.getElementById('title').innerText = item.snippet.title;
                    document.getElementById('artist').innerText = item.snippet.channelTitle;
                    document.getElementById('disk').style.backgroundImage = `url('${item.snippet.thumbnails.high.url}')`;
                };
                resultsList.appendChild(div);
            });
        }
    } catch (err) { alert("Quota Over!"); }
});

playBtn.addEventListener('click', () => {
    if (player.getPlayerState() === 1) player.pauseVideo();
    else player.playVideo();
});
