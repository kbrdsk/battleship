let {
	buildShip,
	buildGameboard,
	createPlayer,
	startGame,
	gameOver,
} = require("./battleship.js");

describe("ship object", () => {
	it("has length property", () => {
		expect(buildShip(4).length).toBeDefined();
	});

	it("initializes with length passed to constructor", () => {
		expect(buildShip(4).length).toBe(4);
	});

	it("has hit() method", () => {
		expect(buildShip(3).hit).toBeDefined();
	});

	it("has isSunk property", () => {
		expect(buildShip(3).isSunk).toBeDefined();
	});

	it("hit returns true when a new hit is registered", () => {
		expect(buildShip(3).hit()).toBe(true);
	});

	it("hit returns false when no new hit is registered", () => {
		let testShip = buildShip(3);
		for (let i = 0; i < 3; i++) testShip.hit();
		expect(testShip.hit()).toBe(false);
	});

	it("initializes with isSunk as false", () => {
		expect(buildShip(3).isSunk).toBe(false);
	});

	it("isSunk property is false when hit less times than length", () => {
		let testShip = buildShip(3);
		testShip.hit();
		testShip.hit();
		expect(testShip.isSunk).toBe(false);
	});

	it("returns sunk once number of hits equal length", () => {
		let testShip = buildShip(3);
		for (let i = 0; i < 3; i++) testShip.hit();
		expect(testShip.isSunk).toBe(true);
	});
});

describe("gameboard object with ship integration", () => {
	it("has factory that is passed two numbers", () => {
		expect(buildGameboard(20, 20)).toBeDefined();
	});

	it("has a placeShip method", () => {
		expect(buildGameboard(20, 20).placeShip).toBeDefined();
	});

	it("placeShip method takes an array of coordinates", () => {
		let gameboard = buildGameboard(20, 20);
		expect(() =>
			gameboard.placeShip([
				[0, 0],
				[0, 1],
				[0, 2],
			])
		).not.toThrow();
	});

	it("length of shipList increases with each new ship", () => {
		let gameboard = buildGameboard(20, 20);
		gameboard.placeShip([
			[0, 0],
			[0, 1],
		]);
		expect(gameboard.shipList.length).toBe(1);
		gameboard.placeShip([
			[1, 1],
			[1, 2],
		]);
		expect(gameboard.shipList.length).toBe(2);
	});

	it("has receiveAttack method", () => {
		let gameboard = buildGameboard(20, 20);
		expect(gameboard.receiveAttack).toBeDefined();
	});

	it("receive attack method returns 'hit' on valid hit", () => {
		let gameboard = buildGameboard(20, 20);
		gameboard.placeShip([
			[0, 0],
			[0, 1],
		]);
		expect(gameboard.receiveAttack([0, 0])).toBe("hit");
	});

	it("receive attack method returns 'miss' on valid miss", () => {
		let gameboard = buildGameboard(20, 20);
		gameboard.placeShip([
			[0, 0],
			[0, 1],
		]);
		expect(gameboard.receiveAttack([1, 1])).toBe("miss");
	});

	it("receiveAttack throws when attempting to attack a hit square", () => {
		let gameboard = buildGameboard(20, 20);
		gameboard.placeShip([
			[0, 0],
			[0, 1],
		]);
		gameboard.receiveAttack([0, 0]);
		expect(() => gameboard.receiveAttack([0, 0])).toThrow();
	});

	it("receiveAttack throws when attempting to attack a missed square", () => {
		let gameboard = buildGameboard(20, 20);
		gameboard.placeShip([
			[0, 0],
			[0, 1],
		]);
		gameboard.receiveAttack([1, 1]);
		expect(() => gameboard.receiveAttack([1, 1])).toThrow();
	});

	it("gameOver is false if ships unsunk ships are left", () => {
		let gameboard = buildGameboard(20, 20);
		gameboard.placeShip([
			[0, 0],
			[0, 1],
		]);
		expect(gameboard.gameOver).toBe(false);
	});

	it("attacking the same ship enough times will sink it", () => {
		let gameboard = buildGameboard(20, 20);
		let shipCoords1 = [
			[0, 0],
			[0, 1],
		];
		let shipCoords2 = [
			[1, 0],
			[1, 1],
		];
		gameboard.placeShip(shipCoords1);
		gameboard.placeShip(shipCoords2);
		for (let coord of shipCoords1) gameboard.receiveAttack(coord);
		expect(gameboard.shipList.some((ship) => ship.isSunk)).toBe(true);
		expect(gameboard.shipList.every((ship) => ship.isSunk)).toBe(false);
	});

	it("gameOver is true when all ships are sunk", () => {
		let gameboard = buildGameboard(20, 20);
		let shipCoords = [
			[0, 0],
			[0, 1],
		];
		gameboard.placeShip(shipCoords);
		for (let coord of shipCoords) gameboard.receiveAttack(coord);
		expect(gameboard.gameOver).toBe(true);
	});

	it("sinking one ship does not cause gameOver to falsely trigger", () => {
		let gameboard = buildGameboard(20, 20);
		let shipCoords1 = [
			[0, 0],
			[0, 1],
		];
		let shipCoords2 = [
			[1, 0],
			[1, 1],
		];
		gameboard.placeShip(shipCoords1);
		gameboard.placeShip(shipCoords2);
		for (let coord of shipCoords1) gameboard.receiveAttack(coord);
		expect(gameboard.gameOver).toBe(false);
	});

	it("receive attack method throws after gameover", () => {
		let gameboard = buildGameboard(20, 20);
		let shipCoords = [
			[0, 0],
			[0, 1],
		];
		gameboard.placeShip(shipCoords);
		for (let coord of shipCoords) gameboard.receiveAttack(coord);
		expect(() => gameboard.receiveAttack([1, 1])).toThrow();
	});
});

