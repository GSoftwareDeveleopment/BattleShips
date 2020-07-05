class BattleScreen extends Screen {
    constructor(_container, _game) {
        super(_container, _game);

        this.scoretext = this.screen.find('div.score');

        this.buildInterface('button', 'btn');
        // this.buildInterface('button', 'btn', {
        //     'surrender': (el) => { el.on('click', () => { this.surrender(); }); },
        //     'stats': (el) => { el.on('click', () => { this.stats(); }); }
        // });

        this.buildInterface('div.bigtext', 'texts');
        for (let textID in this.interface['texts'])
            this.interface['texts'][textID].addClass('hidden');

        this.turn = 0;
        this.shots = 0;
    }

    showScreen() {
        this.currentPlayerID = 0;
        this.turn = 0;
        this.duration = 0;
        this.shots = 0;
        this.isGameover = false;

        this._timer = setInterval(() => { this.duration++; }, 1000);

        // czyszczenie plansz graczy
        for (let player of this.game.players)
            player.board.clear();

        // przełączenie muzyki
        if (this.game.settings.backgroundSound) {
            this.game.assets.sounds['music'].stop(true);
            this.game.assets.sounds['sea'].play(true);
        }

        this.scoretext.removeClass('hidden').html('');

        this.interface.build('button', 'btn', {
            'surrender': (el) => { el.on('click', () => { this.surrender(); }); },
            'stats': (el) => { el.on('click', () => { this.stats(); }); }
        })

        super.showScreen();
        this.preparePlayerScreen();
    }

    hideScreen() {
        super.hideScreen();

        this.game.assets.sounds['sea'].stop();

        // usuń zdarzenia
        this.currentPlayer.board.screen.find('div.cell').off('click');
        this.opponentPlayer.board.screen.find('div.cell').off('click');

        this.interface['btn']['surrender'].addClass('hidden').off('click');
        this.interface['btn']['stats'].addClass('hidden').off('click');
    }

    showText(textID, text2, onFinish) {
        let HTMLtext = this.interface['texts'][textID];

        if (text2 !== '')
            HTMLtext.find('span').html(text2);
        else
            HTMLtext.find('span').html('');

        HTMLtext.removeClass('hidden')

        setTimeout(() => {
            HTMLtext.addClass('scaleout');
            setTimeout(() => {
                HTMLtext.removeClass('scaleout').addClass('hidden');
                if (onFinish) onFinish();
            }, 1000);
        }, 100);
    }

    preparePlayerScreen() {
        if (this.opponentPlayer) {
            this.opponentPlayer.board.hidePointer();
            this.opponentPlayer.board.hideBoard();
        }

        // który gracz jest przeciwnikiem?
        this.opponentPlayerID = this.currentPlayerID + 1 >= this.game.players.length ? 0 : this.currentPlayerID + 1;

        this.currentPlayer = this.game.players[this.currentPlayerID];
        this.opponentPlayer = this.game.players[this.opponentPlayerID];

        this.opponentPlayer.board.showBoard(true); // true - pokaż planszę przeciwnika na środku

        this.opponentPlayer.board.screen.find('div.cell')
            .off('click')
            .on('click', (e) => { this.fire(e); });           // lewy przycisk myszy
        this.score();

        this.interface['btn']['surrender'].removeClass('hidden');
        this.interface['btn']['stats'].removeClass('hidden');

        this.showText('turn', this.currentPlayer.name);
        this.isFire = false;
    }

    score(points) {
        if (points) {
            this.currentPlayer.score += points;
            if (this.currentPlayer.score < 0)
                this.currentPlayer.score = 0;
        }
        this.scoretext.html(this.currentPlayer.name + '<br>SCORE:' + this.currentPlayer.score);
    }

    fire(e) {
        e.preventDefault();

        if (this.isFire)
            return
        else
            this.isFire = true;

        this.interface['btn']['surrender'].addClass('hidden');
        this.interface['btn']['stats'].addClass('hidden');

        let currentCell = $(e.currentTarget),
            x = currentCell.data('col'),
            y = currentCell.data('row');
        currentCell.addClass('aim');

        this.currentPlayer.moves++;
        this.shots++;

        this.game.assets.sounds['cannon'].play();

        this.showText('fire', '', () => {
            currentCell.removeClass('aim');
            let hit = this.opponentPlayer.board.shipInPos(x, y);

            console.log(hit);
            if (hit) { // statek trafiony?
                hit.ship.masts[hit.mastID] = false;

                this.interface['btn']['surrender'].removeClass('hidden');
                this.interface['btn']['stats'].removeClass('hidden');

                if (hit.ship.exist()) { // nie zatopiony
                    this.game.assets.sounds['hit1'].play();
                    this.showText('hit', '+5', () => this.isFire = false);
                    currentCell.addClass('hit');
                    this.score(5);
                } else { // trafiony zatopiony
                    this.game.assets.sounds['hit3'].play();
                    if (this.game.settings.showSunkenShips)
                        hit.ship.draw(0);
                    this.showText('hit-sink', '+10', () => {
                        this.isFire = false;
                        if (this.opponentPlayer.board.checkBoard())
                            this.finishBattle(false);
                    });
                    currentCell.addClass('hit');
                    this.score(10);
                }
            } else {
                this.game.assets.sounds['miss'].play();
                let text = ""
                if (this.currentPlayer.score > 0)
                    text = "-1";
                this.showText('miss', text, () => {
                    this.isFire = false;
                    this.nextTurn();
                });
                currentCell.addClass('mishit');
                this.score(-1);
            }
        })
    }

    nextTurn() {
        this.currentPlayerID++;
        if (this.currentPlayerID >= this.game.players.length) { // następna tura, gracz #0
            this.currentPlayerID = 0;
            this.turn++;
        }
        this.preparePlayerScreen();
    }

    stats() {
        this.game.assets.sounds['click'].play();
        this.game.screenStats.showScreen();
    }

    surrender() {
        this.currentPlayer.isSurrender = true;
        this.finishBattle(true);
    }

    finishBattle(isSurrender) {
        this.isGameover = true;

        this.opponentPlayer.board.hideBoard();

        this.showText('gameover', '', () => {
            this.game.goGameover();
        });
    }
}