const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const disk = document.getElementById('disk');

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.innerText = 'Pause';
        disk.classList.add('play-animation');
    } else {
        audio.pause();
        playBtn.innerText = 'Play';
        disk.classList.remove('play-animation');
    }
});

