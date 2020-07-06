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
                el.on('click', () => { this.done(); });
            },
            'battle': (el) => {
                el.on('click', () => {
                    this.done();
                    this.game.goBattle();
                });
            },
        });
    }

    /* pokazanie/ukrycie ekranu */

    showScreen() {
        super.showScreen();

        // przygotowanie ekranu dla pierwszego gracza
        this.currentPlayer = 0;

        this.prepareScreen();
    }

    hideScreen() {
        super.hideScreen();
    }

    /* przygotowanie ekranu ustawienia statków */

    prepareScreen() {
        // pobranie referencji aktualnego gracza
        let player = this.game.players[this.currentPlayer];

        // ustawienie nazwy gracza
        this.interface['textbox']['player-name'].val(player.name);
        // this.screen.find('input#player-name').val(player.name);

        this.selectedShip = null;
        this.currentShip = null;

        this.dockyardList = new Dockyard(player.dockyard, this.container.find('div#dockyard-list'));
        this.dockyardList.onSelect = (shipType) => {
            this.game.assets.sounds['pop'].play();
            this.currentShip = new Ship(shipType, 0);
        };
        this.dockyardList.onUnselect = (shipType) => {
            this.game.assets.sounds['cancel'].play();
            this.currentShip = null;
        };
        this.dockyardList.onNotAvailable = (shipType) => {
            this.game.assets.sounds['error'].play();
            this.currentShip = null;
        };



        // czy to ostatni gracz?
        if (this.currentPlayer < this.game.players.length - 1) {
            // nie
            this.interface['btn']['done'].removeClass('hidden').prop('disabled', true).addClass('disabled');
            this.interface['btn']['battle'].addClass('green hidden');
        } else {
            // tak
            this.interface['btn']['done'].addClass('hidden');
            this.interface['btn']['battle'].removeClass('green hidden').prop('disabled', true).addClass('disabled');
        }

        player.prepare2SetupShips(this);

    }

    /* obsługa zdarzeń przycisków */

    // ekran pomocy
    help() {
        this.game.assets.sounds['click'].play();
        this.game.screenSetupHelp.showScreen();
    }

    // anulowanie rozgrywki
    abort() {
        this.game.assets.sounds['click'].play();

        let player = this.game.players[this.currentPlayer];

        // ukrycie planszy gracza
        player.board.hideBoard();

        this.dockyardList.remove();

        // skasowanie (ukrycie) listy statków (dockyard-list)
        // this.dockyardList.empty();

        this.game.goAbort();
    }

    // przejście do ustawień następnego gracza
    done() {
        this.game.assets.sounds['click'].play();

        let player = this.game.players[this.currentPlayer];

        // usunięcie zdarzeń dla planszy aktualnego gracza
        this.playerBoard.screen.find('div.cell').off('mouseover click contextmenu');

        // ukrycie planszy gracza
        player.board.hideBoard();

        // skasowanie (ukrycie) listy statków (dockyard-list)
        this.dockyardList.empty();

        // zapamiętanie nazwy gracza
        player.name = this.screen.find('input#player-name').val();

        // zmiana aktualnego gracza lub przejście do bitwy
        this.currentPlayer++;
        if (this.currentPlayer < this.game.players.length)
            this.prepareScreen();
    }
}