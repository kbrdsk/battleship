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
	for (let selection of adapter.playerTypeSelection) {
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
	const boardContainer = document.createElement("div");
	boardContainer.classList.add("board-container");
	adapter.activeBoard.map((column) => {
		column.map((boardSquare) => {
			if (!boardSquare.classList.contains("board-square")) {
				boardSquare.classList.add("board-square");
			}
			boardContainer.appendChild(boardSquare);
		});
	});
	document.body.appendChild(boardContainer);
}

module.exports = updateView;
