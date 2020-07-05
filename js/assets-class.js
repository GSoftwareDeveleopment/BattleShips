const fileType = {
    sound: 0,
    image: 1
}

class SoundFile {
    constructor(url, autoload = true) {
        this.fileType = fileType.sound;
        this.url = url;
        this.obj = null;
        this.isLoaded = false;

        if (autoload) this.load();
    }

    load() {
        this.obj = new Audio();
        this.obj.addEventListener('loadeddata', (event) => {
            console.log(this.url + ' is loaded.');
            this.isLoaded = true;
        });
        this.obj.addEventListener('error', (event) => {
            console.error(this.url + ' is not loaded.');
        });
        this.obj.src = this.url;
    }

    play(fade = false) {
        if (fade) {
            this.obj.volume = 0;
            let fadeTimer = setInterval(() => {
                if (this.obj.volume + 0.05 >= 1) {
                    this.obj.volume = 1;
                    clearInterval(fadeTimer);
                } else
                    this.obj.volume += .05;
            }, 50)
        }
        this.obj.currentTime = 0;
        this.obj.play();
    }

    stop(fade = false) {
        if (fade) {
            let fadeTimer = setInterval(() => {
                if (this.obj.volume - 0.05 <= 0) {
                    this.obj.volume = 0;
                    this.obj.currentTime = 0;
                    this.obj.pause();
                    clearInterval(fadeTimer);
                } else
                    this.obj.volume -= .05;
            }, 50)
        } else {
            this.obj.pause();
            this.obj.currentTime = 0;
        }
    }
}

class ImageFile {
    constructor(url, autoload = true) {
        this.fileType = fileType.image;
        this.url = url;
        this.obj = null;
        this.isLoaded = false;

        if (autoload) this.load();
    }

    load() {
        this.obj = new Image();
        this.obj.onload = () => {
            console.log(this.url + " is loaded.");
            this.isLoaded = true;
        }
        this.obj.onerror = () => {
            console.error(this.url + " is not loaded.");
        }
        this.obj.src = this.url;

        //        this.obj.load();
    }
}