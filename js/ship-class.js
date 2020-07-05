/*
    x - przesunięcie w osi X
    y - przesunięcie w osi Y
    d - ułożenie skośne
*/
const directions = [
    { x: +1, y: 0, d: 0 },
    { x: +1, y: +1, d: 1 },
    { x: 0, y: +1, d: 0 },
    { x: -1, y: +1, d: 1 },
    { x: -1, y: 0, d: 0 },
    { x: -1, y: -1, d: 1 },
    { x: 0, y: -1, d: 0 },
    { x: +1, y: -1, d: 1 }
];

class Ship {

    constructor(_board, shipType, dir) {
        /*
            To jest dość mocno uogólniona metoda
            Pozwala stworzyć statek w dowolnej pozycji (x,y) na mapie (board),
            o dowolnej ilości masztów (mast)
            oraz jego ułożeniu (set)
        */
        this.board = _board;    // referencja do mapy
        this.x = 0;            // położenie x,y
        this.y = 0;            //
        this.shipType = shipType;    // ilość masztów
        this.dir = dir;        // układ statku (=1 poziomo; =2 pionowo)

        // ...inicjujemny maszty statku :)
        this.masts = [];           // tablica istnienia masztów statku

        for (let i = 0; i < this.shipType; i++) {
            this.masts.push(true); // maszt istnieje :D
        }
    }

    clone() {
        let newship = new Ship(this.board, this.shipType, this.dir);
        newship.x = this.x;
        newship.y = this.y;
        return newship;
    }

    inBoard() {
        let mastsCount = this.masts.length;

        const _inPool = function (x, y, board) {
            return ((x >= 0 && x < board.width &&
                y >= 0 && y < board.height));
        }

        let x1 = this.x,
            y1 = this.y,
            x2 = this._pos(mastsCount - 1).x,
            y2 = this._pos(mastsCount - 1).y;

        return (_inPool(x1, y1, this.board) && _inPool(x2, y2, this.board));
    }

    _pos(i) {
        let nx = this.x + directions[this.dir].x * i,
            ny = this.y + directions[this.dir].y * i
        return { x: nx, y: ny };
    }

    _index(x, y) {
        return x + y * this.board.width;
    }
    isOverlaped() {
        let nx, ny, id, isOverlap = false;

        for (let i = 0; i < this.masts.length; i++) {
            ({ x: nx, y: ny } = this._pos(i));

            for (let shipID in this.board.ships) {
                if (this.board.ships[shipID].isHit(nx, ny) !== false) {
                    id = this._index(nx, ny);
                    this.board.boardCells[id].addClass('error');
                    isOverlap = true;
                }
            }
        }
        return isOverlap;
    }

    draw(mode = 0) {
        let nx, ny, id, cell;

        for (let i = 0; i < this.masts.length; i++) {
            ({ x: nx, y: ny } = this._pos(i));

            id = this._index(nx, ny);
            cell = this.board.boardCells[id];

            if (mode)
                cell.addClass('mast')
            else
                cell.addClass('edit');

            if (!this.masts[i]) {
                cell.addClass('mast hit');
            }
        }
    }

    clear() {
        let nx, ny, id;
        for (let i = 0; i < this.masts.length; i++) {
            ({ x: nx, y: ny } = this._pos(i));

            id = this._index(nx, ny);
            let cell = this.board.boardCells[id];

            cell.removeClass('mast hit');
        }
    }

    isHit(hitx, hity) {
        let nx, ny;
        for (let i = 0; i < this.masts.length; i++) {
            ({ x: nx, y: ny } = this._pos(i));

            if (nx === hitx && ny === hity) {
                return i;
            }
        }
        return false;
    }

    exist() {
        // metoda sprawdzająca istnienie statku (na podstawie tablicy masts[])
        let count = 0;
        for (let mastID in this.masts) {
            if (this.masts[mastID]) count++;
        }
        return (count > 0);
    }

    damage() {
        // metoda sprawdzająca uszkodzenia statku (na podstawie tablicy masts[])
        let count = 0;
        for (let mastID in this.masts) {
            if (!this.masts[mastID]) count++;
        }
        return { masts: this.masts.length, damage: count };
    }

}