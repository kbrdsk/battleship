const adapter = require("./adapter.js");

const newGameButton = (() => {
	const button = adapter.newGameButton;
	button.textContent = "New Game";
	button.addEventListener("click", updateView);
	return button;
})();

const nextButton = () => {
	const button = adapter.nextButton;
	button.addEventListener("click", updateView);
	button.textCotnent = "Next";
	return button;
}

const draw = {
	newGame: drawNewGame,
	playerCreation: drawPlayerCreation,
	shipPlacement: drawShipPlacement,
	turn: drawTurn,
	gameOver: drawGameOver,
}

function updateView() {
	document.body.innerHTML = "";
	draw[adapter.phase]();
	console.log(adapter.phase);
}

function drawNewGame(){
	document.body.appendChild(newGameButton);
}

function drawPlayerCreation(){
	document.body.appendChild(adapter.playerNameInput);
	for(let selection of adapter.playerTypeSelection){
		document.body.appendChild(selection);
	}
	document.body.appendChild(nextButton());
}

function drawShipPlacement(){}

function drawTurn(){}

function drawGameOver(){}


module.exports = updateView;
