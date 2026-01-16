const API_KEY = 'AIzaSyBkricU1Xd041GGKd5BUXEXxfYU6fUzVzY'; 
let player;

// API and Player initialization (Purana code)
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        events: { 'onStateChange': (e) => { if(e.data === 0) playBtn.innerText = 'PLAY'; } }
    });
}

const searchBtn = document.getElementById('search-btn');
const resultsList = document.getElementById('results-list');
const disk = document.getElementById('disk');
const playBtn = document.getElementById('play-btn');

searchBtn.addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if(!query) return alert("Gaane ka naam likho!");

    // MaxResults ko 5 kar diya hai taaki list dikhe
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        resultsList.innerHTML = ""; // Purani list saaf karein

        if(data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                const thumb = item.snippet.thumbnails.default.url;

                // Har gaane ke liye ek row banana
                const div = document.createElement('div');
                div.classList.add('result-item');
                div.innerHTML = `
                    <img src="${thumb}">
                    <div class="result-info">
                        <h4>${title.substring(0, 30)}...</h4>
                    </div>
                `;
                
                // Click karne par gaana bajega
                div.onclick = () => {
                    document.getElementById('title').innerText = title;
                    disk.style.backgroundImage = `url('${item.snippet.thumbnails.high.url}')`;
                    player.loadVideoById(videoId);
                    playBtn.innerText = 'PAUSE';
                    resultsList.innerHTML = ""; // Play hone ke baad list chhupa dein
                };
                
                resultsList.appendChild(div);
            });
        } else {
            alert("Gaana nahi mila!");
        }
    } catch (err) {
        alert("Error!");
    }
});

// Play/Pause button logic wahi rahega...
playBtn.addEventListener('click', () => {
    if (player.getPlayerState() === 1) { player.pauseVideo(); playBtn.innerText = 'PLAY'; }
    else { player.playVideo(); playBtn.innerText = 'PAUSE'; }
});
