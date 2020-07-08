const shipDrawingMode = {
    edit: 0,
    mast: 1,
    clear: 2
};

class Board extends Interface {

    constructor(player, width, height) {
        let c = $("<div />"); // utworzenie nowego elementu DOM
        super(c);

        this.player = player;
        this._containerID = this.player.id;
        c.prop("id", this.player.id)
            .addClass('board hidden');

        console.log(`- initializing player board`);
        this.width = width;
        this.height = height;
        // this.screen = $(`<div id="board-${this.player.id}"/>`).addClass('board hidden');
        this.boardCells = [];   // tablica przechowująca referencje do elementów pól planszy
        this.ships = [];        // tablica przechowująca statki na planszy

        // tworzenie elementów HTML planszy
        for (let y = 0; y < this.height; y++) {
            let row = $('<div class="row"/>');

            for (let x = 0; x < this.width; x++) {
                let cell = $(`<div class="cell" data-id="${x + y * 10}" data-col="${x}" data-row="${y}"/>`);
                this.boardCells.push(cell);
                row.append(cell);
            }
            this._container.append(row);
        }

        this._container.appendTo('#game');

        // inicjacja zewnętrznych zdarzeń
        this.onCellOver = null;
        this.onCellOut = null;
        this.onClickLeft = null;
        this.onClickRight = null;

        // inicjacja interfejsu oraz jego zdarzeń
        this.build('div.cell', 'cells')
            .on('mouseover', (e) => { // kursor nad komórką
                this.placePointer(e);
                if (this.onCellOver) this.onCellOver(e);
            })
            .on('mouseout', (e) => {   // kursor nad komórką
                this.removePointer(e);
                if (this.onCellOut) this.onCellOut(e);
            })
            .on('click', (e) => {  // lewy przycisk myszy
                if (this.onClickLeft) this.onClickLeft(e);
            })
            .on('contextmenu', (e) => { // prawy przycisk myszy
                if (this.onClickRight) this.onClickRight(e);
            });

    }

    // usunięcie planszy
    removeBoard() {
        this.onCellOver = null;
        this.onCellOut = null;
        this.onClickLeft = null;
        this.onClickRight = null;

        this.hideBoard();

        this._container.detach();

        delete this.boardCells;
    }

    // pokazanie planszy
    showBoard() {
        this._container.removeClass('hidden');
    }

    // ukrycie planszy
    hideBoard() {
        this._container.addClass('hidden');
    }

    //
    //
    //

    // metody ustawiają rodzaj wyświetlanej planszy
    // editBoard to plansza mniejsza, przeznaczona do ustawiania staków, znajduje się po lewej stronie ekranu
    setEditBoard() {
        console.log('- set board to edit mode');
        this._container.removeClass('battle');
    }

    // setGameBoard ustawia na planszę gry: jest ustawiona na środku ekranu i jest większa od planszy do ustawiania starków
    setGameBoard() {
        console.log('- set board to game mode');
        this._container.addClass('battle')
    }

    // dodaje statek do planszy
    addShip(ship) {
        let cloneShip = ship.clone();
        this.ships.push(cloneShip);

        for (let id = 0; id < this.player.dockyard.length; id++) {
            if (this.player.dockyard[id].shipType === ship.shipType) {
                this.player.dockyard[id].list.push(cloneShip);
                break;
            }
        }

        this.redraw();
        return true;
    }

    removeShip(shipID) {
        let ship = this.ships[shipID];

        // znajdź typ statku w dockyard
        let id = null;
        for (let i = 0; i < this.player.dockyard.length; i++) {
            if (this.player.dockyard[i].shipType === ship.shipType) {
                id = i;
                break;
            }
        }

        // znajdź statek w referencjach
        for (let i = this.player.dockyard[id].list.length - 1; i >= 0; i--) {
            let refShip = this.player.dockyard[id].list[i];
            if (refShip.dir === ship.dir && refShip.x === ship.x && refShip.y === ship.y) {
                // usuń go z listy referencji
                this.player.dockyard[id].list.splice(i, 1);
                break;
            }
        }

        this.ships.splice(shipID, 1);
        this.redraw();
        return;
    }

    //
    //
    //

