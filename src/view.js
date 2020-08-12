const adapter = require("./adapter.js");

const newGameButton = (() => {
	const button = adapter.newGameButton;
	button.textContent = "New Game";
	button.addEventListener("click", updateView);
	button.classList.add("new-game-button");
	return button;
})();

const nextButton = () => {
	const button = adapter.nextButton;
	button.addEventListener("click", updateView);
	button.textContent = "Next";
	button.classList.add("next-button");
	return button;
};

const draw = {
	newGame: drawNewGame,
	playerCreation: drawPlayerCreation,
	shipPlacement: drawShipPlacement,
	turn: drawTurn,
	gameOver: drawGameOver,
};

function drawNewGame() {
	document.body.appendChild(newGameButton);
}

function drawPlayerCreation() {
	const playerTypeSelection = document.createElement("div");
	const playerTypes = ["defaultAI", "human"];
	for (let selection of adapter.playerTypeSelection) {
		selection.textContent = playerTypes.pop();
		playerTypeSelection.appendChild(selection);
	}
	document.body.appendChild(adapter.playerNameInput);
	document.body.appendChild(playerTypeSelection);
	document.body.appendChild(nextButton());
}

function drawShipPlacement() {
	drawBoard();
	document.body.appendChild(nextButton());
}

function drawTurn() {
	drawBoard();
}

function drawGameOver() {
	document.body.appendChild(newGameButton);
}

function updateView() {
	document.body.innerHTML = "";
	draw[adapter.phase]();
	console.log(adapter.phase);
}

function drawBoard() {
	const board = adapter.activeBoard;
	if(!board.initialized) initializeBoard(board)
	const boardContainer = document.createElement("div");
	boardContainer.classList.add("board-container");
	board.map((column) => {
		column.map((boardSquare) => {
			boardContainer.appendChild(boardSquare);
		});
	});
	document.body.appendChild(boardContainer);
}

function initializeBoard(board){
	board.map((column) => {
		column.map((boardSquare) => {
			boardSquare.classList.add("board-square");
			boardSquare.addEventListener("click", updateView);
		});
	});
	board.initialized = true;
}

module.exports = updateView;
