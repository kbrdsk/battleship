const adapter = require("./adapter.js");

jest.mock("./view.js", () => {
	return { updateView: () => {} };
});
jest.mock("./battleship.js", () => {
	return {
		startGame: jest.fn(),
		initializePlayer: jest.fn(),
		placeShips: jest.fn(),
		turn: jest.fn(),
		gameOver: jest.fn(),
	};
});

const battleship = require("./battleship.js");

battleship.startGame.mockImplementation(() => battleship.initializePlayer);
battleship.initializePlayer.mockImplementation((...[, player]) =>
	player === "firstPlayer"
		? battleship.initializePlayer
		: battleship.placeShips
);
battleship.placeShips.mockImplementation((...[, player]) =>
	player === "firstPlayer" ? battleship.placeShips : battleship.turn
);
battleship.turn.mockImplementation((game, player, attackCoords) => {
	if (!game[player]) game[player] = { attackedSquares: [] };
	if (game[player].attackedSquares.includes(attackCoords.toString()))
		throw "Square has already been attacked";
	game[player].attackedSquares.push(attackCoords.toString());
	return battleship.turn;
});

afterEach(() => {
	adapter.reset();
	jest.resetAllMocks();
});

function selectShip(board, startPosition, length, axis, direction) {
	const currentPosition = { ...startPosition };
	board[startPosition.x][startPosition.y].dispatchEvent(
		new MouseEvent("mousedown")
	);
	for (let i = 0; i < length - 1; i++) {
		board[currentPosition.x][currentPosition.y].dispatchEvent(
			new MouseEvent("mouseleave")
		);
		currentPosition[axis] += direction;
		board[currentPosition.x][currentPosition.y].dispatchEvent(
			new MouseEvent("mouseenter")
		);
	}
	board[currentPosition.x][currentPosition.y].dispatchEvent(
		new MouseEvent("mouseup")
	);
	return currentPosition;
}

function changeLocation(board, startPosition, endPosition) {
	const currentPosition = { ...startPosition };
	const direction = {};
	for (let axis of ["x", "y"]) {
		direction[axis] =
			(endPosition[axis] - startPosition[axis]) /
			Math.abs(endPosition[axis] - startPosition[axis]);
		while (currentPosition[axis] !== endPosition[axis]) {
			board[currentPosition.x][currentPosition.y].dispatchEvent(
				new MouseEvent("mouseleave")
			);
			currentPosition[axis] += direction[axis];
			board[currentPosition.x][currentPosition.y].dispatchEvent(
				new MouseEvent("mouseenter")
			);
		}
	}
	return currentPosition;
}

