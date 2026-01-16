const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const disk = document.getElementById('disk');

// Play aur Pause ka logic
playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play().then(() => {
            playBtn.innerText = 'PAUSE';
            disk.classList.add('play-animation');
        }).catch(err => {
            alert("Error: Music file load nahi ho rahi!");
        });
    } else {
        audio.pause();
        playBtn.innerText = 'PLAY';
        disk.classList.remove('play-animation');
    }
});

// JAISE HI GAANA KHATAM HO, YE BUTTON KO WAPAS 'PLAY' KAR DEGA
audio.addEventListener('ended', () => {
    playBtn.innerText = 'PLAY';
    disk.classList.remove('play-animation');
});
