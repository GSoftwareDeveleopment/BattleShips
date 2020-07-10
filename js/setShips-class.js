class SetShipsScreen extends Screen {

    constructor(_container, _game) {
        super(_container, _game);

        // this.dockyardList = this.screen.find('ul#dockyard-list');

        this.interface.build('input', 'textbox');

        this.interface.build('button', 'btn', {
            'help': (el) => {
                el.on('click', () => { this.help(); });
            },
            'abort': (el) => {
                el.on('click', () => { this.abort(); });
            },
            'done': (el) => {
                el.on('click', () => {
                    this.done();
                });
            },
            'battle': (el) => {
                el.on('click', () => {
                    this.done();
                    this.game.goBattle();
                });
            }
        });
    }

    /* pokazanie/ukrycie ekranu */

    showScreen() {
        super.showScreen();

        // przygotowanie ekranu dla pierwszego gracza
        this.currentPlayer = 0;

        this.interface['btn']['done'].removeClass('hidden').prop('disabled', true).addClass('disabled');
        this.interface['btn']['battle'].addClass('green hidden');

        this.prepareScreen();
    }

    hideScreen() {
        super.hideScreen();
    }

    /* przygotowanie ekranu ustawienia statków */

    prepareScreen() {
        // pobranie referencji aktualnego gracza
        let player = this.game.players[this.currentPlayer];
        console.log(`SetShipsScreen class: ...preparing setup ship screen for player '${player.id}'...`)

        // ustawienie nazwy gracza
        this.interface['textbox']['player-name'].val(player.name);

        this.selectedShip = null;
        this.currentShip = null;

        player.prepare2SetupShips(this);
    }

    // ekran pomocy
    help() {
        this.game.assets.sounds['click'].play();
        this.game.screenSetupHelp.showScreen();
    }

    // anulowanie rozgrywki
    abort() {
        this.game.assets.sounds['click'].play();

        let player = this.game.players[this.currentPlayer];
        player.setupShipsDone();

        // skasowanie (ukrycie) listy statków (dockyard-list)
        // this.dockyardList.empty();

        this.game.goAbort();
    }

    // przejście do ustawień następnego gracza
    done() {
        console.log(`SetShipsScreen class: Player '${this.currentPlayer.id}' has finish ships setup.`);
        this.game.assets.sounds['click'].play();

        let currentPlayer = this.game.players[this.currentPlayer];

        currentPlayer.setupShipsDone();

        // zapamiętanie nazwy gracza
        currentPlayer.name = this.interface['textbox']['player-name'].val();

        // zmiana aktualnego gracza lub przejście do bitwy
        this.currentPlayer++;
        if (this.currentPlayer < this.game.players.length) {
            // tak
            this.interface['btn']['done'].addClass('hidden');
            this.interface['btn']['battle'].removeClass('green hidden').prop('disabled', true).addClass('disabled');
            console.log(`SetShipsScreen class: Change to next player...`);
            this.prepareScreen();
        }
    }

    enableButton() {
        this.interface['btn']['done'].prop('disabled', false).removeClass('disabled');
        this.interface['btn']['battle'].prop('disabled', false).removeClass('disabled').addClass('green');
    }

    disableButton() {
        this.interface['btn']['done'].prop('disabled', true).addClass('disabled');
        this.interface['btn']['battle'].prop('disabled', true).addClass('disabled').removeClass('green');
    }

}