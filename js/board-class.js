const shipDrawingMode = {
    edit: 0,
    mast: 1,
    clear: 2
};

class Board extends Interface {

    constructor(player, width, height) {
        let container = $(`<div id="board-${this.player.id}"/>`);
        super(container);

        this.player = player;
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
            this.screen.append(row);
        }

        this._container.addClass('board hidden').appendTo('#game');
    }

    // usunięcie planszy
    removeBoard() {
        this.hideBoard();
        this._container.detach();
        delete this.boardCells;
    }

    // pokazanie planszy
    showBoard(big = false) {
        if (big)
            this._container.addClass('battle')
        else
            this._container.removeClass('battle');
        this._container.removeClass('hidden');

        // zdarzenia dla planszy
        this._container.find('div.cell')
            .on('mouseover', (e) => { // kursor nad komórką
                this.placePointer(e);
                if (this.onMouseOver) this.onMouseOver(e);
            })
            .on('mouseout', (e) => {   // kursor nad komórką
                this.removePointer(e);
                if (this.onMouseOut) this.onMouseOut(e);
            })
            .on('click', (e) => {  // lewy przycisk myszy
                if (this.onLeftClick) this.onLeftClick(e);
            })
            .on('contextmenu', (e) => { // prawy przycisk myszy
                if (this.onRightClick) this.onRightClick(e);
            });

    }

    // ukrycie planszy
    hideBoard() {
        this._container.removeClass('battle')
        this._container.addClass('hidden');

        this._container.find('div.cell').off('mouseover mouseout click contextmenu');
    }

    /* zdarzenie dla mapy (przesówanie kursorem w obszarze mapy) */

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

    // metoda sprawdzająca czy statek (ship) mieści się na planysz
    inBoard(ship) {
        let mastsCount = ship.masts.length;

        const _inBound = function (x, y) {
            return ((x >= 0 && x < this.width &&
                y >= 0 && y < this.height));
        }

        let x1 = ship.x,
            y1 = ship.y,
            x2 = ship._pos(mastsCount - 1).x,
            y2 = ship._pos(mastsCount - 1).y;

        return (_inBound(x1, y1) && _inPool(x2, y2));
    }

    _index(x, y) {
        return x + y * this.board.width;
    }

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

    drawShip(ship, mode = shipDrawingMode.edit) {
        let nx, ny, id, cell;

        for (let i = 0; i < ship.masts.length; i++) {
            ({ x: nx, y: ny } = ship._pos(i));

            id = this._index(nx, ny);
            cell = this.boardCells[id];

            if (mode !== shipDrawingMode.clear) {
                if (mode)
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
            this.drawShip(this.ships[shipID], shipDrawingMode.masts)
            // this.ships[shipID].draw(1);
        }
    }

    // odświerzenie planszy
    redraw() {
        this.clear();
        this.drawAllShips();
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


}