function rand(min, max) {
    return (Math.floor(Math.random() * (max - min + 1) + min));
}

class Game {
    constructor(_assets) {
        this.playmode = '';
        this.settings = {
            boardSize: 10,
            showSunkenShips: true,              // Show sunken ships
            allowObliqueArrangement: false,     // Allow oblique arrangement of ships
            distanceBetweenShips: false,        // Observe the distance between the ships
            backgroundSound: false
        };

        console.groupCollapsed('Initialize game');
        this.assets = _assets;
        this.assets.sounds["music"].obj.loop = true;
        this.assets.sounds["sea"].obj.loop = true;

        this.screenStart = new StartScreen('start', this);
        this.screenSetupShips = new SetShipsScreen('game-set', this);
        this.screenSetupHelp = new SetHelpScreen('set-help', this);
        this.screenBattle = new BattleScreen('battle', this);
        this.screenStats = new StatsScreen('stats', this);
        console.groupEnd();
    }

    getResByName(name) {
        for (let i = 0; i < this.assets.length; i++) {
            let res = this.assets[i];
            if (res.id === name) {
                return $(res).clone();
            }
        }
        return false;
    }

    goStart() {
        this.players = [];
        this.screenStats.hideScreen(); // konieczność, zamknięcie screenStats po Gameover
        this.screenStart.showScreen();
    }

    goSetupShips(playmode) {
        let _game = this;
        if (playmode) {
            this.playmode = playmode;

            // stworzenie graczy wg. typu rozgrywki (playmode)
            switch (playmode) {
                case "cvc": // computer vs computer
                    // addNewPlayer(0, 'computer-1');
                    // addNewPlayer(0, 'computer-2');
                    console.log('Computer vs Computer mode is not implemented yet :(');
                    break;
                case "hvc": // human vs computer
                    // addNewPlayer(1, 'human');
                    // addNewPlayer(0, 'computer');
                    console.log('Human vs Computer mode is not implemented yet :(');
                    break;
                case "hvh": // human vs human
                    console.log('Starting Human vs Human game...');
                    this.players.push(new Human(this, 'human-1'));
                    this.players.push(new Human(this, 'human-2'));
                    break;
            }

            $("body").get(0).style.setProperty("--boardSize", this.settings.boardSize);
        }

        this.screenSetupShips.showScreen();
    }

    goAbort() {
        for (let playerID in this.players) {
            this.players[playerID].removePlayer();
        }

        this.screenSetupShips.hideScreen();
        this.goStart();
        this.screenStart.showScreen();
    }

    goBattle() {
        // przejście do bitwy
        this.screenSetupShips.hideScreen();
        this.screenBattle.showScreen();
    }

    goGameover() {
        this.screenBattle.hideScreen();
        this.screenStats.showScreen();
    }

    goRevange() {
        this.screenStats.hideScreen();

        // zresetuj graczy
        for (let playerID in this.players) {
            this.players[playerID].reset();
        }

        this.goSetupShips();
    }

    run() {
        $('div#loader').addClass('hidden');
        $('div#game').removeClass('hidden');
        this.goStart();
    }
}

var game, resources;

function run() {
    game = new Game(resources);
    game.run();
}

var interval = setInterval(function () {
    if (document.readyState === 'complete' && resources.allLoaded()) {
        console.groupEnd('Loading resources...');
        clearInterval(interval);
        run();
    }
}, 100);

console.groupCollapsed('Loading resources...');
resources = {
    images: {
        "start-bg": new ImageFile("assets/start.jpg"),
        "setup-bg": new ImageFile("assets/setup.jpg"),
        "battle-bg": new ImageFile("assets/battle.jpg"),

        "shiptype-1": new ImageFile("assets/1-mast.png"),
        "shiptype-2": new ImageFile("assets/2-mast.png"),
        "shiptype-3": new ImageFile("assets/3-mast.png"),
        "shiptype-4": new ImageFile("assets/4-mast.png"),
        "aim": new ImageFile("assets/aim.png")
    },
    sounds: {
        "music": new SoundFile("assets/music.mp3"),
        "sea": new SoundFile("assets/sea.mp3"),

        "click": new SoundFile("assets/click.ogg"),
        "pop": new SoundFile("assets/pop.mp3"),
        "splash": new SoundFile("assets/splash.mp3"),
        "cancel": new SoundFile("assets/cancel.mp3"),
        "error": new SoundFile("assets/error.mp3"),

        "cannon": new SoundFile("assets/canon.ogg"),
        "miss": new SoundFile("assets/miss.mp3"),

        "hit1": new SoundFile("assets/hit1.mp3"),
        "hit2": new SoundFile("assets/hit2.mp3"),
        "hit3": new SoundFile("assets/hit3.mp3")
    },
    allLoaded: function () {
        for (resID in this.images) {
            if (!this.images[resID].isLoaded)
                return false;
        }
        for (resID in this.sounds) {
            if (!this.sounds[resID].isLoaded)
                return false;
        }
        return true;
    }
};
