let { buildShip, buildGameboard, createPlayer } = require("./battleship.js");

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

describe("createPlayer", () => {
	it("constructed with plalyerName property", () => {
		expect(createPlayer("defaultAI", "Alice").playerName).toBe("Alice");
		expect(createPlayer("human", "Boyega").playerName).toBe("Boyega");
	});

	it("human io function always returns input", () => {
		const testBoard = new Array(10)
			.fill(null)
			.map(() => new Array(10).fill(null));
		testBoard[1][5] = "hit";
		testBoard[1][4] = "hit";
		testBoard[3][6] = "miss";
		testBoard[0][0] = "miss";
		const boyega = createPlayer("human", "Boyega");
		expect(boyega.launchAttack(testBoard)([0, 5])).toEqual([0, 5]);
		expect(boyega.launchAttack(testBoard)([1, 1])).toEqual([1, 1]);
	});

	it("ai io function only returns coordinates of unattacked squares", () => {
		const testBoard = new Array(10)
			.fill(null)
			.map(() => new Array(10).fill(null));
		testBoard[1][5] = "hit";
		testBoard[1][4] = "hit";
		testBoard[3][6] = "miss";
		testBoard[0][0] = "miss";
		const alice = createPlayer("defaultAI", "Alice");
		while(testBoard.some(column => column.some(square => !square))){
			let [xCoord, yCoord] = alice.launchAttack(testBoard)();
			expect(testBoard[xCoord][yCoord]).toBe(null);
			testBoard[xCoord][yCoord] = "miss";
		}
	});
});

xdescribe("io", () => {});
