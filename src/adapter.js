const {
	startGame,
	initializePlayer,
	placeShips,
	turn,
	gameOver,
} = require("./battleship.js");
const { updateView } = require("./view.js");

let gamePhase = "newGame";
let activeBoard = null;
let playerNameInput = null;
let playerTypeSelection = null;
let nextButton = null;

const newGameButton = document.createElement("button");
newGameButton.addEventListener("click", () => {
	const game = {};
	startGame(game);
	gamePhase = "playerCreation";
	playerNameInput = createNameInput();
	playerTypeSelection = createTypeSelection();
})

function createNameInput(){
	return document.createElement("input");
}

function createTypeSelection(){
	return [];
}

function reset() {
	gamePhase = "newGame";
	activeBoard = null;
	playerNameInput = null;
	playerTypeSelection = null;
}

module.exports = {
	get newGameButton() {
		return newGameButton;
	},
	get activeBoard() {
		return activeBoard;
	},
	get phase() {
		return gamePhase;
	},
	get playerNameInput() {
		return playerNameInput;
	},
	get playerTypeSelection() {
		return playerTypeSelection;
	},
	get nextButton() {
		return nextButton;
	},
	reset,
};
