class Human extends Player {

    constructor(_game, id) {
        console.log('Human class: Creating player: Human...');
        super(_game, 1, id);
    }

    prepare2SetupShips(_setupShips) {
        super.prepare2SetupShips(_setupShips);

        this.dockyardList = new Dockyard(this.dockyard, this.setupShips.container.find('div#dockyard-list'));
        this.dockyardList.onSelect = (shipType) => {
            this.game.assets.sounds['pop'].play();
            this.setupShips.currentShip = this.board.makeShip(shipType);
        };
        this.dockyardList.onUnselect = (shipType) => {
            this.game.assets.sounds['cancel'].play();
            this.setupShips.currentShip = null;
        };
        this.dockyardList.onNotAvailable = (shipType) => {
            this.game.assets.sounds['error'].play();
            this.setupShips.currentShip = null;
        };

        // ustawienie i pokazanie planszy gracza
        this.board.setEditBoard();
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

    /* zdarzenie dla mapy */

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

    setShip(e) {
        e.preventDefault();

        let currentShip = this.setupShips.currentShip;
        // jeżeli gracz nie wybrał statku z listy...
        if (!currentShip) {
            let currentCell = $(e.currentTarget),
                x = currentCell.data('col'),
                y = currentCell.data('row');

            let ship = this.board.shipInPos(x, y);
            if (ship) {
                // ------------------------------------------------------------------- POBRANIE STATKU Z PLANSZY GRACZA
                let currentShip = ship.ship;
                if (this.dockyardList.changeQuantity(currentShip.shipType, 1)) {
                    this.dockyardList.setShip(currentShip.shipType);
                    this.board.removeShip(ship.id);
                    this.board.drawShip(currentShip);

                    this.game.assets.sounds['pop'].play();
                }
                this.setupShips.currentShip = currentShip;
            } else {
                this.game.assets.sounds['error'].play();
            }
        } else {
            // ----------------------------------------------------------------------- DODANIE STATKU DO PLANSZY GRACZA

            // sprawdź, czy statek może być odłożony
            if (this.board.shipInBoard(currentShip) && !this.board.isOverlaped(currentShip)) {

                if (this.dockyardList.changeQuantity(currentShip.shipType, - 1)) {
                    this.board.addShip(currentShip);
                    this.game.assets.sounds['splash'].play();
                } else {
                    this.board.redraw();
                    // odznaczenie wybranego statku na liście
                    this.dockyardList.unselectShip();
                }

            } else {
                this.game.assets.sounds['error'].play();
            }
        }

        if (this.board.countShips() > 0) {
            this.setupShips.enableButton();
        } else {
            this.setupShips.disableButton();
        }
    }

    setupShipsDone() {
        this.board.onCellOver = null;
        this.board.onCellOut = null;
        this.board.onClickLeft = null;
        this.board.onClickRight = null;

        // skasowanie (ukrycie) listy statków (dockyard-list)
        // TO DO: umieść w Interface metodę Remove()
        this.dockyardList.remove();

        super.setupShipsDone();
    }

    //
    //
    //

    prepare2Battle(_battle) {
        super.prepare2Battle(_battle);
    }

    beginTurn() {
        super.beginTurn();
        this.battleBoard.onClickLeft = (e) => { this.fire(e); };
    }

    fire(e) {
        let cell = $(e.currentTarget),
            x = cell.data('col'),
            y = cell.data('row');
        super.fire(x, y);
    }

    endTurn() {
        super.endTurn();
        this.battleBoard.onClickLeft = null;
    }

}