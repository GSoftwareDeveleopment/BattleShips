class Player {
    constructor(_game, mode, id) {
        this.game = _game;
        this.mode = mode;
        this.id = id;
        this.name = id;

        this.score = 0;
        this.moves = 0;

        console.groupCollapsed(`Player class: Initialize player '${this.id}'...`);
        this.reset();
        console.groupEnd();
    }

    reset() {
        this.score = 0;
        this.moves = 0;

        console.log('Player class: - setting player dockyard');
        this.dockyard = JSON.parse(JSON.stringify(default_dockyard));
        // rozszerzenie listy o listę referencji statków znajdujących się już na mapie
        for (let id = 0; id < this.dockyard.length; id++) {
            this.dockyard[id].list = [];
        }

        let boardSize = this.game.settings.boardSize;
        this.board = new Board(this, boardSize, boardSize); // plansza ze statkami gracza
        this.board.setEditBoard();
        this.battleBoard = new Board(this, boardSize, boardSize); // plansza bitwy gracza
        this.battleBoard.setGameBoard();
    }

    removePlayer() {
        this.board.removeBoard();
        this.board = null;
        this.dockyard = null;
        this.id = null;
        this.name = null;
        this.mode = null;
    }

    //
    //
    //

    prepare2SetupShips(_setupShips) {
        console.log(`Player class: Preparing player '${this.id}' to setups shpis...`)
        this.setupShips = _setupShips;
    }

    setupShipsDone() {
        console.log(`Player class: Player '${this.id}' are done setup shpis...`)
        this.board.clear();
        this.board.hideBoard();
    }

    //
    //
    //

    prepare2Battle(_battle) {
        console.log(`Player class: Preparing player '${this.id}' to battle...`)
        this.battle = _battle;
    }

    beginTurn() {
        console.log(`Player class: Player '${this.id}' begin turn...`)
        this.battleBoard.showBoard();
    }

    fire(x, y) {
        if (x !== undefined && y !== undefined) {
            const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            console.log(`Player class: Player '${this.id}' give a shot on point ${letter.charAt(x)}${y}`);
            this.battle.fire(x, y);
        } else {
            console.error(`Player class: Coordinates are not defined! (${x},${y})`);
        }
    }

    endTurn() {
        console.log(`Player class: Player '${this.id}' end turn...`);
        console.log();
        this.battleBoard.hidePointer();
        this.battleBoard.hideBoard();
    }

}