    // czyszczenie planszy
    clear() {
        // TO DO: spróbuj zmienić to na 'for (let cellid of this.boardCells)'
        for (let cellID in this.boardCells) {
            this.boardCells[cellID].removeClass('error edit aim mast mishit hit');
        }
    }

    // rysowanie statku na planszy w trybie 'mode'
    drawShip(ship, mode = shipDrawingMode.edit) {
        let nx, ny, id, cell;

        for (let i = 0; i < ship.masts.length; i++) {
            ({ x: nx, y: ny } = ship._pos(i));

            id = this._index(nx, ny);
            cell = this.boardCells[id];

            if (mode !== shipDrawingMode.clear) {
                if (mode === shipDrawingMode.mast)
                    cell.addClass('mast')
                else
                    cell.addClass('edit');

                if (!ship.masts[i]) {
                    cell.addClass('mast hit');
                }
            } else {
                cell.removeClass('mast hit');
            }
        }
    }

    // rysowanie wszystkich statków na planszy
    drawAllShips() {
        // TO DO: spróbuj zamienić to na pętlę for (ship of this.ships)
        for (let shipID in this.ships) {
            this.drawShip(this.ships[shipID], shipDrawingMode.mast)
        }
    }

    // odświerzenie planszy
    redraw() {
        this.clear();
        this.drawAllShips();
    }

    //
    //
    //

    // metoda sprawdza, czy statek (ship) nie koliduje z innymi statami na planszy
    isOverlaped(ship) {
        let nx, ny, id, isOverlap = false;

        for (let i = 0; i < ship.masts.length; i++) {
            ({ x: nx, y: ny } = ship._pos(i));

            for (let shipID in this.ships) {
                if (this.ships[shipID].isHit(nx, ny) !== false) {
                    id = this._index(nx, ny);
                    this.boardCells[id].addClass('error');
                    isOverlap = true;
                }
            }
        }
        return isOverlap;
    }

    // zlicza ilość istniejący jeszcze na planszy statków
    // (zlicza również tez trafione, ale pływające!)
    countShips() {
        let shipsCount = 0;
        for (let shipID in this.ships) {
            if (this.ships[shipID].exist()) shipsCount++; // zwiększasz licznik jeśli statek istnieje
        }

        return shipsCount;
    }

    // stwierdza obecność statków na planszy
    // (trafiony-niezatopiony też jest wliczany!)
    checkBoard() {
        let ships = this.countShips();
        if (ships !== 0) {
            return false; // jeżeli są jeszcze statki, to zwracasz fałsz
        } else {
            return true; // jeżli nie ma statków na planszy, prawdę
        }
    }

    // Sprawdza obecność statku na danej pozycji
    // zwracając: false - gdy, nie stwierdzono obecności
    //            Object - identyfikator i obiekt Ship, który został zidentyfikowany
    shipInPos(x, y) {
        let ship, mastID;
        for (let shipID = this.ships.length - 1; shipID >= 0; shipID--) {
            ship = this.ships[shipID];
            mastID = ship.isHit(x, y);
            if (mastID !== false) {
                return { id: shipID, ship: ship, mastID: mastID };
            }
        }
        return false;
    }

    // metoda sprawdzająca czy statek (ship) mieści się na planysz
    shipInBoard(ship) {
        let self = this;
        let mastsCount = ship.masts.length;

        const _inBound = function (x, y) {
            return ((x >= 0 && x < self.width &&
                y >= 0 && y < self.height));
        }

        let x1 = ship.x,
            y1 = ship.y,
            x2 = ship._pos(mastsCount - 1).x,
            y2 = ship._pos(mastsCount - 1).y;

        return (_inBound(x1, y1) && _inBound(x2, y2));
    }

    // metoda wylicza index na podstawie koordynatów x,y
    _index(x, y) {
        return x + y * this.width;
    }

    //
    // zdarzenie dla mapy
    //

    placePointer(e) {
        e.preventDefault();
        $(e.currentTarget).addClass('choiced');
    }

    removePointer(e) {
        e.preventDefault();
        $(e.currentTarget).removeClass('choiced');
    }

    hidePointer() {
        this.screen.find('div.cell.choiced').removeClass('choiced');
    }

}