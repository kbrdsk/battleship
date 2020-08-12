//Ship Construction

const shipPrototype = {
	hit: function () {
		if (this.hitCounter < this.length) {
			this.hitCounter++;
			return true;
		} else return false;
	},

	get isSunk() {
		return this.hitCounter >= this.length;
	},
};

function buildShip(length) {
	if (isNaN(length) || length < 1) throw "Must specify a valid length";
	const ship = Object.create(shipPrototype);
	ship.hitCounter = 0;
	ship.length = length;
	return ship;
}

//Gameboard Construction

const nullShip = {
	hit: function () {},
};

const gameboardPrototype = {
	placeShip: function (shipCoords, ship = buildShip(shipCoords.length)) {
		for (let coord of shipCoords) {
			let square = this.getSquare(coord);
			if (square.ship !== nullShip) throw "Overlapping ships";
			square.ship = ship;
		}
		this.shipList.push(ship);
	},

	get gameOver() {
		return this.shipList.every((ship) => ship.isSunk);
	},

	receiveAttack: function (coord) {
		if (this.gameOver) throw "Game is over";
		let square = this.getSquare(coord);
		if (square.hitStatus) throw "Square has already been attacked";
		square.ship.hit();
		if (square.ship === nullShip) square.hitStatus = "miss";
		else square.hitStatus = "hit";
		return square.hitStatus;
	},

	getSquare: function (coord) {
		return this.board[coord[0]][coord[1]];
	},

	get boardState() {
		return this.board;
	},
};

function buildGameboard(width, height) {
	let board = new Array(width)
		.fill(null)
		.map(() =>
			new Array(height)
				.fill(null)
				.map(() => Object.create({ hitStatus: null, ship: nullShip }))
		);

	let gameboard = Object.create(gameboardPrototype);
	gameboard.board = board;
	gameboard.shipList = [];
	return gameboard;
}

//Player Creation

const attackFunctions = {
	human: () => (coords) => coords,
	defaultAI: (boardState) => {
		let xCoord = boardState.findIndex((column) =>
			column.some((square) => !square.hitStatus)
		);
		let yCoord = boardState[xCoord].findIndex(
			(square) => !square.hitStatus
		);
		return () => [xCoord, yCoord];
	},
};

function createPlayer(playerType, playerName) {
	return { playerName, launchAttack: attackFunctions[playerType] };
}

//Game Loop

function startGame(game = {}) {
	return (...args) => initializePlayer(game, "firstPlayer", ...args);
}

function initializePlayer(
	game,
	player,
	playerType,
	playerName,
	boardSize,
	shipCount
) {
	game[player] = createPlayer(playerType, playerName);
	game[player].gameboard = buildGameboard(...boardSize);
	game[player].shipCount = shipCount;
	if (player === "firstPlayer")
		return (...args) => initializePlayer(game, "secondPlayer", ...args);
	else return (...args) => placeShips(game, game.firstPlayer, ...args);
}

function placeShips(game, player, shipLocations) {
	for (let shipCoords of shipLocations) {
		player.gameboard.placeShip(shipCoords);
	}
	if (player === game.firstPlayer)
		return (...args) => placeShips(game, game.secondPlayer, ...args);
	else return (...args) => turn(game, game.firstPlayer, ...args);
}

function turn(game, player, attackCoords) {
	const opponent =
		player === game.firstPlayer ? game.secondPlayer : game.firstPlayer;
	const boardState = opponent.gameboard.boardState;
	opponent.gameboard.receiveAttack(
		player.launchAttack(boardState)(attackCoords)
	);

	if (opponent.gameboard.gameOver) return gameOver;
	return (...args) => turn(game, opponent, ...args);
}

function gameOver(newGame) {
	if (newGame) return startGame;
	else return gameOver;
}

module.exports = {
	buildGameboard,
	buildShip,
	createPlayer,
	startGame,
	initializePlayer,
	placeShips,
	turn,
	gameOver,
	nullShip
};