test("launching an invalid attack does not change active player", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();

	const game = battleship.startGame.mock.calls[0][0];
	game.firstPlayer = "first player dummy";
	game.secondPlayer = "second player dummy";

	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	adapter.playerNameInput.value = "Alice";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	const board = adapter.activeBoard;

	board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
	let currentPosition = { x: 0, y: 0 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	adapter.nextButton.click();

	currentPosition = { x: 5, y: 2 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	selectShip(board, currentPosition, 2, "y", -1);
	adapter.nextButton.click();

	board[1][0].click();
	board[5][2].click();
	board[1][0].click();
	board[2][0].click();

	expect(battleship.turn.mock.calls[3]).toEqual([
		game,
		game.firstPlayer,
		[2, 0],
	]);
});

test("clicking a square calls turn with correct inputs (second player)", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();

	const game = battleship.startGame.mock.calls[0][0];
	game.firstPlayer = "first player dummy";
	game.secondPlayer = "second player dummy";

	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	adapter.playerNameInput.value = "Alice";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	const board = adapter.activeBoard;

	board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
	let currentPosition = { x: 0, y: 0 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	adapter.nextButton.click();

	currentPosition = { x: 5, y: 2 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	selectShip(board, currentPosition, 2, "y", -1);
	adapter.nextButton.click();

	board[1][0].click();
	board[5][2].click();

	expect(battleship.turn.mock.calls[1]).toEqual([
		game,
		game.secondPlayer,
		[5, 2],
	]);
});

test("clicking a square calls turn with correct inputs (first player)", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();

	const game = battleship.startGame.mock.calls[0][0];
	game.firstPlayer = "first player dummy";
	game.secondPlayer = "second player dummy";

	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	adapter.playerNameInput.value = "Alice";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	const board = adapter.activeBoard;

	board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
	let currentPosition = { x: 0, y: 0 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	adapter.nextButton.click();

	currentPosition = { x: 5, y: 2 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	selectShip(board, currentPosition, 2, "y", -1);
	adapter.nextButton.click();

	board[1][0].click();

	expect(battleship.turn.mock.calls[0]).toEqual([
		game,
		game.firstPlayer,
		[1, 0],
	]);
});

test("clicking next at second player ship placement sets phase to turn", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();

	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	adapter.playerNameInput.value = "Alice";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	const board = adapter.activeBoard;

	board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
	let currentPosition = { x: 0, y: 0 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	adapter.nextButton.click();

	currentPosition = { x: 5, y: 2 };
	currentPosition = selectShip(board, currentPosition, 3, "x", 1);
	selectShip(board, currentPosition, 2, "y", -1);
	adapter.nextButton.click();

	expect(adapter.phase).toBe("turn");
});

test(
	"submitting ships for at second player ship placement" +
		"correctly assigns them to second player",
	() => {
		const newGameButton = adapter.newGameButton;
		newGameButton.click();

		const game = battleship.startGame.mock.calls[0][0];
		game.firstPlayer = "first player dummy";
		game.secondPlayer = "second player dummy";

		adapter.playerNameInput.value = "Boyega";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();

		adapter.playerNameInput.value = "Alice";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();

		const board = adapter.activeBoard;

		board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
		let currentPosition = { x: 0, y: 0 };
		currentPosition = selectShip(board, currentPosition, 3, "x", 1);
		adapter.nextButton.click();

		currentPosition = { x: 5, y: 2 };
		selectShip(board, currentPosition, 3, "x", 1);
		adapter.nextButton.click();

		expect(battleship.placeShips.mock.calls[1][1]).toBe(game.secondPlayer);
	}
);

test("moving along different axis during ship placement", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();

	const game = battleship.startGame.mock.calls[0][0];

	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	adapter.playerNameInput.value = "Alice";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();

	const board = adapter.activeBoard;

	board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
	let currentPosition = { x: 5, y: 2 };
	board[currentPosition.x][currentPosition.y].dispatchEvent(
		new MouseEvent("mousedown")
	);
	currentPosition = changeLocation(board, currentPosition, { x: 3, y: 2 });
	currentPosition = changeLocation(board, currentPosition, { x: 9, y: 5 });
	currentPosition = changeLocation(board, currentPosition, { x: 7, y: 2 });
	board[currentPosition.x][currentPosition.y].dispatchEvent(
		new MouseEvent("mouseup")
	);

	currentPosition = changeLocation(board, currentPosition, { x: 7, y: 3 });
	board[currentPosition.x][currentPosition.y].dispatchEvent(
		new MouseEvent("mousedown")
	);

	currentPosition = changeLocation(board, currentPosition, { x: 0, y: 0 });
	currentPosition = changeLocation(board, currentPosition, { x: 7, y: 7 });
	board[currentPosition.x][currentPosition.y].dispatchEvent(
		new MouseEvent("mouseup")
	);
	adapter.nextButton.click();

	expect(battleship.placeShips.mock.calls[0]).toEqual([
		game,
		game.firstPlayer,
		[
			[
				[5, 2],
				[6, 2],
				[7, 2],
			],
			[
				[7, 3],
				[7, 4],
				[7, 5],
				[7, 6],
				[7, 7],
			],
		],
	]);
});

test(
	"clicking next at second player ship placement calls placeShips" +
		" with correct inputs",
	() => {
		const newGameButton = adapter.newGameButton;
		newGameButton.click();

		const game = battleship.startGame.mock.calls[0][0];

		adapter.playerNameInput.value = "Boyega";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();

		adapter.playerNameInput.value = "Alice";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();

		const board = adapter.activeBoard;

		board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
		let currentPosition = { x: 0, y: 0 };
		currentPosition = selectShip(board, currentPosition, 3, "x", 1);
		currentPosition = changeLocation(board, currentPosition, {
			x: 3,
			y: 2,
		});
		currentPosition = selectShip(board, currentPosition, 2, "y", 1);
		currentPosition = changeLocation(board, currentPosition, {
			x: 9,
			y: 9,
		});
		selectShip(board, currentPosition, 4, "x", -1);
		adapter.nextButton.click();

		currentPosition = { x: 5, y: 2 };
		currentPosition = selectShip(board, currentPosition, 3, "x", 1);
		currentPosition = changeLocation(board, currentPosition, {
			x: 7,
			y: 3,
		});
		currentPosition = selectShip(board, currentPosition, 5, "y", 1);
		currentPosition = changeLocation(board, currentPosition, {
			x: 4,
			y: 7,
		});
		selectShip(board, currentPosition, 2, "y", -1);
		adapter.nextButton.click();

		expect(battleship.placeShips.mock.calls[1]).toEqual([
			game,
			game.secondPlayer,
			[
				[
					[5, 2],
					[6, 2],
					[7, 2],
				],
				[
					[7, 3],
					[7, 4],
					[7, 5],
					[7, 6],
					[7, 7],
				],
				[
					[4, 7],
					[4, 6],
				],
			],
		]);
	}
);

test(
	"clicking next at first player ship placement calls placeShips" +
		" with correct inputs",
	() => {
		const newGameButton = adapter.newGameButton;
		newGameButton.click();

		const game = battleship.startGame.mock.calls[0][0];

		adapter.playerNameInput.value = "Boyega";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();

		adapter.playerNameInput.value = "Alice";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();

		const board = adapter.activeBoard;

		board[0][0].dispatchEvent(new MouseEvent("mouseenter"));
		let currentPosition = { x: 0, y: 0 };
		currentPosition = selectShip(board, currentPosition, 3, "x", 1);
		currentPosition = changeLocation(board, currentPosition, {
			x: 7,
			y: 3,
		});
		currentPosition = selectShip(board, currentPosition, 2, "y", -1);
		currentPosition = changeLocation(board, currentPosition, {
			x: 9,
			y: 9,
		});
		selectShip(board, currentPosition, 4, "x", -1);
		adapter.nextButton.click();

		expect(battleship.placeShips.mock.calls[0]).toEqual([
			game,
			game.firstPlayer,
			[
				[
					[0, 0],
					[1, 0],
					[2, 0],
				],
				[
					[7, 3],
					[7, 2],
				],
				[
					[9, 9],
					[8, 9],
					[7, 9],
					[6, 9],
				],
			],
		]);
	}
);

test(
	"clicking next at second player initializes 10 x 10 array of items that" +
		"have events for click, mousenter, mouseup, and mousedown",
	() => {
		const newGameButton = adapter.newGameButton;
		newGameButton.click();
		adapter.playerNameInput.value = "Boyega";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();
		adapter.playerNameInput.value = "Alice";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();
		expect(adapter.activeBoard.length).toBe(10);
		adapter.activeBoard.map((column) => expect(column.length).toBe(10));
		adapter.activeBoard.map((column) =>
			column.map((square) => {
				expect(() => square.click()).not.toThrow();
				expect(() =>
					square.dispatchEvent(new MouseEvent("mouseenter"))
				).not.toThrow();
				expect(() =>
					square.dispatchEvent(new MouseEvent("mouseup"))
				).not.toThrow();
				expect(() =>
					square.dispatchEvent(new MouseEvent("mousedown"))
				).not.toThrow();
			})
		);
	}
);

test("clicking next at second player sets phase to ship creation", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();
	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();
	adapter.playerNameInput.value = "Alice";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();
	expect(adapter.phase).toBe("shipPlacement");
});

test(
	"clicking next at second player creation calls initialize player" +
		" with correct inputs",
	() => {
		const newGameButton = adapter.newGameButton;
		newGameButton.click();
		const game = battleship.startGame.mock.calls[0][0];
		adapter.playerNameInput.value = "Boyega";
		adapter.playerTypeSelection[0].click();
		adapter.nextButton.click();
		adapter.playerNameInput.value = "Alice";
		adapter.playerTypeSelection[1].click();
		adapter.nextButton.click();
		expect(battleship.initializePlayer.mock.calls[1]).toEqual([
			game,
			"secondPlayer",
			"defaultAI",
			"Alice",
			[10, 10],
			10,
		]);
	}
);

test("clicking next at first player creation calls initialize player with correct inputs", () => {
	const newGameButton = adapter.newGameButton;
	newGameButton.click();
	const game = battleship.startGame.mock.calls[0][0];
	adapter.playerNameInput.value = "Boyega";
	adapter.playerTypeSelection[0].click();
	adapter.nextButton.click();
	expect(battleship.initializePlayer.mock.calls[0]).toEqual([
		game,
		"firstPlayer",
		"human",
		"Boyega",
		[10, 10],
		10,
	]);
});

test("clicking new game button calls startGame with blank object", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	expect(battleship.startGame.mock.calls[0][0]).toEqual({});
});

test("resets after clicking newGameButton", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	adapter.reset();
	expect(adapter.newGameButton).not.toBe(null);
	expect(adapter.activeBoard).toBe(null);
	expect(adapter.phase).toBe("newGame");
	expect(adapter.nextButton).toBe(null);
});

test("clicking new game button initializes name input & type select", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	expect(adapter.playerNameInput).not.toBe(null);
	expect(adapter.playerTypeSelection).not.toBe(null);
});

test("clicking new game button sets phase to player creation", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	expect(adapter.phase).toBe("playerCreation");
});
