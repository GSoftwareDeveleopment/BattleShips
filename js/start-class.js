class StartScreen extends Screen {

    constructor(_container, _game) {
        super(_container, _game);

        this.game.players = [];

        this.interface.build('div.menu', 'menus');
        this.interface.build('button', 'button', {
            'playMusic': (el) => {
                el.on('click', () => {
                    this.game.assets.sounds['music'].play(true);
                    this.game.settings.backgroundSound = true;

                    this.interface.button.playMusic.addClass('hidden');
                    this.interface.button.stopMusic.removeClass('hidden');
                })
            },
            'stopMusic': (el) => {
                el.on('click', () => {
                    this.game.assets.sounds['music'].stop(true);
                    this.game.settings.backgroundSound = false;

                    this.interface.button.playMusic.removeClass('hidden');
                    this.interface.button.stopMusic.addClass('hidden');
                })
            }
        });

        this.interface.build('li.selectable', 'menu')
            .on('click', (e) => { this.menuButton(e); });
    }

    menuButton(e) {
        e.preventDefault();

        this.game.assets.sounds['click'].play();

        let option = $(e.target).data('option');
        switch (option) {
            case "battle":
                let mode = $(e.target).data('mode');
                this.prepare2Battle(mode);
                break;
            case "menu":
                let menu = $(e.target).data('menu');
                console.log('StartScreen class: change menu on "' + menu + '"')

                if (this.interface['menus'][menu]) {
                    // zamknij wszystkie menu
                    for (let menuID in this.interface['menus']) {
                        this.interface['menus'][menuID].addClass('hidden');
                    }
                    this.interface['menus'][menu].removeClass('hidden');
                }

                break;
            case "option":
                let value;
                let set = $(e.target).data('set'),
                    setType = $(e.target).data('type'),
                    values = $(e.target).data('values').split(','),
                    setValueHTML = $(e.target).find('span.set-value'),
                    setValue = setValueHTML.html();

                let valueID = values.findIndex((el) => el === setValue);
                if (valueID + 1 >= values.length)
                    valueID = 0
                else
                    valueID++;

                setValue = values[valueID];
                setValueHTML.html(setValue);
                switch (setType) {
                    case "num":
                        value = parseInt(setValue);
                        if (isNaN(value)) value = undefined;
                        break;
                    case "bool":
                        switch (setValue.trim()) {
                            case "off":
                                value = false;
                                break;
                            case "on":
                                value = true;
                                break;
                            default:
                                value = undefined;
                        }
                        break;
                    default:
                        console.warn('StartScreen class: value type is not implemented!')
                        break;
                }
                if (value !== undefined) {
                    this.game.settings[set] = value;
                    console.log('StartScreen class: value "' + set + '" is set on "' + value + '"');
                } else {
                    console.warn('StartScreen class: value is not recoginzed!');
                }
                // console.log(set, values, setValue, valueID);
                break;
            default:
                console.warn('StartScreen class: Option is not implemented or not recognized');
        }

    }

    prepare2Battle(mode) {
        console.log('StartScreen class: selecting new game in "' + mode + '" mode...;')
        this.hideScreen();

        this.game.goSetupShips(mode);
    }

}