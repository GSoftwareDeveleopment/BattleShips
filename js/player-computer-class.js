class Computer extends Player {
    constructor(_game, id) {
        console.log('Computer class: Creating player: Computer...');
        super(_game, 1, id);
    }

    _rand(min, max) {
        return (Math.floor(Math.random() * (max - min) + min));
    }

    //
    // metody odpowiedzialne za fazę ustawiania statków
    //

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
    // metody odpowiedzialne za fazę bitwy
    //

    prepare2Battle(_battle, opponentPlayer) {
        super.prepare2Battle(_battle);
        this.isHunter = true;

        this.aimsCoord = [];
        this.lastAimCoordLen = 0;

        this.hitsCoord = [];
        this.currentHitCoord = null;

        // przygotowanie list możliwych strzałów
        this.mapCoord = [];
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                this.mapCoord.push({ x: x, y: y });
            }
        }

        this.chanceMap = new Board(this, this.battleBoard.width, this.battleBoard.height);
        this.chanceMap.setGameBoard();

        for (let ship of opponentPlayer.dockyard) {
            for (let Q = ship.maxQ - ship.Q; Q > 0; Q--) {
                let newShip = new Ship(ship.shipType, -1)
                newShip.x = -1;
                newShip.y = -1;
                this.chanceMap.ships.push(newShip);
            }
        }

    }

    beginTurn() {
        super.beginTurn();
        console.log('Computer class: prepare to fire...');

        /* tylko w trybie debbugingu komputera */
        this.chanceMap.hideBoard();
        this.battle.interface['btn']['aim']
            .removeClass('hidden')
            .on('click', () => {
                this.prepare2Fire();
            });

        this.battle.interface['btn']['fire']
            .removeClass('hidden')
            .on('click', () => {
                this.fire(this.aimX, this.aimY);
            });

        this.battle.interface['btn']['chance-map']
            .removeClass('hidden')
            .on('click', () => {
                this._makeMapOfChance();
                this.chanceMap.toggleVisibility();
            });
    }

    _makeMapOfChance() {
        let map = new Array(this.chanceMap.height * this.chanceMap.width);

        // ustaw mapę na 0%
        for (let cellID = 0; cellID < map.length; cellID++) {
            map[cellID] = 0;
            let cell = this.chanceMap.boardCells[cellID];
            cell.css('background-color', 'black');
        }

        // oznacz miejsca możliwych ruchów
        for (let coord of this.mapCoord) {
            let x = coord.x, y = coord.y, id = x + y * this.chanceMap.width;
            map[id] = 1;
        }

        // oznacz wszystkie zatopione statki na 0%
        for (let ship of this.battleBoard.ships) {

            let nx, ny, id;

            for (let i = 0; i < ship.masts.length; i++) {
                ({ x: nx, y: ny } = ship._pos(i));
                id = this.chanceMap._index(nx, ny);
                map[id] = 0;
            }

        }

        //
        for (let coord of this.aimsCoord) {
            let cellID = this.chanceMap._index(coord.x, coord.y);
            let cell = this.chanceMap.boardCells[cellID];
            cell.css('background-color', 'yellow');
            if (coord.isAimed)
                map[cellID] += 10;
        }

        //
        for (let coord of this.hitsCoord) {
            let cellID = this.chanceMap._index(coord.x, coord.y);
            let cell = this.chanceMap.boardCells[cellID];
            cell.css('background-color', 'green');
            map[cellID] += 5;
            if (coord.isFire) {
                if (coord.isHit)
                    map[cellID] += 5;
                else
                    map[cellID] = 0;
            }
        }

        // normalizuj
        let max = 0;
        for (let i = 0; i < map.length; i++)
            if (map[i] > max) max = map[i];

        for (let y = 0; y < this.chanceMap.height; y++) {
            for (let x = 0; x < this.chanceMap.width; x++) {
                let cellID = this.chanceMap._index(x, y);
                let cell = this.chanceMap.boardCells[cellID];
                let v = 1 - (map[cellID] / max);
                cell.css('background-color', 'black');
                cell.css('opacity', v);

                // for (let ship of this.board.)
            }
        }
    }

    _makeTargets(aimCoord, offsetCoord) {
        console.log(`makeing possible hit targets...`);
        aimCoord.isAimed = true;

        for (let i = 0; i < offsetCoord.length; i++) {
            const targetX = aimCoord.x + offsetCoord[i].x,
                targetY = aimCoord.y + offsetCoord[i].y;

            // sprawdź, czy cel namierzania mieści się w obrębie planszy
            if (this.battleBoard.coordInBoard(targetX, targetY)) {
                // jeżeli tak, to...

                // ...sprawdź, czy cel namierzania jest możliwy do wybrania (nie był wcześniej wybierany/trafiony)
                let targetID = this._findIndexByCoord(targetX, targetY);

                // jeżeli, cel możliwy do namierzania
                if (targetID !== false) {

                    // dodaj do listy celi namierzania
                    this.hitsCoord.push({
                        x: targetX,     // koordyntaty celu
                        y: targetY,
                        isFire: false,  // czy cel został już ostrzelany
                        isHit: false    // czy cel był trafiony
                    });

                    // usuń koordynaty z listy możliwych koordynatów
                    this.mapCoord.splice(targetID, 1);
                }
            }
        }
    }

    _findIndexByCoord(targetX, targetY) {
        for (let j = 0; j < this.mapCoord.length; j++) {
            const x = this.mapCoord[j].x,
                y = this.mapCoord[j].y;
            if (targetX === x && targetY === y) {
                // cel możliwy do namierzania
                return j;
                break;
            }
        }
        return false;
    }

    prepare2Fire() {
        let fireX, fireY;

        /* tylko w trybie debbugingu komputera */
        if (this.aimX !== undefined && this.aimY !== undefined) {
            let cellID = this.battleBoard._index(this.aimX, this.aimY);
            let cell = this.battleBoard.boardCells[cellID];
            cell.removeClass('aim');
        }

        if (this.isHunter) { // tryb polowania (hunter mode)
            console.log('... Hunter mode');

            // wybierz losowy koordynat z mapy
            let coordID = this._rand(0, this.mapCoord.length);
            console.log(coordID);

            fireX = this.mapCoord[coordID].x;
            fireY = this.mapCoord[coordID].y;
        } else { // namierzanie (target mode)
            console.log('... Target mode');

            // sprawdź, czy jest jakiś nowy namierzony cel
            if (this.aimsCoord.length !== this.lastAimCoordLen) {
                this.lastAimCoordLen = this.aimsCoord.length;
                // tak?
                // znajdź i pobierz ostatni namierzony koordynat
                let aimCoord;
                for (let j = this.aimsCoord.length - 1; j >= 0; j++) {
                    aimCoord = this.aimsCoord[j];
                    if (!aimCoord.isAimed) {
                        break;
                    }
                }
                // i utwórz cele namierzania w/g wytycznych listy offsetów
                this._makeTargets(aimCoord,
                    [{ x: -1, y: 0 },   // lewo // lista offsetów do namierzania względem koordynatu trafienia 
                    { x: 0, y: -1 },    // góra // (tylko dla trybu gry, gdzie statki mogą być układane poziomo lub pionowo)
                    { x: +1, y: 0 },    // prawo
                    { x: 0, y: +1 }]);  // dół
            }
            if (this.hitsCoord.length > 0) {
                // wybierz cel z listy namierzania
                let hitID = this._rand(0, this.hitsCoord.length);
                console.log(this.hitsCoord.length, hitID);
                this.currentHitCoord = this.hitsCoord[hitID];
                fireX = this.currentHitCoord.x;
                fireY = this.currentHitCoord.y;

            } else {
                this.currentHitCoord = null;
                console.log('... not enought hits targets. Mode switch...')
                // przejdź do trybu polowania (hunter mode)
                this.isHunter = true;

                // this.prepare2Fire();
                return
            }

        }

        // this._makeMapOfChance();

        /* tylko w trybie debbugingu komputer */
        if (fireX !== undefined && fireY !== undefined) {
            let cellID = this.battleBoard._index(fireX, fireY);
            let cell = this.battleBoard.boardCells[cellID];
            cell.addClass('aim');
        }
        this.aimX = fireX;
        this.aimY = fireY;

        /* tylko w trybie bez debbugingu komputera
        // oddaj strzał
        this.fire(fireX, fireY);
        */
    }

    fire(fireX, fireY) {
        if (this.battle.isFire) {
            if (!this.waiting) {
                console.log('Computer class: Waiting for the possibility to put a shot...')
                // odczekaj, aż skończy się faza strzału
                this.waiting = setInterval(() => {
                    console.log('Computer class: An attempt to fire after waiting');
                    this.fire(fireX, fireY);
                }, 1000);
            }
            return
        }
        if (this.waiting) clearInterval(this.waiting);
        this.waiting = null;

        // usuń koordynat z listy możliwych strzałów
        let coordID = this._findIndexByCoord(fireX, fireY);
        this.mapCoord.splice(coordID, 1);

        let hit = super.fire(fireX, fireY);

        if (!this.isHunter) { // tryb "TARGET"
            if (this.currentHitCoord) {
                this.currentHitCoord.isFire = true;
            }
            if (this.currentHitCoord) {
                this.currentHitCoord.isHit = true;
            }

        } else { // tryb "HUNTER"
            // czy było trafienie?
            if (hit.isHit) {
                // tak?
                // czy było zatopienie?
                if (!hit.isSunk) {
                    // nie?
                    // dodaj koordynat do listy trafień
                    this.aimsCoord.push({ x: fireX, y: fireY, isAimed: false });
                } else {
                    // tak?

                }

                // przygotuj następny strzał
                // this.prepare2Fire();
            }
        }
    }

    endTurn() {
        /* tylko w trybie debbugingu komputera */
        this.chanceMap.hideBoard();
        this.battle.interface['btn']['aim']
            .addClass('hidden')
            .off('click');
        super.endTurn();
        this.battle.interface['btn']['fire']
            .addClass('hidden')
            .off('click');
        this.battle.interface['btn']['chance-map']
            .addClass('hidden')
            .off('click');
    }
}