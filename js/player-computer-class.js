class Computer extends Player {
    constructor(_game, id) {
        console.log('Computer class: Creating player: Computer...');
        super(_game, 1, id);
    }

    prepare2SetupShips(_setupShips) {

    }

    setupShipsDone() {

    }

    //
    //
    //

    prepare2Battle(_battle) {
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