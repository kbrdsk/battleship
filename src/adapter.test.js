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

test("clicking new game button calls startGame with blank object", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	expect(battleship.startGame.mock.calls[0][0]).toEqual({});
	battleship.startGame.mockReset();
	adapter.reset();
})

test("clicking new game button sets phase to player creation", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	expect(adapter.phase).toBe("playerCreation");
	adapter.reset();
});

test("clicking new game button initializes name input & type select", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	expect(adapter.playerNameInput).not.toBe(null);
	expect(adapter.playerTypeSelection).not.toBe(null);
	adapter.reset();
});

test("resets after clicking newGameButton", () => {
	let newGameButton = adapter.newGameButton;
	newGameButton.click();
	adapter.reset();
	expect(adapter.newGameButton).not.toBe(null);
	expect(adapter.activeBoard).toBe(null);
	expect(adapter.phase).toBe("newGame");
	expect(adapter.playerNameInput).toBe(null);
	expect(adapter.playerTypeSelection).toBe(null);
	expect(adapter.nextButton).toBe(null);
});
