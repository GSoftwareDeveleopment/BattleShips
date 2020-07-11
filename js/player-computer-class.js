class Computer extends Player {
    constructor(_game, id) {
        console.log('Computer class: Creating player: Computer...');
        super(_game, 1, id);
    }

    prepare2SetupShips(_setupShips) {
        super.prepare2SetupShips(_setupShips);
        this.progress = new ProgressBar(this.setupShips.container);
        setTimeout(() => { this.setupShip(); }, 10);

        // oblicz, ilość statków do rozłożenia na planszy
        this.maxShips = 0;
        for (let ship of this.dockyard) {
            this.maxShips += ship.Q
        }
    }

    _rand(min, max) {
        return (Math.floor(Math.random() * (max - min + 1) + min));
    }

    setupShip() {
        // wybór statku
        let selectedShip = null;
        for (let ship of this.dockyard) {
            if (ship.Q > 0) {
                selectedShip = ship;
                break;
            }
        }

        // czy jest wybrany statek?
        if (!selectedShip) {
            console.log('Computer class: There are no ships left to place on the board.');
            // nie? zakończ procedurę ustawiania statków
            this.setupShips.done();
            return;
        }

        // tak? ...
        console.log(`Computer class: The selected ship is:`, selectedShip.name);

        // ... utwórz instancje statku ułożonego w losowym kierunku
        let currentShip = this.board.makeShip(selectedShip.shipType);

        // wylosuj kierunek ułożenia statku
        let dir = this._rand(0, directions.length);
        currentShip.dir = dir;

        // sprawdź, czy kierunek jest dopuszczalny
        if (!this.game.settings.allowObliqueArrangement) {
            do {
                currentShip.dir++;
                if (currentShip.dir > 7) currentShip.dir = 0;
            } while (directions[currentShip.dir].d !== 0);
        }

        // wylosuj miejsce dla niego
        const x = this._rand(0, this.board.width),
            y = this._rand(0, this.board.height);

        currentShip.x = x;
        currentShip.y = y;

        // sprawdź, czy statek mieści się na planszy i czy nie przecina się z innymi statkami
        if (this.board.shipInBoard(currentShip) && !this.board.isOverlaped(currentShip)) {
            // tak?

            selectedShip.Q--;
            this.board.addShip(currentShip);

            let shipsCount = 0;
            for (let ship of this.dockyard) {
                shipsCount += ship.Q
            }
            this.progress.set((this.maxShips - shipsCount) / this.maxShips);
        } else {
            //nie?
            console.warn(`Computer class: Ship cannot be placed in the selected position.`);
        }

        setTimeout(() => { this.setupShip(); }, 100);
    }

    setupShipsDone() {
        this.progress.remove();
        super.setupShipsDone();
    }

    //
    //
    //

    prepare2Battle(_battle) {
        super.prepare2Battle(_battle);
        this.isHunter = true;
        this.mapcoord = [];
        this.hitsCoord = [];
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                this.mapcoord.push({ x: x, y: y });
            }
        }
    }

    beginTurn() {
        super.beginTurn();
        console.log('Computer class: prepare to fire...');
        this.prepare2Fire();
    }

    _makeTargets(hitCoord, targetCoord) {
        console.log(`makeing possible hit targets...`);

        for (let i = 0; i < targetCoord.length; i++) {
            const targetX = hitCoord.x + targetCoord[i].x,
                targetY = hitCoord.y + targetCoord[i].y;

            // sprawdź, czy cel namierzania mieści się w obrębie planszy
            if (this.battleBoard.coordInBoard(targetX, targetY)) {
                // jeżeli tak, to...

                // ...sprawdź, czy cel namierzania jest możliwy do wybrania (nie był wcześniej wybierany/trafiony)
                let targetID = false;
                for (let j = 0; j < this.mapcoord.length; j++) {
                    const x = this.mapcoord[j].x,
                        y = this.mapcoord[j].y;
                    if (targetX === x && targetY === y) {
                        // cel możliwy do namierzania
                        targetID = j;
                        break;
                    }
                }

                // jeżeli, cel możliwy do namierzania
                if (targetID !== false) {

                    // dodaj do listy celi namierzania
                    this.hitsCoord.push({ x: targetX, y: targetY, aimCoord: false });

                    // usuń koordynaty z listy możliwych koordynatów
                    this.mapcoord.splice(targetID, 1);
                }
            }
        }
    }

    prepare2Fire() {
        let fireX, fireY;

        if (this.isHunter) { // tryb polowania (hunter mode)
            console.log('... Hunter mode');

            // wybierz losowy koordynat z mapy
            let coordID = this._rand(0, this.mapcoord.length);
            fireX = this.mapcoord[coordID].x;
            fireY = this.mapcoord[coordID].y;

            // usuń koordynat z listy możliwych wyborów
            this.mapcoord.splice(coordID, 1);
        } else { // namierzanie (target mode)
            console.log('... Target mode');

            // pobierz ostatni namierzony koordynat
            let hitCoord = this.hitsCoord.pop();

            // sprawdź, czy koordynat nie jest pusty
            if (hitCoord) {

                // czy koordynat trafienia był namierzany?
                if (hitCoord.aimCoord) {
                    // tak? utwórz cele namierzania
                    this._makeTargets(hitCoord,
                        [{ x: -1, y: 0 },   // lista offsetów do namierzania względem koordynatu trafienia 
                        { x: +1, y: 0 },    // (tylko dla trybu gry, gdzie statki mogą być układane poziomo lub pionowo)
                        { x: 0, y: -1 },
                        { x: 0, y: +1 }]
                    );
                } else {
                    fireX = hitCoord.x;
                    fireY = hitCoord.y;
                }
            } else {
                console.log('... not enought targets. Switching to mode...')
                // przejdź do trybu polowania (hunter mode)
                this.isHunter = true;
                this.prepare2Fire();
                return
            }
        }

        // oddaj strzał
        this.fire(fireX, fireY);
    }

    fire(x, y) {
        if (this.battle.isFire) {
            if (!this.waiting) {
                console.log('Computer class: Waiting for the possibility to put a shot...')
                // odczekaj, aż skończy się faza strzału
                this.waiting = setInterval(() => {
                    console.log('Computer class: An attempt to fire after waiting');
                    this.fire(x, y);
                }, 1000);
            }
            return
        } else {
            if (this.waiting) clearInterval(this.waiting);
            this.waiting = null;

            super.fire(x, y);

            if (this.battle.isHit) {
                if (!this.battle.isSunk) {
                    // ustaw tryb namierzania (target mode)
                    this.isHunter = false;

                    // dodaj koordynat do listy trafień
                    this.hitsCoord.push({ x: x, y: y, aimCoord: true });
                }

                // przygotuj następny strzał
                this.prepare2Fire();
            }

        }
    }

    endTurn() {
        super.endTurn();
    }
}