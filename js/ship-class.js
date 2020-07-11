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

    constructor(shipType, dir) {
        this.x = 0;            // położenie x,y
        this.y = 0;            //
        this.shipType = shipType;    // ilość masztów
        this.dir = dir;        // układ statku

        // ...inicjujemny maszty statku :)
        this.masts = [];           // tablica istnienia masztów statku
        for (let i = 0; i < this.shipType; i++) {
            this.masts.push(true); // maszt istnieje :D
        }
    }

    clone() {
        let newship = new Ship(this.shipType, this.dir);
        newship.x = this.x;
        newship.y = this.y;
        return newship;
    }

    _pos(i) {
        let nx = this.x + directions[this.dir].x * i,
            ny = this.y + directions[this.dir].y * i
        return { x: nx, y: ny };
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