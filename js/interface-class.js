class Interface {
    constructor(screen) {
        this._containerID = screen.containerID;
        this._screen = screen.screen;
        this._elements = new Array();
    }

    build(selector, group, initList) {
        console.groupCollapsed(`Initialize interface '${this._containerID}'.'${group}'...`)

        this[group] = new Array();
        this._elements[group] = this._screen.find(selector);
        console.log(`${this._elements.length} element(s) in interface found`);

        this._elements[group].each((index, el) => {
            let _el = $(el);
            if (!_el.hasClass('interface-exlude')) {
                let id = _el.prop('id');
                this[group][id] = _el;
                if (initList && initList[id]) {
                    console.log(`interface '${this._containerID}'.'${group}'.'${id}' initialize...`);
                    initList[id](_el);
                }
            }
        });

        console.groupEnd();
        return this._elements[group];
    }

}