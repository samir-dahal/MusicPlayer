//helper functions
function $(element) {
    return document.querySelector(element);
}
function log(message) {
    return console.log(message);
}

//object refrences
const next = $('#next');
const playToggle = $('#play-pause');
const prev = $('#prev');
const volumeslider = $('#volumeslider');
const seekslider = $('#seekslider');
const curtimeText = $('#curtimetext');
const durtimeText = $('#durtimetext');
const playlistStatus = $('#playlist-status');
let seeking = false;
var seekto = 0;

//audio object
let audio = new Audio();
let dir = "sounds/";
let playlist = ["sound1", "sound2", "sound3"];
let ext = ".mp3";
let playlist_index = 0;
audio.src = dir + playlist[playlist_index] + ext;


//play or pause music
function PlayPause() {
    playToggle.classList.toggle("fa-pause-circle");
    if (!audio.paused) {
        audio.pause();
    }
    else {
        audio.play();
    }
}
playToggle.addEventListener('click', PlayPause);

//manual seeking
seekslider.addEventListener('input', () => {
    audio.currentTime = audio.duration * (seekslider.value / 100);
})
//volume control
function setVolume() {
    audio.volume = volumeslider.value / 100;
}
volumeslider.addEventListener('input', setVolume);

//updating seektime duration
function seekTimeUpdate() {
    const newTime = audio.currentTime * (100 / audio.duration);
    seekslider.value = newTime;

    //generating current time and song duration
    var curmin = Math.floor(audio.currentTime / 60);
    var cursec = Math.floor(audio.currentTime - (curmin * 60));
    var durmin = Math.floor(audio.duration / 60);
    var dursec = Math.floor(audio.duration - (durmin * 60));

    //adding zero if less than 10
    curmin = (curmin < 10) ? "0" + curmin : curmin;
    cursec = (cursec < 10) ? "0" + cursec : cursec;
    durmin = (durmin < 10) ? "0" + durmin : durmin;
    dursec = (dursec < 10) ? "0" + dursec : dursec;

    //populating time box
    curtimeText.textContent = curmin + ":" + cursec;
    durtimeText.textContent = durmin + ":" + dursec;

    //displaying playlist status
    playlistStatus.textContent = dir + playlist[playlist_index] + ext;
}
audio.addEventListener('timeupdate', seekTimeUpdate);


//autoplay song when ends
function autoPlay() {
    if (playlist_index == (playlist.length - 1)) {
        playlist_index = 0;
    }
    else {
        playlist_index++;
        audio.src = dir + playlist[playlist_index] + ext;
        audio.currentTime = 0;
        audio.play();
    }
}
audio.addEventListener('ended', autoPlay);

//check playing or not and add class to it play/pause
function checkPlayPause() {
    if (audio.paused) {
        playToggle.classList.toggle("fa-pause-circle");
    }
}



//changing songs next and prev

//on next
function nextSong() {
    checkPlayPause();
    if (playlist_index == (playlist.length - 1)) {
        playlist_index = 0;
        audio.src = dir + playlist[playlist_index] + ext;
        audio.play();
    }
    else {
        playlist_index++;
        audio.src = dir + playlist[playlist_index] + ext;
        audio.play();
    }
}
next.addEventListener('click', nextSong);

//on prev
var count = playlist.length;
function prevSong() {
    checkPlayPause();
    if (playlist_index == 0) {
        audio.src = dir + playlist[playlist_index] + ext;
        audio.play();
    }
    else {
        playlist_index--;
        audio.src = dir + playlist[playlist_index] + ext;
        audio.play();
    }
}
prev.addEventListener('click', prevSong);

//verly js
VerlyRange("seekslider", "#655ecf");
VerlyRange("volumeslider", "#eb3992");

/**
 * @author Anurag Hazra
 * @param {string} id 
 * @param {string} color 
 */
function VerlyRange(id, color) {
    let DOMSlider = document.getElementById(id);
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let width = DOMSlider.scrollWidth;
    let height = width / 2;
    canvas.width = width;
    canvas.height = height;
    canvas.style.pointerEvents = 'none';
    canvas.style.transform = 'translate(0, -15px)';
    DOMSlider.parentElement.appendChild(canvas);

    const gravity = new Vector(0, 0.3);

    // iteration, canvas, ctx
    let verly = new Verly(50, canvas, ctx);
    let rope = generateRope();

    // generic function to apply reset of rope wehn resizing
    function generateRope() {
        let rope = verly.createRope(0, 0, width / 20, 17, 0);
        let lastIndex = rope.points.length - 1;
        // rope extra tweaks
        rope.setGravity(gravity);
        rope.pin(lastIndex);

        // overwrite render function
        rope.renderSticks = () => {
            for (let i = 0; i < rope.sticks.length; i++) {
                let stick = rope.sticks[i];
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 10;
                ctx.lineCap = 'round';
                ctx.moveTo(stick.startPoint.pos.x, stick.startPoint.pos.y);
                ctx.lineTo(stick.endPoint.pos.x, stick.endPoint.pos.y);
                ctx.stroke();
                ctx.closePath();
            }
        }
        return rope;
    }

    // handle resize 
    window.addEventListener('resize', function () {
        width = DOMSlider.scrollWidth
        height = width / 2;
        canvas.width = verly.WIDTH = width;
        canvas.height = verly.HEIGHT = height;

        rope = generateRope();

        setRopePosition();
    });

    // rope end point position
    function setRopePosition() {
        let ratio = (DOMSlider.value - DOMSlider.min) / (DOMSlider.max - DOMSlider.min);
        // floating point correction
        if (ratio < 0.5) ratio += 0.01;
        if (ratio < 0.3) ratio += 0.01;
        if (ratio > 0.6) ratio -= 0.01;
        if (ratio > 0.8) ratio -= 0.02;
        rope.points[rope.points.length - 1].pos.x = (ratio * width);
    }
    setRopePosition();
    DOMSlider.addEventListener('input', setRopePosition);

    function animate() {
        ctx.clearRect(0, 0, width, height);

        verly.update();
        rope.renderSticks();
        setRopePosition();
        requestAnimationFrame(animate);
    }
    animate();
}




