class SetHelpScreen extends Screen {
    constructor(_container, _game) {
        super(_container, _game);

        this.buildInterface('button', 'btn');
    }

    showScreen() {
        this.interface['btn']['close'].one('click', () => {
            this.hideScreen();
        })

        super.showScreen();
    }

    hideScreen() {
        this.game.assets.sounds['click'].play();

        super.hideScreen();
    }
}