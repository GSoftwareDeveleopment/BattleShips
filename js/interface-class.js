class Interface {
    constructor(container) {
        if (container instanceof Screen) {
            this._containerID = container.containerID;
            this._container = container.container;
        } else {
            this._containerID = container.prop('id');
            this._container = container;
        }
        this._elements = new Array();
    }

    build(selector, group, initList) {
        console.groupCollapsed(`Build interface '${this._containerID}'.'${group}'...`)

        this[group] = new Array();
        let elements = this._container.find(selector);
        console.log(`${elements.length} element(s) in interface found`);
        if (elements.length > 0) {
            this._elements[group] = elements;
            elements.each((index, el) => {
                let _el = $(el);
                if (!_el.hasClass('interface-exlude')) {
                    let id = _el.prop('id');
                    this[group][id] = _el;
                    if (initList && initList[id]) {
                        console.log(`Initialize interface element '${this._containerID}'.'${group}'.'${id}'...`);
                        initList[id](_el);
                    }
                }
            });
        } else {
            console.error(`Can't find '${selector}' in '${this._containerID}' :( Interface is not build`);
        }
        console.groupEnd();
        return elements;
    }

}