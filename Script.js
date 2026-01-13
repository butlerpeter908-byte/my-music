const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const disk = document.getElementById('disk');

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play().then(() => {
            playBtn.innerText = 'PAUSE';
            disk.classList.add('play-animation');
        }).catch(error => {
            console.log("Playback failed:", error);
            alert("Please try again!");
        });
    } else {
        audio.pause();
        playBtn.innerText = 'PLAY';
        disk.classList.remove('play-animation');
    }
});
