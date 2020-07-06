class Dockyard extends Interface {

    constructor(dockyardData, container) {
        let c = $('<ul id="dockyard-list" />'); // utworzenie nowego elementu DOM
        super(c);

        this.dockyard = dockyardData;
        for (let i = 0; i < this.dockyard.length; i++) {
            let shipdata = this.dockyard[i];

            if (!shipdata.mainField) { // main list item element
                shipdata.mainField = $(`<li id="ship-${i}" data-shiptype="${shipdata.shipType}"/>`);
                this._container.append(shipdata.mainField);
            }

            if (!shipdata.QField) {     // Quantity field
                let _QField = $('<div class="q"></div>');
                shipdata.mainField.append(_QField)
                shipdata.QField = $('<span/>');
                _QField.append(shipdata.QField)
            }

            if (!shipdata.nameField) {  // Name field
                shipdata.nameField = $(`<span class="name">${shipdata.name}</span>`);
                shipdata.mainField.append(shipdata.nameField);
            }

            if (!shipdata.imgField) {   // Image field
                let img = game.assets.images[`shiptype-${shipdata.shipType}`].obj;
                shipdata.imgField = $(img).addClass('ship');
                shipdata.mainField.append(img)
            }

            if (!shipdata.size) {     // Size field
                shipdata.size = $('<div class="size"/>');
                for (let j = 0; j < shipdata.masts; j++) {
                    let ind = $('<span class="set"/>');
                    shipdata.size.append(ind);
                }
                shipdata.mainField.append(shipdata.size);
            }
        }

        // dodanie elementu DOM do wyznaczonego kontenera 'container'
        container.append(this._container);

        // obsługa zdarzeń list statków (dockyard-list) (lewy przycisk myszy)
        this.build('li', 'dockyard-items')
            .on('click', (e) => { this.selectShip(e); });

        this.selectedShip = null;
        this.selectedShipType = null;
        this.selectShipData = null;

        this.update();
    }

    remove() {
        this._container.detach();
    }

    /* aktualizacja listy statków (dockyard-list) */
    update() {
        for (let i = 0; i < this.dockyard.length; i++) {
            let shipdata = this.dockyard[i];

            if (shipdata.Q === 0) {
                shipdata.QField.html('-');
                shipdata.mainField.addClass('zeroQ');
            } else {
                shipdata.QField.html(`${shipdata.Q}`);
                shipdata.mainField.removeClass('zeroQ');
            }
        }
    }

    // metoda pobiera dane dotyczące statku (z this.dockyard), na podstawie jego typu
    getShipData(shipType) {
        let shipdata;
        for (let i = 0; i < this.dockyard.length; i++) {
            shipdata = this.dockyard[i];
            if (this.dockyard[i].shipType === shipType) {
                return shipdata;
            }
        }
        return false;
    }

    // obsługa listy statków gracza (dockyard-lisy)
    selectShip(e) {

        if (this.selectedShip) {
            this.selectedShip.removeClass('selected');
        }

        this.selectedShip = $(e.currentTarget);
        this.selectedShipType = this.selectedShip.data('shiptype');
        const shipData = this.getShipData(this.selectedShipType);

        if (this.selectedShipType !== this._lastSelectedShipType) {
            if (shipData.Q > 0) {
                if (this.onSelect) this.onSelect(this.selectedShipType);
                this.selectedShip.addClass('selected');
            } else {
                if (this.onNotAvailable) this.onNotAvailable(this.selectedShipType);
                this.selectedShip = null;
            }
        } else {
            if (this.onUnselect) this.onUnselect(this.selectedShipType);
            this.selectedShip = null;
            this.selectedShipType = null;
        }
        this._lastSelectedShipType = this.selectedShipType;
    }

    unselectShip() {
        if (this.selectedShip) {
            this.selectedShip.removeClass('selected');
        }
        this.selectedShip = null;
        if (this.onUnselect) this.onUnselect(this.selectedShipType)
    }

}