class StatsScreen extends Screen {

	constructor(_container, _game) {
		super(_container, _game);

		this.interface.build('button', 'btn', {
			'close': (el) => { el.one('click', () => { this.close(); }); },
			'revange': (el) => { el.one('click', () => { this.game.goRevange(); }); },
			'menu': (el) => { el.one('click', () => { this.game.goStart(); }); }
		});

		this.interface.build('li.tab', 'tabsbtn').each((id, el) => {
			$(el).removeClass('selected');
			$(el).on('click', (e) => {
				let tabID = $(e.target).prop('id');

				this.showTab(tabID);
			});
		});

		this.interface.build('div.tab', 'tab-content');

		this.interface.build('span.stat', 'stats');
	}

	showScreen() {
		super.showScreen();

		let buttons = this.interface['btn'];
		if (!this.game.screenBattle.isGameover) {
			buttons['close'].removeClass('hidden')
			buttons['revange'].addClass('hidden');
			buttons['menu'].addClass('hidden');
		} else {
			buttons['close'].addClass('hidden');
			buttons['revange'].removeClass('hidden')
			buttons['menu'].removeClass('hidden')
		}

		this.showTab('you');

		// przygotowanie zakładkek "You" i "Opponent"
		// oraz pobranie statystk
		let youStat = this.prepareStats4Player('you', this.game.screenBattle.currentPlayer),
			opponentStat = this.prepareStats4Player('opponent', this.game.screenBattle.opponentPlayer);

		let stats = this.interface['stats'];

		// uzupełnienie statystyk w zakładce "You"		
		stats['you-shots'].html(youStat.moves);
		stats['you-fleetCondition'].html(Math.floor(youStat.fleetCondition) + "%");
		stats['you-hits'].html(opponentStat.hits);
		let youAccuracy = Math.floor((opponentStat.hits / youStat.moves) * 100);
		if (!isNaN(youAccuracy))
			stats['you-accuracy'].html(youAccuracy + "%");
		else
			stats['you-accuracy'].html("-");
		stats['you-discoveredShips'].html(opponentStat.discoveredShips);
		stats['you-sunkenShips'].html(opponentStat.sunkenShips);

		// uzupełnienie statystyk w zakładce "Opponent"
		stats['opponent-shots'].html(opponentStat.moves);
		stats['opponent-fleetCondition'].html(Math.floor(opponentStat.fleetCondition) + "%");
		stats['opponent-hits'].html(youStat.hits);

		let opponentAccuracy = Math.floor((youStat.hits / opponentStat.moves) * 100);
		if (!isNaN(opponentAccuracy))
			stats['opponent-accuracy'].html(opponentAccuracy + "%");
		else
			stats['opponent-accuracy'].html("-");

		stats['opponent-discoveredShips'].html(youStat.discoveredShips);
		stats['opponent-sunkenShips'].html(youStat.sunkenShips);

		// przygotowanie zakładki "Global"

		var d = this.game.screenBattle.duration;
		if (d < 60) {
			stats['stat-duration'].html(d + 's');
		} else if (d < 3600) {
			stats['stat-duration'].html(parseInt(d / 60) + "m " + (d % 60) + "s");
		} else if (d > 3600) {
			stats['stat-duration'].html(parseInt(d / 3600) + "h " + parseInt(d / 60) + "m " + (d % 60) + "s");
		}

		stats['stat-turns'].html(this.game.screenBattle.turn);
		stats['stat-shots'].html(this.game.screenBattle.shots);

	}

	hideScreen() {
		// for (let id in this.interface['tabsbtn'])
		// 	this.interface['tabsbtn'][id].off('click');

		// for (let id in this.interface['btn'])
		// 	this.interface['btn'][id].off('click');

		super.hideScreen();
	}

	//
	//
	//

	unselectAllTabs() {
		for (let id in this.interface['tabsbtn'])
			this.interface['tabsbtn'][id].removeClass('selected');
	}

	hideAllTabs() {
		for (let id in this.interface['tab-content']) {
			this.interface['tab-content'][id].addClass('hidden');
		}
	}

	showTab(tabid) {
		this.unselectAllTabs();
		this.hideAllTabs();
		this.interface['tabsbtn'][tabid].addClass('selected');
		this.interface['tab-content'][tabid].removeClass('hidden');
	}

	//
	//
	//

	prepareStats4Player(tabid, player) {
		let dockyard = player.dockyard,
			HTMLshipList = [],
			stat = {
				discoveredShips: 0,
				sunkenShips: 0,
				fleetCondition: 0,
				hits: 0,
				moves: player.moves
			},
			isFirst = true;

		HTMLshipList = this.interface['tab-content'][tabid].find('ul#ships');
		HTMLshipList.find('li.info').detach();

		let maxMasts = 0;
		for (let id = 0; id < dockyard.length; id++)
			if (dockyard[id].masts > maxMasts)
				maxMasts = dockyard[id].masts;

		for (let id = 0; id < dockyard.length; id++) {
			let ships = dockyard[id],
				HTMLshipType = $('<li class="info"/>'),
				HTMLshipName = $('<div class="name"/>').html(ships.name),
				HTMLships = $('<div class="ships"/>');

			HTMLshipType.append(HTMLshipName);
			HTMLshipType.append(HTMLships);
			let size = 100 / (maxMasts + 1 - ships.masts);

			// let shipsCount = ship.list.length;
			for (let i = 0; i < ships.list.length; i++) {
				let HTMLshipUnit = $('<div class="ship"/>').css('width', size + '%');

				let HTMLshipImg = $(this.game.assets.images[`shiptype-${ships.shipType}`].obj).clone();
				HTMLshipUnit.append(HTMLshipImg);

				let info = ships.list[i].damage();
				// let info = null;
				// if (i >= shipsCount) {
				// 	continue;
				// 	// HTMLshipImg.addClass('noactive');
				// } else {
				// 	info = ship.list[i].damage();
				// }

				let HTMLdamage = $('<div class="damage"/>');

				if (info) {
					let damage = 0;

					if (info.damage > 0) stat.discoveredShips++
					stat.hits += info.damage;

					if (info.damage === info.masts) {
						HTMLshipImg.addClass('sunk');
						stat.sunkenShips++;
					}

					damage = ((info.damage / info.masts) * 100);
					let HTMLdamageBar = $('<span/>').css("width", damage + '%');
					HTMLdamage.append(HTMLdamageBar);

					if (isFirst)
						stat.fleetCondition = damage
					else
						stat.fleetCondition = (stat.fleetCondition + damage) / 2;
					isFirst = false;
				}
				HTMLshipUnit.append(HTMLdamage);
				HTMLships.append(HTMLshipUnit);
				HTMLshipList.append(HTMLshipType);
			}
		}

		stat.fleetCondition = 100 - stat.fleetCondition;

		return stat;
	}

	close() {
		this.game.assets.sounds['click'].play();
		this.hideScreen();
	}
}