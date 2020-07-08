class BattleScreen extends Screen {
    constructor(_container, _game) {
        super(_container, _game);

        this.interface.build('div.score', 'score');
        // this.scoretext = this.container.find('div.score');

        this.interface.build('button', 'btn', {
            'surrender': (el) => { el.on('click', () => { this.surrender(); }); },
            'stats': (el) => { el.on('click', () => { this.stats(); }); }
        });

        this.interface.build('div.bigtext', 'texts').each((id, el) => {
            $(el).addClass('hidden');
        });

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

        // przełączenie muzyki
        if (this.game.settings.backgroundSound) {
            this.game.assets.sounds['music'].stop(true);
            this.game.assets.sounds['sea'].play(true);
        }

        this.interface['score'][''].removeClass('hidden').html('');
        // this.scoretext.removeClass('hidden').html('');

        super.showScreen();

        this.preparePlayerScreen();
    }

    hideScreen() {
        super.hideScreen();

        this.game.assets.sounds['sea'].stop();

        // usuń zdarzenia
        this.currentPlayer.battleBoard.onClickLeft = null;
        this.opponentPlayer.battleBoard.onClickLeft = null;

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
        this.assignPlayerSide();

        this.interface['btn']['surrender'].removeClass('hidden');
        this.interface['btn']['stats'].removeClass('hidden');

        this.showText('turn', this.currentPlayer.name);
        this.isFire = false;

        this.currentPlayer.prepare2Battle(this);
        this.opponentPlayer.prepare2Battle(this);

        this.score(0);
        this.currentPlayer.beginTurn(this);
    }

    assignPlayerSide() {
        // określenie grających stron
        this.opponentPlayerID = this.currentPlayerID + 1 >= this.game.players.length ? 0 : this.currentPlayerID + 1;

        this.currentPlayer = this.game.players[this.currentPlayerID];
        this.opponentPlayer = this.game.players[this.opponentPlayerID];
    }

    score(points) {
        if (points) {
            this.currentPlayer.score += points;
            if (this.currentPlayer.score < 0)
                this.currentPlayer.score = 0;
        }
        let scoreText = this.currentPlayer.name + '<br>SCORE:' + this.currentPlayer.score;
        this.interface['score'][''].html(scoreText);
    }

    fire(firex, firey) {
        if (this.isFire)
            return
        else
            this.isFire = true;

        this.interface['btn']['surrender'].addClass('hidden');
        this.interface['btn']['stats'].addClass('hidden');

        let cellID = this.currentPlayer.battleBoard._index(firex, firey);
        let cell = this.currentPlayer.battleBoard.boardCells[cellID];
        cell.addClass('aim');

        this.currentPlayer.moves++;
        this.shots++;

        this.game.assets.sounds['cannon'].play();

        this.showText('fire', '', () => {
            cell.removeClass('aim');
            let hit = this.opponentPlayer.board.shipInPos(firex, firey);

            console.log(hit);
            if (hit) { // statek trafiony?
                hit.ship.masts[hit.mastID] = false; // ustaw trafiony masz na "zniszczony"

                this.interface['btn']['surrender'].removeClass('hidden');
                this.interface['btn']['stats'].removeClass('hidden');

                if (hit.ship.exist()) { // nie zatopiony
                    this.hit(cell, hit);
                } else { // trafiony zatopiony
                    this.hitAndSunk(cell, hit);
                }
            } else {
                this.miss(cell);
            }
        })
    }

    hit(cell) {
        this.game.assets.sounds['hit1'].play();
        this.showText('hit', '+5', () => this.isFire = false);

        cell.addClass('hit');

        this.score(5);
    }

    hitAndSunk(cell, hit) {
        this.game.assets.sounds['hit3'].play();

        if (this.game.settings.showSunkenShips)
            this.currentPlayer.battleBoard.drawShip(hit.ship, shipDrawingMode.mast);

        this.showText('hit-sink', '+10', () => {
            this.isFire = false;
            if (this.opponentPlayer.board.checkBoard())
                this.finishBattle(false);
        });
        cell.addClass('hit');
        this.score(10);
    }

    miss(cell) {
        this.game.assets.sounds['miss'].play();
        let text = ""
        if (this.currentPlayer.score > 0)
            text = "-1";
        this.showText('miss', text, () => {
            this.isFire = false;
            this.nextTurn();
        });
        cell.addClass('mishit');
        this.score(-1);
    }

    nextTurn() {
        this.currentPlayer.board.hidePointer();
        this.currentPlayer.endTurn();

        this.currentPlayerID++;
        if (this.currentPlayerID >= this.game.players.length) { // następna tura
            this.currentPlayerID = 0;
            this.turn++;
        }

        this.preparePlayerScreen();
    }

    //
    //
    //

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

        this.currentPlayer.battleBoard.hideBoard();

        this.showText('gameover', '', () => {
            this.game.goGameover();
        });
    }
}