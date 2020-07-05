class Player {
    constructor(_game, mode, id) {
        this.game = _game;
        this.mode = mode;
        this.id = id;
        this.name = id;

        this.resetPlayer();
    }

    resetPlayer() {
        this.score = 0;
        this.moves = 0;

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

    createShips() {
        let newship;
        switch (this.mode) {
            case 0: // ustawianie statków "przez komputer"
                for (let j = 0; j < 4; j++) { // rodzaj statku (0- jednomasztowiec; 1- dwumasztowiec; ...)
                    for (let i = 0; i < (4 - j); i++) { // ilość statków (im większy statek, tym mniejsza ich ilość)
                        do {
                            let dir = rand(0, 1);  // losowanie orientacji statku
                            let x = rand(0, 9),    // losowanie pozycji statku
                                y = rand(0, 9);
                            newship = new Ship(this.board, x, y, j, dir)
                        } while (newship); // jeżeli statek został bez przeszkód ustawiony, wyjdź z pętli
                        this.board.ships.push(newship); // dodaj nowy statek do listy
                    }
                }
                break;
            case 1: // ustawienie statków przez człowieka
                // tu logika dla ustawiania statków przez gracza
                break;
        }
    }
}