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
		updateSunkShips.call(this);
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

function updateSunkShips() {
	for (let column of this.board)
		for (let square of column)
			if (square.ship.isSunk) square.hitStatus = "sunk";
}

//Player Creation

const attackFunctions = {
	human: () => (coords) => coords,
	defaultAI: aiAttack,
};

const shipLocationGenerators = {
	human: () => {},
	defaultAI: aiShipLocationGenerator,
};

function createPlayer(playerType, playerName) {
	return {
		playerName,
		playerType,
		launchAttack: attackFunctions[playerType],
		generateShipLocations: shipLocationGenerators[playerType],
	};
}

//ai functions

const adjacentDirections = [
	[1, 0],
	[0, -1],
	[-1, 0],
	[0, 1],
];

function aiAttack(boardState) {
	let multiHitFollowUp, oneHitFollowUp, isolatedSquare, defaultGuess;
	let maxIsolation = 1;
	boardState.map((column, x) =>
		column.map((square, y) => {
			if (square.hitStatus === null) {
				defaultGuess = [x, y];
				const adjacentStatuses = scanAdjacentSquares(boardState, x, y);
				if (adjacentStatuses.some((status) => status === null)) {
					const openSquares = adjacentStatuses.map(
						(status, directionIndex) => {
							const [xDelta, yDelta] = adjacentDirections[
								directionIndex
							];
							let isolationIndex = 1;
							let [checkX, checkY] = [x, y];
							while (
								boardState[checkX + xDelta] &&
								boardState[checkX + xDelta][checkY + yDelta] &&
								boardState[checkX + xDelta][checkY + yDelta]
									.hitStatus === null
							) {
								isolationIndex++;
								checkX += xDelta;
								checkY += yDelta;
							}
							return isolationIndex;
						}
					);
					const isolation = openSquares.reduce((n, m) => n * m);
					if (isolation > maxIsolation) {
						maxIsolation = isolation;
						isolatedSquare = [x, y];
					}
				}
				if (adjacentStatuses.some((status) => status === "hit")) {
					adjacentStatuses.map((status, directionIndex) => {
						if (status === "hit") {
							oneHitFollowUp = [x, y];
							const [xDelta, yDelta] = adjacentDirections[
								directionIndex
							].map((delta) => 2 * delta);
							if (
								boardState[x + xDelta] &&
								boardState[x + xDelta][y + yDelta] &&
								boardState[x + xDelta][y + yDelta].hitStatus ===
									"hit"
							)
								multiHitFollowUp = [x, y];
						}
					});
				}
			}
		})
	);
	const attackCoords =
		multiHitFollowUp || oneHitFollowUp || isolatedSquare || defaultGuess;
	return () => attackCoords;
}

function scanAdjacentSquares(boardState, x, y) {
	const adjacentStatuses = [];
	for (let [i, j] of adjacentDirections) {
		if (!boardState[x + i]) adjacentStatuses.push("OOB");
		else if (!boardState[x + i][y + j]) adjacentStatuses.push("OOB");
		else adjacentStatuses.push(boardState[x + i][y + j].hitStatus);
	}
	return adjacentStatuses;
}

/*function aiAttack(boardState){
		let xCoord = boardState.findIndex((column) =>
			column.some((square) => !square.hitStatus)
		);
		let yCoord = boardState[xCoord].findIndex(
			(square) => !square.hitStatus
		);
		return () => [xCoord, yCoord];

}*/

function aiShipLocationGenerator([width, height]) {
	const shipLocations = [];
	for (let length of [5, 4, 3, 3, 2]) {
		const validLocations = findValidShipLocations(
			width,
			height,
			length,
			shipLocations
		);
		const direction = Math.floor(Math.random() * 2);
		const directionName = ["horizontal", "vertical"][direction];
		const locationIndex = Math.floor(
			Math.random() * validLocations[directionName].length
		);
		const start = validLocations[directionName][locationIndex];
		const location = [];
		for (let i = 0; i < length; i++) {
			const coordinate = [...start];
			coordinate[direction] += i;
			location.push(coordinate);
		}
		shipLocations.push(location);
	}
	return shipLocations;
}

function findValidShipLocations(
	boardWidth,
	boardHeight,
	length,
	occupiedLocations
) {
	const occupiedSquares = occupiedLocations.flatMap((location) => location);
	const validShipLocations = { horizontal: [], vertical: [] };
	for (let i = 0; i < boardWidth; i++) {
		const occupiedInColumn = occupiedSquares
			.filter((square) => square[0] === i)
			.map((square) => square[1]);
		for (let j = 0; j < boardHeight - length; j++) {
			if (
				occupiedInColumn.every(
					(index) => index < j || index > j + length - 1
				)
			)
				validShipLocations.vertical.push([i, j]);
		}
	}
	for (let i = 0; i < boardHeight; i++) {
		const occupiedInRow = occupiedSquares
			.filter((square) => square[1] === i)
			.map((square) => square[0]);
		for (let j = 0; j < boardWidth - length; j++) {
			if (
				occupiedInRow.every(
					(index) => index < j || index > j + length - 1
				)
			)
				validShipLocations.horizontal.push([j, i]);
		}
	}
	return validShipLocations;
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
	if (
		player.playerType === "defaultAI" &&
		(!shipLocations || shipLocations.length === 0)
	)
		shipLocations = player.generateShipLocations([10, 10]);
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
	nullShip,
};
