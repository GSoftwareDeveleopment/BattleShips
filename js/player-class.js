class Player {
    constructor(_game, mode, id) {
        this.game = _game;
        this.mode = mode;
        this.id = id;
        this.name = id;

        this.isPlayerDone = false; // znacznik oznajmiający koniec czynności gracza

        this.reset();
    }

    reset() {
        this.score = 0;
        this.moves = 0;
        this.isPlayerDone = false;

        this.dockyard = JSON.parse(JSON.stringify(default_dockyard));
        // rozszerzenie listy o listę referencji statków znajdujących się już na mapie
        for (let id = 0; id < this.dockyard.length; id++) {
            this.dockyard[id].list = [];
        }
        let boardSize = this.game.settings.boardSize;
        this.board = new Board(this, boardSize, boardSize); // inicjowanie planszy gracza
    }

    removePlayer() {
        this.board.removeBoard();
        this.board = null;
        this.dockyard = null;
        this.id = null;
        this.name = null;
        this.mode = null;
    }
}