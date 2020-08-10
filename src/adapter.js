const {
	startGame,
	initializePlayer,
	placeShips,
	turn,
	gameOver,
} = require("./battleship.js");
//const { updateView } = require("./view.js");

let playerType, nextButton, gameFunction, gameState, activePlayer;

/*
let mouseHold;
window.addEventListener("onmousedown", () => {mouseHold = true;})
window.addEventListener("onmouseup", () => {mouseHold = false});*/

const gamePhase = new Map([
	[startGame, { nextFunction: startNewGame, phaseName: "newGame" }],
	[
		initializePlayer,
		{ nextFunction: submitPlayerInfo, phaseName: "playerCreation" },
	],
	[
		placeShips,
		{ nextFunction: submitShipPlacementInfo, phaseName: "shipPlacement" },
	],
	[turn, { nextFunction: submitAttack, phaseName: "turn" }],
	[gameOver, { nextFunction: startNewGame, phaseName: "gameOver" }],
]);

const newGameButton = document.createElement("button");
newGameButton.addEventListener("click", startNewGame);

const playerNameInput = document.createElement("input");

const playerTypeSelection = [
	createTypeSelectButton("human"),
	createTypeSelectButton("defaultAI"),
];

const activeBoard = new Map([
	[null, null],
	["firstPlayer", null],
	["secondPlayer", null],
]);

reset();

function reset() {
	activeBoard.set("firstPlayer", null);
	activeBoard.set("secondPlayer", null);
	playerType = null;
	nextButton = null;
	playerNameInput.value = "";
	gameFunction = startGame;
	gameState = {};
	activePlayer = null;
}

function startNewGame() {
	gameState = {};
	startGame(gameState);
	gameFunction = initializePlayer;
	updateNextButton();
	activePlayer = "firstPlayer";
}

function submitPlayerInfo() {
	initializePlayer(
		gameState,
		activePlayer,
		playerType,
		playerNameInput.value,
		[10, 10],
		10
	);
	activeBoard.set(activePlayer, createBoard(10, 10));
	playerNameInput.value = "";
	playerType = null;
	if (activePlayer === "firstPlayer") {
		activePlayer = "secondPlayer";
		gameFunction = initializePlayer;
		updateNextButton();
	} else if (activePlayer === "secondPlayer") {
		activePlayer = "firstPlayer";
		gameFunction = placeShips;
		updateNextButton();
	}
}

function submitShipPlacementInfo() {
	placeShips(gameState, gameState[activePlayer], playerShipLocations);
	playerShipLocations = [];
	if (activePlayer === "firstPlayer") {
		activePlayer = "secondPlayer";
		updateNextButton();
	} else if (activePlayer === "secondPlayer") {
		activePlayer = "firstPlayer";
		gameFunction = turn;
		updateNextButton();
	}
}

function submitAttack(x, y) {
	try {
		gameFunction = turn(gameState, gameState[activePlayer], [x, y]);
		activePlayer =
			activePlayer === "firstPlayer" ? "secondPlayer" : "firstPlayer";
	} catch (err) {
		if (
			err === "Game is over" ||
			err === "Square has already been attacked"
		);
		else throw err;
	}
}

function updateNextButton() {
	nextButton = document.createElement("button");
	nextButton.addEventListener(
		"click",
		gamePhase.get(gameFunction).nextFunction
	);
}

function createTypeSelectButton(type) {
	const button = document.createElement("button");
	button.addEventListener("click", () => {
		playerType = type;
	});
	return button;
}

function createBoard(width, height) {
	const board = [];
	for (let x = 0; x < width; x++) {
		board.push([]);
		for (let y = 0; y < height; y++) {
			board[x][y] = createBoardSquare(x, y);
		}
	}
	return board;
}

let currentShipStart;
let playerShipLocations = [];

function addShipLocation(start, length, axis, direction) {
	const shipCoords = [start];
	let currentCoord = [...start];
	for (let i = 0; i < length; i++) {
		currentCoord = [...currentCoord];
		currentCoord[axis] += direction;
		shipCoords.push(currentCoord);
	}
	playerShipLocations.push(shipCoords);
}

function submitShipCreation(x, y) {
	const xDelta = x - currentShipStart[0];
	const yDelta = y - currentShipStart[1];
	const axis = Math.abs(xDelta) < Math.abs(yDelta) ? 1 : 0;
	const delta = Math.abs(xDelta) < Math.abs(yDelta) ? yDelta : xDelta;
	const length = Math.abs(delta);
	const direction = delta / Math.abs(delta);
	addShipLocation(currentShipStart, length, axis, direction);
}

function createBoardSquare(x, y) {
	const square = document.createElement("div");
	Object.assign(square, { x, y });
	square.addEventListener("click", () => {
		if(gameFunction === turn ) submitAttack(x, y);
	})
	square.addEventListener("mouseup", () => {
		if (gameFunction === placeShips) submitShipCreation(x, y);
	});
	square.addEventListener("mousedown", () => {
		if (gameFunction === placeShips) currentShipStart = [x, y];
	});
	return square;
}

module.exports = {
	newGameButton,
	get activeBoard() {
		return activeBoard.get(activePlayer);
	},
	get phase() {
		return gamePhase.get(gameFunction).phaseName;
	},
	playerNameInput,
	playerTypeSelection,
	get nextButton() {
		return nextButton;
	},
	reset,
};