describe("player", () => {
	it("constructed with playerName property", () => {
		expect(createPlayer("defaultAI", "Alice").playerName).toBe("Alice");
		expect(createPlayer("human", "Boyega").playerName).toBe("Boyega");
	});

	it("human io function always returns input", () => {
		const testBoard = new Array(10)
			.fill(null)
			.map(() => new Array(10).fill(null).map(() => Object.create(null)));
		testBoard[1][5].hitStatus = "hit";
		testBoard[1][4].hitStatus = "hit";
		testBoard[3][6].hitStatus = "miss";
		testBoard[0][0].hitStatus = "miss";
		const boyega = createPlayer("human", "Boyega");
		expect(boyega.launchAttack(testBoard)([0, 5])).toEqual([0, 5]);
		expect(boyega.launchAttack(testBoard)([1, 1])).toEqual([1, 1]);
	});

	it("ai io function only returns coordinates of unattacked squares", () => {
		const testBoard = new Array(10).fill(null).map(() =>
			new Array(10).fill(null).map(() => {
				const square = Object.create(null);
				square.hitStatus = null;
				return square;
			})
		);
		testBoard[1][5].hitStatus = "hit";
		testBoard[1][4].hitStatus = "hit";
		testBoard[3][6].hitStatus = "miss";
		testBoard[0][0].hitStatus = "miss";
		const alice = createPlayer("defaultAI", "Alice");
		while (
			testBoard.some((column) =>
				column.some((square) => !square.hitStatus)
			)
		) {
			let [xCoord, yCoord] = alice.launchAttack(testBoard)();
			expect(testBoard[xCoord][yCoord].hitStatus).toBe(null);
			testBoard[xCoord][yCoord].hitStatus = "miss";
		}
	});

	xit("ai has a ship placement function", () => {
		const alice = createPlayer("defaultAI", "Alice");
		expect(alice.placeShips([10, 10])).toBeDefined();
	});
});

