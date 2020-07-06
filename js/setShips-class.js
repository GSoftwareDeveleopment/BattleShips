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

        /* implementacja w player-human-class prepare2setupShips
        
                        //pokazanie planszy gracza
                        this.playerBoard.showBoard();
                
                        this.selectedShip = null;
                        this.currentShip = null;
                        this.updateShipList();
                
                        // zdarzenia dla planszy
                        this.playerBoard.screen.find('div.cell')
                            .on('mouseover', (e) => { this.placePointer(e); })  // kursor nad komórką
                            .on('mouseout', (e) => { this.removePointer(e); })  // kursor nad komórką
                            .on('click', (e) => { this.setShip(e); })           // lewy przycisk myszy
                            .on('contextmenu', (e) => { this.rotateShip(e); }); // prawy przycisk myszy
        */
    }

    /* implementacja w player-human-class
        // zdarzenie dla mapy (przesówanie kursorem w obszarze mapy)
        placePointer(e) {
            e.preventDefault();
    
            this.currentCell = $(e.currentTarget);
    
            if (!this.currentShip) return;
            let x = this.currentCell.data('col'),
                y = this.currentCell.data('row');
    
            this.currentShip.x = x;
            this.currentShip.y = y;
            if (this.currentShip.inBoard()) {
                this.currentShip.draw();
                !this.currentShip.isOverlaped();
            }
        }
    
        removePointer(e) {
            e.preventDefault();
            this.currentCell = null;
            if (!this.currentShip) return;
            this.playerBoard.redraw();
        }
    
        // zdarzenie dla mapu (prawy przycisk myszy)
    
        rotateShip(e) {
            e.preventDefault();
            if (!this.currentShip) return;
    
            if (this.game.settings.allowObliqueArrangement) {
                this.currentShip.dir++;
                if (this.currentShip.dir > 7) this.currentShip.dir = 0;
            } else {
                do {
                    this.currentShip.dir++;
                    if (this.currentShip.dir > 7) this.currentShip.dir = 0;
                } while (directions[this.currentShip.dir].d !== 0);
            }
            this.playerBoard.redraw();
            this.placePointer(e);
        }
    
        // zdarzenie dla mapy (lewy przycisk myszy)
    
        setShip(e) {
            e.preventDefault();
    
            let player = this.game.players[this.currentPlayer];
    
            // jeżeli gracz nie wybrał statku z listy...
            if (!this.currentShip) {
                this.currentCell = $(e.currentTarget);
                let x = this.currentCell.data('col'),
                    y = this.currentCell.data('row');
    
                // ...sprawdź, czy "kliknięte" miejsce na mapie, zawiera statek...
                let ship = this.playerBoard.shipInPos(x, y);
                if (ship) {
                    // POBRANIE STATKU Z PLANSZY GRACZA
                    this.currentShip = ship.ship;
    
                    let shipdata = this.findShipList(this.currentShip.shipType);
                    // jeżeli wybrany statek został znaleziony w doku gracza (dockyard) to...
                    if (shipdata) {
                        // ... oznacz pobrany statek jako wybrany na liście statków
                        this.selectedShip = shipdata.mainField.addClass('selected');
    
                        // ... zwiększ ilość statków w doku (ponieważ, pobieramy statek z mapy :) )
                        shipdata.Q++;
    
                        // ... usuń statek z planszy gracza
                        // ... zakualizuj planszę gracza
                        this.playerBoard.removeShip(ship.id);
    
                        this.currentShip.draw();
                    }
                    // odtwórz dźwięk
                    this.game.assets.sounds['pop'].play();
                }
            } else {
                // DODANIE STATKU DO PLANSZY GRACZA
    
                // sprawdź, czy statek może być odłożony
                if (this.currentShip.inBoard() && !this.currentShip.isOverlaped()) {
    
                    let shipdata = this.findShipList(this.currentShip.shipType);
                    // jeżeli wybrany statek został znaleziony w doku gracza (dockyard) to...
                    if (shipdata && shipdata.Q > 0) {
                        // ... zmniejsz ilość statków w doku
                        shipdata.Q--;
    
                        // dodaj statek do planszy gracza
                        // zaktualizuj planszę gracza
                        this.playerBoard.addShip(this.currentShip);
    
                        // odtwórz dźwięk
                        this.game.assets.sounds['splash'].play();
                    }
    
                    // odznaczenie wybranego statku na liście
                    this.unselectShip();
                } else {
                    this.game.assets.sounds['error'].play();
                }
            }
    
            // zaktualizuj listę statków
            this.updateShipList();
    
            if (player.board.countShips() > 0) {
                this.interface['btn']['done'].prop('disabled', false).removeClass('disabled');
                this.interface['btn']['battle'].prop('disabled', false).removeClass('disabled').addClass('green');
            } else {
                this.interface['btn']['done'].prop('disabled', true).addClass('disabled');
                this.interface['btn']['battle'].prop('disabled', true).addClass('disabled').removeClass('green');
            }
        }
    */


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