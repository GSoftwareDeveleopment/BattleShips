class Human extends Player {

    constructor(_game, id) {
        super(_game, 1, id);
        console.log('creating player: Human...')
    }

    prepare2SetupShips(_setupShips) {
        this.setupShips = _setupShips;

        // pokazanie planszy gracza
        this.board.showBoard();

        this.board.onCellOver = (e) => { this.placePointer(e); };
        this.board.onCellOut = (e) => { this.removePointer(e); };
        this.board.onClickLeft = (e) => { this.setShip(e); };
        this.board.onClickRight = (e) => { this.rotateShip(e); };
    }

    /* zdarzenie dla mapy (przesówanie kursorem w obszarze mapy) */
    placePointer(e) {
        e.preventDefault();

        let currentShip = this.setupShips.currentShip;

        if (!currentShip) return;

        const currentCell = $(e.currentTarget);

        let x = currentCell.data('col'),
            y = currentCell.data('row');

        currentShip.x = x;
        currentShip.y = y;
        if (this.board.shipInBoard(currentShip)) {
            this.board.drawShip(currentShip);
            this.board.isOverlaped(currentShip);
        }
    }

    removePointer(e) {
        e.preventDefault();
        let currentShip = this.setupShips.currentShip;
        if (!currentShip) return;
        this.board.redraw();
    }

    /* zdarzenie dla mapu (prawy przycisk myszy) */

    rotateShip(e) {
        e.preventDefault();
        let currentShip = this.setupShips.currentShip;
        if (!currentShip) return;

        if (this.game.settings.allowObliqueArrangement) {
            currentShip.dir++;
            if (currentShip.dir > 7) currentShip.dir = 0;
        } else {
            do {
                currentShip.dir++;
                if (currentShip.dir > 7) currentShip.dir = 0;
            } while (directions[currentShip.dir].d !== 0);
        }

        this.board.redraw();
        this.placePointer(e);
    }

    /* zdarzenie dla mapy (lewy przycisk myszy) */

    setShip(e) {
        e.preventDefault();
        /*
                let player = this.game.players[this.currentPlayer];
        
                // jeżeli gracz nie wybrał statku z listy...
                if (!this.currentShip) {
                    this.currentCell = $(e.currentTarget);
                    let x = this.currentCell.data('col'),
                        y = this.currentCell.data('row');
        
                    // ...sprawdź, czy "kliknięte" miejsce na mapie, zawiera statek...
                    let ship = this.playerBoard.shipInPos(x, y);
                    if (ship) {
                        // ------------------------------------------------------------------- POBRANIE STATKU Z PLANSZY GRACZA
                        this.currentShip = ship.ship;
        
                        let shipdata = this.findShipList(this.currentShip.shipType);
                        // jeżeli wybrany statek został znaleziony w doku gracza (dockyard) to...
                        if (shipdata) {
                            // ... oznacz pobrany statek jako wybrany na liście statków
                            this.selectedShip = shipdata.mainField.addClass('selected');
        
                            // ... zwiększ ilość statków w doku (ponieważ, pobieramy statek z mapy :) )
                            shipdata.Q++;
        
                            // ... usuń statek z planszy gracza
                            // ... zakualizuj planszę gracza
                            this.playerBoard.removeShip(ship.id);
        
                            this.currentShip.draw();
                        }
                        // odtwórz dźwięk
                        this.game.assets.sounds['pop'].play();
                    }
                } else {
                    // ----------------------------------------------------------------------- DODANIE STATKU DO PLANSZY GRACZA
        
                    // sprawdź, czy statek może być odłożony
                    if (this.currentShip.inBoard() && !this.currentShip.isOverlaped()) {
        
                        let shipdata = this.findShipList(this.currentShip.shipType);
                        // jeżeli wybrany statek został znaleziony w doku gracza (dockyard) to...
                        if (shipdata && shipdata.Q > 0) {
                            // ... zmniejsz ilość statków w doku
                            shipdata.Q--;
        
                            // dodaj statek do planszy gracza
                            // zaktualizuj planszę gracza
                            this.playerBoard.addShip(this.currentShip);
        
                            // odtwórz dźwięk
                            this.game.assets.sounds['splash'].play();
                        }
        
                        // odznaczenie wybranego statku na liście
                        this.unselectShip();
                    } else {
                        this.game.assets.sounds['error'].play();
                    }
                }
        
                // zaktualizuj listę statków
                this.updateShipList();
        
                if (player.board.countShips() > 0) {
                    this.interface['btn']['done'].prop('disabled', false).removeClass('disabled');
                    this.interface['btn']['battle'].prop('disabled', false).removeClass('disabled').addClass('green');
                } else {
                    this.interface['btn']['done'].prop('disabled', true).addClass('disabled');
                    this.interface['btn']['battle'].prop('disabled', true).addClass('disabled').removeClass('green');
                }
        */
    }

}