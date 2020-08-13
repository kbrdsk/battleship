const adapter = require("./adapter.js");
/*const {nullShip} = require("./battleship.js");*/

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

function updateView() {
	document.body.innerHTML = "";
	document.body.setAttribute("phase", adapter.phase);
	draw[adapter.phase]();
	console.log(adapter.phase);
}

function drawNewGame() {
	document.body.appendChild(newGameButton);
}

function drawPlayerCreation() {
	const playerTypeSelection = document.createElement("div");
	const playerTypes = ["defaultAI", "human"];
	for (let selection of adapter.playerTypeSelection) {
		selection.textContent = playerTypes.pop();
		selection.classList.add("player-type-selection-button");
		playerTypeSelection.appendChild(selection);
	}
	document.body.appendChild(adapter.playerNameInput);
	document.body.appendChild(playerTypeSelection);
	document.body.appendChild(nextButton());
}

function initializeBoard(board) {
	board.map((column, x) => {
		column.map((boardSquare, y) => {
			boardSquare.classList.add("board-square");
			boardSquare.addEventListener("click", () => {
				if (adapter.phase === "turn" || adapter.phase === "gameOver")
					updateTurnView(board);
			});
			boardSquare.addEventListener("mousedown", () => {
				if (adapter.phase === "shipPlacement") {
					startShipIndicator(x, y);
					updateShipPlacementView(x, y);
				}
			});
			boardSquare.addEventListener("mouseup", () => {
				if (
					adapter.phase === "shipPlacement" &&
					activePlacementIndicator
				)
					endShipIndicator();
			});
			boardSquare.addEventListener("mouseenter", () => {
				if (adapter.phase === "shipPlacement")
					updateShipPlacementView(x, y);
			});
		});
	});
	board.initialized = true;
}

function drawBoard() {
	const board = adapter.activeBoard;
	if (!board.initialized) initializeBoard(board);
	const boardContainer = document.createElement("div");
	boardContainer.classList.add("board-container");
	board.map((column) => {
		column.map((boardSquare) => {
			boardContainer.appendChild(boardSquare);
		});
	});
	document.body.appendChild(boardContainer);
}

function drawShipPlacement() {
	drawBoard();
	document.body.appendChild(nextButton());
}

let shipPlacementAnchor = [];
let activePlacementIndicator = false;

document.addEventListener("mouseup", () => {
	if (adapter.phase === "shipPlacement" && activePlacementIndicator) {
		clearShipIndicator();
		endShipIndicator();
	}
});

function updateShipPlacementView(x, y) {
	clearShipIndicator();
	if (activePlacementIndicator) {
		const xDelta = x - shipPlacementAnchor[0];
		const yDelta = y - shipPlacementAnchor[1];
		const axis = Math.abs(xDelta) < Math.abs(yDelta) ? 1 : 0;
		const delta = Math.abs(xDelta) < Math.abs(yDelta) ? yDelta : xDelta;
		const length = Math.abs(delta);
		const direction = delta / Math.abs(delta);
		let currentCoord = [...shipPlacementAnchor];
		for (let i = 0; i <= length; i++) {
			const square =
				adapter.activeBoard[currentCoord[0]][currentCoord[1]];
			if (square.classList.contains("ship-indicator")) break;
			square.classList.add("ship-placement-indicator");
			currentCoord[axis] += direction;
		}
	}
}

function startShipIndicator(x, y) {
	shipPlacementAnchor = [x, y];
	activePlacementIndicator = true;
	updateShipPlacementView();
}

function endShipIndicator() {
	shipPlacementAnchor = [];
	activePlacementIndicator = false;
	adapter.activeBoard.map((column) =>
		column.map((square) => {
			if (square.classList.contains("ship-placement-indicator"))
				square.classList.add("ship-indicator");
		})
	);
	clearShipIndicator();
}

function clearShipIndicator() {
	adapter.activeBoard.map((column) => {
		column.map((boardSquare) => {
			boardSquare.classList.remove("ship-placement-indicator");
		});
	});
}

function drawTurn() {
	drawBoard();
}

function updateTurnView(board) {
	document.body.setAttribute("attacking", true);
	board.map((column, x) =>
		column.map((boardSquare, y) => {
			boardSquare.setAttribute(
				"hit-status",
				adapter.gameState[adapter.activePlayer].gameboard.boardState[x][
					y
				].hitStatus
			);
			/*if(adapter.gameState[adapter.activePlayer].gameboard.boardState[x][y].ship !== nullShip)
			boardSquare.classList.add("ship-indicator");*/
		})
	);
	setTimeout(() => {
		document.body.setAttribute("attacking", false);
		updateView();
		if (
			adapter.gameState[adapter.activePlayer].playerType ===
				"defaultAI" &&
			adapter.phase === "turn"
		) {
			const aiBoard = adapter.activeBoard;
			adapter.submitAttack();
			updateTurnView(aiBoard);
		}
	}, 1500);
}

function drawGameOver() {
	const winner =
		adapter.activePlayer === "firstPlayer" ? "secondPlayer" : "firstPlayer";
	alert(`Game Over!\n` + `${adapter.gameState[winner].playerName} wins!`);
	document.body.appendChild(newGameButton);
}

module.exports = updateView;
