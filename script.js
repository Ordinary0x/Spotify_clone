console.log("First web project")

let songs
let current_song = new Audio()
let current_folder
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function get_song(folder) {
    current_folder = folder
    let a = await fetch(`http://127.0.0.1:3000/spotify/${current_folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName('a')
    let songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${current_folder}/`)[1])
        }
    }
    // Show all the songs in the playlist
    let songUL = document.querySelector(".song_list").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
                        <img  src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Me</div>
                        </div>
                        <div class="playinfo">
                            <span>Play now</span>
                            <img class="invert" src="img/play1.svg" alt="">
                        </div>
                            

                    </li>
        `

    }
    //Attach event listner to each song
    Array.from(document.querySelector(".song_list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            play_music(e.querySelector(".info").firstElementChild.innerHTML)

        })
    })
    return songs
}

const play_music = (track, paused = false) => {
    current_song.src = `/spotify/${current_folder}/` + track
    if (!paused) {
        current_song.play()
        play.src = "img/paused.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}
async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/spotify/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card_container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/spotify/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/spotify/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play"><svg width="50" height="50" viewBox="0 0 64 64" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <circle cx="32" cy="32" r="32" fill="#1DB954" />
                                <polygon points="24,18 24,46 48,32" fill="black" />
                            </svg></div>

            <img src="/spotify/songs/${folder}/image.png" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await get_song(`songs/${item.currentTarget.dataset.folder}`)
            play_music(songs[0])


        })
    })
}
async function main() {
    // songs = await get_song("songs/ncs")
    // play_music(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()





    play.addEventListener("click", () => {
        if (current_song.paused) {
            current_song.play()
            play.src = "img/paused.svg"
        }
        else {
            current_song.pause()
            play.src = "img/play.svg"
        }
    })

    // listen to timeupdate
    current_song.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(current_song.currentTime)} / ${secondsToMinutesSeconds(current_song.duration)}`
        document.querySelector(".circle").style.left = (current_song.currentTime / current_song.duration) * 100 + "%";
    })


    //Add eventlistener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = persent + "%";
        current_song.currentTime = (persent) * (current_song.duration) / 100;
    })

    //Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add an event listener to collapse button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%"
    })

    //Add event listener to prev
    prev.addEventListener("click", () => {
        current_song.pause()
        play.src = "img/play.svg"
        console.log("Previous Clicked")

        let index = songs.indexOf(current_song.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            play_music(songs[index - 1])
        }
    })
    //Add event listener to next
    next.addEventListener("click", () => {
        current_song.pause()
        play.src = "img/play.svg"
        console.log("Next Clicked")

        let index = songs.indexOf(current_song.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            play_music(songs[index + 1])
        }
    })

    //Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value)
        current_song.volume = parseInt(e.target.value) / 100
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            current_song.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            current_song.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })



}

main()
