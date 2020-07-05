class StatsScreen extends Screen {

	constructor(_container, _game) {
		super(_container, _game);

		this.but = [];
		this.stats = [];
		this.tabsctx = [];

		this.screen.find("button").each((index, el) => {
			let id = $(el).prop('id');
			this.but[id] = $(el);
		});

		this.tabsbtn = this.screen.find("li");
		this.tabsbtn.on('click', (e) => {
			let tabID = $(e.target).data('tabid');
			this.tabsbtn.removeClass('selected');
			$(e.target).addClass('selected');
			this.showTab(tabID);
		});

		this.screen.find("div.tab").each((index, el) => {
			if (!$(el).hasClass('exclude')) {
				let id = $(el).prop('id');
				this.tabsctx[id] = $(el);
			}
		});

		this.screen.find("span.stat").each((index, el) => {
			let id = $(el).prop('id');
			this.stats[id] = $(el);
		});
	}

	showScreen() {
		if (!this.game.screenBattle.isGameover) {
			this.but['close'].removeClass('hidden')
			this.but['revange'].addClass('hidden');
			this.but['menu'].addClass('hidden');
		} else {
			this.but['close'].addClass('hidden');
			this.but['revange'].removeClass('hidden')
			this.but['menu'].removeClass('hidden')
		}

		this.but['close'].one('click', () => { this.close(); });
		this.but['revange'].one('click', () => { this.game.goRevange(); });
		this.but['menu'].one('click', () => { this.game.goStart(); });

		this.showTab('you');
		for (let i = 0; i < this.tabsbtn.length; i++) {
			$(this.tabsbtn[i]).removeClass('selected');
		}
		$(this.tabsbtn[0]).addClass('selected');

		// przygotowanie zakładkek "You" i "Opponent"
		// oraz pobranie statystk
		let youStat = this.prepareStats4Player('you', this.game.screenBattle.currentPlayer),
			opponentStat = this.prepareStats4Player('opponent', this.game.screenBattle.opponentPlayer);

		// uzupełnienie statystyk w zakładce "You"		
		this.stats['you-shots'].html(youStat.moves);
		this.stats['you-fleetCondition'].html(Math.floor(youStat.fleetCondition) + "%");
		this.stats['you-hits'].html(opponentStat.hits);
		let youAccuracy = Math.floor((opponentStat.hits / youStat.moves) * 100);
		if (!isNaN(youAccuracy))
			this.stats['you-accuracy'].html(youAccuracy + "%");
		else
			this.stats['you-accuracy'].html("-");
		this.stats['you-discoveredShips'].html(opponentStat.discoveredShips);
		this.stats['you-sunkenShips'].html(opponentStat.sunkenShips);

		// uzupełnienie statystyk w zakładce "Opponent"
		this.stats['opponent-shots'].html(opponentStat.moves);
		this.stats['opponent-fleetCondition'].html(Math.floor(opponentStat.fleetCondition) + "%");
		this.stats['opponent-hits'].html(youStat.hits);

		let opponentAccuracy = Math.floor((youStat.hits / opponentStat.moves) * 100);
		if (!isNaN(opponentAccuracy))
			this.stats['opponent-accuracy'].html(opponentAccuracy + "%");
		else
			this.stats['opponent-accuracy'].html("-");

		this.stats['opponent-discoveredShips'].html(youStat.discoveredShips);
		this.stats['opponent-sunkenShips'].html(youStat.sunkenShips);

		// przygotowanie zakładki "Global"

		var d = this.game.screenBattle.duration;
		if (d < 60) {
			this.stats['stat-duration'].html(d + 's');
		} else if (d < 3600) {
			this.stats['stat-duration'].html(parseInt(d / 60) + "m " + (d % 60) + "s");
		} else if (d > 3600) {
			this.stats['stat-duration'].html(parseInt(d / 3600) + "h " + parseInt(d / 60) + "m " + (d % 60) + "s");
		}

		this.stats['stat-turns'].html(this.game.screenBattle.turn);
		this.stats['stat-shots'].html(this.game.screenBattle.shots);

		super.showScreen();
	}

	hideScreen() {
		for (let id in this.tabbtn)
			this.tabsbtn[id].off('click');

		for (let id in this.but)
			this.but[id].off('click');

		super.hideScreen();
	}

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

		HTMLshipList = this.tabsctx[tabid].find('ul#ships');
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

	hideAllTabs() {
		for (let tabid in this.tabsctx) {
			this.tabsctx[tabid].addClass('hidden');
		}
	}

	showTab(tabid) {
		this.hideAllTabs();
		this.tabsctx[tabid].removeClass('hidden');
	}

	close() {
		this.game.assets.sounds['click'].play();
		this.hideScreen();
	}
}