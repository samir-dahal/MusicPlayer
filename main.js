//helper functions
const $ = (element) => document.querySelector(element);
const log = (message) => console.log(message);

//object refrences
const next = $('#next');
const prev = $('#prev');
const playToggle = $('#play-pause');
const volumeslider = $('#volumeslider');
const seekslider = $('#seekslider');
const curtimeText = $('#curtimetext');
const durtimeText = $('#durtimetext');
const playlistStatus = $('#playlist-status');

VerlyRange("seekslider", "#655ecf");
VerlyRange("volumeslider", "#eb3992");

class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = ["sound1", "sound2", "sound3"];
        this.playlistIndex = 0;
        this.audio.src = this.getCurrentSongSource();
    }
    getCurrentSongSource = () => {
        return "sounds/" + this.playlist[this.playlistIndex] + ".mp3";
    }
    togglePlay = () => {
        playToggle.classList.toggle("fa-pause-circle");
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }
    playCurrentSource = () => {
        if (!playToggle.classList.contains("fa-pause-circle")) {
            playToggle.classList.add("fa-pause-circle");
        }
        this.audio.src = this.getCurrentSongSource();
        this.audio.play();
    }
    playNext = () => {
        this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
        this.playCurrentSource();
    }
    playPrev = () => {
        this.playlistIndex = (this.playlistIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playCurrentSource();
    }
    guardNanForDuration = (value) => {
        return isNaN(value) ? "00" : value;
    }
    seekTimeUpdate = () => {
        const newTime = this.audio.currentTime * (100 / this.audio.duration);
        seekslider.value = newTime;

        //generating current time and song duration
        var curmin = Math.floor(this.audio.currentTime / 60);
        var cursec = Math.floor(this.audio.currentTime - (curmin * 60));
        var durmin = Math.floor(this.audio.duration / 60);
        var dursec = Math.floor(this.audio.duration - (durmin * 60));

        //adding zero if less than 10
        curmin = (curmin < 10) ? "0" + curmin : curmin;
        cursec = (cursec < 10) ? "0" + cursec : cursec;
        durmin = (durmin < 10) ? "0" + durmin : durmin;
        dursec = (dursec < 10) ? "0" + dursec : dursec;

        //populating time box
        curtimeText.textContent = this.guardNanForDuration(curmin) + ":" + this.guardNanForDuration(cursec);
        durtimeText.textContent = this.guardNanForDuration(durmin) + ":" + this.guardNanForDuration(dursec);

        //displaying playlist status
        playlistStatus.textContent = this.getCurrentSongSource();
    }
    setVolume = () => {
        this.audio.volume = volumeslider.value / 100;
    }
    manualSeek = () => {
        const seekVal = this.audio.duration * (seekslider.value / 100);
        this.audio.currentTime = isNaN(seekVal) ? 0 : seekVal;
    }
    init = () => {
        this.audio.addEventListener('timeupdate', this.seekTimeUpdate);
        this.audio.addEventListener('ended', this.playNext);
        next.addEventListener('click', this.playNext);
        prev.addEventListener('click', this.playPrev);
        playToggle.addEventListener('click', this.togglePlay);

        //manual seek and volume
        seekslider.addEventListener('input', this.manualSeek)
        volumeslider.addEventListener('input', this.setVolume);
    }
}
new MusicPlayer().init();

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

    // generic function to apply reset of rope when resizing
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