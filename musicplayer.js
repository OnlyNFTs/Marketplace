const musicContainer = document.querySelector('.music-container');
const playBtn = document.querySelector('#play');
const prevBtn = document.querySelector('#prev');
const nextBtn = document.querySelector('#next');
const audio = document.querySelector('#audio');
const progress = document.querySelector('.progress');
const progressContainer = document.querySelector('.progress-container');
const title = document.querySelector('#title');
const cover = document.querySelector('#cover');


//Notification
// const notificationHeader = document.getElementById("notificationHeader")
// const notificationBody = document.getElementById("notificationBody")
// const notificationTime = document.getElementById("notificationTime")

//Song Titles
const songs = ['sickickvol3', 'diamonds', 'pumpitup', 'elephants']

// Keep track of songs
let songIndex = 0

//Load a song of dom
loadSong(songs[songIndex])

//Update song details
function loadSong(song) {
    title.innerText = song
    audio.src = `music/${song}.mp3`
    cover.src = `music/images/${song}.jpg`
}

function playSong() {
    musicContainer.classList.add('play')
    //playBtn.querySelector('i.fas').classList.remove('fa-play')
   // playBtn.querySelector('i.fas').classList.add('fa-pause')
   notificationHeader.innerText = "Now Playing!";
        notificationBody.innerText = "Now Playing! " + title.innerText;
        //notificationTime.innerText = Math.round(Date.now()/1000)+60*20;
        $('.toast').toast('show');
   audio.play()
}

function pauseSong() {
    musicContainer.classList.remove('play')
    //playBtn.querySelector('i.fas').classList.add('fa-play')
    //playBtn.querySelector('i.fas').classList.remove('fa-pause')
    audio.pause()
}

function prevSong() {
    songIndex--

    if(songIndex < 0) {
        songIndex = songs.length -1
    }
    loadSong(songs[songIndex])

    playSong()
}

function nextSong() {
    songIndex++

    if(songIndex > songs.length - 1) {
        songIndex = 0
    }
    loadSong(songs[songIndex])

    playSong()
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement
    const progressPercent = (currentTime / duration) * 100
    progress.style.width = `${progressPercent}%`
}

function setProgress(e) {
    const width = this.clientWidth
    const clickX = e.offsetX
    // alert(clickX)
    // alert(width)
    const duration = audio.duration
    alert(clickX/width*duration)


    audio.currentTime = (clickX / width) * duration
}

//Event Listeners
playBtn.addEventListener('click', () => {
    const isPlaying = musicContainer.classList.contains('play')
    if (isPlaying) {
        pauseSong()
    } else {
        playSong()
    }
    })

//Change Song Events
prevBtn.addEventListener('click', prevSong)
nextBtn.addEventListener('click', nextSong)

audio.addEventListener('timeupdate', updateProgress)

progressContainer.addEventListener('click', setProgress)

audio.addEventListener('ended', nextSong)