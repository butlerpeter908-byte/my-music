const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const disk = document.getElementById('disk');

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play().then(() => {
            playBtn.innerText = 'PAUSE';
            disk.classList.add('play-animation');
        }).catch(error => {
            console.error("Playback failed:", error);
            alert("Gaana load nahi ho raha, please check karein ki Pika.mp3 sahi se upload hui hai!");
        });
    } else {
        audio.pause();
        playBtn.innerText = 'PLAY';
        disk.classList.remove('play-animation');
    }
});