describe("game loop", () => {
	it("game ends appropriately when first player wins", () => {
		const game = {};
		const firstBoard = startGame(game);
		const secondBoard = firstBoard("human", "Boyega", [20, 20], 1);
		const placeFirst = secondBoard("human", "Alice", [20, 20], 1);
		const placeSecond = placeFirst([
			[
				[0, 2],
				[0, 3],
				[0, 4],
			],
		]);
		const turns = placeSecond([
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
		]);

		expect(turns([0, 0])([0, 0])([1, 0])([0, 2])([2, 0])).toBe(gameOver);
	});

	it("game ends appropriately when second player wins", () => {
		const game = {};
		const firstBoard = startGame(game);
		const secondBoard = firstBoard("human", "Boyega", [20, 20], 1);
		const placeFirst = secondBoard("human", "Alice", [20, 20], 1);
		const placeSecond = placeFirst([
			[
				[0, 2],
				[0, 3],
				[0, 4],
			],
		]);
		const turns = placeSecond([
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
		]);
		expect(
			turns([0, 0])([0, 0])([1, 0])([0, 2])([3, 0])([0, 3])([4, 0])([
				0,
				4,
			])
		).toBe(gameOver);
	});

	it("game ends appropriately when ai wins as second player", () => {
		const game = {};
		const firstBoard = startGame(game);
		const secondBoard = firstBoard("human", "Boyega", [20, 20], 1);
		const placeFirst = secondBoard("defaultAI", "Alice", [20, 20], 1);
		const placeSecond = placeFirst([
			[
				[0, 2],
				[0, 3],
				[0, 4],
			],
		]);
		const turns = placeSecond([
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
		]);
		expect(turns([0, 0])()([1, 0])()([3, 0])()([1, 1])()([2, 2])()).toBe(
			gameOver
		);
	});
	it("simple game human vs human", () => {
		const game = {};
		const firstBoard = startGame(game);
		const secondBoard = firstBoard("human", "Boyega", [20, 20], 1);
		const placeFirst = secondBoard("human", "Alice", [20, 20], 1);
		const placeSecond = placeFirst([
			[
				[0, 2],
				[0, 3],
				[0, 4],
			],
		]);
		const turns = placeSecond([
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
		]);
		expect(turns([0, 0])([0, 0])([1, 0])([0, 2])([2, 0])).toBe(gameOver);

		const firstPlayerEndboard = new Array(20)
			.fill(null)
			.map(() => new Array(20).fill(null));
		firstPlayerEndboard[0][0] = "miss";
		firstPlayerEndboard[0][2] = "hit";
		expect(
			game.firstPlayer.gameboard.boardState.map((column) =>
				column.map((square) => square.hitStatus)
			)
		).toEqual(firstPlayerEndboard);

		const secondPlayerEndboard = new Array(20)
			.fill(null)
			.map(() => new Array(20).fill(null));
		secondPlayerEndboard[0][0] = "hit";
		secondPlayerEndboard[1][0] = "hit";
		secondPlayerEndboard[2][0] = "hit";
		expect(
			game.secondPlayer.gameboard.boardState.map((column) =>
				column.map((square) => square.hitStatus)
			)
		).toEqual(secondPlayerEndboard);
	});

	it("simple game human vs ai", () => {
		const game = {};
		const firstBoard = startGame(game);
		const secondBoard = firstBoard("human", "Boyega", [20, 20], 1);
		const placeFirst = secondBoard("defaultAI", "Alice", [20, 20], 1);
		const placeSecond = placeFirst([
			[
				[0, 2],
				[0, 3],
				[0, 4],
			],
		]);
		const turns = placeSecond([
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
		]);
		expect(turns([0, 0])()([1, 0])()([2, 0])).toBe(gameOver);

		const firstPlayerEndboard = new Array(20)
			.fill(null)
			.map(() => new Array(20).fill(null));
		firstPlayerEndboard[0][0] = "miss";
		firstPlayerEndboard[0][1] = "miss";
		expect(
			game.firstPlayer.gameboard.boardState.map((column) =>
				column.map((square) => square.hitStatus)
			)
		).toEqual(firstPlayerEndboard);

		const secondPlayerEndboard = new Array(20)
			.fill(null)
			.map(() => new Array(20).fill(null));
		secondPlayerEndboard[0][0] = "hit";
		secondPlayerEndboard[1][0] = "hit";
		secondPlayerEndboard[2][0] = "hit";
		expect(
			game.secondPlayer.gameboard.boardState.map((column) =>
				column.map((square) => square.hitStatus)
			)
		).toEqual(secondPlayerEndboard);
	});

	function testGame(turnFunction, firstPlayerTurns, secondPlayerTurns) {
		let gameFunction = turnFunction;
		for (
			let i = 0;
			i < Math.max(firstPlayerTurns.length, secondPlayerTurns.length);
			i++
		) {
			gameFunction = gameFunction(firstPlayerTurns[i]);
			if (secondPlayerTurns[i])
				gameFunction = gameFunction(secondPlayerTurns[i]);
		}
		return gameFunction;
	}

	it("human vs human with multiple ships", () => {
		const game = {};
		const firstBoard = startGame(game);
		const secondBoard = firstBoard("human", "Boyega", [20, 20], 1);
		const placeFirst = secondBoard("human", "Alice", [20, 20], 1);
		const placeSecond = placeFirst([
			[
				[0, 2],
				[0, 3],
				[0, 4],
			],
			[
				[10, 15],
				[11, 15],
				[12, 15],
				[13, 15],
			],
		]);
		const turn = placeSecond([
			[
				[0, 0],
				[1, 0],
				[2, 0],
			],
			[
				[16, 19],
				[17, 19],
				[18, 19],
				[19, 19],
			],
		]);

		const secondPlayerTurns = [
			[0, 2],
			[0, 3],
			[0, 4],
			[19, 3],
			[11, 15],
			[12, 15],
		];
		const firstPlayerTurns = [
			[0, 0],
			[1, 0],
			[2, 0],
			[16, 19],
			[17, 19],
			[18, 19],
			[19, 19],
		];
		expect(testGame(turn, firstPlayerTurns, secondPlayerTurns)).toBe(
			gameOver
		);

		const firstPlayerEndboard = new Array(20)
			.fill(null)
			.map(() => new Array(20).fill(null));
		firstPlayerEndboard[0][2] = "hit";
		firstPlayerEndboard[0][3] = "hit";
		firstPlayerEndboard[0][4] = "hit";
		firstPlayerEndboard[19][3] = "miss";
		firstPlayerEndboard[11][15] = "hit";
		firstPlayerEndboard[12][15] = "hit";
		expect(
			game.firstPlayer.gameboard.boardState.map((column) =>
				column.map((square) => square.hitStatus)
			)
		).toEqual(firstPlayerEndboard);

		const secondPlayerEndboard = new Array(20)
			.fill(null)
			.map(() => new Array(20).fill(null));
		secondPlayerEndboard[0][0] = "hit";
		secondPlayerEndboard[1][0] = "hit";
		secondPlayerEndboard[2][0] = "hit";
		secondPlayerEndboard[16][19] = "hit";
		secondPlayerEndboard[17][19] = "hit";
		secondPlayerEndboard[18][19] = "hit";
		secondPlayerEndboard[19][19] = "hit";
		expect(
			game.secondPlayer.gameboard.boardState.map((column) =>
				column.map((square) => square.hitStatus)
			)
		).toEqual(secondPlayerEndboard);

		expect(
			game.firstPlayer.gameboard.shipList.map((ship) => ship.isSunk)
		).toEqual([true, false]);
	});
});
