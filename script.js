

console.log("lets start coding");
let currentSong = new Audio;
let songs;
let currFolder ;

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


 async function getSongs(folder){
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let respose =  await a.text();
    let div = document.createElement("div");
    div.innerHTML= respose;
    let as = div.getElementsByTagName("a");
    songs=[];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }    
    }

    // to show all songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML="";
    for (const song of songs) {
        songUL.innerHTML= songUL.innerHTML + `<li> 
                   <img  class="invert p-1" src="/images/music.svg" alt="music">
                    <div class="info">
                        <div> ${song.replaceAll("%20", " ")}</div>
                        <div>Soleha</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <i class="fa-regular fa-circle-play"></i>
                    </div> </li>`;   
    }
    //attach event listener to all songs
    Array.from (document.querySelector(".songList").getElementsByTagName("li")).forEach(e =>{
        e.addEventListener("click",()=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

        })
        
    });
    //question regarding this
    return songs;
}
let playMusic= (track, pause=false)=>{
    // let audio = new Audio ();
    currentSong.src = `/${currFolder}/` +track;
    // console.log(currentSong.src);
    if(!pause){
        currentSong.play();
        play.src= "/images/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML= decodeURI(track);
    document.querySelector(".songTime").innerHTML= "00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/Songs/`);
    let respose =  await a.text();
    let div = document.createElement("div");
    div.innerHTML= respose;
    console.log(div);
    let anchors = div.getElementsByTagName("a");
    let cardContainer= document.querySelector(".cardContainer");
     let array= Array.from(anchors);
     for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/Songs") && e.href.endsWith("/")){
            let folder =(e.href.split("/").slice(-2)[0]);
            console.log(folder);
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`);
            let response =  await a.json();
            console.log(response);
            cardContainer.innerHTML= cardContainer.innerHTML + `<div  data-folder="${folder}" class="card">
                <div class="play">
                    <i class="fa-solid fa-play"></i>
                </div>
                <img src="/Songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }
    
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs= await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
    
        })
       })
}

 async function main(){
    // get the list of all songs
    songs= await getSongs("Songs/ncs");
    playMusic(songs[0],true);

    //display all the albums
    await displayAlbums();
    
    
    //attach an event listeners to play, next and previous buttons
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "/images/pause.svg"
        } else{
            currentSong.pause();
            play.src = "/images/play.svg"
        }

    }) 

    //add event listener for tracking duration of the song
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songTime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =(currentSong.currentTime/currentSong.duration) * 100 + "%";
    })
    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        //this code calculate the click on the seekbar and gives it out as percentage
        let percent= (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent+"%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    })
    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    //add an event listener to close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })
   // add event listener for previous btn
   previous.addEventListener("click",()=>{
    currentSong.pause();
    let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if(index-1 >= 0){
        playMusic(songs[index-1]);
    }
   })
   // add event listener for next btn
   next.addEventListener("click",()=>{
    currentSong.pause();
    let index= songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if(index+1 < songs.length){
        playMusic(songs[index+1]);
    }
   })

   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    // console.log("Setting volume to", e.target.value, "/ 100");
    currentSong.volume= parseInt(e.target.value)/100;
   })
   //add event listener for the cards load playlist when card clicked
   Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click", async item=>{
        songs= await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0]);

    })
   })
    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}
main();
