class Computer extends Player {
    constructor(_game, id) {
        console.log('Computer class: Creating player: Computer...');
        super(_game, 1, id);
    }

    prepare2SetupShips(_setupShips) {
        super.prepare2SetupShips(_setupShips);
        setTimeout(() => { this.setupShip(); }, 100);
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

        // sprawdź, czy statek może być odłożony
        if (this.board.shipInBoard(currentShip) && !this.board.isOverlaped(currentShip)) {
            // tak?

            selectedShip.Q--;
            this.board.addShip(currentShip);

        } else {
            //nie?
            console.log(`Computer class: The ship cannot be placed in the selected position.`);
        }

        setTimeout(() => { this.setupShip(); }, 100);
    }

    setupShipsDone() {
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
    }

    fire() {
        super.fire();
    }

    endTurn() {
        super.endTurn();
    }
}