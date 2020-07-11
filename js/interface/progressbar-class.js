class ProgressBar extends Interface {
    constructor(contaienr) {
        let c = $('<div id="progressbar" />'); // utworzenie nowego elementu DOM
        super(c);

        this._progress = $('<div class="progress"/>)')
            .appendTo(this._container);
        contaienr.append(this._container);
    }

    set(progressValue) {
        this._progress.css('width', parseInt(progressValue * 100) + '%');
    }

    remove() {
        this._container.detach();
    }
}