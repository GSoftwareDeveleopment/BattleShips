class Screen {

    constructor(containerID, _game) {
        this.game = _game;
        this.containerID = containerID;
        this.container = $(`div#${containerID}`);
        this.interface = new Interface(this);
    }

    showScreen() {
        this.container.removeClass('hidden');
    }

    hideScreen() {
        this.container.addClass('hidden')
    }

    buildInterface(selector, group, initList) {
        this.interface[group] = new Array();
        this.container.find(selector).each((index, el) => {
            let _el = $(el);
            if (!_el.hasClass('interface-exlude')) {
                let id = _el.prop('id');
                this.interface[group][id] = _el;
                if (initList && initList[id]) {
                    console.log(`interface '${this.containerID}'.'${group}'.'${id}' initialize...`);
                    initList[id](_el);
                }
            }
        });
    }
}
