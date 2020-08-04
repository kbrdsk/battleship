const {startGame, gameOver} = require("./battleship.js");
const {updateView} = require("./view.js");

const testMock = () => updateView();
const activeController = {};

module.exports = { activeController, testMock }